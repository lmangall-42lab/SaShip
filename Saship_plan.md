# SaShip

> Shipping visibility for SaaS dev teams. Translates daily commits into plain English updates for clients, with a live roadmap frontend.

---

## Repos

**Client dev repo** — existing repo, has the GitHub Actions installed, pushes to the SaShip tracking repo.

**Tracking repo** — passive receiver, one branch per project, auto-deploys via Vercel.

---

## Tracking Repo Structure

- `main` — setup docs, templates, ready-to-use prompts to spin up new projects
- `project-x`, `project-y` — each has its own Next.js frontend, MDX roadmap files, `content/roadmap.json`, `project.config.json`
- Each branch gets its own Vercel URL automatically

---

## project.config.json

```json
{
  "project": "project-x",
  "devs": ["Alex", "Sam"],
  "environments": ["dev", "prod"],
  "commitPrefix": "[project-x]"
}
```

`environments` is either `["prod"]` or `["dev", "prod"]` — the frontend and Action adapt accordingly. Deliverables per dev are defined in `content/roadmap.json` (the single source of truth).

---

## Commit Convention

- Devs use a **Claude Code slash command** (`/ship`) instead of regular `git commit`
- Claude reads the current conversation context, drafts the commit message, applies the right prefix if roadmap-relevant, and pushes
- Git hook rejects non-conforming commits as a fallback

---

## GitHub Actions (on client dev repo)

### Daily Digest (`saship-digest.yml`)

1. Pulls the day's commits, filters by prefix from `project.config.json`
2. Segregates by author and by branch (`staging` → `in-staging`, `main`/`production` → `deployed`)
3. Appends ALL commits to `content/commits.mdx` (no AI — direct formatting)
4. Fetches roadmap context from the tracking repo: `project.config.json` + all existing MDX frontmatter + extras
5. Sends commits + context to Claude API — matches commits to deliverables, writes changelog entries, marks resolved extras as done
6. Posts daily digest to Slack
7. Updates MDX files, extras.json, stats on the tracking repo via GitHub API

### Merge Notify (`slack-merge-notify.yml`)

1. Triggers on push to `main` or `staging`
2. Waits for Vercel deployment to succeed
3. Collects all commits in the merge, rephrases in customer-friendly language via AI
4. Posts to Slack ("Now available in production/staging")
5. Posts failure alert if Vercel deploy fails; skips if all changes are purely technical

---

## MDX Roadmap Files

One file per deliverable, updated in place.

```mdx
---
title: User Authentication
owner: Alex
status: in-staging
environment: dev
---

## Changelog

### 2026-02-18
Completed login flow, working on token refresh — *Alex*

### 2026-02-17
Set up auth middleware — *Alex*
```

---

## UI Guidelines

- Components built with standard shadcn/ui
- A `UI.md` file will be provided per project branch — it defines the visual style only (colors, typography, spacing, tone), not sections, components, or UX structure
- The frontend should extract only the style tokens from it, not treat it as a layout or component spec

---

## Tracking Frontend (per branch)

- Roadmap items grouped by dev and environment
- Dev/prod pipeline view (if enabled in config)
- Commits log page (all commits, matched or not)
- Extras page (additional client requests outside the roadmap)
- Changelog visible per deliverable
- Auto-redeploys on every MDX commit via Vercel

---

## Main Branch Docs

Ready-to-use prompts for:
- Scaffolding a new project branch (MDX files, config, folder structure)
- Setting up the GitHub Actions on the client dev repo
- Setting up the Claude Code slash commands on the dev side

Setup steps:
1. Branch off `main` in the tracking repo
2. Fill in `project.config.json`
3. Add secrets and variables to the client dev repo (see `setup/README.md`)
4. Install GitHub Actions on client dev repo, point at the tracking branch
5. Set up Claude Code slash commands (`/ship`, `/roadmap`, `/extra`) on dev side
6. Vercel picks up the new branch automatically

---

## Slack

- One incoming webhook per project (stored as GitHub Actions secret)
- Daily digest posted to the project's designated channel
- Merge notifications posted on deploy
- No bot setup required
