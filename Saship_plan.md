# SaShip

> Shipping visibility for SaaS dev teams. Translates daily commits into plain English updates for clients, with a live roadmap frontend.

---

## Repos

**Client dev repo** — existing repo, has the GitHub Action installed, pushes to the SaShip tracking repo.

**Tracking repo** — passive receiver, one branch per project, auto-deploys via Vercel.

---

## Tracking Repo Structure

- `main` — setup docs, ready-to-use prompts to spin up new projects
- `project-x`, `project-y` — each has its own Next.js frontend, MDX roadmap files, `project.config.json`
- Each branch gets its own Vercel URL automatically

---

## project.config.json

```json
{
  "project": "project-x",
  "devs": [
    { "name": "Alex", "deliverables": ["Auth", "Dashboard"] },
    { "name": "Sam", "deliverables": ["API", "Integrations"] }
  ],
  "environments": ["dev", "prod"],
  "commitPrefix": "[project-x]"
}
```

`environments` is either `["prod"]` or `["dev", "prod"]` — the frontend and Action adapt accordingly.

---

## Commit Convention

- Devs use a **Claude Code slash command** instead of regular `git commit`
- Claude reads the current conversation context, drafts the commit message, applies the right prefix if roadmap-relevant, and pushes
- Git hook rejects non-conforming commits as a fallback

---

## GitHub Action (on client dev repo, runs daily)

1. Pulls the day's commits, filters by prefix from `project.config.json`
2. Segregates by author and by branch (`staging` → `in-dev`, `main`/`production` → `deployed`)
3. Fetches roadmap context from the tracking repo: `project.config.json` + all existing MDX frontmatter (slug, title, owner, status, environment)
4. Sends commits + full roadmap context to Claude API
5. Claude matches commits to existing deliverables (exact slugs), writes plain-English changelog entries; commits that don't map to any deliverable are skipped in MDX but included in the Slack digest
6. Status is determined by branch, not by AI — staging = `in-dev`, main/production = `deployed`
7. Posts summary to Slack
8. Updates relevant MDX files in the tracking repo branch via GitHub API
9. Validates MDX before committing — skips and alerts team if broken

---

## MDX Roadmap Files

One file per deliverable, updated in place.

```mdx
---
title: User Authentication
owner: Alex
status: in-dev
environment: dev
---

## Changelog

### 2024-02-18
Completed login flow, working on token refresh — *Alex*

### 2024-02-17
Set up auth middleware — *Alex*
```

---

## UI Guidelines

- Components built with standard shadcn/ui
- A `UI.md` file will be provided in the repo — it defines the visual style only (colors, typography, spacing, tone), not sections, components, or UX structure
- The frontend should extract only the style tokens from it, not treat it as a layout or component spec

---

## Tracking Frontend (per branch)

- Roadmap items grouped by dev and environment
- Dev/prod pipeline view (if enabled in config)
- Changelog visible per deliverable
- Auto-redeploys on every MDX commit via Vercel

---

## Main Branch Docs

Ready-to-use prompts for:
- Scaffolding a new project branch (MDX files, config, folder structure)
- Setting up the GitHub Action on the client dev repo
- Setting up the Claude Code slash command on the dev side

Setup steps:
1. Branch off `main` in the tracking repo
2. Fill in `project.config.json`
3. Add secrets to tracking repo (Claude API key, Slack webhook, GitHub token)
4. Install GitHub Action on client dev repo, point it at the tracking branch
5. Set up Claude Code slash command on dev side
6. Vercel picks up the new branch automatically

---

## Slack

- One incoming webhook per project (stored as GitHub Actions secret)
- Daily digest posted to the project's designated channel
- No bot setup required
