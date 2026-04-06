"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/lib/constants";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";
import ProjectModal from "./ProjectModal";

export default function ProjectsSection() {
  const { ref, inView } = useScrollAnimation();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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
    <>
      <section id="projects" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
        <h2
          className={`mb-12 text-3xl font-bold tracking-tight transition-all duration-700 ${
            inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ color: "var(--foreground)" }}
        >
          Projects
        </h2>

        <div
          ref={cardsRef}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PROJECTS.map((project, i) => (
            <button
              key={project.title}
              onClick={() => setSelectedIdx(i)}
              className="group rounded-xl p-6 text-left opacity-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3
                  className="text-lg font-semibold transition-colors group-hover:text-[var(--color-accent)]"
                  style={{ color: "var(--foreground)" }}
                >
                  {project.title}
                  {project.link && (
                    <span className="ml-1 text-xs" style={{ color: "var(--muted)" }}>
                      ↗
                    </span>
                  )}
                </h3>
              </div>
              <p
                className="mb-1 text-xs"
                style={{ color: "var(--muted)" }}
              >
                {project.period}
              </p>
              <p
                className="mb-4 line-clamp-2 text-sm"
                style={{ color: "var(--muted)" }}
              >
                {project.role}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.slice(0, 4).map((t) => (
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
                {project.tech.length > 4 && (
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    +{project.tech.length - 4}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedIdx !== null && (
        <ProjectModal
          project={PROJECTS[selectedIdx]}
          onClose={() => setSelectedIdx(null)}
          onPrev={
            selectedIdx > 0 ? () => setSelectedIdx(selectedIdx - 1) : null
          }
          onNext={
            selectedIdx < PROJECTS.length - 1
              ? () => setSelectedIdx(selectedIdx + 1)
              : null
          }
        />
      )}
    </>
  );
}
