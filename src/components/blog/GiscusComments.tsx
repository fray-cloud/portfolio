"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "fray-cloud/portfolio");
    script.setAttribute("data-repo-id", "R_kgDOR7Fa-A");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOR7Fa-M4C6LJv");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light"
    );
    script.setAttribute("data-lang", "ko");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.innerHTML = "";
    ref.current.appendChild(script);
  }, [theme]);

  return <div ref={ref} className="mt-16" />;
}
