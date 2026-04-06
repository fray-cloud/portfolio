import { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostMeta().map((post) => ({
    url: `${SITE.url}/blog/${post.slug}/`,
    lastModified: new Date(post.date),
  }));

  return [
    { url: SITE.url, lastModified: new Date() },
    { url: `${SITE.url}/blog/`, lastModified: new Date() },
    ...posts,
  ];
}
