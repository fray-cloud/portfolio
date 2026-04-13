"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const tags = tagsRef.current;
    const scroll = scrollRef.current;
    if (!title || !tags || !scroll) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { splitText } = await import("animejs");
      const { animate, stagger } = await import("animejs");

      const splitter = splitText(title, { chars: true });

      // Step 1: Split text blur reveal
      const titleAnim = animate(splitter.chars, {
        opacity: [0, 1],
        filter: ["blur(8px)", "blur(0px)"],
        duration: 800,
        delay: stagger(40),
        ease: "outQuad",
      });

      // Step 2: After title completes → hashtags fade up
      await titleAnim;

      animate(tags.children, {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(100),
        duration: 600,
        ease: "outQuad",
      });

      // Step 3: Scroll indicator fade in
      animate(scroll, {
        opacity: [0, 1],
        duration: 800,
        delay: 300,
        ease: "outQuad",
      });

      cleanup = () => splitter.revert();
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1
        ref={titleRef}
        className="text-5xl font-black uppercase tracking-tighter sm:text-6xl md:text-8xl"
        style={{ color: "var(--foreground)" }}
      >
        Portfolio
      </h1>
      <div ref={tagsRef} className="mt-6 flex flex-wrap justify-center gap-3">
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
      <div ref={scrollRef} className="mt-16 animate-bounce opacity-0">
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
