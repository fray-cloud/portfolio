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
        translateX: ((_el: unknown, i: number) =>
          i % 2 === 0 ? [-40, 0] : [40, 0]) as Parameters<typeof animate>[1]["translateX"],
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
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px sm:left-1/2"
          style={{ background: "var(--border)" }}
        />

        {EXPERIENCES.map((exp, i) => (
          <div
            key={exp.role}
            className="relative mb-12 opacity-0"
            data-exp-item
          >
            <div
              className="absolute left-4 -translate-x-1/2 sm:left-1/2"
              style={{ top: "6px" }}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
            </div>

            <div
              className={`ml-10 sm:ml-0 ${
                i % 2 === 0
                  ? "sm:mr-[50%] sm:pr-12 sm:text-right"
                  : "sm:ml-[50%] sm:pl-12"
              }`}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {exp.role}
              </h3>
              <p className="mb-3 text-sm" style={{ color: "var(--muted)" }}>
                {exp.period}
              </p>
              <ul className="space-y-2">
                {exp.items.map((item) => (
                  <li key={item.name}>
                    <span
                      className="font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      — {item.description}
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
