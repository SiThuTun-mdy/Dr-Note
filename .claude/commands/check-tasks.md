# Check Assigned Tasks

List all GitHub issues assigned to you in the project.

## Input

- `$ARGUMENTS` (optional): Label name to filter tasks (e.g., `bug`, `user-story`, `task`)
- If no input provided, show all tasks without filter

## Steps

### 1. Get GitHub Project Info

Read from `CLAUDE.md` (GitHub Project section):
```bash
grep "Repository:" CLAUDE.md
grep "Project Board:" CLAUDE.md
```

Extract:
- **CODE_REPO** — from `Repository:` line (format: `owner/repo`)
- **PROJECT_URL** — from `Project Board:` line (full URL)

If missing or contains `<!--` placeholders, ask the user:
```
What is your GitHub repo? (e.g., ChanOoDev/drnotes)
```

Extract **ISSUE_REPO** from `PROJECT_URL`:
- Format: `https://github.com/<OWNER>/<REPO>/projects/<NUMBER>`
- Extract `<OWNER>/<REPO>` as **ISSUE_REPO**

### 2. List Tasks

**First, try CODE_REPO:**
```bash
gh issue list --repo <CODE_REPO> --assignee @me --state all
```

**If no issues found AND CODE_REPO ≠ ISSUE_REPO, try ISSUE_REPO:**
```bash
gh issue list --repo <ISSUE_REPO> --assignee @me --state all
```

**With filter:**
```bash
gh issue list --repo <REPO> --assignee @me --state all --label "$ARGUMENTS"
```

### 3. Display Results

Show tasks in a clean format:
- Issue number
- Title
- Labels
- State
- Last updated

**Note which repo the issues came from.**

### 4. Group by Priority

- 🔴 **High Priority** (demo-blocker label)
- 🟡 **Medium Priority** (type:dev label)
- 🟢 **Low Priority** (other)

### 5. Summary

- Total tasks
- Label filter applied (if any)
- Which repo issues came from

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/check-tasks` | Show all assigned tasks |
| `/check-tasks bug` | Filter by bug label |
| `/check-tasks user-story` | Filter by user-story label |
| `/check-tasks task` | Filter by task label |
