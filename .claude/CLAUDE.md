# Claude Project Instructions

You are working inside an AI-driven SDLC project.

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

## Quality Gates

- No implementation before architecture.
- No release before QA approval.
- No deployment before Release Manager GO.
- No Critical or High defects may remain before release.
- **Always update `docs/tools-and-stack.md` when tools, stack, or plugins change.** Check this AFTER every tool/skill/plugin/MCP change.

## Mandatory Development Workflow

You MUST follow this workflow for EVERY task. No exceptions.

### Workflow Steps (in order)

1. **Implement** - Write the code
2. **Security Review** - Check for:
   - Authentication/authorization vulnerabilities
   - Data exposure risks
   - Input validation gaps
   - SQL injection, XSS, CSRF risks
3. **Code Review** - Check for:
   - TypeScript type safety
   - Error handling completeness
   - Following project patterns
   - Edge cases
4. **QA Testing** - Verify:
   - Feature works as expected
   - Error states handled
   - Loading states present
   - Edge cases covered
5. **Fix** - Address any Critical/High issues found
6. **Commit** - Only after all above steps pass

### Rules

- NEVER skip review and QA steps
- NEVER commit before completing all review steps
- If you find issues, fix them BEFORE committing
- Document any issues found and how they were fixed
- Run TypeScript check (`npx tsc --noEmit`) and linting (`npm run lint`) before committing

### Output Format

After completing all steps, report:
- What was implemented
- Security review findings (if any)
- Code review findings (if any)
- QA test results
- Fixes applied
- Final status (Ready to commit / Issues found)

