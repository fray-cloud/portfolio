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
      const items = itemsRef.current!.querySelectorAll("[data-exp-item]");
      animate(items, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: stagger(150),
        ease: "outQuad",
      });
    })();
  }, [inView]);

  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
      <h2
        className={`mb-12 text-3xl font-bold tracking-tight transition-all duration-700 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ color: "var(--foreground)" }}
      >
        Experience
      </h2>

      <div className="relative" ref={itemsRef}>
        {/* Vertical timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px md:left-1/2"
          style={{ background: "var(--border)" }}
        />

        {EXPERIENCES.map((exp, i) => (
          <div
            key={exp.role}
            className="relative mb-10 opacity-0"
            data-exp-item
          >
            {/* Dot */}
            <div
              className="absolute left-4 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full md:left-1/2"
              style={{ background: "var(--color-accent)" }}
            />

            {/* Content: mobile=always right, desktop=alternating */}
            <div
              className={`pl-12 ${
                i % 2 === 0
                  ? "md:pl-0 md:pr-12 md:mr-[50%] md:text-right"
                  : "md:pl-12 md:ml-[50%]"
              }`}
            >
              <div
                className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${
                  i % 2 === 0 ? "md:justify-end" : ""
                }`}
              >
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {exp.role}
                </h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                >
                  {exp.duration}
                </span>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                {exp.period}
              </p>

              <ul className="mt-3 space-y-1.5">
                {exp.projects.map((p) => (
                  <li
                    key={p.name}
                    className={`flex items-center gap-2 text-sm ${
                      i % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    <span
                      className="h-1 w-1 shrink-0 rounded-full md:hidden"
                      style={{ background: "var(--muted)" }}
                    />
                    <span style={{ color: "var(--foreground)" }}>
                      {p.name}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--muted)" }}
                    >
                      {p.duration}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
