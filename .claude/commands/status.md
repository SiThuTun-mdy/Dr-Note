Summarize current project status from local docs AND GitHub.

## Step 1: Read Local Docs

Read these files (skip if not found):
- docs/Progress.md
- docs/18-Sprint-Backlog.md
- docs/26-QA-Report.md
- docs/31-Release-Report.md

## Step 2: Check GitHub

First, read repo and project info from `CLAUDE.md`:
```bash
grep "Repository:" CLAUDE.md
grep "Project Board:" CLAUDE.md
grep "Project ID:" CLAUDE.md
```

Extract **REPO** and **PROJECT_ID**. If missing or contains `<!--` placeholders, ask user.

Then run these `gh` commands:

1. **GitHub Project Board** — List issues and their status:
   ```bash
   gh issue list --repo <REPO> --state all --limit 50
   ```

2. **Open Pull Requests** — Check for pending reviews:
   ```bash
   gh pr list --repo <REPO> --state open
   ```

3. **Recent PRs** — See what was recently merged:
   ```bash
   gh pr list --repo <REPO> --state merged --limit 5
   ```

4. **Branch Status** — Current branch and changes:
   ```bash
   git branch --show-current
   git status --short
   ```

## Step 3: Return Report

Format the output as:

### 1. Current Phase
From docs/Progress.md

### 2. Completed Work
- From local docs (user stories)
- From GitHub (merged PRs, closed issues)

### 3. In-Progress Work
- From local docs
- From GitHub (open PRs, issues in progress)

### 4. Pending Work
- From local docs
- From GitHub (issues in TODO/backlog)

### 5. GitHub Project Board
List all issues with status:
| Issue | Title | Status | Assignee |

### 6. Open Pull Requests
| PR | Title | Author | Status |

### 7. Branch Status
Current branch, uncommitted changes

### 8. Sync Check
Compare local Progress.md vs GitHub — flag any discrepancies (e.g., story marked done locally but issue still open on GitHub)

### 9. Blockers
From all sources

### 10. Next Recommended Command
Based on current state
