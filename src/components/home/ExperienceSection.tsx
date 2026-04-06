"use client";

import { useEffect, useRef } from "react";
import { EXPERIENCES } from "@/lib/constants";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";

export default function ExperienceSection() {
  const { ref, inView } = useScrollAnimation();
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView || !itemsRef.current) return;

    (async () => {
      const { animate, stagger } = await import("animejs");
      // Animate the line drawing
      const line = itemsRef.current!.querySelector("[data-timeline-line]");
      if (line) {
        animate(line, {
          scaleX: [0, 1],
          duration: 800,
          ease: "outQuad",
        });
      }
      // Animate each block
      const blocks = itemsRef.current!.querySelectorAll("[data-exp-block]");
      animate(blocks, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: stagger(200, { start: 400 }),
        ease: "outQuad",
      });
    })();
  }, [inView]);

  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
      <h2
        className={`mb-16 text-3xl font-bold tracking-tight transition-all duration-700 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ color: "var(--foreground)" }}
      >
        Experience
      </h2>

      <div ref={itemsRef} className="relative">
        {/* Horizontal timeline line */}
        <div
          data-timeline-line
          className="absolute top-6 left-0 right-0 h-px origin-left"
          style={{ background: "var(--border)", transform: "scaleX(0)" }}
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {EXPERIENCES.map((exp) => (
            <div key={exp.role} data-exp-block className="relative pt-10 opacity-0">
              {/* Dot on the line */}
              <div
                className="absolute top-4 left-0 h-3 w-3 -translate-y-1/2 rounded-full sm:left-1/2 sm:-translate-x-1/2"
                style={{ background: "var(--color-accent)" }}
              />

              <div className="sm:text-center">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {exp.role}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--muted)" }}
                >
                  {exp.period}
                </p>
                <span
                  className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "var(--color-accent)",
                    color: "#fff",
                  }}
                >
                  {exp.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
