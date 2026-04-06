import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { PostMeta, Post, Heading } from "./types";

const postsDir = path.join(process.cwd(), "content/posts");

function fileNameToSlug(fileName: string): string {
  // Remove date prefix: 2021-06-17-docker-setting.md -> docker-setting
  return fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

function fileNameToDate(fileName: string): string {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function preprocessContent(content: string): string {
  // Convert Jekyll Liquid syntax: {{ "/img/post/..." | relative_url }} -> /img/post/...
  return content.replace(
    /\{\{\s*["']([^"']+)["']\s*\|\s*relative_url\s*\}\}/g,
    "$1"
  );
}

function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /<h([2-3])\s+id="([^"]+)"[^>]*>(.*?)<\/h[2-3]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ""),
    });
  }
  return headings;
}

// Fix internal cross-references between 정처기 posts
function fixInternalLinks(html: string): string {
  const linkMap: Record<string, string> = {
    "exam-reduce-word": "/blog/exam-reduce-word/",
    "exam-reduce-word_2": "/blog/exam-reduce-word_2/",
    "exam-reduce-word_3": "/blog/exam-reduce-word_3/",
  };

  let result = html;
  for (const [slug, url] of Object.entries(linkMap)) {
    // Match old Jekyll-style URLs
    result = result.replace(
      new RegExp(
        `href=["'](?:[^"']*)?${slug.replace(/_/g, "[_-]")}(?:[^"']*)?["']`,
        "g"
      ),
      `href="${url}"`
    );
  }
  return result;
}

export function getAllPostMeta(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  return files
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(postsDir, fileName), "utf-8");
      const { data } = matter(raw);
      return {
        slug: fileNameToSlug(fileName),
        title: data.title || fileName,
        subtitle: data.subtitle,
        date: fileNameToDate(fileName),
        tags: data.tags || [],
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map(fileNameToSlug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const fileName = files.find((f) => fileNameToSlug(f) === slug);
  if (!fileName) return null;

  const raw = fs.readFileSync(path.join(postsDir, fileName), "utf-8");
  const { data, content } = matter(raw);

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(preprocessContent(content));

  let html = processed.toString();
  html = fixInternalLinks(html);

  return {
    slug,
    title: data.title || slug,
    subtitle: data.subtitle,
    date: fileNameToDate(fileName),
    tags: data.tags || [],
    contentHtml: html,
    headings: extractHeadings(html),
  };
}
