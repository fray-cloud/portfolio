"use client";

import { useEffect, useRef } from "react";
import { PROJECTS } from "@/lib/constants";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";

export default function ProjectsSection() {
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
    <section id="projects" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
      <h2
        className={`mb-12 text-3xl font-bold tracking-tight transition-all duration-700 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ color: "var(--foreground)" }}
      >
        Projects
      </h2>

      <div ref={cardsRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <div
            key={project.title}
            className="group rounded-xl p-6 opacity-0 transition-shadow duration-300 hover:shadow-lg"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--color-accent)]"
                >
                  {project.title} ↗
                </a>
              ) : (
                project.title
              )}
            </h3>
            <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
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
