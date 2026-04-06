import Link from "next/link";
import { getAllPostMeta } from "@/lib/posts";
import BlogHighlightsWrapper from "./BlogHighlightsWrapper";

export default function BlogHighlights() {
  const posts = getAllPostMeta().slice(0, 4);

  return (
    <BlogHighlightsWrapper>
      <section id="blog" className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 flex items-center justify-between">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Blog
          </h2>
          <Link
            href="/blog/"
            className="text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
            style={{ color: "var(--muted)" }}
          >
            View all posts →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <time className="text-xs" style={{ color: "var(--muted)" }}>
                {post.date}
              </time>
              <h3
                className="mt-2 text-lg font-semibold transition-colors group-hover:text-[var(--color-accent)]"
                style={{ color: "var(--foreground)" }}
              >
                {post.title}
              </h3>
              {post.subtitle && (
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  {post.subtitle}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
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
          ))}
        </div>
      </section>
    </BlogHighlightsWrapper>
  );
}
