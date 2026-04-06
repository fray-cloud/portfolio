import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug, getAllPostMeta } from "@/lib/posts";
import PostContent from "@/components/blog/PostContent";
import TableOfContents from "@/components/blog/TableOfContents";
import GiscusComments from "@/components/blog/GiscusComments";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.subtitle || post.title,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Prev/Next navigation
  const allPosts = getAllPostMeta();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prev = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const next = idx > 0 ? allPosts[idx - 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:max-w-5xl">
      <article className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-12">
        <div className="min-w-0">
          <header className="mb-12">
            <time
              className="text-sm"
              style={{ color: "var(--muted)" }}
            >
              {post.date}
            </time>
            <h1
              className="mt-2 text-4xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              {post.title}
            </h1>
            {post.subtitle && (
              <p
                className="mt-2 text-lg"
                style={{ color: "var(--muted)" }}
              >
                {post.subtitle}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "var(--card)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <PostContent html={post.contentHtml} />

          {/* Prev/Next navigation */}
          <nav
            className="mt-16 flex justify-between border-t pt-8"
            style={{ borderColor: "var(--border)" }}
          >
            {prev ? (
              <Link
                href={`/blog/${prev.slug}/`}
                className="text-sm transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--muted)" }}
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/blog/${next.slug}/`}
                className="text-right text-sm transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--muted)" }}
              >
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <GiscusComments />
        </div>

        <aside className="hidden lg:block">
          <TableOfContents headings={post.headings} />
        </aside>
      </article>
    </div>
  );
}
