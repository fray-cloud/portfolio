export interface PostMeta {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  tags: string[];
}

export interface Post extends PostMeta {
  contentHtml: string;
  headings: Heading[];
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  link?: string;
}

export interface Experience {
  role: string;
  period: string;
  items: { name: string; description: string }[];
}
