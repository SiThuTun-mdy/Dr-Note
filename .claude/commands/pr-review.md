# PR Review

Review a pull request on GitHub.

## Usage

```
/pr-review <PR_NUMBER>
```

If no PR number provided, list open PRs first.

## Steps

### 1. Get GitHub Project Info

Read the repo name from `docs/Progress.md`:
```bash
grep "GitHub Project:" docs/Progress.md
```

If not found, ask the user:
```
What is your GitHub repo? (e.g., SiThuTun-mdy/Dr-Note)
```

### 2. List Open PRs (if no number provided)

```bash
gh pr list --repo <REPO>
```

Ask user which PR to review.

### 3. Get PR Details

```bash
gh pr view <PR_NUMBER> --repo <REPO>
gh pr diff <PR_NUMBER> --repo <REPO>
```

### 4. Review Code Changes

For each changed file, check:
- **Security:** Hardcoded secrets, SQL injection, XSS, auth bypass
- **Quality:** Code style, naming, patterns, error handling
- **Performance:** N+1 queries, unnecessary re-renders, memory leaks
- **Testing:** Test coverage, edge cases
- **Documentation:** Comments, README updates

### 5. Post Review Comments

```bash
gh pr comment <PR_NUMBER> --repo <REPO> --body "review comments"
```

Or use inline comments:
```bash
gh api repos/<REPO>/pulls/<PR_NUMBER>/comments --method POST -f body="comment" -f path="file.ts" -F position=1
```

### 6. Generate Review Report

Create `docs/51-PR-Review.md` with:

```markdown
# PR Review Report

## PR: #<NUMBER> - <TITLE>

## Summary
TODO

## Findings

### HIGH
- TODO

### MEDIUM
- TODO

### LOW
- TODO

## Recommendation
TODO (APPROVE / REQUEST_CHANGES / COMMENT)

## Checklist
- [ ] Security reviewed
- [ ] Code quality checked
- [ ] Tests verified
- [ ] Documentation reviewed
```

### 7. Set PR Status

Based on findings:
- **APPROVE** — No HIGH/MEDIUM issues
- **REQUEST_CHANGES** — HIGH issues found
- **COMMENT** — Only LOW issues or suggestions

---

## Review Criteria

| Category | Check For |
|----------|-----------|
| Security | Secrets, injection, auth bypass, XSS |
| Quality | Code style, patterns, error handling |
| Performance | N+1 queries, memory leaks, bundle size |
| Testing | Coverage, edge cases, mocking |
| Documentation | Comments, README, API docs |

---

## Output

- Review comments on GitHub PR
- `docs/51-PR-Review.md` with detailed findings
- Recommendation: APPROVE / REQUEST_CHANGES / COMMENT
