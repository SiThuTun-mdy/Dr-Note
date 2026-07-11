# Check Assigned Tasks

List all GitHub issues assigned to you in the Dr-Note project.

## Input

- `$ARGUMENTS` (optional): Label name to filter tasks (e.g., `demo-blocker`, `task`, `epic:records`)
- If no input provided, show all tasks without filter

## Instructions

### 1. Determine filter

```bash
# Check if label argument is provided
if [ -z "$ARGUMENTS" ]; then
  # No filter - show all tasks
  gh issue list --repo SiThuTun-mdy/Dr-Note --assignee @me
else
  # Filter by label
  gh issue list --repo SiThuTun-mdy/Dr-Note --assignee @me --label "$ARGUMENTS"
fi
```

### 2. Display results

Show tasks in a clean, organized format:
- Issue number
- Title
- Labels
- State
- Last updated date

### 3. Group by priority

- 🔴 **Demo Blockers** (high priority)
- 🟡 **Other Tasks** (regular priority)

### 4. Summary

Provide a count at the end:
- Total tasks
- Demo blockers count (if unfiltered)
- Label filter applied (if any)

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/check-tasks` | Show all assigned tasks |
| `/check-tasks demo-blocker` | Filter by demo-blocker label |
| `/check-tasks task` | Filter by task label (excludes epics) |
| `/check-tasks epic:records` | Filter by records epic |
| `/check-tasks epic:auth` | Filter by auth epic |
| `/check-tasks epic:user-reg` | Filter by user registration epic |
| `/check-tasks epic:history` | Filter by history epic |
| `/check-tasks epic:infra` | Filter by infrastructure epic |

### Common Filters

| Filter | Use Case |
|--------|----------|
| `demo-blocker` | Show only critical demo tasks |
| `task` | Show only implementation tasks (not epics) |
| `epic:records` | Show clinical/records features |
| `epic:auth` | Show authentication features |
| `epic:user-reg` | Show user registration features |
| `epic:history` | Show patient history features |