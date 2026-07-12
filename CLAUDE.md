# Claude Project Instructions

You are working inside an AI-driven SDLC project.

## GitHub Project

- **Repository:** https://github.com/SiThuTun-mdy/Dr-Note
- **Project Board:** https://github.com/SiThuTun-mdy/Dr-Note/projects/3
- **Project ID:** PVT_kwHOAOdsvc4BdB7j

> **Note:** If the Project Board URL is missing, ask the developer for it before checking issue status.

## Global Rules

- Follow the workflow coordinator model.
- Do not build everything at once.
- Work phase by phase.
- Read current project documents before acting.
- Keep `docs/Progress.md` updated.
- Keep `docs/10-Decisions.md` updated for significant decisions.
- Do not introduce out-of-scope features unless explicitly approved.
- Use small, reviewable changes.
- Prioritize security, maintainability, and delivery discipline.
- **Do not modify files in `templates/docs/` unless explicitly asked.** These are templates for document generation and should remain unchanged.
- **Update `docs/tools-and-stack.md` whenever tools, stack, or plugins changes.** Keep the reference in sync with actual project state.
- **Run conflict analysis when introducing new AI tools.** Before adding new skills, plugins, or MCP servers, check `docs/conflict-analysis.md` for overlaps. Update the analysis with findings and resolution.
- **Run security review after task implementation.** After completing any feature or bugfix, run `/security-review` to scan for vulnerabilities before committing.

## Core Workflow

```text
Plan → Implement → Security Review → Review → QA → Fix → Regression → Release Check → Deploy → Document
```

## /next-task Workflow — Mandatory Steps

**When running `/next-task`, you MUST complete ALL of these steps in order. Do NOT skip any step.**

1. **GitHub Project** — Check and update issue status (if issues exist)
2. **Create Feature Branch** — `git checkout -b feat/<scope>-<short-description>`
3. **Explain the task** — Describe what will be implemented
4. **Implement** — Write the code
5. **Developer Self-Review** — Review your own code for:
   - Security issues (injection, auth bypass, data leaks)
   - Error handling gaps
   - Input validation
   - Code quality
6. **Commit and Push** — `git add -A && git commit` with conventional message
7. **QA Checks** — Run ALL of these and fix any failures:
   - `npm run lint` (ESLint)
   - `npx tsc --noEmit` (TypeScript)
   - `npm run build` (Build verification)
   - `bash scripts/safe-code-check.sh` (Security scan)
8. **Fix Issues** — If QA found problems, fix them and re-run QA
9. **Create Pull Request** — `gh pr create`
10. **Update Project Board** — Set issue to Done (if issues exist)
11. **Update docs/Progress.md** — Mark task as completed
12. **Report** — Tell user what was completed and what is next

**Violations will result in incomplete work being committed. Always follow the full workflow.**

## Quality Gates

- No implementation before architecture.
- No release before QA approval.
- No deployment before Release Manager GO.
- No Critical or High defects may remain before release.
- **Always update `docs/tools-and-stack.md` when tools, stack, or plugins change.** Check this AFTER every tool/skill/plugin/MCP change.

## Protected Files (Do Not Modify)

The following files are **PM-provided documents** and must NOT be modified by AI agents. They are the authoritative source for their respective domains. If changes are needed, request them from the PM.

- `docs/guide/01-database-schema.md` — Database schema (PM-owned)
- `docs/guide/02-architecture.md` — Architecture document (PM-owned)
- `docs/guide/03-design-system.md` — Design system guidelines (PM-owned)

**If you find inconsistencies between these files and the code, fix the code — not the document.**

---

## Safety Guardrails

**You MUST follow these rules when generating code. Violations will be caught by pre-commit hooks.**

### Never Generate
- Fork bombs (`:(){ :|:& };:`) or similar process-spawning loops
- Destructive shell commands (`rm -rf /`, `dd if=/dev/zero of=/dev/sda`, `mkfs`)
- System shutdown/reboot commands (`shutdown`, `reboot`, `halt`)
- `chmod 777` or overly permissive file permissions
- Infinite loops without exit conditions (`while(true){}` without break/timeout)
- `eval()` or `new Function()` on untrusted/user input
- `child_process.exec()` with unsanitized template literals or string concatenation
- `fs.rmSync()` or `fs.promises.rm()` with `recursive: true` without explicit user confirmation

### Always Do
- Use `try/catch` around filesystem and network operations
- Validate and sanitize all user inputs before processing
- Use `path.resolve()` or `path.join()` for file paths (never concatenate strings)
- Set timeouts on async operations that could hang
- Log errors with context instead of silently swallowing them
- Run `bash scripts/safe-code-check.sh` before committing to verify no dangerous patterns

### Pre-commit Protection
The repo has a Git pre-commit hook that:
1. Runs `lint-staged` (ESLint on staged `.js/.ts/.jsx/.tsx` files)
2. Runs `safe-code-check.sh` to detect dangerous code patterns

If you need to bypass the hook (emergency only), use `git commit --no-verify` and explain why in the commit message.
