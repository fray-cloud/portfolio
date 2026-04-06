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
  const measureRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Measure the widest word to fix container size
  useEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;

    let maxW = 0;
    let maxH = 0;
    const children = measure.children;
    for (let i = 0; i < children.length; i++) {
      const el = children[i] as HTMLElement;
      maxW = Math.max(maxW, el.offsetWidth);
      maxH = Math.max(maxH, el.offsetHeight);
    }
    setSize({ width: maxW, height: maxH });
  }, [words]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || size.height === 0) return;

    (async () => {
      const { animate } = await import("animejs");
      const children = container.querySelectorAll<HTMLElement>("[data-roll]");

      children.forEach((child, i) => {
        if (i === currentIndex) {
          child.style.visibility = "visible";
          animate(child, {
            translateY: ["100%", "0%"],
            opacity: [0, 1],
            duration: 500,
            ease: "outQuad",
          });
        } else {
          animate(child, {
            translateY: ["0%", "-100%"],
            opacity: [1, 0],
            duration: 300,
            ease: "inQuad",
          }).then(() => {
            child.style.visibility = "hidden";
          });
        }
      });
    })();
  }, [currentIndex, size.height]);

  return (
    <>
      {/* Hidden measurer to get max width */}
      <span
        ref={measureRef}
        className={className}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        {words.map((word) => (
          <span key={word} style={{ display: "block" }}>
            {word}
          </span>
        ))}
      </span>

      {/* Visible fixed-size container */}
      <span
        ref={containerRef}
        className={`relative inline-block overflow-hidden ${className}`}
        style={{
          width: size.width || "auto",
          height: size.height || "auto",
          verticalAlign: "bottom",
        }}
      >
        {words.map((word, i) => (
          <span
            key={word}
            data-roll
            className="absolute left-0 top-0 whitespace-nowrap"
            style={{
              color: "var(--color-accent)",
              visibility: i === 0 ? "visible" : "hidden",
            }}
          >
            {word}
          </span>
        ))}
      </span>
    </>
  );
}
