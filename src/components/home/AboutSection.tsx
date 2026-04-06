"use client";

import { useEffect, useRef } from "react";
import { SKILLS } from "@/lib/constants";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";

export default function AboutSection() {
  const { ref, inView } = useScrollAnimation();
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView || !badgesRef.current) return;

    (async () => {
      const { animate, stagger } = await import("animejs");
      animate(badgesRef.current!.querySelectorAll("span"), {
        scale: [0, 1],
        duration: 600,
        delay: stagger(60),
        ease: "outElastic(1, .5)",
      });
    })();
  }, [inView]);

  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24" ref={ref}>
      <div
        className={`transition-all duration-700 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2
          className="mb-8 text-3xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          About
        </h2>
        <p
          className="max-w-2xl text-lg leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          5년 이상의 경력을 가진 풀스택 엔지니어입니다. Computer Vision에서
          시작하여 Solution Engineering, Platform Engineering으로 성장해 왔습니다.
          안정적인 운영은 물론, 지속적인 개선까지 스스로 책임지는 개발자입니다.
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
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "var(--card)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    transform: "scale(0)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
