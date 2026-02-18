# SaShip Setup Guide

## Quick Start

### 1. Create a new project branch

```bash
git checkout main
git checkout -b project-your-name
```

### 2. Configure project.config.json

Edit `project.config.json` at the repo root:

```json
{
  "project": "your-project",
  "devs": [
    { "name": "Dev Name", "deliverables": ["Feature A", "Feature B"] }
  ],
  "environments": ["dev", "prod"],
  "commitPrefix": "[your-project]"
}
```

Set `environments` to `["prod"]` if you don't need a dev/prod pipeline split.

### 3. Add secrets to the client dev repo

In the **client dev repo's** GitHub Settings > Secrets and Variables > Actions:

| Secret               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key for commit summarization         |
| `SLACK_WEBHOOK_URL`  | Slack incoming webhook URL for daily digests           |
| `TRACKING_REPO_TOKEN`| GitHub PAT with repo write access to the tracking repo |

### 4. Install the GitHub Action on the client dev repo

Copy `setup/github-action.yml` to `.github/workflows/saship-digest.yml` in the **client dev repo**.

Set these repository variables (Settings > Variables > Actions):

| Variable          | Value                        |
| ----------------- | ---------------------------- |
| `TRACKING_REPO`   | `org/saship-tracking`        |
| `TRACKING_BRANCH` | `your-project`               |
| `COMMIT_PREFIX`   | `[your-project]`             |

### 5. Set up the Claude Code slash commands

Follow the instructions in `setup/slash-command-ship.md` to install the `/ship` commit command on the dev side.

Follow the instructions in `setup/slash-command-roadmap.md` to install the `/roadmap` status command on the dev side.

### 6. Vercel deployment

Connect the tracking repo to Vercel. Each branch auto-deploys to its own preview URL.

No additional configuration needed — Vercel detects the Next.js app at the repo root.

---

## Adding Deliverables

Create `.mdx` files in `content/`:

```mdx
---
title: Feature Name
owner: Dev Name
status: in-dev
environment: dev
---

## Changelog

### 2026-02-18
Initial scaffolding — *Dev Name*
```

**Status values:** `in-dev`, `in-review`, `deployed` — the Action sets `in-dev` or `deployed` based on branch; `in-review` can be set manually
**Environment values:** `dev`, `prod`

The GitHub Action updates these files automatically via the daily digest.

---

## Scaffolding Prompt

Use this prompt with Claude to quickly scaffold a new project:

> I'm setting up a new SaShip project branch. The project is called "[name]". The developers are [list names and their deliverables]. We use [dev+prod / prod only] environments. Please create the project.config.json and initial MDX files in content/ for each deliverable.
