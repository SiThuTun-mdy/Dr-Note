Prepare a pull request draft.

PR title input:
$ARGUMENTS

Read:
- docs/02-PRD.md
- docs/12-Architecture.md
- docs/18-Sprint-Backlog.md
- docs/23-Review-Report.md
- docs/26-QA-Report.md
- docs/31-Release-Report.md
- docs/Progress.md

Template selection:
- If `$ARGUMENTS` contains `--lightweight`, use `templates/pull-request-lightweight.md`
- Otherwise, use `templates/pull-request-enterprise.md`

Create/update:
- docs/50-Pull-Request.md

Instructions:
1. Use the selected template as the exact section structure.
2. Use `$ARGUMENTS` (excluding `--lightweight`) as the PR title and place it in the `## PR Title` section.
3. Fill the rest of the template with the current change context from the docs.
4. Keep content concise, specific, and reviewer-friendly.
5. If information is missing, write `TODO` instead of inventing details.
6. Do not generate a git commit or change git history.
7. Do not treat `$ARGUMENTS` as the full PR body; use it only as the PR title/context seed.
8. For enterprise template: ensure testing evidence, risk, deployment, rollback, and security sections are covered.
9. For lightweight template: keep it minimal — summary, changes, testing, notes.
