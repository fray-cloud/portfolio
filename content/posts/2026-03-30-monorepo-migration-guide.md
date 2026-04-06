---
layout: post
title: "[DevOps] 멀티레포에서 모노레포로 전환 - 구조 설계와 CI/CD"
subtitle: "5개+ 레포를 1개로 통합하면서 배운 것들"
catalog: true
tags:
    - monorepo
    - devops
    - ci-cd
    - architecture
---

### 멀티레포의 문제점

마이크로서비스를 서비스당 1개 레포로 관리하는 멀티레포 방식은 초기에는 깔끔하지만, 서비스 수가 5개를 넘어가면서 문제가 생기기 시작한다.

#### 직접 겪은 문제들

**1. 개발 환경 셋업이 너무 오래 걸린다**

```bash
# 5~7개 레포를 각각 클론
git clone service-a.git && cd service-a && cp .env.example .env && docker compose up -d && cd ..
git clone service-b.git && cd service-b && cp .env.example .env && docker compose up -d && cd ..
git clone service-c.git && cd service-c && cp .env.example .env && docker compose up -d && cd ..
# ... 5~7번 반복, 총 1~2시간
```

**2. 공통 유틸리티 코드가 복사/붙여넣기로 퍼진다**

```python
# service-a/utils/cleaner.py
def clean_data(df):
    df = df.dropna(subset=['id'])
    df['time'] = pd.to_datetime(df['time'])
    return df

# service-b/utils/cleaner.py (복사본)
def clean_data(df):
    df = df.dropna(subset=['id'])
    # 버그: datetime 변환이 빠져있음!
    return df
```

한 곳에서 버그를 수정해도 다른 레포에 반영이 안 된다.

**3. 설정값 불일치**

DB 테이블명, API URL 등이 각 레포에 하드코딩되어 있어 값이 서로 달라지는 문제가 발생한다.

**4. CI/CD 파이프라인이 서비스 수만큼 존재**

5~7개 Jenkinsfile/gitlab-ci.yml을 각각 관리해야 한다. 빌드 로직 변경 시 전부 수정.

---

### 모노레포 구조 설계

```
project/
├── services/                    # 마이크로서비스
│   ├── service-a/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── requirements.txt
│   │   └── Makefile
│   ├── service-b/
│   ├── service-c/
│   ├── docker-compose.yml       # 서비스 통합 compose
│   └── docker-compose.dev.yml
├── frontend/
│   ├── apps/
│   │   ├── api/                 # Backend (NestJS 등)
│   │   └── web/                 # Frontend (React 등)
│   └── docker-compose.yml
├── infra/                       # 인프라 구성
│   ├── kafka/
│   ├── nginx/
│   └── airflow/
├── shared/                      # 공유 라이브러리
│   ├── common/
│   │   ├── data_cleaner.py
│   │   ├── validator.py
│   │   └── data_loader.py
│   └── config/
│       └── base_config.py
├── Jenkinsfile                  # 단일 CI/CD 파이프라인
├── Makefile                     # 통합 빌드 명령
├── docker-compose.yml           # 전체 orchestration
└── docker-compose.dev.yml
```

핵심 설계 원칙:
- **services/**: 각 서비스는 독립적인 Dockerfile과 compose를 가진다
- **shared/**: 모든 서비스가 공유하는 코드는 여기에
- **infra/**: 인프라 구성은 별도 디렉토리로 분리
- **루트**: 통합 Makefile, Jenkinsfile, docker-compose

---

### Docker Compose Include 패턴

Docker Compose의 `include` 디렉티브(v2.20+)를 사용하면 대규모 compose 파일을 모듈화할 수 있다.

#### 루트 docker-compose.yml

```yaml
# docker-compose.yml - 전체 시스템 통합
include:
  - path: frontend/docker-compose.yml
    project_directory: frontend
  - path: ./infra/kafka/docker-compose.yml
    project_directory: ./infra/kafka
  - path: ./infra/nginx/docker-compose.yml
    project_directory: ./infra/nginx
  - path: services/docker-compose.yml
    project_directory: services
  - path: ./infra/airflow/docker-compose.yml
    project_directory: ./infra/airflow

networks:
  app-network:
    name: app-network
    driver: bridge

volumes:
  airflow-data:
    name: airflow-data
  feature-store-data:
    name: feature-store-data
```

#### 서비스 docker-compose.yml

```yaml
# services/docker-compose.yml
include:
  - path: ./service-a/docker-compose.yml
    project_directory: ./service-a
  - path: ./service-b/docker-compose.yml
    project_directory: ./service-b
  - path: ./service-c/docker-compose.yml
    project_directory: ./service-c
```

> 각 include 파일은 자신만의 `project_directory`를 가지므로 상대 경로가 정상적으로 동작한다.

---

### 공유 라이브러리 패턴

#### shared/common/data_cleaner.py

```python
"""공통 데이터 정제 유틸리티 - 모든 서비스에서 import"""
import pandas as pd

class DataCleaner:
    @staticmethod
    def clean_data(df, required_cols=None):
        if required_cols is None:
            required_cols = ['id', 'time']
        df = df.dropna(subset=required_cols)
        df = df.drop_duplicates(subset=['id', 'date'])
        df['time'] = pd.to_datetime(df['time'])
        return df
```

#### shared/config/base_config.py

```python
"""프로젝트 전역 설정 - 하드코딩 제거"""
import os

class BaseConfig:
    PROJECT_ROOT = os.getenv('PROJECT_ROOT', '/app')

    # DB 테이블명 단일 소스
    FEATURE_TABLE = 'feature_data_1h'
    PREDICTION_TABLE = 'model_predictions'

    # DB 연결
    FEATURE_STORE_DB = os.getenv('FEATURE_STORE_DB', 'feature_store_db')
```

#### Dockerfile에서 shared 포함

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY services/service-a/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/service-a/src/ ./src/
COPY shared/ ./shared/              # 공유 모듈 포함

ENV PYTHONPATH=/app                 # import 경로 설정

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

사용하는 서비스에서:

```python
from shared.common.data_cleaner import DataCleaner
from shared.config.base_config import BaseConfig

cleaner = DataCleaner()
df = cleaner.clean_data(raw_df)
table = BaseConfig.FEATURE_TABLE
```

---

### Makefile로 통합 빌드 관리

```makefile
# Makefile
SERVICES = service-a service-b service-c service-d service-e

# 모든 서비스 환경 설정 한 번에
make-env-all:
	@for service in ${SERVICES}; do \
		$(MAKE) -C services/$$service make-env || true; \
	done
	$(MAKE) -C frontend make-env
	$(MAKE) -C infra/kafka make-env
	$(MAKE) -C infra/nginx make-env

# 전체 빌드
build-all:
	$(MAKE) -C frontend build-app
	@for service in ${SERVICES}; do \
		$(MAKE) -C services/$$service build || true; \
	done

# 전체 푸시
push-all:
	$(MAKE) -C frontend push-app
	@for service in ${SERVICES}; do \
		$(MAKE) -C services/$$service push || true; \
	done

# 개발 환경 한 줄로 실행
dev-up-build:
	docker compose -f docker-compose.dev.yml up --build -d

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f
```

셋업이 이렇게 바뀐다:

```bash
# Before (멀티레포): 1~2시간
git clone repo-a.git && cd repo-a && ... && cd ..
git clone repo-b.git && cd repo-b && ... && cd ..
# ... 5~7회 반복

# After (모노레포): 10~15분
git clone project.git
cd project
make make-env-all
make dev-up-build
```

---

### Jenkins 변경 감지 파이프라인

모노레포에서는 단일 Jenkinsfile로 모든 서비스의 CI/CD를 처리한다.

```groovy
pipeline {
    agent any

    stages {
        stage('DETECT CHANGED SERVICES') {
            steps {
                script {
                    def changedFiles = sh(
                        script: "git diff --name-only HEAD~1 HEAD",
                        returnStdout: true
                    ).trim().split('\n')

                    def changedServices = [] as Set

                    changedFiles.each { file ->
                        def matcher = (file =~ /^services\/([^\/]+)\//)
                        if (matcher.find()) {
                            changedServices.add(matcher.group(1))
                        }
                        def frontMatcher = (file =~ /^frontend\/apps\/(web|api)\//)
                        if (frontMatcher.find()) {
                            changedServices.add("frontend-${frontMatcher.group(1)}")
                        }
                    }

                    env.CHANGED_SERVICES = changedServices.join(',')
                }
            }
        }

        stage('DOCKER BUILD') {
            when { expression { env.CHANGED_SERVICES?.trim() } }
            steps {
                script {
                    def services = env.CHANGED_SERVICES.split(',').join(' ')
                    sh "docker compose build --no-cache ${services}"
                }
            }
        }

        stage('DOCKER PUSH') {
            when { expression { env.CHANGED_SERVICES?.trim() } }
            steps {
                script {
                    def services = env.CHANGED_SERVICES.split(',')
                    services.each { service ->
                        sh "docker push registry.example.com/${service}:latest"
                    }
                }
            }
        }

        stage('MANIFEST UPDATE') {
            when { expression { env.CHANGED_SERVICES?.trim() } }
            steps {
                script {
                    // Kustomize로 K8s 매니페스트 자동 업데이트
                    def services = env.CHANGED_SERVICES.split(',')
                    services.each { service ->
                        dir("manifests/${service}") {
                            sh """
                                git clone manifest-repo.git .
                                # 이미지 다이제스트로 업데이트 (immutable)
                                kustomize edit set image registry.example.com/${service}@sha256:${digest}
                                git commit -am "Automation: Update ${service} image"
                                git push origin main
                            """
                        }
                    }
                }
            }
        }
    }
}
```

> **이미지 다이제스트 기반 배포**: 태그(`:latest`)는 덮어쓰기가 가능하지만, SHA256 다이제스트는 immutable이다. 배포 추적성과 롤백 안정성이 크게 향상된다.

---

### 전환 효과 정리

| 항목 | Before (멀티레포) | After (모노레포) |
|------|-------------------|------------------|
| 레포 클론 | 5~7개 × git clone | 1개 clone |
| 환경 셋업 | 약 1~2시간 | `make make-env-all` → **15분** |
| 로컬 실행 | 각 서비스별 docker compose | `make dev-up-build` 한 줄 |
| 공통 코드 | 복사/붙여넣기 중복 | shared/ 단일 소스 |
| CI/CD | 5~7개 파이프라인 | 1개 통합 파이프라인 |
| 설정 변경 | 5~7개 레포 각각 수정 | 1곳 수정 → 전체 반영 |
| 빌드 대상 | 항상 전체 | 변경 서비스만 감지 |
| **셋업 시간 단축** | | **약 85~90%** |

---

### 전환 시 주의사항

1. **점진적 전환**: 한 번에 모든 레포를 통합하지 말고, 가장 의존성이 높은 서비스부터 단계적으로 진행
2. **git subtree vs 직접 복사**: 히스토리를 보존하려면 `git subtree`를 사용하고, 깔끔한 시작을 원하면 코드만 복사
3. **CODEOWNERS**: 서비스별 코드 오너를 명확히 지정해서 리뷰 책임 분산
4. **shared/ 버전 관리**: 공유 라이브러리 변경 시 모든 서비스에 영향이 가므로, 테스트 커버리지가 중요
5. **Docker context**: 모노레포에서는 Dockerfile의 `COPY` 경로와 build context가 달라질 수 있으므로 주의

---

### 참고 자료

- [Monorepo Hands-On Guide — Aviator](https://www.aviator.co/blog/monorepo-a-hands-on-guide-for-managing-repositories-and-microservices/)
- [Python Monorepo 구조와 도구 — Tweag](https://www.tweag.io/blog/2023-04-04-python-monorepo-1/)
- [Docker Compose include로 모듈화 — Docker Blog](https://www.docker.com/blog/improve-docker-compose-modularity-with-include/)
- [Docker Compose include 레퍼런스](https://docs.docker.com/reference/compose-file/include/)
- [GitOps Image Digest 배포 — Red Hat](https://www.redhat.com/en/blog/gitops-deployment-and-image-management)
- [Jenkins Monorepo Change Detection](https://blog.rifhanakram.com/posts/jenkins-pipeline-monorepo/)
