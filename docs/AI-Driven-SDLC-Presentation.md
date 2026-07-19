# AI-Driven SDLC Presentation — Dr.Note

> Medical records management platform built with Next.js 16 + Supabase + Vercel

---

## Slide 1: Title

**"Building Dr.Note with AI: A Real-World AI-Driven SDLC"**

Medical records management platform · 11-day sprint · 9 contributors · 236 commits

---

## Stage 1: Planning & Architecture

**What happened:**
- PRD authored by PM (human), architecture designed with AI assistance
- Database schema, folder structure, auth flow defined before any code
- GitHub Project Board created for issue tracking

**AI Tools Used:**

| Category | Tool | Purpose |
|---|---|---|
| Skill | `doctor-note-domain-skill` | Medical domain knowledge, clinical workflow patterns |
| MCP | Supabase MCP | Schema design, database planning |
| Agent | `architect` | Architecture decisions, tech stack review |

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
| Skill | `supabase-skill` | RLS patterns, migration best practices |
| MCP | Supabase MCP | `apply_migration`, `get_advisors`, `list_tables` |
| Command | `/supabase-setup` | Project provisioning, environment config |

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
| Skill | `backend-skill` | Server actions, middleware, auth patterns |
| MCP | Supabase MCP | Auth config, `has_permission` RPC, user management |
| Hook | `secret-scan.sh` | Prevents service-role key leaks in code |

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
| Skill | `react-best-practices` | React Hook Form + Zod, component patterns |
| MCP | Context7 MCP | Next.js 16 + Supabase docs lookup |
| Agent | `developer` | Code generation, feature implementation |

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
| Skill | `security-review-skill` | Security checklist, vulnerability patterns |
| MCP | Supabase MCP | `apply_migration` for RLS, `get_advisors` for scan |
| Command | `/security-review` | Automated security scan after every feature |

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
| Skill | `qa-testing-skill` | Test generation patterns, mock strategies |
| MCP | Chrome DevTools MCP | Browser testing, upload/download verification |
| Agent | `qa` | Test orchestration, E2E test creation |

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
| Skill | `ai-sdlc-skill` | Review workflow, defect severity ranking |
| Hook | `lint.sh` | Auto-lint on every file edit (PostToolUse) |
| Command | `/qa` | Full QA cycle: lint, tsc, build, tests, report |

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
| Skill | `devops-deploy-skill` | Deploy checks, environment verification |
| Command | `/release-check` | Pre-deploy validation checklist |
| Hook | `progress-reminder.sh` | Reminds to update Progress.md on task completion |

**Human Verify Gate:**
- Release Manager GO required before production deployment
- Demo script + walkthrough checklist
- Manual smoke test on deployed URL

**Challenges:**
- Keeping docs in sync with code (AI updates Progress.md but sometimes misses context)
- Multi-role demo flow requires all features working end-to-end

---

## Complete AI Tool Inventory

### Skills (Domain Knowledge)

| Skill | Stage Used | Purpose |
|---|---|---|
| `doctor-note-domain-skill` | Planning | Medical domain, clinical workflows |
| `supabase-skill` | Infrastructure | RLS patterns, migrations, Supabase best practices |
| `backend-skill` | Auth, Features | Server actions, middleware, API patterns |
| `react-best-practices` | Features | React Hook Form, Zod, component patterns |
| `security-review-skill` | Security | Vulnerability patterns, security checklist |
| `qa-testing-skill` | Testing | Test generation, mock strategies |
| `ai-sdlc-skill` | Review | SDLC workflow, defect severity ranking |
| `devops-deploy-skill` | Deployment | Deploy checks, environment verification |
| `ui-ux-pro-max` | Features | UI/UX patterns, shadcn components |

### MCP Servers (Live Integrations)

| MCP Server | Stages Used | Key Capabilities |
|---|---|---|
| Supabase MCP | All | `apply_migration`, `get_advisors`, `execute_sql`, `list_tables`, `get_logs` |
| Context7 MCP | Features | Framework documentation lookup (Next.js, Supabase) |
| Chrome DevTools MCP | Testing | Browser navigation, screenshots, file upload, console logs |

### Agents (Specialized Roles)

| Agent | Stage Used | Purpose |
|---|---|---|
| `architect` | Planning | Architecture decisions, tech stack review |
| `developer` | Features | Code generation, feature implementation |
| `qa` | Testing | Test orchestration, E2E creation |
| `reviewer` | Review | Code review, security analysis |
| `release-manager` | Deployment | Deploy approval, release validation |

### Commands (Slash Commands)

| Command | Stage Used | Purpose |
|---|---|---|
| `/supabase-setup` | Infrastructure | Project provisioning |
| `/security-review` | Security | Automated security scan |
| `/qa` | Review | Full QA cycle (lint, tsc, build, tests) |
| `/release-check` | Deployment | Pre-deploy validation |
| `/next-task` | All | Workflow coordinator for next task |
| `/create-pr` | Features | PR creation with description |

### Hooks (Automated Guards)

| Hook | Stage Used | Purpose |
|---|---|---|
| `secret-scan.sh` | All (PostToolUse) | Prevents service-role key leaks |
| `lint.sh` | All (PostToolUse) | Auto-lint on every file edit |
| `typecheck.sh` | All (PostToolUse) | Auto type-check on every file edit |
| `progress-reminder.sh` | All (Stop) | Reminds to update Progress.md |

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
6. **Skills encode domain knowledge** — Without `doctor-note-domain-skill`, AI misses medical workflow nuances
7. **MCP bridges AI and live systems** — Supabase MCP lets AI verify schema, run queries, check advisories in real-time
