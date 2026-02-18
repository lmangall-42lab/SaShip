interface ChangelogEntry {
  date: string;
  text: string;
}

export function Changelog({ content }: { content: string }) {
  const entries = parseChangelog(content);

  if (entries.length === 0) {
    return (
      <div className="border border-border-default p-6 text-center">
        <span className="text-[11px] text-text-muted">
          No changelog entries yet
        </span>
      </div>
    );
  }

  return (
    <div className="border border-border-default">
      <div className="border-b border-border-default px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-primary">
          Changelog
        </span>
      </div>
      <div className="divide-y divide-border-default">
        {entries.map((entry, i) => (
          <div key={i} className="flex animate-enter">
            <div className="w-1 shrink-0 bg-accent/40" />
            <div className="flex-1 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-text">
                  {entry.date}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                {entry.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split("\n");

  let currentDate: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      if (currentDate && currentLines.length > 0) {
        entries.push({ date: currentDate, text: currentLines.join(" ") });
      }
      currentDate = trimmed.replace("### ", "");
      currentLines = [];
    } else if (trimmed && !trimmed.startsWith("## ") && currentDate) {
      currentLines.push(trimmed);
    }
  }

  if (currentDate && currentLines.length > 0) {
    entries.push({ date: currentDate, text: currentLines.join(" ") });
  }

  return entries;
}
