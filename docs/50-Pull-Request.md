# Enterprise Pull Request

## PR Title

`feat(tooling): add /create-issue command and issue template`

## Summary

Adds a `/create-issue` Claude Code slash command and a matching GitHub issue template
(`.github/ISSUE_TEMPLATE/task.md`), so new issues follow the repo's existing
Story/Context/Constraints/Files/Acceptance-criteria structure (already used in issues like
#27, #38) instead of being written ad hoc. The command reads repo/project config from
`CLAUDE.md`, always shows a full preview, and requires explicit user confirmation before
calling `gh issue create` or touching the Project Board.

## Business Context

- Related story/bug/epic: TODO — not filed against a tracked issue; requested directly by
  the developer as a workflow tooling improvement
- Objective/value: Reduce inconsistent/ad-hoc issue bodies and make issue creation reuse
  the existing label set, project board (`PVT_kwHOAOdsvc4BdB7j`), and confirmation-before-
  action norms already followed by `/next-task` and `/check-tasks`

## Scope of Change

- Included: `.claude/commands/create-issue.md` (new slash command),
  `.github/ISSUE_TEMPLATE/task.md` (new GitHub issue template)
- Not included: no application code, no other slash commands modified, no changes to
  `.github/PULL_REQUEST_TEMPLATE.md` or existing labels/milestones

## Change Type

- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [x] Documentation
- [ ] Test Only
- [ ] Security
- [x] Infrastructure / DevOps

## Testing Evidence

- Unit tests: N/A — markdown-only change, no executable application code
- Integration/API tests: N/A
- Manual validation: Ran `/create-issue` live against the real repo/project; it correctly
  read `CLAUDE.md` config, rendered the template, held for confirmation, then created
  [issue #76](https://github.com/SiThuTun-mdy/Dr-Note/issues/76) with the requested labels
  (`bug`, `task`, `epic:records`) and milestone (`Demo Day 18 Jul`), and added it to
  Project Board #3 (Status: Backlog — no "Todo" option exists on this board)
- Screenshots/logs: `gh issue create` output → `https://github.com/SiThuTun-mdy/Dr-Note/issues/76`

## Risk and Impact

- Risk level: Low
- Impacted modules/services: None — no app code touched; adds a Claude Code command and a
  GitHub issue template only
- Breaking changes: No

## Deployment Plan

- Deployment steps: None — repo tooling/config only, not part of the deployed application
- Rollback steps: Revert this commit / delete the two added files
- Post-deployment checks: N/A

## Security and Compliance

- [x] No secrets or credentials included
- [x] Access control/authentication impact reviewed — none; command only calls `gh` as the
      authenticated user's own CLI session, same as existing `/check-tasks` and `/next-task`
- [ ] Logging/monitoring considered — N/A, no runtime logging surface
- [ ] Data/privacy impact reviewed — N/A, no patient/user data touched

## Reviewer Checklist

- [ ] Requirements are met
- [ ] Code is understandable and maintainable
- [ ] Tests are sufficient
- [ ] Documentation updated if needed
- [ ] Risks and rollback are clear
