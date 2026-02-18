interface Stat {
  label: string;
  value: string | number;
  accent?: boolean;
  danger?: boolean;
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 border border-border-default sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`border border-border-default px-5 py-4 ${
            stat.danger && Number(stat.value) > 0
              ? "bg-status-error/5"
              : "bg-bg-panel"
          }`}
        >
          <span className="label mb-1 block">{stat.label}</span>
          <span
            className={`font-mono text-[28px] font-bold ${
              stat.danger && Number(stat.value) > 0
                ? "text-status-error"
                : stat.accent
                  ? "text-accent-text"
                  : "text-neutral-900"
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
