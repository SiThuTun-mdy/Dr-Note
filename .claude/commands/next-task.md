# /next-task — Next Sprint Task

Optional input:
$ARGUMENTS

Read:
- docs/18-Sprint-Backlog.md (if exists — tasks may come from GitHub Project)
- docs/Progress.md
- docs/12-Architecture.md
- docs/02-PRD.md
- docs/guide/03-design-system.md (if exists — PM's design guidelines)
- .github/PULL_REQUEST_TEMPLATE.md

Find the next Pending task. If Sprint-Backlog doesn't exist, read tasks from GitHub Project board.

**If `$ARGUMENTS` contains a number** (e.g., `/next-task 16`), treat it as a GitHub issue ID and skip to Step 1B below.

## Mandatory Workflow (13 Steps)

**Complete ALL steps in order. Do NOT skip any step.**
**Two mandatory approval gates: Step 5 (Code Review) and Step 9 (Pre-PR).**

### Workflow Flow
```
Implement → Code Review (reviewer agent) → WAIT → QA (qa agent) → WAIT → PR
```

### Step 1A: Auto-pick Next Task (when no task ID provided)

Read repo and project info from `CLAUDE.md` (GitHub Project section):
```bash
grep "Repository:" CLAUDE.md
grep "Project Board:" CLAUDE.md
grep "Project ID:" CLAUDE.md
```

Extract:
- **REPO** — from `Repository:` line (format: `owner/repo`)
- **PROJECT_URL** — from `Project Board:` line (full URL)
- **PROJECT_ID** — from `Project ID:` line (format: `PVT_xxx`)

**If any are missing or contain `<!--` placeholders**, ask the developer:
```
GitHub Project info is missing from CLAUDE.md.
Please provide:
1. GitHub Project Board URL (e.g., https://github.com/ChanOoDev/drnotes/projects/1)
2. Project ID (run: gh project list --owner ChanOoDev)
```

Also check `docs/Progress.md` as fallback:
```bash
grep "Repo:" docs/Progress.md
grep "Project ID:" docs/Progress.md
```

**Discover field IDs dynamically** (stable per project, but vary across projects):
```bash
# Get the Status field ID and its option IDs
gh project field-list --project-id <PROJECT_ID> --format json
```

Look for:
- **FIELD_ID** — the field named "Status" (or similar)
- **IN_PROGRESS_ID** — the option ID for "In Progress"
- **DONE_ID** — the option ID for "Done"

**Important:** Save these discovered IDs locally for this session. All subsequent `gh project item-edit` calls in this workflow use them.

Fetch all open issues assigned to you:
```bash
gh issue list --repo <REPO> --assignee @me --state open --json number,title,labels,updatedAt
```

**Filter OUT these labels (skip infra/setup tasks):**
- `epic:infra` — infrastructure, CI/CD, scaffolding
- `type:infra` — infrastructure work

**Only consider issues with these labels:**
- `type:dev` — feature development
- `epic:auth`, `epic:records`, `epic:ui` — feature epics

**Prioritize using this ranking:**

| Priority | Rule | Why |
|----------|------|-----|
| 1 (Highest) | Has `demo-blocker` label | Must land before demo |
| 2 | Has `type:dev` label | Implementation work |
| 3 | Fewest open dependencies (check issue body for "Depends on: #X") | Unblock downstream work |
| 4 | Oldest `updatedAt` | Avoid staling |

Pick the highest-priority issue. If there's a tie, pick the oldest.

**Present the selection to the user before proceeding:**
```
Auto-picked: #<NUMBER> — <TITLE>
Labels: <labels>
Reason: <why this was picked>
Proceed? (y/n)
```

If user says no, show the top 5 candidates and let them choose.

Set issue to In Progress:
```
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id <IN_PROGRESS_ID>
```

### Step 1B: Pick Specific Task (when task ID provided)

If `$ARGUMENTS` contains a number (e.g., `/next-task 16`), fetch that issue directly:

```bash
gh issue view <ISSUE_NUMBER> --repo <REPO> --json title,state,labels,body
```

- If the issue is OPEN, proceed with it.
- If the issue is CLOSED, report it's already done and suggest picking another.
- Read the issue body for acceptance criteria and constraints.

### Step 2: Create Feature Branch
```
git checkout -b feat/<scope>-<short-description>
```

### Step 3: Explain the Task
- Describe what will be implemented
- Read PRD for acceptance criteria
- Read Architecture for technical patterns
- Read Sprint Backlog for task details and dependencies

### Step 4: Implement
- Write code following architecture patterns
- Use server actions, Supabase, shadcn/ui, Tailwind CSS
- Follow `backend-skill` patterns (auth first, validate input, defense in depth)
- Follow `supabase-skill` for client setup (getAll/setAll API)
- Apply `ui-ux-pro-max` for UI components and layout patterns
- Follow `react-best-practices` for React/Next.js performance
- Handle errors properly with try/catch
- Validate all inputs with Zod

### Step 5: Code Review with Reviewer Agent (MANDATORY — DO NOT SKIP)

**Spawn the `reviewer` agent to perform code review:**

```bash
# Agent will review all changed files for:
# - Architecture consistency
# - Security vulnerabilities
# - Type safety
# - Error handling
# - Performance issues
# - Maintainability
```

The reviewer agent will return:
- Findings grouped by severity (Critical, High, Medium, Low)
- Verdict: PASS or FAIL

**If FAIL (Critical/High findings):**
1. Fix the issues identified
2. Re-run the review
3. Repeat until PASS

**Present review results to user:**
```
## Code Review Results

| Severity | Count |
|----------|-------|
| Critical | X |
| High | X |
| Medium | X |
| Low | X |

Verdict: PASS/FAIL

Proceed to QA? (y/n)
```

**WAIT FOR USER APPROVAL before proceeding.**

### Step 6: Commit and Push
```
git add -A && git commit -m "feat(<scope>): <description>"
git push origin feat/<scope>-<short-description>
```

### Step 7: QA with QA Agent (MANDATORY — DO NOT SKIP)

**Spawn the `qa` agent to perform quality assurance:**

The QA agent will:
1. Run automated checks (ESLint, TypeScript, Build)
2. **Create unit tests** for all implemented functions/components
3. Validate acceptance criteria from the issue
4. Test the implementation against requirements
5. Generate test results and bug reports

**QA Agent validates:**
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Unit tests created and passing
- [ ] Acceptance criteria met
- [ ] No Critical/High bugs

The QA agent will return:
- Test results (passed/failed/skipped)
- **Unit test coverage report**
- Acceptance criteria status
- Bug list (if any)
- Ready for release: true/false

### Step 8: Fix Issues (if needed)
If the QA agent found Critical/High bugs:
1. Fix the issues identified
2. Re-run QA agent
3. Repeat until no Critical/High bugs remain

### Step 9: Pre-PR Review Gate (MANDATORY — DO NOT SKIP)

**Present QA results and request user approval before creating PR:**

```
## QA Results

| Check | Status |
|-------|--------|
| ESLint | ✅/❌ |
| TypeScript | ✅/❌ |
| Build | ✅/❌ |
| Acceptance Criteria | X/Y met |

### Bugs Found
- Critical: X
- High: X
- Medium: X
- Low: X

Ready to create PR? (y/n)
```

**WAIT FOR USER APPROVAL before creating PR.**

### Step 10: Create Pull Request

Create PR using `.github/PULL_REQUEST_TEMPLATE.md`:
```bash
gh pr create --title "<title>" --body "<filled PR template>"
```
- Link to issue: `Closes #<issue-number>` (if applicable)
- Pre-check items verified in Step 7 should be checked in the template

### Step 11: Update Project Board (if issues exist)
Set issue to Done using the PROJECT_ID, FIELD_ID, and DONE_ID discovered in Step 1A:
```
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id <DONE_ID>
```

### Step 12: Update docs/Progress.md
- Mark the completed user story
- Update current phase if needed
- Add any new decisions to `docs/10-Decisions.md`

### Step 13: Report
Tell the user:
- What was completed
- What is next

## Rules
- Do not start more than one task
- Do not skip any step
- **Do not proceed past Step 5 without user approval**
- **Do not proceed past Step 9 without user approval**
- Do not commit code that fails QA checks
- Do not create PR without explicit user approval
