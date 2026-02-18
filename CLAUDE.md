# SaShip — Tracking Repo

This is the **tracking repo**. It is a passive receiver — it does not contain application source code.

## Architecture (two repos)

- **Client dev repo** — the actual codebase where developers write code. It has a GitHub Action that pushes daily commit summaries here. Developers install Claude Code slash commands (`/ship`, `/roadmap`) in that repo.
- **Tracking repo (this repo)** — receives processed commit data and hosts the roadmap frontend. One branch per project, auto-deployed via Vercel.

## Branch structure

- `main` — setup docs, ready-to-use prompts and templates in `setup/`
- `project-x`, `project-y`, etc. — each branch has its own Next.js frontend, MDX roadmap files in `content/`, and a `project.config.json`

## Key files (on project branches)

- `project.config.json` — project name, dev roster, environments, commit prefix
- `content/*.mdx` — one file per deliverable, with YAML frontmatter (title, owner, status, environment) and a changelog
- `setup/` — templates and instructions for setting up new projects (lives on `main`)

## Data flow

1. Devs commit in the client repo using the `/ship` slash command (proper prefix + conventional format)
2. A daily GitHub Action on the client repo collects today's commits, determines environment from branch (staging → `in-dev`, main/production → `deployed`)
3. The Action fetches roadmap context from the tracking repo: `project.config.json` + all existing MDX frontmatter
4. Commits + roadmap context are sent to Claude API — Claude matches commits to existing deliverables and writes plain-English changelog entries; unmatched commits are skipped in MDX but included in the Slack digest
5. The Action updates MDX files here via GitHub API, posts a Slack digest
6. Vercel auto-redeploys the branch frontend

## MDX status values

`in-dev`, `in-review`, `deployed` — the automated Action only sets `in-dev` and `deployed` (derived from branch); `in-review` can be set manually

## Slash commands (installed on client dev repo, templates in `setup/`)

- `/ship` — drafts and creates a properly prefixed commit from staged changes
- `/roadmap` — fetches current roadmap state from the tracking repo and displays status summary
