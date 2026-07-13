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

## Mandatory Workflow (14 Steps)

**Complete ALL steps in order. Do NOT skip any step.**
**Three mandatory approval gates: Step 6 (Code Review), Step 10 (Pre-PR), and Step 4B (UI Design Compliance).**

### Workflow Flow
```
Developer Agent → ui-ux-pro-max Skill → Code Review → WAIT → QA → WAIT → PR
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

### Step 4A: Invoke Developer Agent (MANDATORY — DO NOT SKIP)

**Use the `developer` agent for code implementation:**

The developer agent is a Senior Full-Stack Developer that will:
- Implement one feature at a time
- Follow architecture and folder structure
- Use strict TypeScript where applicable
- Add validation and proper error handling
- Keep code modular and maintainable
- Avoid unrelated refactoring

**When invoking the developer agent, provide:**
1. The task description and acceptance criteria
2. The architecture patterns to follow (from docs/12-Architecture.md)
3. The file structure and naming conventions
4. The tech stack: server actions, Supabase, shadcn/ui, Tailwind CSS

### Step 4B: Invoke ui-ux-pro-max Skill (MANDATORY — DO NOT SKIP)

**Use the `ui-ux-pro-max` skill for UI/UX review and design compliance:**

The ui-ux-pro-max skill will:
- Review UI components for design system compliance
- Verify accessibility (44×44px touch targets, WCAG AA contrast)
- Check responsive design (mobile-first, 375px+ support)
- Validate form patterns (labels, validation, error messages)
- Ensure consistent styling with shadcn/ui and Tailwind

**After UI review, verify against `docs/guide/03-design-system.md`:**
- [ ] §1 Design principles (calm, clinical, no decoration)
- [ ] §2 Color tokens (no hardcoded hex, use Tailwind semantic classes)
- [ ] §3 Button text (verb phrases like "Save note", not "Save")
- [ ] §5 Form patterns (labels above, error messages below, Zod validation)
- [ ] §6 States (loading skeleton, empty state, error toast)
- [ ] §7 Accessibility (44×44px touch targets, focus states, aria-labels)
- [ ] §8 Sentence case, no exclamation marks, terse factual copy

**If design system violations found:**
1. Fix the issues identified
2. Re-verify against §03-design-system.md
3. Repeat until compliant

### Step 5: Implement (Code Implementation)
- Write code following architecture patterns
- Use server actions, Supabase, shadcn/ui, Tailwind CSS
- Follow `backend-skill` patterns (auth first, validate input, defense in depth)
- Follow `supabase-skill` for client setup (getAll/setAll API)
- Apply `frontend-design` for UI components
- Handle errors properly with try/catch
- Validate all inputs with Zod

### Step 6: Code Review with Reviewer Agent (MANDATORY — DO NOT SKIP)

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

### Step 7: Commit and Push
```
git add -A && git commit -m "feat(<scope>): <description>"
git push origin feat/<scope>-<short-description>
```

### Step 8: QA with QA Agent (MANDATORY — DO NOT SKIP)

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

### Step 9: Fix Issues (if needed)
If the QA agent found Critical/High bugs:
1. Fix the issues identified
2. Re-run QA agent
3. Repeat until no Critical/High bugs remain

### Step 10: Pre-PR Review Gate (MANDATORY — DO NOT SKIP)

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

### Step 11: Create Pull Request

Create PR using `.github/PULL_REQUEST_TEMPLATE.md`:
```bash
gh pr create --title "<title>" --body "<filled PR template>"
```
- Link to issue: `Closes #<issue-number>` (if applicable)
- Pre-check items verified in Step 7 should be checked in the template

### Step 12: Update Project Board (if issues exist)
Set issue to Done using the PROJECT_ID, FIELD_ID, and DONE_ID discovered in Step 1A:
```
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id <DONE_ID>
```

### Step 13: Update docs/Progress.md
- Mark the completed user story
- Update current phase if needed
- Add any new decisions to `docs/10-Decisions.md`

### Step 14: Report
Tell the user:
- What was completed
- What is next

## Rules
- Do not start more than one task
- Do not skip any step
- **Do not proceed past Step 4B without design system compliance**
- **Do not proceed past Step 6 without user approval**
- **Do not proceed past Step 10 without user approval**
- Do not commit code that fails QA checks
- Do not create PR without explicit user approval
