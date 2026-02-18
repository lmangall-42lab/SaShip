# SaShip — Code Review

## Repo Structure

```
SaShip/ (branch: entrepreneurs-os)
├── app/                    # Next.js 16 App Router pages
│   ├── globals.css         # Design tokens + Tailwind v4
│   ├── layout.tsx          # Root layout (Nav, IBM Plex Mono font)
│   ├── page.tsx            # Home / Overview dashboard
│   ├── roadmap/page.tsx    # 90-day roadmap grid
│   └── deliverable/[slug]/page.tsx  # Single deliverable + changelog
├── components/             # 11 React server/client components
├── lib/                    # 4 utility modules
│   ├── config.ts           # Reads project.config.json
│   ├── mdx.ts              # Reads content/*.mdx (gray-matter)
│   ├── stats.ts            # Reads stats.json (lines shipped)
│   └── roadmap-schedule.ts # Hardcoded 13-week sprint plan
├── content/                # 6 MDX deliverable files
├── setup/                  # Automation templates (not deployed)
│   ├── github-action.yml   # Daily digest workflow
│   ├── slash-command-ship.md
│   ├── slash-command-roadmap.md
│   ├── testing-guide.md
│   └── README.md
├── project.config.json     # Project metadata (2 devs, 30 deliverables)
├── stats.json              # Empty — populated by the Action
└── .env                    # Local secrets (gitignored)
```

---

## Data Flow (end-to-end)

```
CLIENT DEV REPO                           TRACKING REPO (this)
───────────────                           ────────────────────
Dev uses /ship →
  prefixed commit
       │
       ▼
GitHub Action (daily cron or manual)
  1. Collects last 24h commits
     with [entrepreneurs-os] prefix
  2. Determines env from branch:
     staging → in-dev
     main/production → deployed
  3. Fetches from tracking repo:      ──→ project.config.json
     - project config                     content/*.mdx frontmatter
     - all MDX frontmatter
  4. Sends commits + context to
     Vercel AI Gateway (claude-haiku-4-5)
  5. AI returns JSON:
     - slack_message (digest)
     - mdx_updates[] (per deliverable)
  6. Posts digest to Slack
  7. Writes MDX updates via           ──→ content/*.mdx (appends changelog)
     GitHub Contents API                  stats.json (lines per dev)

                                      Vercel auto-deploys →
                                      Next.js frontend renders
                                      live roadmap dashboard
```

---

## Lib Layer

| Module | Purpose |
|---|---|
| `lib/config.ts` | Reads and caches `project.config.json`. Exports `ProjectConfig` interface, `getConfig()`, `hasMultipleEnvironments()` |
| `lib/mdx.ts` | Reads `content/*.mdx` using `gray-matter`. Exports `getAllDeliverables()`, `getDeliverable(slug)`, `groupByOwner()`, `groupByEnvironment()` |
| `lib/stats.ts` | Reads `stats.json` for line-count chart data. Exports `getStats()`, `getDevNames()` |
| `lib/roadmap-schedule.ts` | Hardcoded 13-week `WeekSchedule[]` mapping S1–S13 to deliverables per dev (Quentin/Leonard). Used by the `/roadmap` page |

---

## Pages

### `/` — Home (`app/page.tsx`)

Async server component. Loads config, deliverables, stats in parallel. Renders:

1. **Header** — project name, dev count, total deliverables
2. **StatGrid** — TOTAL / IN_DEV / DEPLOYED / BLOCKED counts
3. **PipelineView** — DEV vs PROD columns (only if `environments.length > 1`)
4. **OnTrackView** — per-dev progress bars, shipped/planned ratio, per-deliverable status
5. **LinesChart** — SVG bar chart from `stats.json` (empty state shown when no data)
6. **RoadmapTimeline** — vertical checklist grouped by status phase (SHIPPED → IN REVIEW → IN PROGRESS → BLOCKED)
7. **Roadmap by Owner** — grid of `RoadmapCard` grouped by owner

### `/roadmap` — 90-Day Roadmap (`app/roadmap/page.tsx`)

Shows `FullRoadmap` component: a 13-week x 2-dev grid. Cross-references `roadmapSchedule` with actual MDX deliverables to show status dots. Includes sync milestones and overall progress.

### `/deliverable/[slug]` — Deliverable Detail (`app/deliverable/[slug]/page.tsx`)

Static-generated via `generateStaticParams()`. Shows title, status badge, environment badge, owner, and full parsed changelog.

---

## Components (11 total)

| Component | Type | Role |
|---|---|---|
| `nav.tsx` | Client | Sticky top nav. "SaShip / project-name", Overview + Roadmap links, pulsing "Live" dot |
| `stat-grid.tsx` | Server | 4-cell grid of KPI numbers, danger highlight for blocked > 0 |
| `pipeline-view.tsx` | Server | Two-column DEV/PROD split, lists deliverables with status badges |
| `on-track-view.tsx` | Server | Per-dev row with progress bar (shipped/in-dev/blocked segments) and per-deliverable breakdown |
| `lines-chart.tsx` | Server | Custom SVG grouped bar chart. Computes nice-max Y axis, formats K labels, grouped by date and dev |
| `roadmap-timeline.tsx` | Server | Vertical timeline grouped by phase, with check/pulse/cross indicators, extracts latest changelog entry |
| `roadmap-card.tsx` | Server | Card with title, status/env badges, latest changelog preview, link to detail |
| `full-roadmap.tsx` | Server | 13-week grid (week label + 2 dev columns). Status dots, sync callouts, overall progress bar |
| `status-badge.tsx` | Server | Colored dot + label for in-dev/in-review/deployed/blocked |
| `environment-badge.tsx` | Server | Pill badge for dev/prod |
| `changelog.tsx` | Server | Parses MDX content into date+text entries, renders with accent left border |

---

## Content (6 MDX files)

All 6 files are Sprint 0 deliverables for the "entrepreneurs-os" project, with `status: in-dev` and `environment: dev`:

| File | Owner | Deliverable |
|---|---|---|
| `socle-commun-quentin.mdx` | Quentin | Socle Commun |
| `agent-guide-quentin.mdx` | Quentin | Agent Guide |
| `systeme-de-credits-quentin.mdx` | Quentin | Systeme de Credits |
| `socle-commun-leonard.mdx` | Leonard | Socle Commun |
| `agent-guide-leonard.mdx` | Leonard | Agent Guide |
| `systeme-de-credits-leonard.mdx` | Leonard | Systeme de Credits |

Each has a single changelog entry dated 2026-02-18. The `project.config.json` lists 15 deliverables per dev (30 total) — so 24 MDX files are not yet created and will be auto-generated by the Action when work begins.

---

## GitHub Action (`setup/github-action.yml`)

6-step workflow installed on the **client dev repo**, runs weekdays at 18:00 UTC:

1. **Collect commits** — `git log --all --since 24h` filtered by prefix, determines env/status from branch
2. **Fetch roadmap context** — pulls `project.config.json` + all MDX frontmatter from tracking repo via GitHub API
3. **AI summarization** — sends commits + roadmap context to Vercel AI Gateway (`claude-haiku-4-5`), gets back `{slack_message, mdx_updates[]}`
4. **Slack post** — sends digest via incoming webhook
5. **MDX updates** — creates or updates MDX files via GitHub Contents API (appends changelog, updates frontmatter status/env)
6. **Stats update** — counts lines added per author from `git show --stat`, appends a daily entry to `stats.json`

---

## Design System

- **Font**: IBM Plex Mono (monospace everywhere)
- **Palette**: Warm neutral base (#e8e4dc), lime-green accent (#d0f501), dark text (#1a1a14)
- **Pattern**: Dotted radial-gradient background
- **Animations**: `animate-enter` (fade-up), `pulse-dot` (status pulsing)
- **Style**: Technical/brutalist — uppercase labels, section codes (`// SECTION: ROADMAP_OVERVIEW 001`), tight letter-spacing

---

## Notable Observations

1. **`stats.json` schema mismatch (FIXED)** — The Action previously wrote cumulative `linesPerDev`/`commitsPerDev` objects, but the frontend's `LinesChart` reads `daily[{date, dev1: N, dev2: N}]` entries. Fixed: the Action now appends per-day entries to the `daily[]` array.

2. **`extractLatestEntry` is duplicated** — exists in `roadmap-card.tsx:46`, `roadmap-timeline.tsx:284`, and `full-roadmap.tsx:266` with slight regex variations (`—` vs `--` for author stripping).

3. **No `next-mdx-remote` usage** — the package is listed in `package.json` but never imported. MDX content is parsed with `gray-matter` only — the markdown body is treated as raw text (split on `###` headings), not rendered as React components.

4. **All 6 existing MDX files are `in-dev`/`dev`** — the dashboard will show 6 in-dev, 0 deployed, 0 blocked, all under Sprint 0.

5. **Roadmap schedule is hardcoded** — `lib/roadmap-schedule.ts` has all 13 weeks baked in. Changes to the project plan require code changes, not config updates.
