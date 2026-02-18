import { getAllDeliverables, groupByOwner } from "@/lib/mdx";
import { getConfig, hasMultipleEnvironments } from "@/lib/config";
import { getStats } from "@/lib/stats";
import { RoadmapCard } from "@/components/roadmap-card";
import { StatGrid } from "@/components/stat-grid";
import { PipelineView } from "@/components/pipeline-view";
import { OnTrackView } from "@/components/on-track-view";
import { LinesChart } from "@/components/lines-chart";
import { RoadmapTimeline } from "@/components/roadmap-timeline";

export default async function Home() {
  const [config, deliverables, stats] = await Promise.all([
    getConfig(),
    getAllDeliverables(),
    getStats(),
  ]);

  const byOwner = groupByOwner(deliverables);
  const showPipeline = hasMultipleEnvironments(config);

  const totalDeliverables = deliverables.length;
  const inDev = deliverables.filter(
    (d) => d.frontmatter.status === "in-dev"
  ).length;
  const deployed = deliverables.filter(
    (d) => d.frontmatter.status === "deployed"
  ).length;
  const blocked = deliverables.filter(
    (d) => d.frontmatter.status === "blocked"
  ).length;

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="relative">
        <h1 className="font-display text-[clamp(36px,6vw,64px)] font-bold uppercase leading-[0.9] tracking-tight text-neutral-900">
          {config.project}
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-text-muted">
          Shipping visibility — {config.devs.length} devs /{" "}
          {totalDeliverables} deliverables
        </p>
      </div>

      {/* Stats */}
      <StatGrid
        stats={[
          { label: "TOTAL", value: totalDeliverables },
          { label: "IN_DEV", value: inDev, accent: true },
          { label: "DEPLOYED", value: deployed },
          { label: "BLOCKED", value: blocked, danger: true },
        ]}
      />

      {/* Pipeline View (if dev+prod) */}
      {showPipeline && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
              Pipeline
            </h2>
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
              DEV → PROD
            </span>
          </div>
          <PipelineView deliverables={deliverables} />
        </section>
      )}

      {/* On Track — roadmap vs shipped */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          On Track
        </h2>
        <OnTrackView devs={config.devs} deliverables={deliverables} />
      </section>

      {/* Lines shipped per dev */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          Output
        </h2>
        <LinesChart stats={stats} />
      </section>

      {/* Roadmap Timeline */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          Roadmap
        </h2>
        <RoadmapTimeline deliverables={deliverables} />
      </section>

      {/* Roadmap by Dev */}
      <section>
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          Roadmap by Owner
        </h2>
        {Object.keys(byOwner).length === 0 ? (
          <div className="border border-border-default p-8 text-center">
            <p className="text-[12px] text-text-muted">
              No deliverables yet. Add .mdx files to the content/ directory.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byOwner).map(([owner, items]) => (
              <div key={owner}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-text-primary">
                    {owner}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    {items.length} items
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((d) => (
                    <RoadmapCard key={d.slug} deliverable={d} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer section label */}
      <div className="flex justify-between pt-8">
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          // SECTION: ROADMAP_OVERVIEW
        </span>
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          001
        </span>
      </div>
    </div>
  );
}
