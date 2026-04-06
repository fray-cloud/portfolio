"use client";

import { useSplitTextReveal } from "@/components/animations/useSplitTextReveal";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const titleRef = useSplitTextReveal();
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tagsRef.current;
    if (!el) return;

    (async () => {
      const { animate, stagger } = await import("animejs");
      animate(el.children, {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(100, { start: 600 }),
        duration: 600,
        ease: "outQuad",
      });
    })();
  }, []);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1
        ref={titleRef as React.RefObject<HTMLHeadingElement>}
        className="text-6xl font-black uppercase tracking-tighter sm:text-8xl"
        style={{ color: "var(--foreground)" }}
      >
        Portfolio
      </h1>
      <div ref={tagsRef} className="mt-6 flex gap-3">
        {["#FullStack", "#DevOps", "#Architect"].map((tag) => (
          <span
            key={tag}
            className="text-sm font-medium opacity-0 sm:text-base"
            style={{ color: "var(--color-accent)" }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-16 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "var(--muted)" }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
