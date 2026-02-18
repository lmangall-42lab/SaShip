import type { Deliverable } from "@/lib/mdx";
import { StatusBadge } from "./status-badge";
import Link from "next/link";

interface PipelineViewProps {
  deliverables: Deliverable[];
}

export function PipelineView({ deliverables }: PipelineViewProps) {
  const devItems = deliverables.filter(
    (d) => d.frontmatter.environment === "dev"
  );
  const prodItems = deliverables.filter(
    (d) => d.frontmatter.environment === "prod"
  );

  return (
    <div className="grid grid-cols-1 gap-0 border border-border-default md:grid-cols-2">
      <PipelineColumn label="DEV" sectionNum="001" items={devItems} />
      <PipelineColumn label="PROD" sectionNum="002" items={prodItems} />
    </div>
  );
}

function PipelineColumn({
  label,
  sectionNum,
  items,
}: {
  label: string;
  sectionNum: string;
  items: Deliverable[];
}) {
  return (
    <div className="relative border border-border-default">
      <div className="border-b border-border-default px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          {label}
        </span>
        <span className="ml-3 text-[10px] uppercase tracking-[0.15em] text-text-muted">
          {items.length} items
        </span>
      </div>
      <div className="divide-y divide-border-default">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <span className="text-[11px] text-text-muted">
              No items in pipeline
            </span>
          </div>
        ) : (
          items.map((d) => (
            <Link
              key={d.slug}
              href={`/deliverable/${d.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-bg-surface transition-colors"
            >
              <div>
                <span className="text-[12px] font-medium text-text-primary">
                  {d.frontmatter.title}
                </span>
                <span className="ml-2 text-[10px] text-text-muted uppercase tracking-[0.1em]">
                  {d.frontmatter.owner}
                </span>
              </div>
              <StatusBadge status={d.frontmatter.status} />
            </Link>
          ))
        )}
      </div>
      <div className="flex justify-between border-t border-border-default px-4 py-2">
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          // PIPELINE: {label}
        </span>
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          {sectionNum}
        </span>
      </div>
    </div>
  );
}
