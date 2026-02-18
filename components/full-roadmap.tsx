import Link from "next/link";
import type { Deliverable } from "@/lib/mdx";
import type { WeekSchedule, DeliverableEntry } from "@/lib/roadmap-schedule";

interface FullRoadmapProps {
  schedule: WeekSchedule[];
  deliverables: Deliverable[];
  devNames: string[];
}

export function FullRoadmap({
  schedule,
  deliverables,
  devNames,
}: FullRoadmapProps) {
  // Count totals across all weeks
  let totalPlanned = 0;
  for (const week of schedule) {
    for (const entries of Object.values(week.devs)) {
      totalPlanned += entries.length;
    }
  }
  const totalShipped = deliverables.filter(
    (d) => d.frontmatter.status === "deployed"
  ).length;
  const totalInDev = deliverables.filter(
    (d) => d.frontmatter.status === "in-dev"
  ).length;
  const pct =
    totalPlanned > 0 ? Math.round((totalShipped / totalPlanned) * 100) : 0;

  return (
    <div className="border border-border-default">
      {/* Header */}
      <div className="border-b border-border-default px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          90-Day Roadmap
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Legend dotClass="bg-status-done" label="SHIPPED" />
            <Legend dotClass="bg-accent border border-accent-text/50" label="IN DEV" />
            <Legend dotClass="bg-[#e0a030]" label="REVIEW" />
            <Legend dotClass="bg-status-error" label="BLOCKED" />
            <Legend dotClass="bg-neutral-300" label="PLANNED" />
          </div>
          <span className="font-mono text-[18px] font-bold text-neutral-900">
            {pct}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex h-2 w-full overflow-hidden rounded-sm bg-neutral-300">
          {totalShipped > 0 && (
            <div
              className="bg-status-done"
              style={{ width: `${(totalShipped / totalPlanned) * 100}%` }}
            />
          )}
          {totalInDev > 0 && (
            <div
              className="bg-accent shadow-[inset_0_0_0_1px_rgba(74,104,0,0.4)]"
              style={{ width: `${(totalInDev / totalPlanned) * 100}%` }}
            />
          )}
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-[10px] tracking-[0.12em] text-text-muted">
            {totalShipped}/{totalPlanned} shipped
          </span>
          <span className="text-[10px] tracking-[0.12em] text-text-muted">
            {totalInDev} in progress
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[72px_1fr_1fr] border-b border-t border-border-default">
        <div className="border-r border-border-default px-3 py-2" />
        {devNames.map((name) => (
          <div
            key={name}
            className="border-r border-border-default px-3 py-2 last:border-r-0"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-primary">
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Week rows — one row per week */}
      {schedule.map((week, wi) => (
        <div key={week.week}>
          {/* Sync callout — above the week */}
          {week.sync && (
            <div className="border-b border-accent/30 bg-accent-glow/30 px-4 py-1">
              <span className="text-[10px] tracking-widest text-accent-text">
                {week.sync}
              </span>
            </div>
          )}

          <div
            className={`grid grid-cols-[72px_1fr_1fr] ${wi < schedule.length - 1 ? "border-b border-border-default" : ""}`}
          >
            {/* Week label cell */}
            <div className="border-r border-border-default px-3 py-3 flex flex-col gap-1">
              <span className="text-[13px] font-bold tracking-[0.04em] text-text-primary">
                {week.week}
              </span>
            </div>

            {/* Dev columns */}
            {devNames.map((devName) => {
              const entries = week.devs[devName] ?? [];
              return (
                <div
                  key={devName}
                  className="border-r border-border-default px-3 py-2.5 last:border-r-0"
                >
                  {/* Week theme label (only in first dev column) */}
                  {devName === devNames[0] && (
                    <div className="mb-2 flex items-center gap-2 -mx-3 -mt-2.5 px-3 py-1.5 bg-bg-surface/50 border-b border-border-default/40"
                      style={{ gridColumn: "2 / -1" }}
                    >
                      <span className="text-[10px] tracking-[0.08em] text-text-secondary">
                        {week.label}
                      </span>
                    </div>
                  )}
                  {devName !== devNames[0] && (
                    <div className="mb-2 -mx-3 -mt-2.5 px-3 py-1.5 bg-bg-surface/50 border-b border-border-default/40">
                      <span className="text-[10px] tracking-[0.08em] text-transparent select-none">
                        &nbsp;
                      </span>
                    </div>
                  )}

                  {/* Deliverables stacked */}
                  <div className="flex flex-col gap-2">
                    {entries.map((entry) => (
                      <DeliverableCell
                        key={entry.title}
                        entry={entry}
                        devName={devName}
                        deliverables={deliverables}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ))}

      {/* Footer */}
      <div className="flex justify-between border-t border-border-default px-4 py-2">
        <span className="text-[10px] tracking-widest text-neutral-400">
          // SECTION: FULL_ROADMAP
        </span>
        <span className="text-[10px] tracking-widest text-neutral-400">
          006
        </span>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function DeliverableCell({
  entry,
  devName,
  deliverables,
}: {
  entry: DeliverableEntry;
  devName: string;
  deliverables: Deliverable[];
}) {
  const match = deliverables.find(
    (d) =>
      d.frontmatter.title.toLowerCase() === entry.title.toLowerCase() &&
      d.frontmatter.owner === devName
  );
  const status = match?.frontmatter.status ?? null;
  const slug = match?.slug;
  const lastEntry = match ? extractLatestEntry(match.content) : null;

  const inner = (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <StatusDot status={status} />
        <span
          className={`text-[11px] font-medium tracking-[0.04em] ${
            status === "deployed"
              ? "text-text-muted line-through decoration-status-done"
              : status
                ? "text-text-primary"
                : "text-text-muted"
          }`}
        >
          {entry.title}
        </span>
      </div>
      <span className="text-[10px] leading-snug text-text-secondary ml-[18px]">
        {lastEntry ?? entry.description}
      </span>
    </div>
  );

  if (slug) {
    return (
      <Link href={`/deliverable/${slug}`} className="group block hover:bg-bg-panel/50 -mx-1 px-1 py-0.5 transition-colors">
        {inner}
      </Link>
    );
  }

  return <div className="py-0.5">{inner}</div>;
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={`inline-block h-[6px] w-[6px] rounded-full ${dotClass}`}
      />
      <span className="text-[9px] uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-block h-[8px] w-[8px] shrink-0 rounded-full border border-neutral-300 bg-neutral-200" />
    );
  }
  const colorMap: Record<string, string> = {
    deployed: "bg-status-done",
    "in-dev": "bg-accent border border-accent-text/50",
    "in-review": "bg-[#e0a030]",
    blocked: "bg-status-error",
  };
  return (
    <span
      className={`inline-block h-[8px] w-[8px] shrink-0 rounded-full ${colorMap[status] ?? "bg-neutral-300"}`}
      style={
        status === "in-dev"
          ? { animation: "pulse-dot 2s infinite" }
          : undefined
      }
    />
  );
}

/* ─── Helpers ─── */

function extractLatestEntry(content: string): string | null {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("### ")) {
      const nextLines: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (next.startsWith("### ") || next.startsWith("## ")) break;
        if (next) nextLines.push(next.replace(/\s*--\s*\*.*\*$/, ""));
      }
      return nextLines.join(" ") || null;
    }
  }
  return null;
}
