import type { DeliverableFrontmatter } from "@/lib/mdx";

const statusConfig: Record<
  DeliverableFrontmatter["status"],
  { label: string; color: string; dotColor: string }
> = {
  "in-dev": {
    label: "IN DEV",
    color: "text-accent-text",
    dotColor: "bg-accent border border-accent-text/50",
  },
  "in-review": {
    label: "IN REVIEW",
    color: "text-[#e0a030]",
    dotColor: "bg-[#e0a030]",
  },
  deployed: {
    label: "DEPLOYED",
    color: "text-status-done",
    dotColor: "bg-status-done",
  },
  blocked: {
    label: "BLOCKED",
    color: "text-status-error",
    dotColor: "bg-status-error",
  },
};

export function StatusBadge({
  status,
}: {
  status: DeliverableFrontmatter["status"];
}) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 ${config.color}`}>
      <span
        className={`inline-block h-[6px] w-[6px] rounded-full ${config.dotColor}`}
        style={
          status === "in-dev"
            ? { animation: "pulse-dot 2s infinite" }
            : undefined
        }
      />
      <span className="text-[10px] font-medium tracking-[0.15em]">
        {config.label}
      </span>
    </span>
  );
}
