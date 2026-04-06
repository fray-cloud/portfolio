"use client";

import { useEffect, useRef } from "react";
import { CONTACT } from "@/lib/constants";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";

const links = [
  {
    label: "GitHub",
    href: CONTACT.github,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: `mailto:${CONTACT.email}`,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4l-10 8L2 4" />
      </svg>
    ),
  },
];

export default function ContactSection() {
  const { ref, inView } = useScrollAnimation();
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView || !iconsRef.current) return;

    (async () => {
      const { animate, stagger } = await import("animejs");
      animate(iconsRef.current!.children, {
        scale: [0, 1],
        duration: 800,
        delay: stagger(120),
        ease: "outElastic(1, .5)",
      });
    })();
  }, [inView]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center" ref={ref}>
      <div
        className={`transition-all duration-700 ${
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2
          className="mb-4 text-3xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Contact
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
          {CONTACT.email}
        </p>
      </div>
      <div ref={iconsRef} className="flex justify-center gap-6">
        {links.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:text-[var(--color-accent)]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              transform: "scale(0)",
            }}
            aria-label={label}
          >
            {icon}
          </a>
        ))}
      </div>
    </section>
  );
}
