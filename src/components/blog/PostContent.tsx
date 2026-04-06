"use client";

export default function PostContent({ html }: { html: string }) {
  return (
    <article
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
