"use client";

import { useRef, useEffect, useState } from "react";
import type { Deliverable } from "@/lib/mdx";
import type { WeekSchedule } from "@/lib/schedule";
import Link from "next/link";

interface HorizonRoadmapProps {
  schedule: WeekSchedule[];
  deliverables: Deliverable[];
  devNames: string[];
}

interface TimelineItem {
  title: string;
  devName: string;
  sprint: string;
  isFirstInSprint: boolean;
  status: "deployed" | "staging" | null;
  slug: string | null;
}

export function HorizonRoadmap({
  schedule,
  deliverables,
  devNames,
}: HorizonRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastShippedRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);

  // Build flat list of all deliverables in schedule order
  const items: TimelineItem[] = [];
  const seen = new Set<string>();

  for (const week of schedule) {
    let isFirst = true;
    for (const devName of devNames) {
      const entries = week.devs[devName] ?? [];
      for (const entry of entries) {
        const key = `${entry.title}::${devName}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const match = deliverables.find(
          (d) =>
            d.frontmatter.title.toLowerCase() === entry.title.toLowerCase() &&
            d.frontmatter.owner === devName
        );

        items.push({
          title: entry.title,
          devName,
          sprint: week.week,
          isFirstInSprint: isFirst,
          status: match?.frontmatter.status ?? null,
          slug: match?.slug ?? null,
        });
        isFirst = false;
      }
    }
  }

  // Find last shipped index for auto-centering
  let lastShippedIndex = -1;
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].status === "deployed" || items[i].status === "staging") {
      lastShippedIndex = i;
      break;
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    const target = lastShippedRef.current;
    const timeline = timelineRef.current;
    if (!container || !target || !timeline) return;

    const containerWidth = container.clientWidth;
    const targetRect = target.getBoundingClientRect();
    const timelineRect = timeline.getBoundingClientRect();
    const targetCenterInTimeline =
      targetRect.left - timelineRect.left + targetRect.width / 2;
    setOffsetX(containerWidth * 0.5 - targetCenterInTimeline);
  }, []);

  const shipped = items.filter((i) => i.status === "deployed").length;
  const staging = items.filter((i) => i.status === "staging").length;

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-y border-border-default">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          Roadmap
        </span>
        <div className="flex items-center gap-3">
          <Legend color="bg-accent" label="Shipped" />
          <Legend color="bg-neutral-400" label="Staging" />
          <Legend color="bg-neutral-300" label="Planned" />
          <span className="ml-1 text-[10px] tracking-[0.12em] text-text-muted">
            {shipped + staging}/{items.length}
          </span>
        </div>
      </div>

      {/* Horizontal timeline */}
      <div ref={containerRef} className="overflow-x-clip border-t border-border-default">
        <div
          ref={timelineRef}
          className="px-6 pt-56 pb-10 min-w-max transition-transform duration-500"
          style={{ transform: `translateX(${offsetX}px)` }}
        >
          <div className="flex items-end">
            {items.map((item, i) => {
              const color =
                item.status === "deployed"
                  ? "bg-accent"
                  : item.status === "staging"
                    ? "bg-neutral-400"
                    : "bg-neutral-300";

              const textColor =
                item.status === "deployed"
                  ? "text-accent-text"
                  : item.status === "staging"
                    ? "text-text-primary"
                    : "text-neutral-400";

              const isLast = i === items.length - 1;
              const isLastShipped = i === lastShippedIndex;

              const dot = (
                <div className="relative flex flex-col items-center" style={{ width: 48 }}>
                  {/* Rotated label */}
                  <div
                    className="absolute bottom-6"
                    style={{
                      transformOrigin: "bottom left",
                      transform: "rotate(-45deg)",
                      whiteSpace: "nowrap",
                      left: "50%",
                      marginLeft: 4,
                    }}
                  >
                    <span className={`text-[10px] tracking-[0.04em] ${textColor}`}>
                      {item.title}
                    </span>
                    <span className="ml-1.5 text-[9px] tracking-[0.08em] text-neutral-400">
                      {item.devName[0]}
                    </span>
                  </div>

                  {/* Dot on the line */}
                  <div className="relative z-10 flex items-center justify-center">
                    <span
                      className={`block h-[10px] w-[10px] rounded-full ${color} border border-white/60`}
                      style={
                        item.status === "staging"
                          ? { animation: "pulse-dot 2s infinite" }
                          : undefined
                      }
                    />
                  </div>

                  {/* Sprint label (below line, only for first in sprint) */}
                  {item.isFirstInSprint && (
                    <span className="absolute top-5 text-[9px] font-bold tracking-[0.1em] text-text-muted">
                      {item.sprint}
                    </span>
                  )}
                </div>
              );

              return (
                <div
                  key={`${item.title}-${item.devName}`}
                  ref={isLastShipped ? lastShippedRef : undefined}
                  className="flex items-center"
                >
                  {item.slug ? (
                    <Link
                      href={`/deliverable/${item.slug}`}
                      className="group hover:opacity-80 transition-opacity"
                    >
                      {dot}
                    </Link>
                  ) : (
                    dot
                  )}
                  {/* Connecting line segment */}
                  {!isLast && (
                    <div className="h-px w-4 bg-border-default" style={{ marginLeft: -2, marginRight: -2 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between border-t border-border-default px-4 py-2">
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          // SECTION: HORIZON
        </span>
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          003
        </span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block h-[6px] w-[6px] rounded-full ${color}`} />
      <span className="text-[9px] uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
    </div>
  );
}
