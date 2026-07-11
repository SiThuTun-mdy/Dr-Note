# /hotfix — Emergency Production Fix

Usage: `/hotfix <issue-number or description>`

Hotfix workflow for critical production issues. Streamlined for speed — minimal steps, fast-track review.

Read:
- docs/Progress.md
- docs/12-Architecture.md
- .github/PULL_REQUEST_TEMPLATE.md

## When to Use

- Site is down or critically broken
- Security vulnerability actively exploited
- Data loss or corruption occurring
- Core feature (login, consultation save) completely broken

**Not for:** QA bugs found during development, cosmetic issues, nice-to-haves. Use `/bugfix` for those.

## Mandatory Workflow (8 Steps)

### Step 1: Assess Severity

Confirm this is a true hotfix:
- **Is production affected?** (Not just local dev)
- **Is there a workaround?** (If yes, consider `/bugfix` instead)
- **How many users impacted?**

Present assessment:
```
HOTFIX ASSESSMENT
Issue: <description>
Severity: Critical / High
Impact: <who is affected>
Workaround: <yes/no>
Proceed with hotfix? (y/n)
```

### Step 2: Create Hotfix Branch from Main

```bash
git checkout main
git pull origin main
git checkout -b hotfix/<short-description>
```

**Always branch from main** — hotfixes are urgent fixes to production, not feature work.

### Step 3: Implement Minimal Fix

- **Minimal changes only** — fix the exact bug, nothing else
- **No refactoring** — do not clean up surrounding code
- **No new features** — strictly the fix
- **No unrelated changes** — stay focused

If the fix is complex (more than ~50 lines changed), reconsider whether this is truly a hotfix or should be a `/bugfix` on a feature branch.

### Step 4: Developer Self-Review (Fast)

Quick checklist — do NOT skip, but keep it fast:
- [ ] **Security** — fix doesn't introduce new vulnerabilities
- [ ] **Side effects** — fix doesn't break other features
- [ ] **RLS** — database-level security still enforced
- [ ] **Auth** — authentication/authorization not weakened

### Step 5: QA Checks (Essential Only)

Run only the critical checks:
```bash
npm run lint          # ESLint — must pass
npx tsc --noEmit      # TypeScript — must pass
npm run build         # Build — must succeed
```

Skip full regression — there's no time. Trust the minimal change scope.

### Step 6: Commit and Push

```bash
git add -A
git commit -m "hotfix(<scope>): <description>

Closes #<issue-number>"
git push origin hotfix/<short-description>
```

### Step 7: Fast-Track Review

Create PR using `.github/PULL_REQUEST_TEMPLATE.md` with hotfix additions:
```bash
gh pr create \
  --title "HOTFIX: <description>" \
  --body "<filled PR template + hotfix urgency section>" \
  --label "hotfix"
```

If no `hotfix` label exists, create it first:
```bash
gh label create hotfix --description "Emergency production fixes" --color "D93F0B"
```

### Step 8: After Merge — Cherry-pick to Feature Branches

After the hotfix PR is merged to main:

```bash
# Get the hotfix commit SHA
git log main --oneline -1

# Cherry-pick to any active feature branches
git checkout feat/<active-branch>
git cherry-pick <hotfix-commit-sha>
```

This prevents the fix from being lost when feature branches eventually merge.

**If no active feature branches exist**, skip this step.

## Rules

- Do NOT skip self-review — even hotfixes can introduce bugs
- Do NOT add unrelated changes — stay minimal
- Do NOT skip lint/tsc/build — a broken build is worse than the original bug
- Do NOT delay merge — hotfix PRs should be reviewed and merged ASAP
- Do update docs/Progress.md after merge

## Escalation

If the fix requires:
- **Database migration** → Contact DBA / run Supabase migration manually
- **Environment variable change** → Update Vercel env vars, redeploy
- **Third-party service outage** → Document workaround, do not code around it
