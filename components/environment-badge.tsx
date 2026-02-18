export function EnvironmentBadge({
  environment,
}: {
  environment: "dev" | "prod";
}) {
  const isDev = environment === "dev";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] ${
        isDev
          ? "border-accent-text/40 text-accent-text"
          : "border-status-prod/40 text-status-prod"
      }`}
    >
      {environment}
    </span>
  );
}
