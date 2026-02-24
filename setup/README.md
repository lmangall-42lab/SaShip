# SaShip Setup Guide

This is aguide to setup for a new project (new client)

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
  "devs": ["Dev Name A", "Dev Name B"],
  "environments": ["dev", "prod"],
  "commitPrefix": "[your-project]"
}
```

Set `environments` to `["prod"]` if you don't need a dev/prod pipeline split. Deliverables per dev are defined in `content/roadmap.json` (see Sprint Schedule below).

### 3. Add secrets and variables to the client dev repo

#### Generate the `TRACKING_REPO_TOKEN`

This token allows the GitHub Action on the client repo to write MDX files, extras, and stats to SaShip.
Go to **GitHub > Profile picture > Settings > Developer settings > Personal access tokens > Fine-grained tokens**


#### Add secrets on the client repo

Go to the **client dev repo** on GitHub > **Settings > Secrets and Variables > Actions > Secrets**:

| Secret               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `TRACKING_REPO_TOKEN`| The fine-grained PAT generated above                   |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key for commit summarization         |
| `SLACK_WEBHOOK_URL`  | Slack incoming webhook URL for digests and deploy notifs|

#### Add variables on the client repo

Go to the **client dev repo** on GitHub > **Settings > Secrets and Variables > Actions > Variables**:

| Variable             | Value                              |
| -------------------- | ---------------------------------- |
| `TRACKING_REPO`      | `org/SaShip` (e.g. `42Lab-co/SaShip`) |
| `TRACKING_BRANCH`    | `your-project` (the branch name)   |
| `COMMIT_PREFIX`      | `[your-project]`                   |

### 4. Install the GitHub Action on the client dev repo

Copy `setup/github-action.yml` to `.github/workflows/saship-digest.yml` in the **client dev repo**.

This workflow runs automatically at **7:30 AM UTC+1 on weekdays** (6:30 UTC) and can also be triggered manually.

The required secrets and variables were already configured in step 3.

### 5. Install the Slack merge notify workflow on the client dev repo

Copy `setup/slack-merge-notify.yml` to `.github/workflows/slack-merge-notify.yml` in the **client dev repo**.

This workflow fires on every push to `main`, `staging`, or `dev/*`. It:
1. Waits for the Vercel deployment to succeed (polls up to 10 min) — **skipped for dev branches**
2. Collects all commits in the push
3. Rephrases them in customer-friendly language via AI (no technical jargon)
4. Posts to Slack with a branch-specific message:
   - **main** → "*Mise en production effectuee*"
   - **staging** → "*Nouveau deploiement en staging*" + link to staging URL + ping for validation
   - **dev/*** → "*{Author} a ajouté à l'environnement de développement*" (French, personalized)
5. If Vercel deployment fails (main/staging only), posts a failure alert

No new secrets needed — reuses `AI_GATEWAY_API_KEY` and `SLACK_WEBHOOK_URL` from step 3.

### 5b. Create per-developer dev branches on the client repo

Create one `dev/<username>` branch per developer:

```bash
git branch dev/lmangall staging
git branch dev/quentin staging
git push origin dev/lmangall dev/quentin
```

These branches trigger the merge notify workflow with the personalized French message. No Vercel deployment is expected on these branches.

### 6. Set up the Claude Code slash commands

Follow the instructions in `setup/slash-command-ship.md` to install the `/ship` commit command on the dev side.

Follow the instructions in `setup/slash-command-roadmap.md` to install the `/roadmap` status command on the dev side.

Follow the instructions in `setup/slash-command-extras.md` to install the `/extra` command for adding additional developments.


---

## Sprint Schedule

Create `content/roadmap.json` to define the week-by-week sprint plan. This drives the `/roadmap` page on the frontend:

```json
[
  {
    "week": "S1",
    "label": "Sprint 0 — Foundation",
    "sync": "Optional sync milestone note",
    "devs": {
      "Dev Name": [
        { "title": "Feature A", "description": "Short description of the work" }
      ]
    }
  }
]
```

Each entry maps a week code (S1, S2, ...) to a label and the deliverables each dev works on that week. The `sync` field is optional — use it for milestone checkpoints. This is the single source of truth for what each dev builds — dev names must match those in `project.config.json`.

---

## Adding Deliverables

Create `.mdx` files in `content/`:

```mdx
---
title: Feature Name
owner: Dev Name
status: in-staging
environment: staging
---

## Changelog

### 2026-02-18
Initial scaffolding — *Dev Name*
```

**Status values:** `in-staging`, `deployed` — the Action sets `in-staging` or `deployed` based on branch
**Environment values:** `staging`, `prod`

The GitHub Action updates these files automatically via the daily digest. All Action commits are prefixed with `[bot]` to distinguish them from developer commits.

The Action also maintains:
- `content/commits.mdx` — a single file with ALL commits (matched or not), prepended after `## Commit Log`. No AI involved — just direct formatting with the project prefix stripped. Drives the `/commits` page.
- `content/extras.json` — additional client-requested developments. Items are added via the `/extra` slash command. The Action's AI step auto-marks items as `"done"` when commits resolve them. Drives the `/extras` page.
- `sync-log.json` at the branch root, recording the timestamp and details of each sync run.

---

## Scaffolding Prompt

Use this prompt with Claude to quickly scaffold a new project:

> I'm setting up a new SaShip project branch. The project is called "[name]". The developers are [list names and their deliverables]. We use [dev+prod / prod only] environments. Please create the project.config.json and initial MDX files in content/ for each deliverable.
