"use client";

import { useEffect, useRef } from "react";
import { SKILLS } from "@/lib/constants";
import { SKILL_ICONS } from "@/lib/skill-icons";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";
import RollingText from "@/components/animations/RollingText";

const ROLES = [
  "풀스택 엔지니어",
  "Platform Engineer",
  "Solution Architect",
  "DevOps Engineer",
];

export default function AboutSection() {
  const { ref, inView } = useScrollAnimation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView) return;

    (async () => {
      const { animate, stagger } = await import("animejs");

      // Step 1: Title
      if (titleRef.current) {
        animate(titleRef.current, {
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 600,
          ease: "outQuad",
        });
      }

      // Step 2: Description (delayed)
      if (descRef.current) {
        animate(descRef.current, {
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 600,
          delay: 200,
          ease: "outQuad",
        });
      }

      // Step 3: Badges (more delayed, staggered)
      if (badgesRef.current) {
        animate(badgesRef.current.querySelectorAll("[data-badge]"), {
          scale: [0, 1],
          opacity: [0, 1],
          duration: 600,
          delay: stagger(60, { start: 400 }),
          ease: "outElastic(1, .5)",
        });
      }
    })();
  }, [inView]);

  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
      <h2
        ref={titleRef}
        className="mb-8 text-3xl font-bold tracking-tight opacity-0"
        style={{ color: "var(--foreground)" }}
      >
        About
      </h2>
      <div ref={descRef} className="max-w-2xl opacity-0">
        <p
          className="text-lg leading-relaxed sm:text-xl"
          style={{ color: "var(--muted)" }}
        >
          5년 이상의 경력을 가진{" "}
          <RollingText words={ROLES} className="font-semibold" />
          입니다.
        </p>
        <p
          className="mt-3 text-lg leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          Computer Vision에서 시작하여 Solution Engineering, Platform
          Engineering으로 성장해 왔습니다. 안정적인 운영은 물론, 지속적인 개선까지
          스스로 책임지는 개발자입니다.
        </p>
      </div>

      <div
        ref={badgesRef}
        className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Object.entries(SKILLS).map(([category, skills]) => (
          <div key={category}>
            <h3
              className="mb-3 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const Icon = SKILL_ICONS[skill];
                return (
                  <span
                    key={skill}
                    data-badge
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium opacity-0"
                    style={{
                      background: "var(--card)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                      transform: "scale(0)",
                    }}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
