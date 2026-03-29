import matter from 'gray-matter';
import { marked } from 'marked';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Article {
  slug: string;
  title: string;
  date: Date;
  tags: string[];
  references: { title: string; url: string }[];
  body: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  tags: string[];
  status: 'active' | 'completed' | 'archived';
  featured: boolean;
  body: string;
}

// ── File globs (resolved at build time by Vite) ───────────────────────────────

const articleFiles = import.meta.glob('/content/articles/*.md', {
  query: '?raw',
  import: 'default',
});

const projectFiles = import.meta.glob('/content/projects/*.md', {
  query: '?raw',
  import: 'default',
});

// ── Loaders ───────────────────────────────────────────────────────────────────

export async function loadArticles(): Promise<Article[]> {
  const results = await Promise.all(
    Object.entries(articleFiles).map(async ([path, loader]) => {
      const raw = (await loader()) as string;
      const { data, content } = matter(raw);
      return {
        slug: path.replace(/.*\//, '').replace('.md', ''),
        title: (data.title as string) ?? 'Untitled',
        date: new Date(data.date),
        tags: (data.tags as string[]) ?? [],
        references: (data.references as { title: string; url: string }[]) ?? [],
        body: await marked(content),
      } as Article;
    }),
  );
  // Newest first
  return results.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function loadProjects(): Promise<Project[]> {
  const results = await Promise.all(
    Object.entries(projectFiles).map(async ([path, loader]) => {
      const raw = (await loader()) as string;
      const { data, content } = matter(raw);
      return {
        slug: path.replace(/.*\//, '').replace('.md', ''),
        title: (data.title as string) ?? 'Untitled',
        description: (data.description as string) ?? '',
        dateStart: (data.date_start as string) ?? '',
        dateEnd: (data.date_end as string) ?? '',
        tags: (data.tags as string[]) ?? [],
        status: (data.status as Project['status']) ?? 'completed',
        featured: (data.featured as boolean) ?? false,
        body: await marked(content),
      } as Project;
    }),
  );
  // Featured first, then by date_start descending
  return results.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.dateStart.localeCompare(a.dateStart);
  });
}
