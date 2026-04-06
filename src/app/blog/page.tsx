import { getAllPostMeta } from "@/lib/posts";
import BlogList from "@/components/blog/BlogList";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const posts = getAllPostMeta();

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <h1
        className="mb-8 text-3xl font-bold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        Blog
      </h1>
      <BlogList posts={posts} />
    </div>
  );
}
