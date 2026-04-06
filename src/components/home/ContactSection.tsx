"use client";

import { useEffect, useRef } from "react";
import { CONTACT } from "@/lib/constants";
import { useScrollAnimation } from "@/components/animations/useScrollAnimation";
import { SiGithub, SiGmail } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";

const links = [
  { label: "GitHub", href: CONTACT.github, icon: SiGithub },
  { label: "LinkedIn", href: CONTACT.linkedin, icon: FaLinkedinIn },
  { label: "Email", href: `mailto:${CONTACT.email}`, icon: SiGmail },
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
        {links.map(({ label, href, icon: Icon }) => (
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
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </section>
  );
}
