# SaShip — Tracking Repo

This is the **tracking repo**. It is a passive receiver — it does not contain application source code.

## Architecture (two repos)

- **Client dev repo** — the actual codebase where developers write code. It has two GitHub Actions: a daily digest that pushes commit summaries here, and a merge notify that posts customer-friendly Slack updates on deploy. Developers install Claude Code slash commands (`/ship`, `/roadmap`) in that repo.
- **Tracking repo (this repo)** — receives processed commit data and hosts the roadmap frontend. One branch per project, auto-deployed via Vercel.

## Branch structure

- `main` — setup docs, ready-to-use prompts and templates in `setup/`
- `project-x`, `project-y`, etc. — each branch has its own Next.js frontend, MDX roadmap files in `content/`, and a `project.config.json`

## Key files (on project branches)

- `project.config.json` — project name, dev names, environments, commit prefix
- `content/roadmap.json` — week-by-week sprint plan (S1–S13), deliverables per dev per week with descriptions; single source of truth for what each dev builds and when; drives the `/roadmap` page
- `content/*.mdx` — one file per deliverable, with YAML frontmatter (title, owner, status, environment) and a changelog
- `content/commits.mdx` — single file listing ALL commits (matched or not); the Action prepends new entries after `## Commit Log`; drives the `/commits` page
- `content/extras.json` — additional client-requested developments outside the roadmap; each item has `id`, `title`, `description`, `owner`, `status` (pending/done); drives the `/extras` page; added via `/extra` slash command, auto-marked done by the Action when commits resolve them
- `setup/` — templates and instructions for setting up new projects (lives on `main`)

## Data flow

1. Devs commit in the client repo using the `/ship` slash command (proper prefix + conventional format)
2. A daily GitHub Action on the client repo collects today's commits, determines environment from branch (staging → `staging`, main/production → `deployed`)
3. The Action appends ALL collected commits to `content/commits.mdx` (no AI — direct formatting, prefix stripped)
4. The Action fetches roadmap context from the tracking repo: `project.config.json` + all existing MDX frontmatter (excluding `commits.mdx`)
5. Commits + roadmap context + extras are sent to Claude API — Claude matches commits to existing deliverables, writes plain-English changelog entries, and marks resolved extras as done; unmatched commits are skipped in MDX but included in the Slack digest
6. The Action updates MDX files and extras.json here via GitHub API, posts a Slack digest
7. Vercel auto-redeploys the branch frontend

## Commit conventions

- **Developer commits** use the project prefix: `[project-x] feat: ...`
- **Bot commits** (made by the GitHub Action) always start with `[bot]`: `[bot] update: ...`, `[bot] update: commit-log ...`, `[bot] update: extras ...`, `[bot] extras: add ...`, `[bot] stats: ...`, `[bot] sync-log: ...`
- To filter Action commits in git log: `git log --grep='^\[bot\]'` (or exclude with `--invert-grep`)

## Sync log

Each project branch has a `sync-log.json` that records every Action run:
- `lastSync` — ISO 8601 timestamp of the most recent sync
- `runs[]` — last 30 entries with `timestamp`, `commitsProcessed`, `filesUpdated`, `deliverables`

## MDX status values

`staging`, `deployed` — the automated Action sets `staging` or `deployed` (derived from branch)

## GitHub Actions (installed on client dev repo, templates in `setup/`)

- `saship-digest.yml` — daily cron (7:30 AM UTC+1 weekdays) + manual trigger. Collects all commits from the previous day across all branches for the commit log page, then filters by project prefix for AI matching. Updates MDX/extras/stats/sync-log on the tracking repo, posts daily Slack digest.
- `slack-merge-notify.yml` — triggers on push to `main`, `staging`, or `dev/*`. Waits for Vercel deployment to succeed (skipped for dev branches), collects all commits in the merge, rephrases them in customer-friendly language via AI, and posts to Slack. Dev branches post in French with the author's name ("Léonard a ajouté à l'environnement de développement"). Posts a failure alert if Vercel deploy fails.

**IMPORTANT — keep workflows in sync:** The live workflow files live in the client dev repo (`.github/workflows/`). The templates in `setup/` on this repo must always mirror them. When editing a workflow, update BOTH the client repo copy and the `setup/` template here. The only acceptable differences are project-specific values (Slack user IDs, project names).

## Slash commands (installed on client dev repo, templates in `setup/`)

- `/ship` — drafts and creates a properly prefixed commit from staged changes
- `/roadmap` — reads local `.saship/roadmap.json`, shows current sprint week, planned deliverables, and cross-references with recent commits
- `/extra` — adds a new additional development request to `content/extras.json` on the tracking repo

## What lives where (`main` vs project branches)

`main` is the **general template branch**. Project branches are **per-client instances**. When improving SaShip itself (templates, setup docs, shared tooling), update `main`. When working on a specific project, stay on that branch.

### `main` branch only

- `setup/` — action templates, slash command prompts, setup README, testing guide
- `CLAUDE.md` — general repo documentation (this file)
- `Saship_plan.md` — product-level plan and architecture overview

### Project branches only

- `app/`, `components/`, `lib/` — Next.js frontend (per-project UI)
- `content/` — MDX deliverables, `roadmap.json`, `commits.mdx`, `extras.json`
- `project.config.json` — project name, devs, environments, commit prefix
- `stats.json`, `sync-log.json` — runtime data from the Action
- `package.json`, `tsconfig.json`, `next.config.ts`, etc. — project deps and config
- `UI.md` — per-project design system spec
- `REPO-REVIEW.md` — project-specific code review notes
- `.env` — local secrets (gitignored)

### Syncing improvements back to `main`

When a project branch improves a `setup/` template or general doc, cherry-pick those changes back to `main` so future projects get them. Never bring project-specific files (`content/`, `app/`, `project.config.json`, etc.) to `main`.