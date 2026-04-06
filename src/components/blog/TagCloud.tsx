"use client";

interface TagCloudProps {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

export default function TagCloud({ tags, selected, onSelect }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
        style={{
          background: selected === null ? "var(--color-accent)" : "var(--card)",
          color: selected === null ? "#fff" : "var(--muted)",
          border: "1px solid var(--border)",
        }}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag === selected ? null : tag)}
          className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          style={{
            background:
              tag === selected ? "var(--color-accent)" : "var(--card)",
            color: tag === selected ? "#fff" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
