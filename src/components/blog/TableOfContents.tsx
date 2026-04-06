"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/lib/types";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto xl:block">
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--muted)" }}
      >
        On this page
      </p>
      <ul className="space-y-1.5 text-sm">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: `${(level - 2) * 12}px` }}>
            <a
              href={`#${id}`}
              className="block py-0.5 transition-colors"
              style={{
                color:
                  active === id ? "var(--color-accent)" : "var(--muted)",
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
