import { getConfig } from "@/lib/config";
import { getLinearIssues, groupByStateType, type LinearIssue } from "@/lib/linear";

export const dynamic = "force-dynamic";

const PRIORITY_COLORS: Record<number, string> = {
  0: "bg-neutral-300",       // No priority
  1: "bg-status-error",      // Urgent
  2: "bg-[#e0a030]",         // High
  3: "bg-accent",            // Normal
  4: "bg-status-prod",       // Low
};

const STATE_TYPE_LABELS: Record<string, string> = {
  started: "In Progress",
  unstarted: "Todo",
  backlog: "Backlog",
  completed: "Done",
  cancelled: "Cancelled",
  triage: "Triage",
};

function IssueRow({ issue }: { issue: LinearIssue }) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <span
        className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${PRIORITY_COLORS[issue.priority] ?? "bg-neutral-300"}`}
        title={issue.priorityLabel}
      />
      <span className="shrink-0 text-[10px] font-medium tracking-[0.1em] text-text-muted">
        {issue.identifier}
      </span>
      <div className="min-w-0 flex-1">
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-text-primary hover:underline"
        >
          {issue.title}
        </a>
        {(issue.labelNames.length > 0 || issue.slackThreads.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {issue.labelNames.map((name, i) => (
              <span
                key={name}
                className="inline-block rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] font-medium"
                style={{
                  backgroundColor: `${issue.labelColors[i]}20`,
                  color: issue.labelColors[i],
                }}
              >
                {name}
              </span>
            ))}
            {issue.slackThreads.map((thread) => (
              <a
                key={thread.url}
                href={thread.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm bg-[#4A154B]/10 px-1.5 py-0.5 text-[9px] font-medium tracking-[0.05em] text-[#4A154B] hover:bg-[#4A154B]/20 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
                {thread.channel}
              </a>
            ))}
          </div>
        )}
      </div>
      {issue.assigneeName && (
        <span className="shrink-0 text-[10px] uppercase tracking-[0.15em] text-text-muted">
          {issue.assigneeName}
        </span>
      )}
    </div>
  );
}

export default async function IssuesPage() {
  const config = await getConfig();
  const teamKey = config.linearTeamKey;

  if (!teamKey) {
    return (
      <div className="space-y-6 animate-enter">
        <div>
          <h1 className="font-display text-[clamp(24px,4vw,40px)] font-bold uppercase leading-[0.9] tracking-tight text-neutral-900">
            Issues
          </h1>
        </div>
        <div className="border border-border-default p-8 text-center">
          <p className="text-[12px] text-text-muted">
            No Linear team configured. Add <code className="text-text-primary">"linearTeamKey"</code> to <code className="text-text-primary">project.config.json</code>.
          </p>
        </div>
      </div>
    );
  }

  const { issues, error } = await getLinearIssues(teamKey);

  if (error) {
    return (
      <div className="space-y-6 animate-enter">
        <div>
          <h1 className="font-display text-[clamp(24px,4vw,40px)] font-bold uppercase leading-[0.9] tracking-tight text-neutral-900">
            Issues
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-text-muted">
            {config.project} — linear issues
          </p>
        </div>
        <div className="border border-status-error/30 bg-status-error/5 p-6">
          <p className="text-[12px] text-status-error">{error}</p>
        </div>
      </div>
    );
  }

  const grouped = groupByStateType(issues);

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="font-display text-[clamp(24px,4vw,40px)] font-bold uppercase leading-[0.9] tracking-tight text-neutral-900">
          Issues
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-text-muted">
          {config.project} — linear / {teamKey}
        </p>
      </div>

      {/* Priority legend */}
      <div className="flex items-center gap-4">
        {[
          { label: "Urgent", color: PRIORITY_COLORS[1] },
          { label: "High", color: PRIORITY_COLORS[2] },
          { label: "Normal", color: PRIORITY_COLORS[3] },
          { label: "Low", color: PRIORITY_COLORS[4] },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {issues.length === 0 ? (
        <div className="border border-border-default p-8 text-center">
          <p className="text-[12px] text-text-muted">No issues found for team {teamKey}.</p>
        </div>
      ) : (
        grouped.map(([stateType, groupIssues]) => (
          <div key={stateType} className="border border-border-default">
            <div className="border-b border-border-default px-4 py-2.5 flex items-center gap-3">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: groupIssues[0]?.stateColor }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
                {STATE_TYPE_LABELS[stateType] ?? stateType}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                {groupIssues.length} {groupIssues.length === 1 ? "issue" : "issues"}
              </span>
            </div>
            <div className="divide-y divide-border-default">
              {groupIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        ))
      )}

      <div className="flex justify-between pt-8">
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          // SECTION: ISSUES
        </span>
        <span className="text-[10px] tracking-[0.1em] text-neutral-400">
          005
        </span>
      </div>
    </div>
  );
}
