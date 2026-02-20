# Testing the SaShip GitHub Action

## Prerequisites

### Secrets (client dev repo → Settings → Secrets → Actions)

| Secret | Value | Why |
|---|---|---|
| `AI_GATEWAY_API_KEY` | `vck_...` | Vercel AI Gateway key — calls claude-haiku-4-5 to summarize commits |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` or `https://example.com` | Slack digest destination. Use a dummy URL for testing — step logs error but doesn't block |
| `TRACKING_REPO_TOKEN` | `ghp_...` | GitHub PAT with repo write access to the SaShip tracking repo |

### Variables (client dev repo → Settings → Variables → Actions)

| Variable | Value |
|---|---|
| `TRACKING_REPO` | `<org>/SaShip` |
| `TRACKING_BRANCH` | `entrepreneurs-os` |
| `COMMIT_PREFIX` | `[entrepreneurs-os]` |

### Workflow file

Copy into the client dev repo:

```bash
mkdir -p .github/workflows
cp setup/github-action.yml .github/workflows/saship-digest.yml
git add .github/workflows/saship-digest.yml
git commit -m "add saship digest workflow"
git push
```

## Test commits

Run these from any branch on the client dev repo. Empty commits are fine — the action only reads git log messages.

```bash
git commit --allow-empty -m "[entrepreneurs-os] feat(socle-commun): add auth middleware and session management"
git commit --allow-empty -m "[entrepreneurs-os] feat(agent-guide): implement onboarding wizard first steps"
git commit --allow-empty -m "[entrepreneurs-os] fix(systeme-de-credits): fix credit deduction on failed transactions"
git commit --allow-empty -m "[entrepreneurs-os] chore: update linter config"
git push
```

The first three match existing MDX deliverables (e.g. `socle-commun-quentin`, `agent-guide-quentin`) so the action can update them. The fourth commit doesn't map to any deliverable — it should appear only in the Slack digest, not in MDX updates.

## Trigger

1. Go to the client dev repo on GitHub
2. **Actions** tab → **SaShip Daily Digest** → **Run workflow**
3. Pick the branch where you pushed the commits + workflow file

## What to check in the logs

Each step is a collapsible group:

| Group | Success looks like | Failure looks like |
|---|---|---|
| **Commit collection** | `Found 3 commit(s)` + JSON array with `status` field per commit | `::warning:: No commits with prefix...` |
| **Update commit log** | `Updated content/commits.mdx with N new commit(s)` | `::error:: Failed to update content/commits.mdx` |
| **Fetch roadmap context** | `Found N existing roadmap entries` + JSON array of slugs/status | Empty array (no MDX files yet — OK for first run) |
| **AI Gateway request** | `HTTP status: 200` + `response received (N chars)` | `::error:: HTTP 401/500` + response body |
| **Slack post** | `HTTP status: 200` + `posted successfully` | `::error:: HTTP 4xx` (non-blocking) |
| **MDX updates** | `Updated content/socle-commun-quentin.mdx (HTTP 201)` per file | `::error:: Failed to update ... (HTTP 4xx)` |
| **Extras update** | `Updated content/extras.json` or `No extras updates` | `::error:: Failed to update content/extras.json` |
| **Stats update** | `Updated stats.json (HTTP 200)` | `::error:: Failed to update stats.json` |
| **Sync log** | `Updated sync-log.json (HTTP 200)` | `::error:: Failed to update sync-log.json` |

## Verify results

After a successful run, check the tracking repo (`entrepreneurs-os` branch):

- `content/commits.mdx` — ALL commits listed as bullet points (prefix stripped, no date/time)
- `content/extras.json` — any resolved extras marked as `"done"` (if applicable)
- `content/*.mdx` — new changelog entries appended under `## Changelog`
- `stats.json` — `commitsPerDev` and `lastUpdated` updated
- `sync-log.json` — `lastSync` timestamp and new entry in `runs[]`

All commits on the tracking repo should be prefixed with `[bot]` (e.g. `[bot] update: socle-commun-quentin digest 2026-02-19`).

## Common issues

| Symptom | Cause | Fix |
|---|---|---|
| No commits found | Commits older than 24h or wrong prefix | Re-run the `git commit --allow-empty` commands and trigger immediately |
| AI Gateway 401 | Bad API key | Check `AI_GATEWAY_API_KEY` secret |
| MDX update 404 | Wrong `TRACKING_REPO` or `TRACKING_BRANCH` | Verify variables match the actual repo/branch |
| MDX update 409 | SHA conflict — file changed between read and write | Re-run the action |
| MDX update 422 | `TRACKING_REPO_TOKEN` lacks write access | Create a new PAT with `repo` scope |
