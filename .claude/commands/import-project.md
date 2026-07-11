# /import-project — Import Existing Project

Import existing documentation and connect to a GitHub Project board.

Use this when the PM has already provided PRD, Architecture, and other docs, and tasks are in GitHub Projects.

## Prerequisites

- PM has provided docs in `docs/guide/` folder (or similar)
- GitHub Project board exists with user stories/tasks
- Repository is set up with remote origin

## Steps

### Step 1: Get Code Repo from Git + Ask for GitHub Project Link

**1. Get code repo from git remote:**
```bash
git remote -v | head -1
```
Extract `<OWNER>/<REPO>` from the URL (e.g., `git@github.com:ChanOoDev/drnotes.git` → `ChanOoDev/drnotes`)

**2. Ask for GitHub Project URL:**
```
What is your GitHub Project URL? (e.g., https://github.com/SiThuTun-mdy/Dr-Note/projects/3)
```

**Extract from the URL:**
| Part | From URL | Example |
|------|----------|---------|
| `ISSUE_OWNER` | `<OWNER>` | `SiThuTun-mdy` |
| `ISSUE_REPO` | `<REPO>` | `Dr-Note` |
| `PROJECT_NUMBER` | `<NUMBER>` | `3` |

**Note:** Project URL and code repo can be different (issues in one repo, code in another).

Store all values for use in all commands.

### Step 2: Scan Provided Documents

Check what the PM has provided:
```bash
ls docs/guide/
```

Look for these files (any naming convention accepted):
- PRD / Product Requirements
- Architecture / Tech Stack / ERD
- Design System / UI Guidelines / Style Guide
- Database Schema / RLS Policies
- Wireframes / UI Specs
- Any other project docs

**Note:** User Stories and Sprint Backlog come from GitHub Project — do NOT look for them in docs/guide/.

### Step 3: Import Documents to docs/

Copy and rename PM's docs to standard locations:

| PM Provided | Import To |
|-------------|-----------|
| PRD / Product Requirements | `docs/02-PRD.md` |
| Architecture / Tech Stack | `docs/12-Architecture.md` |
| Design System / UI Guidelines | `docs/guide/03-design-system.md` (keep in guide/) |
| ERD / Database Schema | `docs/13-ERD.md` (append to Architecture) |
| Acceptance Criteria | `docs/06-Acceptance-Criteria.md` |
| RLS Policies | `docs/16-RLS-Policies.md` |
| API Specification | `docs/14-API-Specification.md` |

```bash
# Example:
cp docs/guide/PRD.md docs/02-PRD.md
cp docs/guide/Architecture.md docs/12-Architecture.md
```

If docs are in different format (Word, PDF, Notion export), read and convert to Markdown.

**Skip:** `docs/04-User-Stories.md` and `docs/18-Sprint-Backlog.md` — these come from GitHub Project.

### Step 4: Read GitHub Project Board

```bash
gh api user --jq '.login'
gh project list --owner @me --format json
```

Find the project and list tasks:
```bash
gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json --jq '.items[] | {title, status, id}'
```

### Step 5: Create Progress.md

Create `docs/Progress.md` based on GitHub board state:
- Mark completed tasks (status: "Done")
- Mark in-progress tasks (status: "In Progress")
- List pending tasks (status: "Todo")

### Step 6: Verify Setup

```bash
# Check required docs exist
ls docs/02-PRD.md docs/12-Architecture.md docs/Progress.md

# Check GitHub connection
gh auth status
gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json | head -5
```

### Step 7: Save Configuration

Save the GitHub project info to BOTH locations:

**1. Update `CLAUDE.md`** (GitHub Project section):
```markdown
## GitHub Project

- **Repository:** https://github.com/<CODE_OWNER>/<CODE_REPO>
- **Project Board:** https://github.com/<ISSUE_OWNER>/<ISSUE_REPO>/projects/<PROJECT_NUMBER>
- **Project ID:** <PVT_xxxxx from gh project list>
```

**2. Update `docs/Progress.md`** (GitHub Configuration section):
```markdown
## GitHub Configuration

- **Code Repo:** <CODE_OWNER>/<CODE_REPO> (code, branches, PRs)
- **Issue Tracker:** <ISSUE_OWNER>/<ISSUE_REPO> (issues, project board)
- **Project ID:** <PVT_xxxxx>
```

This allows all commands to read the correct repos:
- `CLAUDE.md` → primary source for agents
- `docs/Progress.md` → fallback for older commands

**3. Verify Project ID:**
```bash
gh project list --owner <ISSUE_OWNER> --format json | jq '.[].id'
```

### Step 8: Report

Tell the user:
- What documents were imported
- How many tasks found in GitHub board
- What's missing (if any docs weren't provided)
- Next command: `/bootstrap` (if app not scaffolded) or `/next-task`

## Rules

- Do not modify PM's original docs in `docs/guide/`
- Preserve all content from imported docs
- Do NOT create `docs/04-User-Stories.md` or `docs/18-Sprint-Backlog.md` — tasks come from GitHub
- If a required doc is missing, report it — do not skip
- If GitHub board has tasks in unexpected format, report it
