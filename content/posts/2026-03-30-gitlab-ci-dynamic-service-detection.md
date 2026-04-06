---
layout: post
title: "[CI/CD] GitLab CI에서 변경된 서비스만 빌드하는 동적 파이프라인 구축"
subtitle: "MSA 20개+ 서비스를 매번 전체 빌드? git diff로 해결하자"
catalog: true
tags:
    - gitlab
    - ci-cd
    - devops
    - msa
---

### 문제: MSA에서 전체 빌드의 비효율

마이크로서비스 아키텍처(MSA)에서 서비스 수가 늘어나면 CI/CD의 비효율이 급격히 커진다.

예를 들어 20개 서비스가 있는 모노레포에서 1개 서비스의 코드 1줄을 수정했는데, CI가 20개 서비스를 전부 빌드한다면?

| 항목 | 전체 빌드 | 변경분만 빌드 |
|------|----------|--------------|
| 빌드 대상 | 20개 전부 | 1~2개 |
| 소요 시간 | 30~50분 | 5~10분 |
| 레지스트리 트래픽 | 20개 push | 1~2개 push |

변경된 서비스만 감지해서 빌드하면 **빌드 자원을 약 85~90% 절감**할 수 있다.

---

### 전체 아키텍처

```
┌──────────────────────────────────────────┐
│           GitLab CI Pipeline             │
│                                          │
│  Stage 1: detect-changes                 │
│  ┌────────────────────────────────────┐  │
│  │ git diff → 변경 서비스 감지        │  │
│  │ → child-pipeline.yml 동적 생성     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Stage 2: trigger-build                  │
│  ┌────────────────────────────────────┐  │
│  │ child pipeline 트리거              │  │
│  │ → parallel:matrix로 병렬 빌드      │  │
│  │ → Harbor 레지스트리 push           │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

### 1단계: Makefile로 변경 서비스 감지

`git diff`를 사용해서 마지막 커밋에서 변경된 파일 목록을 추출하고, 어떤 서비스 디렉토리에 속하는지 매핑한다.

```makefile
# Makefile

detect-changed:
	@$(MAKE) _detect-changed-services

_detect-changed-services:
	@CHANGED_SERVICES=""; \
	# Frontend 서비스 변경 감지
	for dir in frontend/*/; do \
		if [ -d "$$dir" ]; then \
			name=$$(basename "$$dir"); \
			if git diff --name-only HEAD~1 HEAD | grep -E "^frontend/$$name/" >/dev/null 2>&1; then \
				CHANGED_SERVICES="$$CHANGED_SERVICES $$name"; \
			fi; \
		fi; \
	done; \
	# Java 서비스 변경 감지
	for dir in micro-services/java/*/; do \
		if [ -d "$$dir" ]; then \
			name=$$(basename "$$dir"); \
			if git diff --name-only HEAD~1 HEAD | grep -E "^micro-services/java/$$name/" >/dev/null 2>&1; then \
				CHANGED_SERVICES="$$CHANGED_SERVICES $$name"; \
			fi; \
		fi; \
	done; \
	# Python 서비스 변경 감지
	for dir in micro-services/python/*/; do \
		if [ -d "$$dir" ]; then \
			name=$$(basename "$$dir"); \
			if git diff --name-only HEAD~1 HEAD | grep -E "^micro-services/python/$$name/" >/dev/null 2>&1; then \
				CHANGED_SERVICES="$$CHANGED_SERVICES $$name"; \
			fi; \
		fi; \
	done; \
	# 결과를 JSON 배열로 변환 (GitLab CI Matrix에서 사용)
	if [ -z "$$CHANGED_SERVICES" ]; then \
		echo "[]"; \
	else \
		echo "$$CHANGED_SERVICES" | tr ' ' '\n' | grep -v '^$$' | jq -R . | jq -s .; \
	fi
```

실행 결과 예시:

```bash
$ make detect-changed
["authentication", "notification"]
```

---

### 2단계: GitLab CI에서 동적 Child Pipeline 생성

핵심은 **detect-changes 스테이지에서 child-pipeline.yml을 동적으로 생성**하고, **trigger-build 스테이지에서 이를 실행**하는 것이다.

```yaml
# .gitlab-ci.yml

stages:
  - detect-changes
  - trigger-build

variables:
  DOCKER_REGISTRY: 'harbor.example.com/myproject'

# Stage 1: 변경 서비스 감지 → child pipeline YAML 동적 생성
detect-changed-services-dev:
  stage: detect-changes
  image: python:3.9-slim
  before_script:
    - apt-get update -y
    - apt-get install -y git jq make
  script: |
    SERVICES_JSON=$(make detect-changed)

    if [ "$SERVICES_JSON" = "[]" ]; then
      MATRIX="[]"
    else
      # JSON 배열 → parallel:matrix 형식으로 변환
      MATRIX=$(echo "$SERVICES_JSON" | jq -c 'map({"SERVICE_NAME": .})')
    fi

    # child-pipeline.yml을 동적으로 생성
    cat << EOF > child-pipeline.yml
    build-service:
      stage: build
      image: docker:23.0.0-dind
      services:
        - docker:23.0.0-dind
      variables:
        DOCKER_REGISTRY: '$DOCKER_REGISTRY'
        HARBOR_USERNAME: '$HARBOR_USERNAME'
        HARBOR_PASSWORD: '$HARBOR_PASSWORD'
      before_script:
        - apk add --update make
        - echo "\$HARBOR_PASSWORD" | docker login --username "\$HARBOR_USERNAME" --password-stdin \$DOCKER_REGISTRY
      script: |
        make dev-build-service \$SERVICE_NAME
        make dev-push-service \$SERVICE_NAME
        make dev-clean-service \$SERVICE_NAME
        docker logout \$DOCKER_REGISTRY
      parallel:
        matrix: $(echo "$MATRIX")
    EOF
  artifacts:
    paths:
      - child-pipeline.yml
  rules:
    - if: '$CI_COMMIT_REF_NAME == "dev"'

# Stage 2: 생성된 child pipeline 트리거
trigger-child-pipeline-dev:
  stage: trigger-build
  trigger:
    include:
      - artifact: child-pipeline.yml
        job: detect-changed-services-dev
  needs:
    - detect-changed-services-dev
  rules:
    - if: '$CI_COMMIT_REF_NAME == "dev"'
```

#### 동작 흐름

1. `detect-changed-services-dev`가 실행되면 `make detect-changed`로 변경 서비스 목록을 JSON으로 추출
2. 변경 서비스가 `["auth", "notification"]`이면, `parallel:matrix`에 이 2개만 들어간 `child-pipeline.yml` 생성
3. `trigger-child-pipeline-dev`가 이 YAML을 child pipeline으로 트리거
4. GitLab이 `auth`, `notification` 2개의 병렬 job을 실행

---

### 3단계: 환경별 분기 (dev/prod)

동일한 패턴으로 prod 환경도 구성한다.

```yaml
# prod 브랜치 감지
detect-changed-services-prod:
  stage: detect-changes
  # ... (위와 동일한 구조, prod 빌드 명령 사용)
  rules:
    - if: '$CI_COMMIT_REF_NAME == "main"'

trigger-child-pipeline-prod:
  stage: trigger-build
  trigger:
    include:
      - artifact: child-pipeline.yml
        job: detect-changed-services-prod
  needs:
    - detect-changed-services-prod
  rules:
    - if: '$CI_COMMIT_REF_NAME == "main"'
```

| 브랜치 | 환경 | 빌드 명령 | 이미지 태그 |
|--------|------|-----------|-------------|
| dev | 개발 | `make dev-build-service` | `registry/dev/service:latest` |
| main | 운영 | `make prod-build-service` | `registry/service:latest` |

---

### 4단계: 서비스별 빌드/푸시 Makefile 타겟

```makefile
# 개발 환경 빌드
dev-build-service:
	@SERVICE_NAME=$(filter-out $@,$(MAKECMDGOALS)); \
	docker compose -f docker-compose.dev.yml build $$SERVICE_NAME

# 개발 환경 푸시
dev-push-service:
	@SERVICE_NAME=$(filter-out $@,$(MAKECMDGOALS)); \
	docker compose -f docker-compose.dev.yml push $$SERVICE_NAME

# 개발 환경 이미지 정리
dev-clean-service:
	@SERVICE_NAME=$(filter-out $@,$(MAKECMDGOALS)); \
	docker compose -f docker-compose.dev.yml rm $$SERVICE_NAME

# 운영 환경도 동일 패턴
prod-build-service:
	@SERVICE_NAME=$(filter-out $@,$(MAKECMDGOALS)); \
	docker compose -f docker-compose.yml build $$SERVICE_NAME
```

사용법:

```bash
make dev-build-service authentication   # authentication만 빌드
make prod-push-service notification     # notification만 레지스트리에 push
```

---

### 효과 정리

| 항목 | Before (전체 빌드) | After (동적 감지) |
|------|-------------------|------------------|
| 빌드 대상 | 20개+ 전체 | 변경된 1~3개 |
| 파이프라인 시간 | 30~50분 | 5~10분 |
| 레지스트리 트래픽 | 20개 이미지 push | 1~3개 push |
| 빌드 자원 | 100% | ~10~15% |
| **절감률** | | **약 85~90%** |

---

### 주의사항

1. **공유 라이브러리 변경 시**: shared/ 디렉토리가 변경되면 이를 사용하는 모든 서비스를 빌드 대상에 포함시켜야 한다
2. **인프라 설정 변경**: docker-compose.yml, Makefile 등이 변경되면 전체 빌드가 필요할 수 있다
3. **git diff 범위**: `HEAD~1`은 마지막 1커밋만 비교한다. squash merge를 사용하면 괜찮지만, 여러 커밋이 한 번에 push되면 `$CI_COMMIT_BEFORE_SHA`를 사용하는 것이 안전하다

---

### 참고 자료

- [GitLab Downstream Pipelines (Child Pipelines) 공식 문서](https://docs.gitlab.com/ci/pipelines/downstream_pipelines/)
- [GitLab Harbor Registry 연동](https://docs.gitlab.com/user/project/integrations/harbor/)
- [Dynamic Pipeline Generation on GitLab — Infinite Lambda](https://infinitelambda.com/dynamic-pipeline-generation-gitlab/)
- [Smart CI/CD: Building Only What You Change](https://akpolatcem.medium.com/smart-ci-cd-building-only-what-you-change-with-github-actions-02d8e42f4028)
