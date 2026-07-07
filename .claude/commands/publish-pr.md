Publish a pull request using the prepared PR draft.

Optional input:
$ARGUMENTS

Read:
- docs/50-Pull-Request.md
- templates/pull-request-template.md
- docs/18-Sprint-Backlog.md
- docs/23-Review-Report.md
- docs/26-QA-Report.md
- docs/31-Release-Report.md
- docs/Progress.md

Workflow:
1. Confirm `docs/50-Pull-Request.md` exists and is complete enough for publishing. If it does not exist, run `/pr` first.
2. Review git status, current branch, and pending changes.
3. Use the `## PR Title` from `docs/50-Pull-Request.md` as the default commit message and PR title unless `$ARGUMENTS` provides an override.
4. Summarize the exact commit message, branch, and PR title before making changes.
5. Ask for confirmation before running any `git add`, `git commit`, `git push`, or remote PR creation step.
6. After approval, commit the intended changes, push the branch, and create the remote pull request using `docs/50-Pull-Request.md` as the PR body.
7. If required details are missing, stop and write `TODO` items instead of guessing.
