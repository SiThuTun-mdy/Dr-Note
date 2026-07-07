# AI SDLC Roadmap (Spec-Driven)

**Project:** Dr-Note (Vibecoding Tour Demo)
**Date:** 2026-07-07
**Status:** Planning
**Deciders:** KST, NLT, NCO

---

## Overview

This roadmap defines the AI-driven Software Development Lifecycle for Dr-Note. Unlike traditional SDLC, every stage is enhanced with AI tools — the developer becomes an **AI orchestrator** rather than a manual coder.

```
Traditional:  Plan → Design → Code → Test → Deploy
AI SDLC:      Context → Spec → Generate → Verify → Iterate → Ship
```

> **Key insight:** Context management is the foundation — without it, AI tools generate wrong code. Invest time in Phase 0.5 first.

> 📅 **Timeline:** See [AI SDLC Timeline](ai-sdlc-timeline.md) for detailed activity sequence, Gantt chart, and critical path.

---

## Phase 0: Foundation (Current)

**Goal:** Set up project, tools, and team workflow

| Task | Owner | AI Tool | Status |
|------|-------|---------|--------|
| Project setup (Next.js + Supabase) | — | — | ⏳ |
| GitHub repo & project board | — | — | ⏳ |
| CI/CD pipeline (GitHub Actions) | — | — | ⏳ |
| Vercel deployment | — | — | ⏳ |
| Claude Code setup & config | — | — | ⏳ |
| Team workflow agreement | KST, NLT, NCO | — | ⏳ |

---

## Phase 0.5: Context Management Setup

**Goal:** Set up AI context so tools understand your project correctly

### Why Context Management Matters

```
Without context:  "Build a login page" → AI guesses everything
With context:     "Build login page using Next.js 14 App Router, Supabase Auth,
                   shadcn/ui components, following our pattern in src/app/auth/"
                   → AI generates exactly what you need
```

### Context Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  CLAUDE.md            → Project rules, conventions          │
│  Memory files         → Persistent facts AI remembers       │
│  Architecture docs    → Design decisions, patterns          │
│  Specs                → Feature requirements                │
│  Codebase structure   → Existing patterns to follow         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI TOOLS                                  │
├─────────────────────────────────────────────────────────────┤
│  Claude Code          → Reads context, generates code       │
│  Skills               → Reusable prompts with context       │
│  Agents               → Sub-agents with focused context     │
│  Hooks                → Auto-enforce context rules          │
└─────────────────────────────────────────────────────────────┘
```

### 0.5.1 CLAUDE.md Setup

Create `CLAUDE.md` at project root — this is the **single source of truth** for AI:

```markdown
# Project: Dr-Note

## Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase (PostgreSQL)
- State: React Query + Zustand
- Forms: React Hook Form + Zod

## Conventions
- Use App Router (not Pages Router)
- Components in src/components/
- Features in src/features/
- Always use TypeScript strict mode
- Use Zod for all form validation

## Database
- Use Supabase client from lib/supabase.ts
- Always use RLS policies
- Migrations in supabase/migrations/

## Testing
- Unit tests: Vitest
- Test files: *.test.ts or *.test.tsx
```

### 0.5.2 Memory Structure

Set up `.claude/memory/` for persistent AI knowledge:

| File | Purpose | Example |
|------|---------|---------|
| `project.md` | Project overview | "Dr-Note is a medical consultation app" |
| `decisions.md` | Architecture decisions | "We chose Supabase over custom API" |
| `patterns.md` | Code patterns | "All forms use React Hook Form + Zod" |
| `gotchas.md` | Known issues | "Supabase free tier has 500MB limit" |
| `team.md` | Team conventions | "PR requires 1 review before merge" |

### 0.5.3 Docs Structure

Organize docs for AI to find easily:

```
docs/
├── specs/                    ← Feature specifications
│   ├── auth.md
│   ├── patient-mgmt.md
│   └── consultation.md
├── architecture/
│   ├── adr.md                ← Architecture decisions
│   ├── ai-sdlc-roadmap.md   ← This document
│   └── claude-code-tools.md ← AI tools reference
├── dev-setup/
│   ├── setup-guide.md
│   └── scripts/
└── diagram/
```

### 0.5.4 Skills Setup

Create reusable prompt templates in `.claude/skills/`:

| Skill File | Purpose |
|------------|---------|
| `spec-to-code.md` | Transform spec to implementation |
| `review-code.md` | AI code review checklist |
| `generate-tests.md` | Test generation template |
| `fix-errors.md` | Error fixing workflow |
| `create-pr.md` | PR creation template |

### 0.5.5 Context Management Tasks

| Task | Description | Status |
|------|-------------|--------|
| Create `CLAUDE.md` | Project rules & conventions | ⏳ |
| Create `.claude/memory/` | Set up memory files | ⏳ |
| Organize `docs/specs/` | Create spec templates | ⏳ |
| Create `.claude/skills/` | Build reusable prompts | ⏳ |
| Create `.claude/commands/` | Build slash commands | ⏳ |
| Create `.claude/hooks/` | Set up auto-triggers | ⏳ |

---

## Phase 1: Spec-Driven Planning

**Goal:** Define WHAT to build using AI-assisted spec writing

### 1.1 Requirements Gathering

| Step | Description | AI Tool |
|------|-------------|---------|
| 1 | Brainstorm features with stakeholders | Claude Code (chat) |
| 2 | Generate user stories | Claude Code (prompt) |
| 3 | Create acceptance criteria | Claude Code (prompt) |
| 4 | Prioritize with MoSCoW | Team discussion + AI summary |

### 1.2 Spec Writing

| Step | Description | AI Tool |
|------|-------------|---------|
| 1 | Write feature spec (PRD-style) | Claude Code (skill) |
| 2 | Define API contracts | Claude Code (prompt) |
| 3 | Design DB schema | Claude Code + Supabase |
| 4 | Review & approve specs | Team review |

### Output
- `docs/specs/` — Feature specifications
- `docs/api/` — API contracts
- `supabase/migrations/` — Database schema

---

## Phase 2: AI-Assisted Design

**Goal:** Design the solution architecture with AI

| Step | Description | AI Tool |
|------|-------------|---------|
| 1 | System architecture | Claude Code (chat) |
| 2 | Component design | Claude Code (prompt) |
| 3 | Flow diagrams | Claude Code + draw.io |
| 4 | Tech decisions (ADRs) | Team + Claude Code |

### Output
- `docs/architecture/` — ADRs, design docs
- `docs/diagram/` — Flow diagrams

---

## Phase 3: Spec-to-Code Generation

**Goal:** Transform specs into working code using AI

### 3.1 Feature Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. SPEC                                                    │
│  Read spec → Understand requirements → Clarify questions    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. SCAFFOLD                                                 │
│  Generate file structure → Types → Interfaces               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT                                                │
│  AI generates code → Developer reviews → Refines prompts    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. VERIFY                                                   │
│  Type check → Lint → Test → Manual review                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. ITERATE                                                  │
│  Fix issues → Refactor → Optimize → Re-verify               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Claude Code Commands for Development

| Command | When | What It Does |
|---------|------|--------------|
| `/next-task` | Start work | Picks next task from GitHub Project, creates branch |
| `/spec-to-code <spec>` | Implement feature | Reads spec, generates implementation |
| `/review` | After implementation | Reviews code, suggests improvements |
| `/test` | After review | Generates and runs tests |
| `/fix` | When issues found | Fixes lint/type/test errors |
| `/pr` | Ready to merge | Creates PR with description from spec |

### 3.3 Developer vs AI Responsibilities

| Task | Developer | AI |
|------|-----------|-----|
| Decide WHAT to build | ✅ | Assist |
| Write specs | ✅ | Generate draft |
| Design architecture | ✅ | Assist |
| Write boilerplate | ❌ | ✅ |
| Write business logic | Review | ✅ Generate |
| Write tests | Review | ✅ Generate |
| Code review | ✅ Final | ✅ First pass |
| Debug complex issues | ✅ Lead | Assist |
| Deploy | ✅ Trigger | Assist |
| Documentation | Review | ✅ Generate |

---

## Phase 4: AI-Assisted Testing

**Goal:** Ensure quality with AI-generated tests

| Step | Description | AI Tool |
|------|-------------|---------|
| 1 | Generate unit tests | Claude Code (prompt) |
| 2 | Generate integration tests | Claude Code (prompt) |
| 3 | Run test suite | npm test |
| 4 | Fix failing tests | Claude Code (/fix) |
| 5 | Edge case analysis | Claude Code (prompt) |

### Test Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Components, utils |
| Integration | Vitest | API routes, DB queries |
| E2E | Playwright (optional) | Critical user flows |

---

## Phase 5: AI-Assisted Documentation

**Goal:** Keep docs in sync with code

| Step | Description | AI Tool |
|------|-------------|---------|
| 1 | Update README | Claude Code |
| 2 | Generate API docs | Claude Code (prompt) |
| 3 | Update setup guide | Claude Code |
| 4 | Write changelog | Claude Code (prompt) |
| 5 | Create user guide | Claude Code (prompt) |

---

## Phase 6: Deployment & Monitoring

**Goal:** Ship with confidence using AI-guided deployment

| Step | Description | AI Tool |
|------|-------------|---------|
| 1 | Pre-deploy checks | check-prerequest.sh |
| 2 | Build verification | npm run build |
| 3 | Deploy to preview | Vercel (auto on PR) |
| 4 | UAT verification | Team |
| 5 | Deploy to production | Vercel (auto on merge) |
| 6 | Monitor errors | Vercel dashboard |
| 7 | AI-assisted debugging | Claude Code |

---

## Workflow Comparison

| Aspect | Traditional | AI SDLC |
|--------|-------------|---------|
| **Planning** | Long meetings, docs | Quick spec, AI drafts |
| **Design** | Whiteboard, diagrams | AI-assisted, faster iteration |
| **Coding** | Manual, line by line | AI generates, human reviews |
| **Testing** | Manual test writing | AI generates tests |
| **Docs** | After-thought, often skipped | AI generates, always current |
| **Review** | Human only | AI first pass + human final |
| **Debugging** | Stack Overflow, manual | AI-assisted, faster resolution |
| **Speed** | Weeks per feature | Days or hours per feature |

---

## Team Workflow Agreement

### Daily Flow

```
Morning:
  1. /next-task → Pick task from board
  2. Read spec → Clarify with AI if needed
  3. /spec-to-code → Generate implementation

Midday:
  4. /review → Self-review with AI
  5. /test → Run and fix tests
  6. Commit & push

Afternoon:
  7. /pr → Create PR
  8. Team review
  9. Merge & deploy
```

### Branch Strategy

```
main
├── feature/user-auth
├── feature/patient-mgmt
├── feature/consultation
├── bugfix/login-issue
└── docs/update-readme
```

### PR Requirements

- [ ] Spec linked in PR description
- [ ] AI review completed
- [ ] Tests passing
- [ ] Type check passing
- [ ] Lint passing
- [ ] Team approval (1 review)

---

## AI Tools Setup

### Claude Code Configuration

| Feature | Config | Purpose |
|---------|--------|---------|
| **Skills** | `.claude/skills/` | Reusable prompt templates |
| **Agents** | `.claude/agents/` | Autonomous sub-agents |
| **MCP** | `.claude/mcp/` | External tool integration |
| **Commands** | `.claude/commands/` | Slash commands |
| **Hooks** | `.claude/hooks/` | Automated triggers |

### Recommended Skills

| Skill | Purpose |
|-------|---------|
| `spec-to-code` | Transform spec to implementation |
| `review-code` | AI code review |
| `generate-tests` | Test generation |
| `fix-errors` | Auto-fix lint/type/test errors |
| `create-pr` | PR creation with description |

### Recommended Hooks

| Hook | Trigger | Action |
|------|---------|--------|
| `secret-scan` | Before commit | Scan for leaked secrets |
| `lint-check` | Before commit | Run lint |
| `type-check` | Before commit | Run type check |

---

## AI Tools Recommendations

### Core AI Tools

| Tool | Category | Purpose | Free Tier |
|------|----------|---------|-----------|
| **Claude Code** | Coding assistant | AI pair programming, code generation | With subscription |
| **GitHub Copilot** | Code completion | Inline code suggestions | ✅ Free for students/OSS |
| **Cursor** | AI IDE | Full IDE with AI integration | ✅ Free tier available |
| **Cline** | VS Code extension | Autonomous coding agent | ✅ Free (BYOK) |

### Planning & Design

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Claude Code** | Brainstorm, spec writing | Phase 1: Planning |
| **Mermaid** | Flow diagrams | Phase 2: Design |
| **Excalidraw** | Wireframes, architecture | Phase 2: Design |
| **drawio** | Complex diagrams | Phase 2: Design |

### Code Generation

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Claude Code** | Full feature implementation | Phase 3: Coding |
| **GitHub Copilot** | Inline completions | Phase 3: Coding |
| **v0.dev** | UI component generation | Phase 3: Coding |
| **Bolt.new** | Full-stack app generation | Prototyping |

### Testing

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Claude Code** | Test generation | Phase 4: Testing |
| **Vitest** | Unit/integration tests | Phase 4: Testing |
| **Playwright** | E2E tests | Phase 4: Testing |
| **Vercel Analytics** | Performance monitoring | Phase 6: Monitoring |

### Documentation

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Claude Code** | Auto-generate docs | Phase 5: Docs |
| **Storybook** | Component documentation | Phase 5: Docs |
| **TypeDoc** | API documentation | Phase 5: Docs |

### Deployment & DevOps

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Vercel** | Hosting & deployment | Phase 6: Deploy |
| **Supabase** | Backend-as-a-Service | All phases |
| **GitHub Actions** | CI/CD automation | All phases |
| **Sentry** | Error tracking | Phase 6: Monitoring |

### MCP Servers (Model Context Protocol)

| MCP Server | Purpose | Integration |
|------------|---------|-------------|
| **GitHub MCP** | PR, issues, repo management | Claude Code ↔ GitHub |
| **Supabase MCP** | Database queries, schema | Claude Code ↔ Supabase |
| **Vercel MCP** | Deployment management | Claude Code ↔ Vercel |
| **Filesystem MCP** | File operations | Claude Code ↔ Local files |

### AI Tool Selection Guide

```
What do you need?
│
├── Write code → Claude Code / GitHub Copilot
├── Generate UI → v0.dev / Bolt.new
├── Write tests → Claude Code + Vitest
├── Write docs → Claude Code
├── Debug issues → Claude Code
├── Deploy → Vercel + GitHub Actions
└── Monitor → Vercel Analytics + Sentry
```

### Tool Setup Priority

| Priority | Tool | Why |
|----------|------|-----|
| 🔴 High | Claude Code | Core AI coding assistant |
| 🔴 High | GitHub | Code hosting, CI/CD |
| 🟡 Medium | GitHub Copilot | Inline completions |
| 🟡 Medium | Vercel | Deployment |
| 🟢 Low | v0.dev | UI generation (optional) |
| 🟢 Low | Sentry | Error tracking (optional) |

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Feature delivery speed | 2-3x faster | Time from spec to PR |
| Code quality | Same or better | Bug rate, test coverage |
| Documentation coverage | 100% | Docs exist for all features |
| Team satisfaction | High | Retrospective feedback |

---

## Next Steps

- [ ] Team agreement on workflow
- [ ] Set up Claude Code skills & commands
- [ ] Create first spec for a feature
- [ ] Run first spec-to-code cycle
- [ ] Retrospective & adjust workflow

---

> _This roadmap is a living document. Update as the team learns and adapts._
