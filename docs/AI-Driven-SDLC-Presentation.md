# AI-Driven SDLC Presentation — Dr.Note

> Medical records management platform built with Next.js 16 + Supabase + Vercel

---

## Slide 1: Title

**"Building Dr.Note with AI: A Real-World AI-Driven SDLC"**

Medical records management platform · 11-day sprint · 9 contributors · 236 commits

---

## Stage 0: Team Project Selection

**What happened:**
- Each team member proposed a personal project idea
- All projects presented and evaluated as a team
- Selected "Dr.Note" (medical records platform) based on impact vs effort analysis
- RACI matrix assigned: roles (Responsible, Accountable, Consulted, Informed) for each task
- Team formed with 5 developers across different locations

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| Agent | `product-manager` | Project evaluation, task breakdown |
| Command | `/create-issue` | Create GitHub issues for project tasks |
| | | |

**Human Verify Gate:**
- Team vote on project selection
- RACI matrix reviewed and agreed by all members
- Sprint scope locked after selection (no scope creep)

**Challenges:**
- Different time zones and personal schedules made meeting times difficult
- Had to coordinate across locations with limited overlapping availability
- Decisions made asynchronously via GitHub issues and docs when meetings weren't possible

---

## Stage 1: Planning & Architecture

**What happened:**
- PRD authored by PM (human), architecture designed with AI assistance
- Database schema, folder structure, auth flow defined before any code
- GitHub Project Board created for issue tracking

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| | | |
| | | |
| | | |

**Human Verify Gate:**
- PM sign-off on PRD (`docs/02-PRD.md`)
- Architecture review (`docs/guide/02-architecture.md`) — protected file, AI cannot modify
- Database schema review (`docs/guide/01-database-schema.md`) — PM-owned

**Challenges:**
- AI tends to over-engineer; PM had to constrain scope to 8-day sprint
- Deciding what AI owns vs what humans own (PRD = human, code = AI-assisted)

---

## Stage 2: Infrastructure & Database

**What happened:**
- Supabase project provisioned via MCP integration
- RLS policies created as migrations (append-only SQL files)
- Seed data for demo accounts (admin, doctor, nurse, receptionist)

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| MCP | Supabase MCP | `apply_migration`, `get_advisors`, `list_tables` |
| | | |
| | | |

**Human Verify Gate:**
- Migration files reviewed before applying (`supabase/migrations/`)
- RLS policies verified via `get_advisors()` MCP tool
- Seed data tested manually in browser

**Challenges:**
- RLS policies are the security boundary — a mistake here means data leaks
- Migration conflicts (three `00004_*` migrations with overlapping policies)
- AI generates correct SQL but doesn't always consider edge cases in RLS

---

## Stage 3: Authentication & Authorization

**What happened:**
- Email/password login via Supabase Auth
- RBAC: roles/permissions tables + RLS policies
- Protected routes with role-based middleware
- Change password, temp password generation for staff onboarding

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| MCP | Supabase MCP | Auth config, `has_permission` RPC, user management |
| Hook | `secret-scan.sh` | Prevents service-role key leaks (PostToolUse) |
| | | |

**Human Verify Gate:**
- Manual login testing across all 4 roles
- RLS policy advisory scan (`get_advisors()`)
- Code review for auth bypass patterns

**Challenges:**
- `crypto.randomInt` for password entropy (AI initially used modulo-biased `Math.random`)
- Patients don't log in yet (demo scope) — had to decide what to defer
- Service-role key must NEVER appear in app code (AI sometimes suggests it for convenience)

---

## Stage 4: Feature Implementation (Record Taking)

**What happened:**
- Visit creation (receptionist) → Screening vitals (nurse) → Diagnosis + Prescription (doctor)
- File attachments with Supabase Storage
- Visit status workflow + patient queue

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| Command | `/next-task` | Pull next task, create branch, start workflow |
| Command | `/create-pr` | Create PR with description after implementation |
| Command | `/qa` | Run lint, tsc, build, tests before PR |
| Command | `/review` | Self-review code for security and quality |
| | | |
| | | |

**Human Verify Gate:**
- Developer self-review checklist (security, error handling, input validation)
- Each feature gets its own branch → PR → code review → merge
- `/security-review` scan after every feature

**Challenges:**
- Server Actions vs API Routes — AI initially suggested API routes; architecture says Server Actions only
- PostgREST filter injection — AI-generated `.or()` calls had unsanitized user input
- Form state management: React Hook Form + Zod validation on both client and server

---

## Stage 5: Security Hardening

**What happened:**
- PostgREST filter injection fix (PR #96)
- Attachment access control (PR #97) — `authorizeVisitAccess()` + Storage RLS
- Password entropy hardening
- Defense-in-depth: app-layer + DB RLS + storage RLS

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| MCP | Supabase MCP | `apply_migration` for RLS, `get_advisors` for scan |
| Command | `/security-review` | Automated security scan after every feature |
| Hook | `secret-scan.sh` | Prevents secret leaks in code |
| | | |

**Human Verify Gate:**
- Security review checklist (SQL injection, auth bypass, data exposure, CSRF)
- Manual browser testing of access control (upload/download/delete as different roles)
- Storage RLS verified via direct Supabase queries

**Challenges:**
- AI generates functional code but misses defense-in-depth (e.g., `uploadAttachment` didn't check visit ownership)
- Storage RLS index bug: `foldername(name)[2]` should be `[1]` — AI didn't catch this
- Balancing security with demo speed (patients don't log in yet)

---

## Stage 6: Testing

**What happened:**
- 378 unit tests (Vitest)
- 76 E2E tests (Playwright)
- Manual browser testing via Chrome DevTools MCP

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| MCP | Chrome DevTools MCP | Browser navigation, screenshots, file upload testing |
| Command | `/qa` | Full QA cycle: lint, tsc, build, tests |
| | | |
| | | |

**Human Verify Gate:**
- QA report (`docs/26-QA-Report.md`) — structured defect log with severity levels
- No release with Critical/High defects
- Manual E2E testing of attachment flow (upload → download → delete)

**Challenges:**
- AI-generated E2E tests had stale selectors (UI changed after tests were written)
- Mock setup for `authorizeVisitAccess` was incomplete — tests passed but didn't cover auth
- Duplicate email test depends on seed data — had to skip

---

## Stage 7: Code Review & QA

**What happened:**
- Automated linting (ESLint), type checking (TypeScript), build verification
- Security scan (`safe-code-check.sh`)
- QA report with severity-ranked findings

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| Hook | `lint.sh` | Auto-lint on every file edit (PostToolUse) |
| Hook | `typecheck.sh` | Auto type-check on every file edit (PostToolUse) |
| Command | `/qa` | Full QA cycle with report generation |
| | | |

**Human Verify Gate:**
- Code review report (`docs/23-Review-Report.md`) — severity-ranked findings
- QA decision: PASS/FAIL with explicit criteria
- PR approval required before merge

**Challenges:**
- AI reviews tend to be thorough but noisy (many low-severity findings)
- Balancing "fix everything" vs "ship the demo" — Medium findings documented but not blocking
- Protecting PM-owned documents from AI modification

---

## Stage 8: Deployment & Documentation

**What happened:**
- Vercel auto-deploy from `main` branch
- Progress tracking in `docs/Progress.md`
- Decision log in `docs/10-Decisions.md`

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| Hook | `progress-reminder.sh` | Reminds to update Progress.md on task completion |
| | | |
| | | |

**Human Verify Gate:**
- Release Manager GO required before production deployment
- Demo script + walkthrough checklist
- Manual smoke test on deployed URL

**Challenges:**
- Keeping docs in sync with code (AI updates Progress.md but sometimes misses context)
- Multi-role demo flow requires all features working end-to-end

---

## Complete AI Tool Inventory

### Skills (Domain Knowledge) — Available in `.claude/skills/`

| Skill | Purpose | Verified Used |
|---|---|---|
| `doctor-note-domain-skill` | Medical domain, clinical workflows | ⚪ Not verified |
| `supabase-skill` | RLS patterns, migrations | ⚪ Not verified |
| `backend-skill` | Server actions, middleware | ⚪ Not verified |
| `react-best-practices` | React Hook Form, Zod | ⚪ Not verified |
| `security-review-skill` | Vulnerability patterns | ⚪ Not verified |
| `qa-testing-skill` | Test generation, mocks | ⚪ Not verified |
| `ai-sdlc-skill` | SDLC workflow | ⚪ Not verified |
| `devops-deploy-skill` | Deploy checks | ⚪ Not verified |
| `ui-ux-pro-max` | UI/UX patterns | ⚪ Not verified |

### MCP Servers (Live Integrations) — Verified

| MCP Server | Verified Used | Evidence |
|---|---|---|
| Supabase MCP | ✅ Yes | `apply_migration`, `get_advisors`, `execute_sql` in prior sessions |
| Context7 MCP | ⚪ Not verified | Available but not demonstrated in this session |
| Chrome DevTools MCP | ✅ Yes | Browser navigation, screenshots, file upload in this session |

### Agents (Specialized Roles) — Available in `.claude/agents/`

| Agent | Purpose | Verified Used |
|---|---|---|
| `architect` | Architecture decisions | ⚪ Not verified |
| `developer` | Code generation | ⚪ Not verified |
| `qa` | Test orchestration | ⚪ Not verified |
| `reviewer` | Code review | ⚪ Not verified |
| `release-manager` | Deploy approval | ⚪ Not verified |
| `product-manager` | Project evaluation | ⚪ Not verified |

### Commands (Slash Commands) — Verified

| Command | Verified Used | Evidence |
|---|---|---|
| `/qa` | ✅ Yes | Invoked in this session for full QA cycle |
| `/resume` | ✅ Yes | Invoked in this session |
| `/next-task` | ⚪ Not verified | Available, not demonstrated |
| `/create-pr` | ⚪ Not verified | Available, not demonstrated |
| `/security-review` | ⚪ Not verified | Available, not demonstrated |
| `/review` | ⚪ Not verified | Available, not demonstrated |
| `/check-tasks` | ⚪ Not verified | Available, not demonstrated |
| `/create-issue` | ⚪ Not verified | Available, not demonstrated |
| `/release-check` | ⚪ Not verified | Available, not demonstrated |
| `/supabase-setup` | ⚪ Not verified | Available, not demonstrated |

### Hooks (Automated Guards) — Verified

| Hook | Verified Used | Evidence |
|---|---|---|
| `secret-scan.sh` | ✅ Yes | Ran on every file edit (PostToolUse) |
| `lint.sh` | ✅ Yes | Ran on every file edit (PostToolUse) |
| `typecheck.sh` | ✅ Yes | Ran on every file edit (PostToolUse) |
| `progress-reminder.sh` | ⚪ Not verified | Runs on Stop, not demonstrated |

---

## Key Metrics (Full Repository)

| Metric | Value | Notes |
|---|---|---|
| **Total commits** | 236 | 11 active days (Jul 7–18) |
| **Merged PRs** | 30 | Across all branches |
| **Contributors** | 9 | 5 human + 1 AI bot (copilot-swe-agent) |
| **Source files** | 183 | `.ts` + `.tsx` in `app/src` |
| **Lines of code** | 21,631 | Application source only |
| **Pages (routes)** | 34 | Next.js App Router pages |
| **Database migrations** | 11 | Supabase SQL migrations |
| **Unit tests** | 378 | Vitest — 100% pass |
| **E2E tests** | 76 | Playwright — 100% pass (2 skipped) |
| **Test files** | 21 | Unit + E2E combined |
| **Project duration** | 11 days | Jul 7 → Jul 18, 2026 |

### Commit Breakdown

| Type | Count | % |
|---|---|---|
| Feature (`feat`) | 74 | 31% |
| Fix (`fix`) | 74 | 31% |
| Documentation (`docs`) | 44 | 19% |
| Test (`test`) | 36 | 15% |
| Other (chore, refactor, etc.) | 8 | 4% |

### Top Contributors

| Contributor | Commits | Role |
|---|---|---|
| chan oo | 107 | Lead developer (AI-assisted) |
| Si Thu Tun | 79 | Lead developer (AI-assisted) |
| Nyein Chan Oo | 18 | Developer |
| SI THU TUN | 14 | Developer |
| copilot-swe-agent[bot] | 8 | AI bot (GitHub Copilot) |
| Others | 10 | Team members |

### AI Velocity Multiplier

| Metric | Value |
|---|---|
| Lines of code per day | ~1,966 LOC/day |
| Commits per day | ~21 commits/day |
| PRs merged per day | ~2.7 PRs/day |
| Tests per day | ~34 tests/day |
| LOC per commit | ~92 lines |

---

## AI-Human Collaboration Model

```
┌──────────────────────────────────────────────────────┐
│              Human owns: Strategy                    │
│  PRD, Architecture, Security decisions,              │
│  QA approval, Deployment go/no-go                    │
├──────────────────────────────────────────────────────┤
│              AI owns: Execution                      │
│  Skills (domain knowledge)                           │
│  MCP (live database/browser access)                  │
│  Agents (specialized roles)                          │
│  Commands (workflow automation)                      │
│  Hooks (automated guards)                            │
├──────────────────────────────────────────────────────┤
│            Shared: Review & Verify                   │
│  Code review, Security scan, QA report,              │
│  Manual testing, Browser verification                │
└──────────────────────────────────────────────────────┘
```

---

## Lessons Learned

1. **AI is fast but needs guardrails** — Hooks (`secret-scan`, `lint`, `typecheck`) catch mistakes automatically
2. **RLS is the real security boundary** — AI-generated app code is not enough; DB policies are the backstop
3. **Tests need maintenance** — AI-generated E2E tests go stale when UI changes
4. **Human judgment still needed** — "Should we ship this?" is not an AI question
5. **Documentation keeps AI honest** — Architecture docs + protected files prevent AI from going off-track
