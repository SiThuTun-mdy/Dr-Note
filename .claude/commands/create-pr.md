# /create-pr — Create Pull Request (One-Step)

Usage: `/create-pr <optional title override>`

Single-step PR creation: checks → commit → push → create PR. Replaces the two-step `/pr` + `/publish-pr` for common cases.

Read:
- docs/Progress.md
- .github/PULL_REQUEST_TEMPLATE.md

## Workflow (7 Steps)

### Step 1: Check Git Status

```bash
git status
git diff --stat
```

- If no changes, report "Nothing to commit" and stop.
- If on `main`, warn and ask to confirm (PRs should come from feature branches).
- Show the user what will be committed.

### Step 2: Run QA Checks

```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript
npm run build         # Build
```

If any check fails, stop and report the errors. Do not create a PR with failing checks.

### Step 3: Generate PR Title

**If `$ARGUMENTS` is provided**, use it as the PR title.

**Otherwise**, auto-generate from git log:
```bash
git log main..HEAD --oneline
```

Format as conventional commit:
```
feat(scope): <description>       ← new feature
fix(scope): <description>        ← bug fix
docs(scope): <description>       ← documentation
hotfix(scope): <description>     ← emergency fix
chore(scope): <description>      ← maintenance
```

Use the most recent commit message as the base. Clean it up (remove branch prefixes, issue numbers).

**Present to user for approval before proceeding:**
```
PR Title: <title>
Branch: <current-branch>
Base: main
Proceed? (y/n)
```

### Step 4: Generate PR Body

Fill the PR template from `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
<1-2 sentences describing what this PR does>

## Type of Change
<check the appropriate box>

## Related Issue
Closes #<issue-number>  (if branch name or commits reference an issue)

## What Changed
<bullet list of key changes based on git diff>

## Checklist
- [x] Code follows project patterns and conventions
- [x] Self-review completed
- [x] No `console.log` or debug statements left
- [x] No secrets or credentials in code
- [x] TypeScript compiles without errors
- [x] ESLint passes
- [x] Build succeeds
- [ ] Documentation updated (if applicable)
- [ ] RLS policies tested (if database changes)
```

Pre-check items that are verified (Step 2). Leave unchecked items for the developer to verify.

### Step 5: Commit and Push

```bash
git add -A
git commit -m "<pr-title>"
git push origin <current-branch>
```

Skip commit if there are no unstaged changes (already committed).

### Step 6: Create PR on GitHub

```bash
gh pr create \
  --title "<pr-title>" \
  --body "<pr-body>" \
  --base main
```

If the branch already has an open PR, report the existing PR URL instead of creating a duplicate.

### Step 7: Report

```
✅ PR Created!

Title: <title>
URL: <pr-url>
Branch: <branch> → main
Checks: <status>

Next: Wait for CI to pass, then request review.
```

## Rules

- Do NOT create PR if QA checks fail
- Do NOT force push
- Do NOT skip user confirmation on PR title
- Do NOT create duplicate PRs (check for existing open PR first)
- Do NOT commit unrelated changes — only stage what's needed
