"use client";

import { useEffect, useRef } from "react";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";
import { SiGithub } from "react-icons/si";

const FUN_PROJECTS = [
  {
    title: "Coin",
    description: "재미로 만든 코인 시뮬레이터 데모",
    link: "https://fray-cloud-coin.vercel.app/demo",
    repo: "https://github.com/fray-cloud/coin",
    tech: ["Next.js", "TypeScript", "Vercel"],
  },
];

export default function JustFunSection() {
  const { ref, inView } = useScrollAnimation();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView || !cardsRef.current) return;

    (async () => {
      const { animate, stagger } = await import("animejs");
      animate(cardsRef.current!.children, {
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 600,
        delay: stagger(100),
        ease: "outQuad",
      });
    })();
  }, [inView]);

  return (
    <section id="justfun" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
      <h2
        className={`mb-4 text-3xl font-bold tracking-tight transition-all duration-700 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ color: "var(--foreground)" }}
      >
        Just Fun
      </h2>
      <p
        className={`mb-12 text-sm transition-all duration-700 delay-100 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ color: "var(--muted)" }}
      >
        재미로 만든 사이드 프로젝트들
      </p>

      <div ref={cardsRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FUN_PROJECTS.map((project) => (
          <div
            key={project.title}
            className="rounded-xl p-6 opacity-0"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {project.title}
              </h3>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--muted)" }}
              >
                Demo ↗
              </a>
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--muted)" }}
              >
                <SiGithub className="h-4.5 w-4.5" />
              </a>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              {project.description}
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{
                    background: "var(--background)",
                    color: "var(--muted)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
