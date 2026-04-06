import Link from "next/link";
import { PostMeta } from "@/lib/types";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className="group block rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <time className="text-xs" style={{ color: "var(--muted)" }}>
        {post.date}
      </time>
      <h2
        className="mt-2 text-xl font-semibold transition-colors group-hover:text-[var(--color-accent)]"
        style={{ color: "var(--foreground)" }}
      >
        {post.title}
      </h2>
      {post.subtitle && (
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {post.subtitle}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded px-2 py-0.5 text-xs"
            style={{
              background: "var(--background)",
              color: "var(--muted)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
