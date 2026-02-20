# SaShip Extras — Claude Code Slash Command

## Installation

Create the file `.claude/commands/extras.md` in your **client dev repo**:

```markdown
Add an additional development request to the SaShip tracking repo.

The tracking repo and branch are configured as repository variables:
- TRACKING_REPO (e.g. `org/saship-tracking`)
- TRACKING_BRANCH (e.g. `project-x`)

If these variables are not available, check `.github/workflows/saship-digest.yml` for the values, or ask the user.

Arguments: /extra <title of the feature or fix>

Steps:

1. Parse the title from the arguments. If no arguments provided, ask the user for a title.

2. Ask the user for:
   - **Description**: A short description of what the client requested (1-2 sentences)
   - **Owner**: Which developer will handle this (check project.config.json devs list if available)

3. Generate an `id` from the title: lowercase, replace spaces with hyphens, remove special characters (e.g. "Fix mobile nav" → "fix-mobile-nav").

4. Fetch the current `content/extras.json` from the tracking repo:
   ```
   gh api repos/{TRACKING_REPO}/contents/content/extras.json --jq .content | base64 -d
   ```
   If the file doesn't exist or is empty, start with an empty array `[]`.

5. Append the new item to the array:
   ```json
   {
     "id": "<generated-id>",
     "title": "<title>",
     "description": "<description>",
     "owner": "<owner>",
     "status": "pending"
   }
   ```

6. Push the updated JSON back to the tracking repo:
   ```
   echo '<updated json>' | base64 | gh api -X PUT repos/{TRACKING_REPO}/contents/content/extras.json \
     --field message="[bot] extras: add <id>" \
     --field content=@- \
     --field branch={TRACKING_BRANCH} \
     --field sha=<current sha>
   ```

7. Confirm to the user: "Added '<title>' to extras (pending). It will appear on the /extras page after the next deploy."
```

## Prerequisites

The dev must have the `gh` CLI installed and authenticated with access to the tracking repo.

## Usage

From your client dev repo, run:

```bash
/extra Fix mobile navigation
```

Claude will ask for a description and owner, then push the new item to `content/extras.json` on the tracking repo.
