# SaShip Commit — Claude Code Slash Command

## Installation

Create the file `.claude/commands/ship.md` in your dev repo:

```markdown
Read the current conversation context and the staged git changes.

Produce a commit message following these rules:

1. If the changes relate to a roadmap deliverable (Auth, Dashboard, API, Integrations, etc.), prefix with the project tag: `$ARGUMENTS`
   Example: `[project-x] feat: implement JWT token refresh`

2. Use conventional commit format: `[prefix] type: description`
   Types: feat, fix, refactor, docs, test, chore

3. Keep the first line under 72 characters

4. If the change is NOT roadmap-relevant (tooling, CI, formatting), do NOT add the prefix.

5. After drafting the message, run:
   ```
   git add -A && git commit -m "<your message>"
   ```

6. Ask the user if they want to push.
```

## Usage

From your dev repo, run:

```bash
/ship [project-x]
```

Claude will read your staged changes, draft a properly prefixed commit message, and commit.

## Git Hook (fallback validation)

Optionally install a commit-msg hook to reject non-conforming commits.

Create `.git/hooks/commit-msg`:

```bash
#!/bin/sh
# SaShip commit convention validator
MSG=$(cat "$1")
PREFIX="[project-x]"  # Change to match your project

# Allow commits without prefix (non-roadmap changes)
# But if prefix is present, validate format
if echo "$MSG" | grep -q "^\["; then
  if ! echo "$MSG" | grep -qE "^\[.+\] (feat|fix|refactor|docs|test|chore): .+"; then
    echo "ERROR: Invalid SaShip commit format."
    echo "Expected: $PREFIX type: description"
    echo "Types: feat, fix, refactor, docs, test, chore"
    exit 1
  fi
fi
```

Make it executable:
```bash
chmod +x .git/hooks/commit-msg
```
