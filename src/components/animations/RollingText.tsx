"use client";

import { useEffect, useRef, useState } from "react";

interface RollingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function RollingText({
  words,
  interval = 2500,
  className = "",
}: RollingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const { animate } = await import("animejs");
      const children = container.children;

      // Animate out the previous word (slide up + fade)
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        if (i === currentIndex) {
          child.style.position = "relative";
          child.style.display = "block";
          animate(child, {
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 500,
            ease: "outQuad",
          });
        } else {
          animate(child, {
            translateY: [0, -20],
            opacity: [1, 0],
            duration: 300,
            ease: "inQuad",
          }).then(() => {
            child.style.display = "none";
          });
        }
      }
    })();
  }, [currentIndex]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block overflow-hidden ${className}`}
      style={{ verticalAlign: "bottom" }}
    >
      {words.map((word, i) => (
        <span
          key={word}
          className="whitespace-nowrap"
          style={{
            display: i === 0 ? "block" : "none",
            color: "var(--color-accent)",
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
