import Link from "next/link";
import type { Deliverable, DeliverableFrontmatter } from "@/lib/mdx";

interface RoadmapTimelineProps {
  deliverables: Deliverable[];
}

const phaseOrder: DeliverableFrontmatter["status"][] = [
  "deployed",
  "in-review",
  "in-dev",
  "blocked",
];

const phaseLabels: Record<DeliverableFrontmatter["status"], string> = {
  deployed: "SHIPPED",
  "in-review": "IN REVIEW",
  "in-dev": "IN PROGRESS",
  blocked: "BLOCKED",
};

export function RoadmapTimeline({ deliverables }: RoadmapTimelineProps) {
  const shipped = deliverables.filter(
    (d) => d.frontmatter.status === "deployed"
  ).length;
  const total = deliverables.length;
  const pct = total > 0 ? Math.round((shipped / total) * 100) : 0;

  const grouped = phaseOrder
    .map((status) => ({
      status,
      label: phaseLabels[status],
      items: deliverables.filter((d) => d.frontmatter.status === status),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="border border-border-default">
      {/* Header */}
      <div className="border-b border-border-default px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          Roadmap
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
            {shipped}/{total} shipped
          </span>
          <span className="font-mono text-[18px] font-bold text-neutral-900">
            {pct}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex h-2 w-full overflow-hidden rounded-sm bg-neutral-300">
          {grouped.map((g) => {
            const w = (g.items.length / total) * 100;
            return (
              <div
                key={g.status}
                className={segmentColor(g.status)}
                style={{ width: `${w}%` }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex gap-4">
          {grouped.map((g) => (
            <div key={g.status} className="flex items-center gap-1.5">
              <span
                className={`inline-block h-[6px] w-[6px] rounded-full ${dotColor(g.status)}`}
              />
              <span className="text-[10px] tracking-[0.12em] text-text-muted">
                {g.label} ({g.items.length})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 pt-2 pb-1">
        {grouped.map((group, gi) => (
          <div key={group.status}>
            {/* Phase divider */}
            <div className="flex items-center gap-2 mt-3 mb-1.5">
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${phaseTextColor(group.status)}`}
              >
                {group.label}
              </span>
              <div className="flex-1 border-t border-border-default" />
            </div>

            {/* Items */}
            {group.items.map((d, i) => {
              const lastDate = extractLastDate(d.content);
              const lastEntry = extractLatestEntry(d.content);
              const isLast = gi === grouped.length - 1 && i === group.items.length - 1;

              return (
                <Link
                  key={d.slug}
                  href={`/deliverable/${d.slug}`}
                  className="group flex gap-3 relative -mx-2 px-2 rounded hover:bg-bg-surface/60 transition-colors"
                >
                  {/* Timeline spine + checkbox */}
                  <div className="flex flex-col items-center w-5 shrink-0">
                    <CheckIndicator status={d.frontmatter.status} />
                    {!isLast && (
                      <div className="flex-1 w-px bg-border-default min-h-[16px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 pb-4 ${isLast ? "pb-2" : ""}`}
                  >
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span
                        className={`text-[12px] font-semibold tracking-[0.06em] group-hover:text-neutral-900 transition-colors truncate shrink min-w-0 ${
                          d.frontmatter.status === "deployed"
                            ? "text-text-muted line-through decoration-status-done decoration-1"
                            : "text-text-primary"
                        }`}
                      >
                        {d.frontmatter.title}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-text-muted shrink-0">
                        {d.frontmatter.owner}
                      </span>
                      {lastDate && (
                        <span className="text-[10px] tracking-[0.1em] text-neutral-400 shrink-0 ml-auto">
                          {lastDate}
                        </span>
                      )}
                    </div>
                    {lastEntry && (
                      <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary line-clamp-1 group-hover:text-text-primary transition-colors">
                        {lastEntry}
                      </p>
                    )}
                  </div>

                  {/* Arrow on hover */}
                  <span className="self-start mt-0.5 text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    VIEW →
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between border-t border-border-default px-4 py-2">
        <span className="text-[10px] tracking-widest text-neutral-400">
          // SECTION: ROADMAP_TIMELINE
        </span>
        <span className="text-[10px] tracking-widest text-neutral-400">
          005
        </span>
      </div>
    </div>
  );
}

/* ─── Check indicators ─── */

function CheckIndicator({
  status,
}: {
  status: DeliverableFrontmatter["status"];
}) {
  if (status === "deployed") {
    return (
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center border border-status-done bg-status-done/10">
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          className="text-status-done"
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </div>
    );
  }

  if (status === "in-dev") {
    return (
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center border border-accent-text/40 bg-accent-glow">
        <span
          className="inline-block h-[6px] w-[6px] bg-accent border border-accent-text/50 rounded-sm"
          style={{ animation: "pulse-dot 2s infinite" }}
        />
      </div>
    );
  }

  if (status === "in-review") {
    return (
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center border border-[#e0a030] bg-[#e0a030]/10">
        <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#e0a030]" />
      </div>
    );
  }

  // blocked
  return (
    <div className="mt-0.5 flex h-5 w-5 items-center justify-center border border-status-error bg-status-error/10">
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        className="text-status-error"
      >
        <path
          d="M1 1L7 7M7 1L1 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
}

/* ─── Helpers ─── */

function segmentColor(status: DeliverableFrontmatter["status"]) {
  switch (status) {
    case "deployed":
      return "bg-status-done";
    case "in-review":
      return "bg-[#e0a030]";
    case "in-dev":
      return "bg-accent shadow-[inset_0_0_0_1px_rgba(74,104,0,0.4)]";
    case "blocked":
      return "bg-status-error";
  }
}

function dotColor(status: DeliverableFrontmatter["status"]) {
  switch (status) {
    case "deployed":
      return "bg-status-done";
    case "in-review":
      return "bg-[#e0a030]";
    case "in-dev":
      return "bg-accent border border-accent-text/50";
    case "blocked":
      return "bg-status-error";
  }
}

function phaseTextColor(status: DeliverableFrontmatter["status"]) {
  switch (status) {
    case "deployed":
      return "text-status-done";
    case "in-review":
      return "text-[#e0a030]";
    case "in-dev":
      return "text-accent-text";
    case "blocked":
      return "text-status-error";
  }
}

function extractLastDate(content: string): string | null {
  const match = content.match(/### (\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
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
        if (next) nextLines.push(next.replace(/\s*—\s*\*.*\*$/, ""));
      }
      return nextLines.join(" ") || null;
    }
  }
  return null;
}
