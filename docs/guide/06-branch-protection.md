# Branch Protection Rules

Branch protection strategy for the DRNotes repository.

---

## Branch Strategy

```
main (production)
  └── feat/<scope>-<description>    ← feature branches
  └── hotfix/<description>          ← emergency fixes
  └── bugfix/<description>          ← QA defect fixes
  └── docs/<scope>-<description>    ← documentation only
```

### Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/patient-search` |
| `hotfix/` | Emergency production fixes | `hotfix/login-broken` |
| `bugfix/` | QA defect fixes | `bugfix/fix-date-format` |
| `docs/` | Documentation changes | `docs/update-readme` |

**Rules:**
- Always lowercase
- Use hyphens (not underscores)
- Include scope (feature area) in the name
- Keep under 50 characters

---

## Main Branch Protection

### GitHub Settings (Manual Setup)

Go to: **Settings → Branches → Add rule** for `main`

| Setting | Value | Why |
|---------|-------|-----|
| **Require pull request before merging** | ✅ On | No direct commits to main |
| **Required approvals** | 1 | Minimum one reviewer (solo dev: 1 is fine) |
| **Dismiss stale reviews** | ✅ On | New commits invalidate old approvals |
| **Require review from code owners** | ⬜ Off | Optional for small team |
| **Require status checks** | ✅ On | CI must pass before merge |
| **Required status checks** | `test`, `security` | From `ci.yml` workflow |
| **Require branches to be up to date** | ✅ On | Must be current with main |
| **Require conversation resolution** | ✅ On | All PR comments must be resolved |
| **Require signed commits** | ⬜ Off | Optional (requires GPG setup) |
| **Require linear history** | ✅ On | Squash or rebase (no merge commits) |
| **Include administrators** | ✅ On | Even repo admin follows rules |
| **Allow force pushes** | ⬜ Off | Never force push to main |
| **Allow deletions** | ⬜ Off | Never delete main |

### GitHub CLI Setup

```bash
# Enable branch protection for main
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","security"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

---

## Pull Request Requirements

### PR Template (`.github/pull_request_template.md`)

Create this file to enforce PR quality:

```markdown
## Description
<!-- What does this PR do? -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update

## Related Issue
<!-- Link to issue: Closes #123 -->

## Checklist
- [ ] Code follows project patterns
- [ ] Self-review completed
- [ ] No console.log statements left
- [ ] No secrets or credentials in code
- [ ] TypeScript compiles without errors
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Documentation updated (if applicable)

## Screenshots (if UI changes)
<!-- Before/after screenshots -->
```

### PR Title Convention

Follow conventional commits:

```
feat(scope): description     → New feature
fix(scope): description      → Bug fix
hotfix(scope): description   → Emergency fix
docs(scope): description     → Documentation
chore(scope): description    → Maintenance
refactor(scope): description → Code restructuring
```

**Examples:**
```
feat(patients): add search by name and email
fix(auth): prevent session timeout during active consultation
hotfix(login): fix broken OAuth callback
docs(architecture): update RLS policy documentation
```

---

## Status Checks

### Required Checks (from `ci.yml`)

| Check | What It Does | Blocks Merge If Failing |
|-------|-------------|------------------------|
| `test` | TypeScript + ESLint + Build | ✅ Yes |
| `security` | TruffleHog + npm audit + Gitleaks | ✅ Yes |

### Optional Checks (from `security.yml`)

| Check | What It Does | Recommended |
|-------|-------------|-------------|
| `CodeQL` | Static application security testing | Yes |
| `License Check` | GPL/AGPL detection | Yes |
| `Dependency Review` | New dependency vulnerabilities | Yes |

---

## Feature Branch Rules

Feature branches do NOT need protection, but follow these conventions:

### Before Starting Work

```bash
git checkout main
git pull origin main
git checkout -b feat/<scope>-<description>
```

### Before Creating PR

```bash
# Rebase on latest main
git fetch origin
git rebase origin/main

# Run local checks
npm run lint
npx tsc --noEmit
npm run build

# Push
git push origin feat/<scope>-<description>
```

### PR Size Guidelines

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| 🟢 Small | < 100 | Quick (< 30 min) |
| 🟡 Medium | 100-500 | Standard (1-2 hours) |
| 🔴 Large | > 500 | Consider splitting |

**If your PR is large,** break it into smaller, stackable PRs.

---

## Hotfix Branch Rules

Hotfixes have accelerated requirements:

```bash
# Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/<description>

# Make minimal fix
# ... edit files ...

# Commit
git add -A
git commit -m "hotfix(scope): description"

# Push and create PR
git push origin hotfix/<description>
gh pr create --title "HOTFIX: description" --label "hotfix"
```

**Hotfix PR characteristics:**
- Minimal changes only (< 50 lines preferred)
- No refactoring or unrelated changes
- Fast-track review (merge as soon as CI passes)
- Cherry-pick to active feature branches after merge

---

## Environment Protection Rules

### GitHub Environments

Create in: **Settings → Environments**

| Environment | Rules | Auto-Deploy |
|-------------|-------|-------------|
| `uat` | None | Yes (on push to main) |
| `production` | Required reviewers + wait timer | No (manual trigger) |

### Production Environment Settings

| Setting | Value |
|---------|-------|
| **Required reviewers** | At least 1 |
| **Wait timer** | 5 minutes (cool-down before deploy) |
| **Deployment branches** | `main` only |

---

## Merge Strategy

### Recommended: Squash and Merge

- Keeps main history clean
- One commit per feature
- Easy to revert entire features

### Allowed: Rebase and Merge

- For hotfixes (preserve individual commits)
- For multi-commit features that need history

### Not Allowed: Merge Commits

- Creates unnecessary merge commits
- Clutters git history
- Use `--no-ff` protection rule to prevent

---

## Enforcement Checklist

Use this to verify branch protection is active:

- [ ] Cannot push directly to `main`
- [ ] PRs require at least 1 approval
- [ ] Stale reviews are dismissed on new commits
- [ ] CI checks (`test`, `security`) must pass
- [ ] Branches must be up to date before merging
- [ ] All PR conversations must be resolved
- [ ] Force push is disabled on `main`
- [ ] Branch deletion is disabled on `main`
- [ ] Administrators are included in protection
- [ ] Linear history is enforced (no merge commits)

---

## CLI Commands Quick Reference

```bash
# Check current branch protection
gh api repos/{owner}/{repo}/branches/main/protection

# Remove branch protection (emergency only)
gh api repos/{owner}/{repo}/branches/main/protection --method DELETE

# List PR checks
gh pr checks <pr-number>

# Merge PR (after checks pass)
gh pr merge <pr-number> --squash

# Force merge (admin override — use with caution)
gh pr merge <pr-number> --squash --admin
```

---

## Related

- `.github/workflows/ci.yml` — CI checks that block merge
- `.github/workflows/security.yml` — Security scans
- `.github/workflows/deploy-prod.yml` — Production deployment
- [[dev-setup/setup-guide]] — Development environment setup
- [[05-sentry-setup]] — Error tracking setup
