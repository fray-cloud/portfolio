import { Experience, ProjectDetail } from "./types";

export const SITE = {
  title: "Woohyun Kim | Portfolio",
  description:
    "풀스택 엔지니어 김우현의 포트폴리오. Computer Vision, Solution Engineering, Platform Engineering.",
  url: "https://portfolio-fray-cloud.vercel.app",
} as const;

export const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "/blog/" },
] as const;

export const SKILLS = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  Backend: ["Spring Boot", "NestJS", "FastAPI"],
  DevOps: ["Docker", "Kubernetes", "GitLab CI", "Jenkins", "ArgoCD"],
  "Data/AI": ["OpenCV", "Python", "Kafka", "Redis"],
} as const;

export const EXPERIENCES: Experience[] = [
  {
    role: "Computer Vision Developer",
    period: "2020.11 ~ 2022.01",
    duration: "1년 2개월",
    projects: [
      { name: "수위 감지 시스템", duration: "6개월" },
      { name: "영상 처리 개발", duration: "6개월" },
    ],
  },
  {
    role: "Solution Engineer",
    period: "2022.01 ~ 2024.05",
    duration: "2년 4개월",
    projects: [
      { name: "FNU AICC 구축", duration: "8개월" },
      { name: "사내 이슈 관리 자동화", duration: "1년" },
      { name: "SKBCCC 유지보수", duration: "1년 9개월" },
    ],
  },
  {
    role: "Platform Engineer",
    period: "2024.08 ~ 현재",
    duration: "1년 8개월",
    projects: [
      { name: "iOMS", duration: "진행 중" },
      { name: "사내 홈페이지", duration: "1개월" },
      { name: "공항자원배정 플랫폼", duration: "1년 3개월" },
    ],
  },
];

export const PROJECTS: ProjectDetail[] = [
  {
    title: "iOMS",
    role: "전체 아키텍처 리딩, MSA 환경 도메인 설계(DDD), 인프라·CI/CD, FE/BE 핵심 서비스 총괄",
    period: "2025.07 ~ 현재",
    tech: [
      "React",
      "Vite",
      "Zustand",
      "Spring Boot",
      "FastAPI",
      "Docker",
      "Kubernetes",
      "Kafka",
      "Redis",
      "Tailwind CSS",
    ],
    sections: [
      {
        title: "프론트엔드 개발",
        items: [
          "React 19(CSR)와 Vite 7로 UI 구현 (CI/자산/관계 관리, Job/Playbook/Workflow 제어 화면)",
          "Zustand로 상태 관리, React Query로 서버 상태 관리, Radix UI 컴포넌트 활용",
          "CodeMirror 코드 에디터 통합, React DnD 기반 드래그앤드롭, RJSF로 동적 폼 구현",
          "Tailwind CSS 4로 UI 스타일링",
        ],
      },
      {
        title: "백엔드 개발",
        items: [
          "Spring Boot 3.2로 Configuration 서비스 구축 (도메인 모델 기반 버저닝·이력 관리)",
          "FastAPI로 자동화 서비스 개발 (Ansible 연동, SSH Key 관리, 동적 인벤토리, Playbook 실행, Celery 비동기 처리)",
          "FastAPI로 스케줄 서비스 개발 (Airflow 연동, croniter 스케줄 관리)",
        ],
      },
      {
        title: "인프라 구축",
        items: [
          "GitLab CI 파이프라인 설정, Harbor Registry 운영",
          "Docker와 Kubernetes 기반의 MSA 인프라 아키텍처 설계",
          "Nginx API Gateway, 리버스 프록시 세팅",
          "Kafka 이벤트 스트림 환경 구성, Redis 캐싱 적용",
        ],
      },
    ],
    achievements: [
      "형상관리·자동화·자산 관리를 모두 아우르는 운영 최적화 플랫폼 확보",
      "도메인 중심(DDD) 설계로 확장성, 유지보수성, 서비스 독립성 크게 향상",
      "개발팀이 표준화된 CI/CD와 협업 체계를 정착시켜 효율성 강화",
    ],
  },
  {
    title: "사내 홈페이지 개발",
    role: "Next.js로 기업 홈페이지 전체 개발",
    period: "2026.02 ~ 2026.03",
    tech: [
      "Next.js",
      "anime.js",
      "CVA",
      "Lenis",
      "next-intl",
      "Storybook",
      "Docker",
    ],
    link: "https://kephas.kr",
    sections: [
      {
        title: "프론트엔드 개발",
        items: [
          "Next.js 16 App Router와 RSC를 활용한 SSR 구현",
          "next-intl을 통해 한국어·영어 다국어 지원, 도메인별 번역 파일 관리",
          "anime.js와 motion 라이브러리로 다양한 애니메이션과 인터랙션 제작",
          "Lenis를 이용한 스무스 스크롤, Leaflet 지도 컴포넌트 통합",
          "CVA(Class Variance Authority)로 디자인 시스템 구축",
          "SVGR로 아이콘 시스템 자동 생성",
          "Vitest, Playwright로 테스트 환경 구성",
          "Storybook 10으로 컴포넌트 문서화 및 시각적 테스트",
          "Docker standalone 빌드 최적화(멀티 스테이지 적용)",
        ],
      },
    ],
    achievements: [
      "Next.js App Router와 RSC를 활용한 최신 아키텍처 도입으로 성능 극대화",
      "CVA 기반 디자인 시스템 구축을 통해 UI의 일관성과 품질을 확보",
      "다국어 지원과 SEO 최적화로 글로벌 접근성 강화",
    ],
  },
  {
    title: "공항자원배정 플랫폼",
    role: "인프라 구축, 프론트엔드 전체 개발, NestJS 백엔드 API 개발 주도",
    period: "2024.08 ~ 2025.12",
    partner: "IITP",
    tech: [
      "React",
      "Vite",
      "NestJS",
      "MongoDB",
      "Jenkins",
      "ArgoCD",
      "Kafka",
      "Redis",
      "Tailwind CSS",
    ],
    sections: [
      {
        title: "Frontend 개발",
        items: [
          "React 18(CSR) + Vite 5 기반 공항 운영 UI/UX 프론트엔드 전체 구현",
          "Zustand 상태관리, Chart.js 데이터 시각화, vis-timeline 타임라인 UI",
          "React Hook Form + Zod 폼 검증, XLSX/CSV 데이터 핸들링",
          "Tailwind CSS + DaisyUI 스타일링",
          "Storybook 컴포넌트 문서화, Playwright E2E 테스트",
        ],
      },
      {
        title: "Backend 개발",
        items: [
          "NestJS 기반 REST API 서버 개발",
          "MongoDB/Mongoose ORM 데이터 모델링",
          "Passport JWT 기반 인증 처리",
          "Kafka 이벤트 연동, Redis 캐싱 적용",
          "Swagger(OpenAPI) API 문서화",
        ],
      },
      {
        title: "인프라 구축",
        items: [
          "GitLab 구축 및 운영 (Repository 구조 정립, 접근권한 정책 수립)",
          "Jenkins 기반 Docker/Kubernetes CI/CD 파이프라인 설계 및 자동화",
          "Harbor Private Registry 구축 및 운영",
          "ArgoCD 기반 GitOps 배포 파이프라인 구현",
          "Nginx Reverse Proxy, Kafka 클러스터 운영, Airflow 워크플로우 관리",
        ],
      },
    ],
    achievements: [
      "사내 망 환경 제약과 클라우드 환경 혼합 구조에서도 안정적으로 CI/CD 및 GitOps 자동화 체계 정립",
      "자원배정 및 예측 서비스 반영 속도와 안정성 확보",
      "프론트/백엔드/인프라 아키텍처 전반에 대한 폭넓은 운영 경험 확보",
    ],
  },
  {
    title: "FNU AICC 구축",
    role: "PM, 팀 리딩 및 전체 프로젝트 책임",
    period: "2023.09 ~ 2024.05",
    partner: "FNU신용정보회사",
    tech: ["STT", "QA", "콜봇", "IPCC"],
    sections: [
      {
        title: "담당 업무",
        items: [
          "기존 IPCC에 다양한 AI 기술 적용 및 통합",
          "IPCC 구축과 상담 내용의 텍스트화·분석 시스템 개발",
          "QA 평가 체계 마련",
          "콜봇 시스템 연동",
          "유지보수 관리로 시스템 안정성과 성능 지속 관리",
        ],
      },
    ],
    achievements: [
      "STT, QA 평가, 콜봇 등 여러 AI 기술을 성공적으로 통합해 솔루션 구축",
      "유지보수로 시스템 안정성과 성능 장기간 유지",
      "팀원들과의 협업 능력 강화, 솔루션 라이프사이클 전반에 걸친 경험 축적",
    ],
  },
  {
    title: "사내 이슈 관리 자동화",
    role: "Atlassian App 개발을 통한 업무 효율 개선",
    period: "2023.05 ~ 2024.05",
    tech: ["Jira", "Confluence", "Forge", "JavaScript"],
    sections: [
      {
        title: "담당 업무",
        items: [
          "Atlassian App 개발을 통한 업무 효율 개선",
          "Jira, Confluence 자동화 시스템 설계 및 구축",
        ],
      },
    ],
    achievements: [
      "Jira/Confluence 자동화로 사내 업무 효율 향상",
    ],
  },
  {
    title: "SKBCCC 유지보수",
    role: "IPCC 솔루션 유지보수 및 운영 관리",
    period: "2022.01 ~ 2023.09",
    partner: "SKB",
    tech: ["PBX", "IVR", "CTI", "녹취"],
    sections: [
      {
        title: "담당 업무",
        items: [
          "PBX, IVR, CTI, 녹취, 3-Party 연동 등 다양한 모듈로 구성된 IPCC 솔루션 운영",
          "정기적인 유지보수를 통한 안정성과 성능 유지",
          "기존 시스템의 문제점 발굴 및 해결",
          "운영 과정에서 발생하는 이슈 대응",
        ],
      },
    ],
    achievements: [
      "솔루션 안정적인 운영 경험 지속",
      "정기 점검을 통해 잠재적 문제 예방과 신속한 이슈 처리",
      "고객과 사용자에게 끊김 없는 안정적 서비스 제공",
    ],
  },
  {
    title: "수위 감지 시스템",
    role: "객체 인식과 영상 전처리 기반 수위 감지 시스템 개발",
    period: "2021.07 ~ 2021.12",
    partner: "코레일",
    tech: ["Django", "OpenCV", "TensorFlow", "PyTorch", "REST API"],
    sections: [
      {
        title: "담당 업무",
        items: [
          "차 영상 기법으로 물의 높이 실시간 감지 기능 구현",
          "색상, 문자 감지 기능까지 확장해 다양한 플랫폼에 적용",
          "Django 기반 웹 서비스 개발",
          "객체 인식(OpenCV), 예측(TensorFlow, PyTorch) 등 오픈소스 기술 활용",
          "REST API 설계 및 개발",
        ],
      },
    ],
    achievements: [
      "철도 교량 내 물의 이상 상태를 실시간 모니터링하는 시스템 구축",
      "코드 문서화로 팀 내 협업 환경 개선",
    ],
  },
  {
    title: "영상 처리 개발",
    role: "영상 처리 및 객체 인식 관련 개발",
    period: "2020.11 ~ 2021.06",
    tech: ["Django", "OpenCV", "Python"],
    sections: [
      {
        title: "담당 업무",
        items: [
          "영상장치 프로토콜과 SDK를 통해 이미지 데이터와 이벤트를 실시간으로 수집",
          "Django 웹 프레임워크를 활용해 관리자가 얼굴을 실시간으로 확인하고, 감지 결과에 따라 출입문을 제어할 수 있는 시스템 개발",
        ],
      },
    ],
    achievements: [
      "영상 처리 기술 기반의 실시간 모니터링 시스템 구축",
    ],
  },
];

export const CONTACT = {
  github: "https://github.com/fray-cloud",
  linkedin: "https://www.linkedin.com/in/fray-cloud",
  email: "official.kwh94@gmail.com",
} as const;
