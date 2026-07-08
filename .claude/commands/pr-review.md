# PR Review

Review a pull request on GitHub.

---

## Usage

```
/pr-review <PR_NUMBER>
```

If no PR number provided, list open PRs first.

---

## Steps

### 1. List Open PRs (if no number provided)

```bash
gh pr list --repo SiThuTun-mdy/Dr-Note
```

Ask user which PR to review.

### 2. Get PR Details

```bash
gh pr view <PR_NUMBER> --repo SiThuTun-mdy/Dr-Note
gh pr diff <PR_NUMBER> --repo SiThuTun-mdy/Dr-Note
```

### 3. Review Code Changes

For each changed file, check:
- **Security:** Hardcoded secrets, SQL injection, XSS, auth bypass
- **Quality:** Code style, naming, patterns, error handling
- **Performance:** N+1 queries, unnecessary re-renders, memory leaks
- **Testing:** Test coverage, edge cases
- **Documentation:** Comments, README updates

### 4. Post Review Comments

```bash
gh pr comment <PR_NUMBER> --repo SiThuTun-mdy/Dr-Note --body "review comments"
```

Or use inline comments:

```bash
gh api repos/SiThuTun-mdy/Dr-Note/pulls/<PR_NUMBER>/comments --method POST -f body="comment" -f path="file.ts" -F position=1
```

### 5. Generate Review Report

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

### 6. Set PR Status

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
