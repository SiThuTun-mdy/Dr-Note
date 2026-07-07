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

## Core Workflow

```text
Plan → Implement → Review → QA → Fix → Regression → Release Check → Deploy → Document
```

## Quality Gates

- No implementation before architecture.
- No release before QA approval.
- No deployment before Release Manager GO.
- No Critical or High defects may remain before release.

