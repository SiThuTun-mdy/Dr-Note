# /next-task — Next Sprint Task

Read:
- docs/18-Sprint-Backlog.md
- docs/Progress.md

Find the next Pending task.

## Steps

### 1. GitHub Project (if issues exist)
```
gh api user --jq '.login'
gh issue list --repo ChanOoDev/ai_sdlc_framework --assignee @me --label user-story --state open
gh project item-list 5 --owner ChanOoDev --format json --jq '.items[] | select(.status == "Todo") | {title, id}'
```
Set issue to In Progress:
```
gh project item-edit --project-id PVT_kwHOBrrxHs4BcjpP --id <ITEM_ID> --field-id PVTSSF_lAHOBrrxHs4BcjpPzhXLgLE --single-select-option-id 47fc9ee4
```

### 2. Create Feature Branch
```
git checkout -b feat/<scope>-<short-description>
```

### 3. Explain the task

### 4. Implement
- Follow developer → reviewer → qa → documentation workflow
- Fix Critical and High issues

### 5. Commit and Push
```
git add -A && git commit -m "feat(<scope>): <description>"
git push origin feat/<scope>-<short-description>
```

### 6. Create Pull Request
```
gh pr create --title "<title>" --body "Closes #<issue-number>"
```
If no issue: `gh pr create --title "<title>" --body "Description of changes"`

### 7. Update Project Board (if issues exist)
Set issue to Done:
```
gh project item-edit --project-id PVT_kwHOBrrxHs4BcjpP --id <ITEM_ID> --field-id PVTSSF_lAHOBrrxHs4BcjpPzhXLgLE --single-select-option-id 98236657
```

### 8. Update docs/Progress.md

### 9. Tell me what was completed and what is next.

Do not start more than one task.
