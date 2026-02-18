import Link from "next/link";
import type { Deliverable } from "@/lib/mdx";
import { StatusBadge } from "./status-badge";
import { EnvironmentBadge } from "./environment-badge";

export function RoadmapCard({ deliverable }: { deliverable: Deliverable }) {
  const { slug, frontmatter } = deliverable;
  const latestEntry = extractLatestEntry(deliverable.content);

  return (
    <Link
      href={`/deliverable/${slug}`}
      className="group block border border-border-default bg-bg-panel hover:border-neutral-900 hover:shadow-[0_2px_8px_rgba(26,26,20,0.08)] hover:-translate-y-px transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-primary">
            {frontmatter.title}
          </h3>
          <EnvironmentBadge environment={frontmatter.environment} />
        </div>
        <div className="mb-3 flex items-center gap-3">
          <StatusBadge status={frontmatter.status} />
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
            {frontmatter.owner}
          </span>
        </div>
        {latestEntry && (
          <p className="text-[11px] leading-relaxed text-text-secondary line-clamp-2">
            {latestEntry}
          </p>
        )}
      </div>
      <div className="border-t border-border-default px-4 py-2 flex justify-between">
        <span className="text-[10px] tracking-[0.1em] text-neutral-400 font-mono">
          // {slug.toUpperCase()}
        </span>
        <span className="text-[10px] tracking-[0.1em] text-neutral-400 group-hover:text-text-primary transition-colors">
          VIEW →
        </span>
      </div>
    </Link>
  );
}

function extractLatestEntry(content: string): string | null {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("### ")) {
      const nextLines: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (next.startsWith("### ") || next.startsWith("## ")) break;
        if (next) nextLines.push(next);
      }
      return nextLines.join(" ") || null;
    }
  }
  return null;
}
