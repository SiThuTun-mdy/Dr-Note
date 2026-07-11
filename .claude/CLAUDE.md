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

