import type { Deliverable } from "@/lib/mdx";
import type { DevConfig } from "@/lib/config";
import { StatusBadge } from "./status-badge";

interface OnTrackViewProps {
  devs: DevConfig[];
  deliverables: Deliverable[];
}

export function OnTrackView({ devs, deliverables }: OnTrackViewProps) {
  return (
    <div className="border border-border-default">
      <div className="border-b border-border-default px-4 py-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          On Track
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
          Roadmap vs Shipped
        </span>
      </div>
      <div className="divide-y divide-border-default">
        {devs.map((dev) => {
          const devDeliverables = deliverables.filter(
            (d) => d.frontmatter.owner === dev.name
          );
          const planned = dev.deliverables.length;
          const shipped = devDeliverables.filter(
            (d) => d.frontmatter.status === "deployed"
          ).length;
          const inProgress = devDeliverables.filter(
            (d) =>
              d.frontmatter.status === "in-dev" ||
              d.frontmatter.status === "in-review"
          ).length;
          const blocked = devDeliverables.filter(
            (d) => d.frontmatter.status === "blocked"
          ).length;
          const pct = planned > 0 ? Math.round((shipped / planned) * 100) : 0;

          return (
            <div key={dev.name} className="px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-text-primary">
                  {dev.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-text-muted">
                    {shipped}/{planned} shipped
                    {inProgress > 0 && <> · {inProgress} in dev</>}
                    {blocked > 0 && <> · {blocked} blocked</>}
                  </span>
                  <span className="font-mono text-[18px] font-bold text-neutral-900">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-sm bg-neutral-300">
                {shipped > 0 && (
                  <div
                    className="bg-status-done"
                    style={{ width: `${(shipped / planned) * 100}%` }}
                  />
                )}
                {inProgress > 0 && (
                  <div
                    className="bg-accent shadow-[inset_0_0_0_1px_rgba(74,104,0,0.4)]"
                    style={{ width: `${(inProgress / planned) * 100}%` }}
                  />
                )}
                {blocked > 0 && (
                  <div
                    className="bg-status-error"
                    style={{ width: `${(blocked / planned) * 100}%` }}
                  />
                )}
              </div>

              {/* Deliverable breakdown */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {dev.deliverables.map((name) => {
                  const match = devDeliverables.find(
                    (d) =>
                      d.frontmatter.title.toLowerCase() === name.toLowerCase()
                  );
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-[11px] text-text-secondary">
                        {name}
                      </span>
                      {match ? (
                        <StatusBadge status={match.frontmatter.status} />
                      ) : (
                        <span className="text-[10px] tracking-[0.15em] text-text-muted">
                          NOT STARTED
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between border-t border-border-default px-4 py-2">
        <span className="text-[10px] tracking-widest text-neutral-400">
          // SECTION: ON_TRACK
        </span>
        <span className="text-[10px] tracking-widest text-neutral-400">
          003
        </span>
      </div>
    </div>
  );
}
