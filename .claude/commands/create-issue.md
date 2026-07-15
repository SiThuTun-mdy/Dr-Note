# /create-issue — Create GitHub Issue

Create a new GitHub issue for yourself using the repo's standard template
(`.github/ISSUE_TEMPLATE/task.md`), then add it to the Project Board.

## Input

- `$ARGUMENTS` (optional): a title and/or short description to seed the issue
  (e.g., `/create-issue Patient search debounce is too aggressive`)
- If no input provided, ask the user for a title first.

## Steps

### 1. Get GitHub Project Info

Read from `CLAUDE.md` (GitHub Project section):
```bash
grep "Repository:" CLAUDE.md
grep "Project Board:" CLAUDE.md
grep "Project ID:" CLAUDE.md
```

Extract:
- **REPO** — from `Repository:` line (format: `owner/repo`)
- **PROJECT_URL** — from `Project Board:` line (full URL, gives `OWNER`/`PROJECT_NUM`)
- **PROJECT_ID** — from `Project ID:` line (format: `PVT_xxx`)

If missing or contains `<!--` placeholders, ask the user for repo + project board URL
before continuing.

### 2. Gather Issue Content

Read `.github/ISSUE_TEMPLATE/task.md` as the body skeleton.

Fill it in from `$ARGUMENTS` plus follow-up questions for anything not already given:
- **Title** — short, specific
- **Story** — As a `<role>`, I want `<capability>` so that `<benefit>`
- **Context** — why this exists, what it relates to, related issues to avoid scope overlap
- **Constraints** — integration points, design system / components to reuse
- **Files** — expected touch points (paths)
- **Acceptance criteria** — testable checklist items
- **Part of #N** / **Depends on: #N** — omit either line from the body if not applicable
- **Labels** — choose only from the existing set (do not invent new labels):
  - Type: `task`, `epic`, `bug`
  - Epic: `epic:infra`, `epic:auth`, `epic:user-reg`, `epic:records`, `epic:history`
  - Area: `area:db`, `area:testing`
  - Kind: `type:dev`, `type:infra`
  - Priority: `demo-blocker` (only if it truly gates a demo/milestone)
- **Milestone** (optional) — check current open milestone with:
  ```bash
  gh api repos/<REPO>/milestones --jq '.[].title'
  ```

Do not fabricate acceptance criteria or context the user hasn't provided — ask rather than guess.

### 3. Preview (MANDATORY — DO NOT SKIP)

Show the fully rendered issue before creating anything:
```
Title: <title>
Labels: <labels>
Milestone: <milestone or "none">
---
<rendered body>
---
Create this issue? (y/n)
```

**WAIT FOR EXPLICIT USER CONFIRMATION.** If the user says no, ask what to change and
re-preview. Do not proceed to Step 4 without a yes.

### 4. Create the Issue

```bash
gh issue create --repo <REPO> --title "<title>" --body-file <tmp-body-file> \
  --label "<label1,label2>" --assignee "@me" [--milestone "<milestone>"]
```

Capture the returned issue URL/number.

### 5. Add to Project Board

```bash
gh project item-add <PROJECT_NUM> --owner <OWNER> --url <issue-url>
```

If the board has a "Todo" (or equivalent not-started) Status option, set it:
```bash
gh project field-list --project-id <PROJECT_ID> --format json
```
Find the Status field ID and the "Todo" option ID, then:
```bash
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> \
  --single-select-option-id <TODO_ID>
```
If no clear "Todo" option exists, leave the default status the board assigns on add.

### 6. Report

Tell the user:
- Issue number and URL
- Labels and milestone applied
- Whether it was added to the Project Board (and its Status)
- Suggest `/next-task <issue-number>` when they're ready to work it

## Rules
- Never invent labels outside the existing set — ask the user if unsure which fits.
- Never skip the Step 3 preview/confirmation gate.
- Never guess acceptance criteria or story content the user hasn't supplied.
- This command only creates the issue — it does not branch, implement, or open a PR
  (that's `/next-task` / `/feature`).
