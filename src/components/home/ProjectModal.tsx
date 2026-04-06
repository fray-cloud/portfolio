"use client";

import { useEffect, useCallback } from "react";
import { ProjectDetail } from "@/lib/types";

interface ProjectModalProps {
  project: ProjectDetail;
  onClose: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

export default function ProjectModal({
  project,
  onClose,
  onPrev,
  onNext,
}: ProjectModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl shadow-2xl"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b px-6 py-5"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="pr-8">
            <div className="flex items-center gap-3">
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                {project.title}
              </h2>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors hover:text-[var(--color-accent)]"
                  style={{ color: "var(--muted)" }}
                >
                  ↗ Link
                </a>
              )}
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {project.period}
              {project.partner && ` · ${project.partner}`}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {project.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1 transition-colors hover:bg-[var(--card)]"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          {/* Tech tags */}
          <div className="mb-6 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: "var(--card)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Sections */}
          {project.sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3
                className="mb-3 text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full"
                      style={{ background: "var(--muted)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Achievements */}
          {project.achievements.length > 0 && (
            <div className="mb-2">
              <h3
                className="mb-3 text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                업무 성과
              </h3>
              <ul className="space-y-2">
                {project.achievements.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full"
                      style={{ background: "var(--color-accent)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer: Prev/Next navigation */}
        <div
          className="flex items-center justify-between border-t px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          {onPrev ? (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--muted)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              이전
            </button>
          ) : (
            <span />
          )}
          {onNext ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--muted)" }}
            >
              다음
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
