# SaShip Roadmap — Claude Code Slash Command

## Installation

1. Copy `roadmap.json` from the tracking repo's `content/roadmap.json` into `.saship/roadmap.json` in your **client dev repo**.

2. Create the file `.claude/commands/roadmap.md` in your **client dev repo**:

```markdown
Read the local roadmap file at `.saship/roadmap.json` and cross-reference it with recent git activity.

The roadmap file has a `startDate` (ISO date for S1 Monday) and a `weeks` array. Each week entry has a `week` code (S1–S13), `label`, optional `sync` milestone, and `devs` mapping developer names to their planned deliverables.

Steps:

1. Read `.saship/roadmap.json` from the repo root.

2. Determine the current sprint week using the `startDate` field. Each week is 7 calendar days starting from that Monday. Calculate which S-week today falls in. If before startDate, show "Not started yet (S1 begins {startDate})". If after S13, show "Project complete".

3. Run `git log --oneline --since="1 week ago"` to get recent commits.

4. Present a roadmap summary:
   - **Current sprint week** (e.g. S6) and its label
   - **This week's plan** — for each dev, list their planned deliverables for the current week
   - **Recent commits** — show the last week's commits and indicate which roadmap deliverable each one maps to (match by keywords in the commit message against deliverable titles/descriptions)
   - **Coverage** — flag any planned deliverables for the current week that have zero matching commits (potential gaps)
   - If there is a `sync` milestone on the current or next week, highlight it

5. If the user provides arguments (e.g. `/roadmap S3`), show that specific week instead of the current one.

Keep the output concise and scannable. Use terminal-friendly formatting.
```

## Usage

From your client dev repo, run:

```bash
/roadmap
```

Claude will read the local roadmap, show the current sprint plan, and cross-reference with recent commits to highlight progress and gaps.

To view a specific week:

```bash
/roadmap S3
```
