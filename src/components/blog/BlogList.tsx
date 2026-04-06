"use client";

import { useState, useMemo } from "react";
import PostCard from "@/components/blog/PostCard";
import TagCloud from "@/components/blog/TagCloud";
import { PostMeta } from "@/lib/types";

export default function BlogList({ posts }: { posts: PostMeta[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filtered = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <>
      <TagCloud tags={allTags} selected={selectedTag} onSelect={setSelectedTag} />
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}
