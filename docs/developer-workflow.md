# Developer Workflow Guide

Two workflows depending on how the project is set up.

---

## Scenario A: PM Provides Docs + GitHub Tasks

When the PM already has PRD, Architecture docs and tasks in a GitHub Project board.

### Flow

```
PM provides docs in docs/guide/
PM creates tasks in GitHub Project
            │
            ▼
┌─ /import-project ─────────────────────────────────────┐
│  Input: GitHub repo link (e.g., SiThuTun-mdy/Dr-Note)  │
│                                                        │
│  1. Scans docs/guide/                                  │
│  2. Imports: PRD → docs/02-PRD.md                     │
│              Architecture → docs/12-Architecture.md   │
│  3. SKIPS: User-Stories, Sprint-Backlog (from GitHub) │
│  4. Reads GitHub board → creates docs/Progress.md     │
│  5. Saves repo to Progress.md                         │
└──────────────────────┬─────────────────────────────────┘
                       ▼
┌─ /bootstrap ──────────────────────────────────────────┐
│  Reads: docs/12-Architecture.md (imported)            │
│  Creates: Next.js app, Supabase client, shadcn/ui     │
└──────────────────────┬─────────────────────────────────┘
                       ▼
┌─ /next-task (repeat daily) ───────────────────────────┐
│  Reads: docs/Progress.md (GitHub board state)         │
│  Gets tasks: GitHub Project board                     │
│                                                        │
│  1. GitHub board → pick next "Todo" task               │
│  2. Create branch                                     │
│  3. Implement                                         │
│  4. Self-review                                       │
│  5. Commit                                            │
│  6. QA checks                                         │
│  7. Fix issues                                        │
│  8. Create PR                                         │
│  9. Update GitHub board → "Done"                      │
│  10. Update Progress.md                               │
│  11. Report                                           │
└────────────────────────────────────────────────────────┘
```

### Key Behaviors

- `/import-project` SKIPS `docs/04-User-Stories.md` and `docs/18-Sprint-Backlog.md` — tasks come from GitHub
- GitHub repo link saved to `docs/Progress.md` under "## GitHub Configuration"
- All commands read repo from Progress.md (single source of truth)
- No Sprint Backlog file needed — GitHub board is the task list

---

## Scenario B: Fresh Project (No PM Docs)

When starting from scratch with only a Project Brief.

### Flow

```
Developer writes docs/00-Project-Brief.md
            │
            ▼
┌─ /warmup ─────────────────────────────────────────────┐
│  Reads: docs/00-Project-Brief.md                      │
│                                                        │
│  1. Generates: docs/02-PRD.md        (product-manager) │
│  2. Generates: docs/12-Architecture.md (architect)    │
│  3. Generates: docs/18-Sprint-Backlog.md (scrum-master)│
│  4. Creates: docs/Progress.md                         │
└──────────────────────┬─────────────────────────────────┘
                       ▼
┌─ /bootstrap ──────────────────────────────────────────┐
│  Reads: docs/00-Project-Brief.md, Architecture.md     │
│  Creates: Next.js app, Supabase client, shadcn/ui     │
└──────────────────────┬─────────────────────────────────┘
                       ▼
┌─ /next-task (repeat daily) ───────────────────────────┐
│  Reads: docs/18-Sprint-Backlog.md (generated)         │
│         docs/Progress.md                              │
│                                                        │
│  1. Sprint-Backlog → pick next "To Do" task            │
│  2. Create branch                                     │
│  3. Implement                                         │
│  4. Self-review                                       │
│  5. Commit                                            │
│  6. QA checks                                         │
│  7. Fix issues                                        │
│  8. Create PR                                         │
│  9. Update Sprint-Backlog → "Done"                    │
│  10. Update Progress.md                               │
│  11. Report                                           │
└────────────────────────────────────────────────────────┘
```

### Key Behaviors

- `/warmup` generates all docs from Project Brief via AI agents
- Sprint Backlog created as `docs/18-Sprint-Backlog.md`
- No GitHub board required (but can add later)
- Developer must write `docs/00-Project-Brief.md` first

---

## Side-by-Side Comparison

| Step | Scenario A (PM provides) | Scenario B (Fresh) |
|------|--------------------------|---------------------|
| **Source of truth** | GitHub Project board | docs/18-Sprint-Backlog.md |
| **Docs source** | PM's docs in docs/guide/ | AI-generated from Project Brief |
| **First command** | `/import-project` | `/warmup` |
| **Task list** | GitHub board | Sprint-Backlog.md |
| **User-Stories** | Skipped (from GitHub) | Generated by scrum-master |
| **Sprint-Backlog** | Skipped (from GitHub) | Generated by scrum-master |
| **Progress tracking** | GitHub board + Progress.md | Sprint-Backlog + Progress.md |
| **GitHub repo needed?** | Yes (for tasks) | Optional |

---

## Per-Task Workflow (Both Scenarios)

Every `/next-task` follows 12 mandatory steps:

```
1.  GitHub Project    → Pick task, move to "In Progress"
2.  Create Branch     → feat/<scope>-<description>
3.  Explain Task      → Read PRD, Architecture, Sprint Backlog
4.  Implement         → Write code following patterns
5.  Self-Review       → Security, error handling, validation, quality
6.  Commit & Push     → git add -A && git commit
7.  QA Checks         → lint, typecheck, build
8.  Fix Issues        → Fix failures, re-run checks
9.  Create PR         → gh pr create
10. Update Board      → Move to "Done"
11. Update Progress   → Mark completed in docs
12. Report            → What was done, what's next
```

---

## All Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/import-project` | Import PM docs + connect GitHub | PM provided docs |
| `/warmup` | Generate docs from Project Brief | Fresh project |
| `/bootstrap` | Scaffold Next.js + Supabase app | After docs ready |
| `/next-task` | Pick next task (12-step workflow) | Daily development |
| `/feature` | Implement a specific feature | After picking task |
| `/review` | Code review | After implementation |
| `/qa` | QA testing | Before PR |
| `/bugfix` | Fix a bug | When bugs found |
| `/regression` | Regression test | After bugfix |
| `/pr` | Prepare PR draft | Ready to merge |
| `/publish-pr` | Publish PR to GitHub | After /pr |
| `/pr-review` | Review a PR on GitHub | Reviewing others' PRs |
| `/check-tasks` | List assigned GitHub issues | Check what to work on |
| `/deploy-check` | Deployment readiness | Before deploy |
| `/release-check` | Release GO/NO-GO | Sprint end |
| `/docs-sync` | Sync docs with code | After features |
| `/status` | Project status summary | Anytime |
| `/supabase-setup` | Check Supabase setup | DB issues |

---

## GitHub Project Link Management

Single source of truth: `docs/Progress.md`

```markdown
## GitHub Configuration

- **Repo:** SiThuTun-mdy/Dr-Note
- **Project Number:** 5
```

All commands read from here:
- `/next-task` → reads repo for GitHub board operations
- `/check-tasks` → reads repo to list issues
- `/pr-review` → reads repo to review PRs
- `/feature` → reads repo for branch/PR creation
- `/pr` → reads repo for PR creation
