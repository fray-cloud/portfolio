---
layout: post
title: "[Java] 컨테이너 환경 JVM 메모리/GC 튜닝 가이드"
subtitle: "기본 설정이 왜 위험한지, PrintFlagsFinal로 실측 비교"
catalog: true
tags:
    - java
    - jvm
    - docker
    - performance
---

### 컨테이너에서 JVM 기본 설정이 위험한 이유

JVM은 실행 환경의 하드웨어를 감지해서 힙 크기, GC 스레드 수 등을 자동으로 결정한다 (Ergonomics). 문제는 컨테이너 환경에서 이 자동 감지가 과도한 리소스를 할당할 수 있다는 점이다.

실제로 16GB RAM, 20코어 호스트에서 2GB 제한 컨테이너를 실행하면 어떻게 되는지 `PrintFlagsFinal`로 측정해보았다.

---

### 실측: JVM 기본 설정 vs 튜닝 적용

```bash
# 기본 설정 확인
docker run --rm eclipse-temurin:21-jre \
  java -XX:+PrintFlagsFinal -version 2>&1 | \
  grep -E "MaxHeapSize|MaxMetaspaceSize|ParallelGCThreads|UseG1GC|UseStringDedup"

# 튜닝 적용 확인
docker run --rm eclipse-temurin:21-jre \
  java -Xmx768m -Xms512m \
  -XX:MaxMetaspaceSize=256m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseStringDeduplication \
  -XX:ParallelGCThreads=2 \
  -XX:+PrintFlagsFinal -version 2>&1 | \
  grep -E "MaxHeapSize|InitialHeapSize|MaxMetaspaceSize|ParallelGCThreads|UseG1GC|UseStringDedup|MaxGCPauseMillis"
```

#### 실측 결과

| JVM 항목 | 기본값 (auto) | 튜닝 적용 | 비고 |
|----------|--------------|-----------|------|
| `MaxHeapSize` | **15,674MB** | **768MB** | 95.1% 제한 |
| `InitialHeapSize` | 1,008MB | 512MB | 시작 시 힙 확장 오버헤드 제거 |
| `MaxMetaspaceSize` | ~17EB (무제한) | **256MB** | OOM 방지 핵심 |
| `ParallelGCThreads` | 20 | **2** | 컨테이너 CPU 기반 |
| `UseG1GC` | true | true | 기본값과 동일 (명시적 선언) |
| `UseStringDeduplication` | **false** | **true** | 메모리 10~20% 절감 |

> 기본 설정에서 MaxHeapSize가 15.6GB로 잡히는 이유: JVM이 호스트의 전체 메모리를 기준으로 계산하기 때문이다. 컨테이너에 2GB 제한을 걸어도 JVM의 cgroup 인식이 불완전하면 이런 문제가 발생할 수 있다.

---

### 각 옵션 상세 설명

#### 1. 힙 메모리 제한: `-Xmx768m -Xms512m`

```
-Xmx768m   → 최대 힙 768MB (이 이상 할당하면 OutOfMemoryError)
-Xms512m   → 초기 힙 512MB (시작 시 바로 512MB 확보)
```

컨테이너 메모리 제한의 **70~75%** 를 힙에 할당하는 것이 권장된다. 나머지 25~30%는 메타스페이스, 스레드 스택, NIO 버퍼, 코드 캐시 등 off-heap 영역이 사용한다.

> 대안: `-XX:MaxRAMPercentage=75.0`을 사용하면 컨테이너 메모리 제한에 비례해서 자동 계산된다. 이 방식이 하드코딩보다 유연하다.

```bash
# 컨테이너 메모리 제한이 1GB일 때 → 힙 ~750MB
docker run --memory=1g eclipse-temurin:21-jre \
  java -XX:MaxRAMPercentage=75.0 -XshowSettings:vm -version
```

#### 2. 메타스페이스 제한: `-XX:MaxMetaspaceSize=256m`

메타스페이스는 클래스 메타데이터를 저장하는 공간이다. 기본값은 **무제한**이므로, 클래스로더 누수가 발생하면 컨테이너 메모리를 모두 소진할 수 있다.

| 앱 유형 | 권장 메타스페이스 |
|---------|------------------|
| 간단한 마이크로서비스 | 128~192MB |
| Spring Boot 앱 | 256~384MB |
| 동적 클래스로딩 (Groovy, 리플렉션 등) | 384~512MB |

> 실제 사용량 확인: `jcmd <pid> VM.metaspace` 명령으로 현재 메타스페이스 사용량을 확인하고, 정상 상태의 **130~150%** 수준으로 설정한다.

#### 3. G1GC: `-XX:+UseG1GC -XX:MaxGCPauseMillis=200`

G1GC(Garbage First)는 JDK 9부터 기본 GC이다. 힙을 Region으로 나누고, 가비지가 많은 Region부터 우선 수집하여 정지 시간을 예측 가능하게 만든다.

```
-XX:+UseG1GC              → G1 GC 사용 (JDK 9+ 기본값)
-XX:MaxGCPauseMillis=200  → GC 정지 시간 목표 200ms
```

`MaxGCPauseMillis`는 **목표값**이지 보장값이 아니다. G1은 이 목표에 맞추려고 동적으로 조절하지만, 힙이 가득 차면 Full GC가 발생할 수 있다.

#### 4. 문자열 중복 제거: `-XX:+UseStringDeduplication`

G1GC 전용 옵션. GC 사이클 중에 동일한 내용의 `String` 객체가 같은 `byte[]`를 공유하도록 중복을 제거한다.

- **힙 절감**: 일반적으로 5~10% (JSON, 로그 등 반복 문자열이 많은 앱에서 효과적)
- **CPU 오버헤드**: ~1~3% (GC와 동시에 수행)
- **활성화 조건**: G1GC에서만 동작

#### 5. GC 스레드 제한: `-XX:ParallelGCThreads=2`

```
-XX:ParallelGCThreads=2   → 병렬 GC 스레드를 2개로 제한
```

기본값은 `availableProcessors`에 비례하여 계산된다. 호스트에 20코어가 있으면 GC 스레드도 20개가 생기는데, 실제 컨테이너에 할당된 CPU가 2코어라면 과도한 컨텍스트 스위칭이 발생한다.

| 컨테이너 CPU | ParallelGCThreads | ConcGCThreads |
|-------------|-------------------|---------------|
| 1 | 1 | 1 |
| 2 | 2 | 1 |
| 4 | 4 | 1~2 |
| 8 | 8 | 2 |

> `ConcGCThreads`는 `ParallelGCThreads / 4` 정도가 적당하다. 또는 `-XX:ActiveProcessorCount=N`으로 JVM이 인식하는 CPU 수 자체를 제한할 수 있다.

---

### Dockerfile에 적용하기

```dockerfile
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app
COPY gradlew gradle build.gradle settings.gradle ./
RUN chmod +x gradlew
COPY src src
RUN ./gradlew build -x test

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

# JVM 메모리/GC 최적화
ENV JAVA_OPTS="-Xmx768m -Xms512m \
-XX:MaxMetaspaceSize=256m \
-XX:+UseG1GC \
-XX:MaxGCPauseMillis=200 \
-XX:+UseStringDeduplication \
-XX:ParallelGCThreads=2"

EXPOSE 8000

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

> **주의**: `CMD ["java", "-jar", "app.jar"]` 형태(exec form)에서는 환경변수가 확장되지 않는다. `sh -c`로 감싸야 `$JAVA_OPTS`가 적용된다.

---

### OpenTelemetry Java Agent 연동

관측성(Observability)을 위해 OpenTelemetry Java Agent를 추가할 수 있다. 자동으로 트레이스, 메트릭, 로그를 수집한다.

```dockerfile
# OTel Agent 다운로드
ARG OTEL_JAVA_AGENT_VERSION=2.20.1
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /otel \
    && curl -sSL https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_JAVA_AGENT_VERSION}/opentelemetry-javaagent.jar \
       -o /otel/opentelemetry-javaagent.jar

ENV JAVA_TOOL_OPTIONS="-javaagent:/otel/opentelemetry-javaagent.jar"
```

OTel Agent의 오버헤드:
- **시작 시간**: +2~5초 (바이트코드 조작)
- **CPU**: ~2~5% 증가
- **메모리**: +50~100MB (메타스페이스/힙)

> OTel Agent 사용 시 `MaxMetaspaceSize`를 +100~150MB 여유있게 잡아야 한다.

---

### 디버깅 명령 모음

```bash
# 컨테이너 내부에서 JVM 설정 전체 확인
java -XX:+PrintFlagsFinal -version 2>&1 | grep -i "heap\|metaspace\|gc\|thread"

# JVM이 인식한 컨테이너 환경 확인
java -XshowSettings:vm -version

# 실행 중인 프로세스의 JVM 플래그
jcmd <pid> VM.flags

# 메타스페이스 사용량
jcmd <pid> VM.metaspace

# GC 로그 활성화 (JDK 9+)
java -Xlog:gc*:file=/tmp/gc.log:time,uptime,level,tags -jar app.jar
```

---

### 최종 권장 설정

2코어 / 2GB 컨테이너 기준 Spring Boot 마이크로서비스:

```bash
JAVA_OPTS="\
  -XX:+UseG1GC \
  -XX:MaxRAMPercentage=75.0 \
  -XX:InitialRAMPercentage=75.0 \
  -XX:MaxMetaspaceSize=256m \
  -XX:+UseStringDeduplication \
  -XX:ParallelGCThreads=2 \
  -XX:ConcGCThreads=1 \
  -XX:ActiveProcessorCount=2 \
  -Xlog:gc*:file=/tmp/gc.log:time,uptime,level,tags:filecount=5,filesize=10m"
```

---

### 참고 자료

- [G1GC Tuning Guide — Oracle](https://docs.oracle.com/en/java/javase/17/gctuning/garbage-first-g1-garbage-collector.html)
- [JVM Ergonomics — Oracle](https://docs.oracle.com/en/java/javase/17/gctuning/ergonomics.html)
- [Spring Boot JVM Tuning for Kubernetes — Google Cloud](https://cloud.google.com/blog/products/containers-kubernetes/spring-boot-jvm-performance-tuning-for-kubernetes)
- [Metaspace 이해하기 — Thomas Stuefe](https://stuefe.de/posts/metaspace/what-is-metaspace/)
- [JEP 192: String Deduplication in G1 — OpenJDK](https://openjdk.org/jeps/192)
- [OpenTelemetry Java 자동 계측](https://opentelemetry.io/docs/languages/java/automatic/)
- [Java inside Docker 주의사항 — Red Hat](https://developers.redhat.com/blog/2017/03/14/java-inside-docker)
