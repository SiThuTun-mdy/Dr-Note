# .claude Folder Changelog

> Auto-generated from git history. Tracks all changes to the `.claude/` directory.

---

## 2026-07-09

### chan oo — `f80eaba` — chore: add .claude directory with commands and agents

Added complete `.claude/` framework with agents, commands, hooks, skills, and settings.

**Files added:**
- `.claude/settings.json`
- `.claude/agents/` — architect, developer, devops, documentation, orchestrator, product-manager, qa, release-manager, reviewer, scrum-master, SCHEMAS.md
- `.claude/commands/` — bootstrap, bugfix, deploy-check, docs-sync, feature, next-task, pr-review, pr, publish-pr, qa, regression, release-check, review, status, supabase-setup, warmup
- `.claude/hooks/` — build.sh, lint.sh, progress-reminder.sh, secret-scan.sh, test.sh, typecheck.sh
- `.claude/skills/` — ai-sdlc-skill, backend-skill, devops-deploy-skill, doctor-note-domain-skill, qa-testing-skill, react-best-practices, security-review-skill, server-actions-skill, supabase-skill, ui-styling, ui-ux-pro-max, banner-design, brand, design-system, design, slides

---

## 2026-07-08

### chan oo — `9b09a11` — chore: enforce review, security review, and QA in workflow commands

**Files modified:**
- `.claude/commands/feature.md`
- `.claude/commands/next-task.md`

### chan oo — `7250064` — feat(patients): implement patient registration (US-004)

**Files modified:**
- `.claude/agents/developer.md`
- `.claude/commands/feature.md`
- `.claude/commands/next-task.md`

### chan oo — `8ee6509` — @ docs: move CLAUDE.md to project root and add mandatory workflow steps

**Files modified:**
- `.claude/CLAUDE.md`

### chan oo — `70a7bd2` — @ feat(security): add code safety guardrails

**Files modified:**
- `.claude/CLAUDE.md`

### chan oo — `7bdf646` — docs: add mandatory development workflow to CLAUDE.md

**Files modified:**
- `.claude/CLAUDE.md`

### chan oo — `72ead4c` — feat: add /pr-review command

**Files added:**
- `.claude/commands/pr-review.md`

### chan oo — `f08ae56` — chore: complete development framework setup

Added skills, bootstrap command, and supabase-setup command.

**Files added:**
- `.claude/commands/bootstrap.md`
- `.claude/commands/supabase-setup.md`
- `.claude/commands/warmup.md`
- `.claude/skills/` — banner-design, brand, design-system, design, slides, ui-styling, ui-ux-pro-max, documentation-skill, frontend-dev-skill, nextjs-skill, uiux-skill

### chan oo — `49c0d01` — feat: scaffold Next.js + Supabase project

Initial `.claude/` setup with agents, commands, hooks, and base skills.

**Files added:**
- `.claude/CLAUDE.md`
- `.claude/settings.json`
- `.claude/agents/` — all 10 agent definitions
- `.claude/commands/` — bootstrap, bugfix, deploy-check, docs-sync, feature, next-task, pr, publish-pr, qa, regression, release-check, review, status, warmup
- `.claude/hooks/` — all 6 hook scripts
- `.claude/skills/` — ai-sdlc-skill, backend-skill, devops-deploy-skill, doctor-note-domain-skill, documentation-skill, frontend-dev-skill, nextjs-skill, qa-testing-skill, security-review-skill, supabase-skill, uiux-skill

---

## Summary

| Date | Author | Commits | Key Changes |
|------|--------|---------|-------------|
| 2026-07-09 | chan oo | 1 | Full .claude framework added |
| 2026-07-08 | chan oo | 8 | Initial setup + workflow enforcement |
| **Total** | | **9** | |
