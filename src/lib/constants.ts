import { Project, Experience } from "./types";

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
    items: [
      {
        name: "수위 감지 시스템",
        description: "코레일 / 객체 인식, 영상 전처리",
      },
      {
        name: "영상 처리 개발",
        description: "Django, OpenCV, TensorFlow",
      },
    ],
  },
  {
    role: "Solution Engineer",
    period: "2022.01 ~ 2024.05",
    items: [
      {
        name: "FNU AICC 구축",
        description: "PM, AI 기술 통합 (STT, QA, 콜봇)",
      },
      {
        name: "사내 이슈 관리 자동화",
        description: "Jira/Confluence, Forge",
      },
      {
        name: "SKBCCC 유지보수",
        description: "IPCC 솔루션 운영",
      },
    ],
  },
  {
    role: "Platform Engineer",
    period: "2024.08 ~ 현재",
    items: [
      {
        name: "iOMS 개발",
        description: "MSA/DDD 아키텍처 리딩, Spring Boot, FastAPI, K8s",
      },
      {
        name: "공항자원배정 플랫폼",
        description: "React, NestJS, Jenkins, ArgoCD, GitOps",
      },
      {
        name: "사내 홈페이지",
        description: "Next.js 16, anime.js, CVA, Storybook",
      },
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    title: "iOMS",
    description: "지능형 운영 관리 시스템, MSA 아키텍처 리딩",
    tech: ["React", "Spring Boot", "FastAPI", "K8s", "Kafka"],
  },
  {
    title: "공항자원배정 플랫폼",
    description: "클라우드 기반 AI 학습 자원배정 (IITP)",
    tech: ["React", "NestJS", "MongoDB", "ArgoCD"],
  },
  {
    title: "kephas.kr",
    description: "기업 홈페이지 전체 개발",
    tech: ["Next.js 16", "anime.js", "CVA", "Lenis"],
    link: "https://kephas.kr",
  },
  {
    title: "암호화폐 자동매매",
    description: "풀스택 트레이딩 플랫폼",
    tech: ["GitHub에서 확인"],
    link: "https://github.com/fray-cloud/coin",
  },
  {
    title: "수위 감지 시스템",
    description: "철도 교량 실시간 수위 모니터링",
    tech: ["Django", "OpenCV", "TensorFlow"],
  },
];

export const CONTACT = {
  github: "https://github.com/fray-cloud",
  email: "official.kwh94@gmail.com",
} as const;
