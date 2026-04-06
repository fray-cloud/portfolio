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

export interface Experience {
  role: string;
  period: string;
  duration: string;
  projects: { name: string; duration: string }[];
}

export interface ProjectDetail {
  title: string;
  role: string;
  period: string;
  partner?: string;
  tech: string[];
  link?: string;
  sections: ProjectSection[];
  achievements: string[];
}

export interface ProjectSection {
  title: string;
  items: string[];
}
