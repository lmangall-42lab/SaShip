# SaShip Roadmap — Claude Code Slash Command

## Installation

Create the file `.claude/commands/roadmap.md` in your **client dev repo**:

```markdown
Fetch the current roadmap state from the SaShip tracking repo.

The tracking repo and branch are configured as repository variables:
- TRACKING_REPO (e.g. `org/saship-tracking`)
- TRACKING_BRANCH (e.g. `project-x`)

If these variables are not available, check `.github/workflows/saship-digest.yml` for the values, or ask the user.

Steps:

1. Use `gh api` to list MDX files from the tracking repo:
   ```
   gh api repos/{TRACKING_REPO}/contents/content --ref {TRACKING_BRANCH}
   ```

2. For each `.mdx` file returned, fetch its raw content:
   ```
   gh api repos/{TRACKING_REPO}/contents/content/{filename} --ref {TRACKING_BRANCH} -q .content | base64 -d
   ```

3. Parse the YAML frontmatter from each file (title, owner, status, environment).

4. Also fetch `project.config.json` the same way to get the project name.

5. Present a roadmap summary:
   - **Project name** from config
   - A table of all deliverables with columns: Deliverable | Owner | Status | Environment
   - Group by status in this order: in-dev, in-review, deployed
   - For each non-deployed deliverable, show the **latest changelog entry** (most recent date and its content)

Keep the output concise and scannable. Use terminal-friendly formatting.
```

## Prerequisites

The dev must have the `gh` CLI installed and authenticated with access to the tracking repo.

## Usage

From your client dev repo, run:

```bash
/roadmap
```

Claude will fetch the MDX roadmap files from the tracking repo and print a status summary showing what's deployed, what's in development, and what's in review.
