---
layout: post
title: "[Docker] Multi-Stage Build로 이미지 크기 최적화 - 실측 비교"
subtitle: "Python, Java, Frontend 이미지를 실제로 빌드하고 크기를 측정해보았다"
catalog: true
tags:
    - docker
    - devops
    - optimization
---

### 왜 Multi-Stage Build인가?

Docker 이미지를 빌드할 때, 빌드 도구(gcc, npm, JDK 등)가 최종 프로덕션 이미지에 그대로 남아있는 경우가 많다. 이는 이미지 크기를 불필요하게 키우고, 보안 공격 표면도 넓힌다.

Multi-Stage Build는 하나의 Dockerfile에 여러 `FROM` 스테이지를 두고, 빌드 결과물만 최종 스테이지로 복사하는 패턴이다.

> 핵심 원리: 빌드에 필요한 도구는 빌드 스테이지에만 존재하고, 최종 이미지에는 런타임에 필요한 것만 남긴다.

---

### 실측 환경

- Docker 29.2.1, Docker Compose v5.0.2
- WSL2 Linux 6.6.87
- 각 이미지를 실제로 `docker build`하고 `docker images`로 크기 측정

---

### 1. Python 서비스: Single-Stage vs Multi-Stage

#### Before (Single-Stage)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

gcc 같은 빌드 도구가 최종 이미지에 남아있다.

#### After (Multi-Stage)

```dockerfile
# Stage 1: 빌드 전용
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Stage 2: 런타임 전용 - 빌드 도구 제외
FROM python:3.11-slim

WORKDIR /app

# 빌드된 Python 패키지만 복사 (gcc 등 빌드 도구 제외)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 실측 결과

| 방식 | 이미지 크기 | 빌드 시간 |
|------|------------|-----------|
| Single-Stage | **1.03GB** | 11초 |
| Multi-Stage | **742MB** | 48초 |
| **차이** | **-28.0% (약 300MB 절감)** | +37초 |

빌드 시간은 늘어나지만 프로덕션 이미지 크기가 28% 줄어든다. CI/CD에서 이미지를 레지스트리에 push/pull하는 시간과 네트워크 비용을 고려하면 충분히 가치있다.

> Python에서 추가로 최적화하려면 `pip wheel` 패턴을 사용할 수 있다. 빌드 스테이지에서 `pip wheel --wheel-dir /wheels`로 wheel 파일을 만들고, 런타임 스테이지에서 `pip install --no-index --find-links=/wheels`로 설치하면 빌드 캐시 효율이 더 좋아진다.

---

### 2. Frontend (React/Vue): node → nginx 전환

#### Before

```dockerfile
FROM node:22

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 개발 서버로 프로덕션 서빙 - 비효율적
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

#### After (Multi-Stage + nginx)

```dockerfile
# Stage 1: 빌드
FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: nginx로 정적 파일만 서빙
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 베이스 이미지 크기 실측

| 이미지 | 크기 |
|--------|------|
| node:22 | **1.64GB** |
| nginx:latest | **240MB** |
| nginx:1.27-alpine | **74.5MB** |

node:22에서 nginx:alpine으로 전환하면 베이스 이미지만 **95.5% 감소** (1.64GB → 74.5MB). 빌드된 `dist/` 폴더가 보통 10~30MB이므로, 최종 이미지는 약 85~105MB 수준이 된다.

---

### 3. Java 서비스: JDK → JRE 분리

#### Multi-Stage 패턴

```dockerfile
# Stage 1: JDK로 빌드
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app
COPY gradlew gradle build.gradle settings.gradle ./
RUN chmod +x gradlew
COPY src src
RUN ./gradlew build -x test

# Stage 2: JRE로 실행
FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8000
CMD ["java", "-jar", "app.jar"]
```

#### 베이스 이미지 크기 실측

| 이미지 | 크기 |
|--------|------|
| eclipse-temurin:21-jdk | **679MB** |
| eclipse-temurin:21-jre | **406MB** |

JDK → JRE 전환만으로 **40.2% 감소** (679MB → 406MB). 더 극적인 최적화를 원한다면 Google의 distroless 이미지(`gcr.io/distroless/java21-debian12`, ~130MB)를 사용할 수 있다.

---

### 4. 주의: Multi-Stage가 오히려 커지는 경우

Multi-Stage Build가 항상 이미지를 줄이는 것은 아니다. 실제 테스트에서 다음과 같은 경우를 발견했다.

#### 문제가 되는 패턴

```dockerfile
# Builder stage
FROM python:3.10-slim AS builder
COPY requirements ./requirements
RUN pip wheel --wheel-dir /wheels -r requirements/common.txt

# Runtime stage
FROM python:3.10-slim AS runtime
COPY --from=builder /wheels /wheels           # Layer A: 6.34GB
RUN pip install --find-links=/wheels ... && \
    rm -rf /wheels                            # Layer B: 10.3GB + 삭제
```

#### 실측 결과

| 방식 | 이미지 크기 |
|------|------------|
| Single-Stage | **19GB** |
| Multi-Stage (위 패턴) | **28.6GB** |

Multi-Stage가 오히려 **50% 더 크다**. 원인은 Docker 레이어 특성에 있다.

> Docker는 Union Filesystem을 사용하므로, Layer A에서 `COPY /wheels` (6.34GB)를 가져오고, Layer B에서 `rm -rf /wheels`로 삭제해도 Layer A의 데이터는 여전히 이미지에 존재한다. 레이어는 누적(additive)되지, 이전 레이어를 수정하지 않는다.

#### 올바른 패턴

```dockerfile
# 한 RUN 명령에서 설치 + 삭제를 한 번에 수행
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels
```

또는 빌더에서 wheel을 복사하지 않고, 직접 site-packages만 복사하는 방식이 안전하다.

```dockerfile
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
```

---

### 정리: 실측 비교 종합

| 항목 | Before | After | 감소율 |
|------|--------|-------|--------|
| Python (FastAPI) | 1.03GB (Single) | 742MB (Multi) | **28%** |
| Frontend (React) | 1.64GB (node:22) | ~100MB (nginx:alpine + dist) | **~94%** |
| Java (Spring Boot) | 679MB (JDK) | 406MB (JRE) | **40%** |
| Java (극한 최적화) | 679MB (JDK) | ~130MB (distroless) | **~81%** |

### 핵심 원칙

1. **빌드 도구와 런타임을 분리**하라 — gcc, npm, JDK는 빌드에만 필요하다
2. **COPY + rm을 분리 레이어로 하지 마라** — 한 `RUN` 명령으로 합쳐야 한다
3. **slim/alpine 베이스 이미지를 사용**하라 — 기본 이미지 대비 50~90% 크기 절감
4. **의존성 레이어를 먼저 복사**하라 — `COPY requirements.txt` → `RUN pip install` → `COPY . .` 순서로 캐시 효율을 높인다

---

### 참고 자료

- [Docker Multi-Stage Builds 공식 문서](https://docs.docker.com/build/building/multi-stage/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Python Multi-Stage Build 패턴 — Python Speed](https://pythonspeed.com/articles/multi-stage-docker-python/)
- [Python Docker Base Image 비교 — Python Speed](https://pythonspeed.com/articles/base-image-python-docker-images/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Google Cloud: 컨테이너 빌드 Best Practices](https://cloud.google.com/architecture/best-practices-for-building-containers)
- [Google Distroless 이미지](https://github.com/GoogleContainerTools/distroless)
- [Docker Build Cache 동작 원리](https://docs.docker.com/build/cache/)
