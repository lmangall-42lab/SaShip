import { getAllDeliverables } from "@/lib/mdx";
import { getConfig } from "@/lib/config";
import { FullRoadmap } from "@/components/full-roadmap";
import { roadmapSchedule } from "@/lib/roadmap-schedule";

export default async function RoadmapPage() {
  const [config, deliverables] = await Promise.all([
    getConfig(),
    getAllDeliverables(),
  ]);

  const devNames = config.devs.map((d) => d.name);

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="font-display text-[clamp(24px,4vw,40px)] font-bold uppercase leading-[0.9] tracking-tight text-neutral-900">
          Roadmap 90 jours
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-text-muted">
          {config.project} — {devNames.join(" + ")} — 13 semaines
        </p>
      </div>

      <FullRoadmap
        schedule={roadmapSchedule}
        deliverables={deliverables}
        devNames={devNames}
      />
    </div>
  );
}
