"use client";

import { useEffect, useRef } from "react";

export function useSplitTextReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { splitText } = await import("animejs");
      const { animate, stagger } = await import("animejs");

      const splitter = splitText(el);

      animate(splitter.chars, {
        opacity: [0, 1],
        filter: ["blur(8px)", "blur(0px)"],
        duration: 800,
        delay: stagger(40),
        ease: "outQuad",
      });

      cleanup = () => splitter.revert();
    })();

    return () => cleanup?.();
  }, []);

  return ref;
}
