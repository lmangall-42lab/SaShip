import type { ProjectStats } from "@/lib/stats";
import { getDevNames } from "@/lib/stats";

interface LinesChartProps {
  stats: ProjectStats;
}

const CHART_HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 44, left: 48 };
const GRID_LINES = 4;
const BAR_INNER_GAP = 2;
const BAR_WIDTH = 12;
const GROUP_GAP = 14;

const BAR_COLORS = [
  "#c8a88a",
  "#1a1a14",
  "#636358",
  "#4a6800",
];

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function formatLabel(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return String(v);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

export function LinesChart({ stats }: LinesChartProps) {
  const devs = getDevNames(stats);
  const { daily } = stats;

  if (daily.length === 0 || devs.length === 0) {
    return (
      <div className="border border-border-default p-6 text-center">
        <span className="text-[11px] text-text-muted">
          No line data yet — stats.json is populated by the daily digest
        </span>
      </div>
    );
  }

  const totalDays = daily.length;
  const groupWidth = devs.length * BAR_WIDTH + (devs.length - 1) * BAR_INNER_GAP;
  const chartWidth = PADDING.left + PADDING.right + totalDays * groupWidth + (totalDays + 1) * GROUP_GAP;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const baseline = PADDING.top + plotH;

  const allValues = daily.flatMap((d) =>
    devs.map((dev) => Number(d[dev]) || 0)
  );
  const ceilMax = niceMax(Math.max(...allValues, 1));

  const toY = (v: number) => PADDING.top + plotH - (v / ceilMax) * plotH;

  // Compute totals per dev for header
  const totals = devs.map((dev) => ({
    dev,
    total: daily.reduce((sum, d) => sum + (Number(d[dev]) || 0), 0),
  }));

  return (
    <div className="border border-border-default">
      {/* Header with totals */}
      <div className="border-b border-border-default px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
            Lines Shipped
          </span>
          {stats.lastUpdated && (
            <span className="ml-3 text-[10px] uppercase tracking-[0.15em] text-text-muted">
              Updated {stats.lastUpdated}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          {totals.map(({ dev, total }, i) => (
            <div key={dev} className="text-right">
              <span className="block text-[10px] uppercase tracking-[0.15em] text-text-muted">
                {dev}
              </span>
              <span
                className="block font-mono text-[22px] font-bold leading-tight"
                style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}
              >
                {total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto px-4 py-4">
        <svg
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          className="font-mono"
        >
          {/* Grid lines + Y labels */}
          {Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
            const value = (ceilMax / GRID_LINES) * i;
            const y = toY(value);
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={chartWidth - PADDING.right}
                  y2={y}
                  stroke="#d0ccc4"
                  strokeWidth={0.5}
                  strokeDasharray={i === 0 ? "none" : "3 3"}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#636358"
                  fontSize={9}
                  fontFamily="inherit"
                >
                  {formatLabel(value)}
                </text>
              </g>
            );
          })}

          {/* Grouped bars */}
          {daily.map((day, dayIdx) => {
            const groupX =
              PADDING.left + GROUP_GAP + dayIdx * (groupWidth + GROUP_GAP);

            return (
              <g key={`day-${dayIdx}`}>
                {devs.map((dev, devIdx) => {
                  const value = Number(day[dev]) || 0;
                  const barH = (value / ceilMax) * plotH;
                  const x = groupX + devIdx * (BAR_WIDTH + BAR_INNER_GAP);
                  const y = baseline - barH;

                  return (
                    <rect
                      key={`${dayIdx}-${dev}`}
                      x={x}
                      y={y}
                      width={BAR_WIDTH}
                      height={Math.max(barH, 0)}
                      fill={BAR_COLORS[devIdx % BAR_COLORS.length]}
                      rx={0.5}
                    />
                  );
                })}

                {/* X label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={baseline + 16}
                  textAnchor="middle"
                  fill="#636358"
                  fontSize={8}
                  fontFamily="inherit"
                >
                  {formatDate(day.date)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={PADDING.left}
            y1={baseline}
            x2={chartWidth - PADDING.right}
            y2={baseline}
            stroke="#c0bdb5"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 border-t border-border-default px-4 py-2.5">
        {devs.map((dev, i) => (
          <div key={dev} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5"
              style={{
                backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                borderRadius: 1,
              }}
            />
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-secondary">
              {dev}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between border-t border-border-default px-4 py-2">
        <span className="text-[10px] tracking-widest text-neutral-400">
          // SECTION: LINES_SHIPPED
        </span>
        <span className="text-[10px] tracking-widest text-neutral-400">
          004
        </span>
      </div>
    </div>
  );
}
