import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface DeliverableFrontmatter {
  title: string;
  owner: string;
  status: "staging" | "deployed";
  environment: "staging" | "prod";
}

export interface Deliverable {
  slug: string;
  frontmatter: DeliverableFrontmatter;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function getAllDeliverables(): Promise<Deliverable[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdxFiles = files.filter((f) => f.endsWith(".mdx") && f !== "commits.mdx");

    const deliverables = await Promise.all(
      mdxFiles.map(async (filename) => {
        const filePath = path.join(CONTENT_DIR, filename);
        const raw = await fs.readFile(filePath, "utf-8");
        const { data, content } = matter(raw);
        return {
          slug: filename.replace(/\.mdx$/, ""),
          frontmatter: data as DeliverableFrontmatter,
          content,
        };
      })
    );

    return deliverables.sort((a, b) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title)
    );
  } catch {
    return [];
  }
}

export async function getDeliverable(
  slug: string
): Promise<Deliverable | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      frontmatter: data as DeliverableFrontmatter,
      content,
    };
  } catch {
    return null;
  }
}

export function groupByOwner(
  deliverables: Deliverable[]
): Record<string, Deliverable[]> {
  return deliverables.reduce(
    (acc, d) => {
      const owner = d.frontmatter.owner;
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(d);
      return acc;
    },
    {} as Record<string, Deliverable[]>
  );
}

export function groupByEnvironment(
  deliverables: Deliverable[]
): Record<string, Deliverable[]> {
  return deliverables.reduce(
    (acc, d) => {
      const env = d.frontmatter.environment;
      if (!acc[env]) acc[env] = [];
      acc[env].push(d);
      return acc;
    },
    {} as Record<string, Deliverable[]>
  );
}

export interface CommitEntry {
  message: string;
  author: string;
  date: string;
}

export async function getCommitLog(): Promise<CommitEntry[]> {
  try {
    const filePath = path.join(CONTENT_DIR, "commits.mdx");
    const raw = await fs.readFile(filePath, "utf-8");
    const entries: CommitEntry[] = [];
    let currentDate = "";

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      const dateMatch = trimmed.match(/^### (\d{4}-\d{2}-\d{2})$/);
      if (dateMatch) {
        currentDate = dateMatch[1];
        continue;
      }
      if (!trimmed.startsWith("- ")) continue;
      const text = trimmed.slice(2);
      const match = text.match(/^(.+?)\s*—\s*\*(.+?)\*$/);
      if (match) {
        entries.push({ message: match[1].trim(), author: match[2].trim(), date: currentDate });
      } else {
        entries.push({ message: text, author: "", date: currentDate });
      }
    }

    return entries;
  } catch {
    return [];
  }
}
