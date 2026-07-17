# AI Tools Reference

Quick reference for all AI tools, frameworks, and libraries in this project.

---

## Global Tools (Required)

Tools that must be installed on developer machines.

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js | JavaScript runtime | https://nodejs.org |
| npm | Package manager | Bundled with Node.js |
| Git | Version control | https://git-scm.com |
| Claude Code | AI assistant CLI | `npm install -g @anthropic-ai/claude-code` |

**Optional global tools:**

| Tool | Purpose | Install |
|------|---------|---------|
| Supabase CLI | Database management | `npm install -g supabase` |
| Vercel CLI | Deployment | `npm install -g vercel` |

---

## Developer Setup

Steps to start development on this project.

### 1. Clone & Install

```bash
git clone <repo-url>
cd Dr-Note
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard
- `SUPABASE_ACCESS_TOKEN` — from https://supabase.com/dashboard/account/tokens
- `GITHUB_TOKEN` — from https://github.com/settings/tokens

### 3. Configure MCP (Auto or Manual)

**Auto:** The project `.mcp.json` auto-loads MCP servers using your environment variables.

**Manual:** Install MCP servers globally:
```bash
# Supabase MCP
claude mcp add --scope user supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token sbp_YOUR_TOKEN

# GitHub MCP
claude mcp add --scope user github -- npx -y @modelcontextprotocol/server-github
```

### 3.1 GitHub MCP Setup

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy token to `.env.local` as `GITHUB_TOKEN`
5. Restart Claude Code to load the MCP server

### 4. Install Plugins (Individual - Each Developer)

Each developer must install these plugins in Claude Code:

```
/plugin code-review
/plugin vercel
/plugin frontend-design
/plugin context7
```

### 5. Start Development

```bash
npm run dev
```

Open http://localhost:3000

---

## Auto-included Tools (From Repo)

These are part of the repo — no installation needed:

| Tool | Location | Notes |
|------|----------|-------|
| Skills (16) | `.claude/skills/` | Auto-loaded from repo |
| Agents (10) | `.claude/agents/` | Auto-loaded from repo |
| Commands (16) | `.claude/commands/` | Auto-loaded from repo |
| Hooks (6) | `.claude/hooks/` | Auto-loaded from repo |
| Project MCP | `.mcp.json` | Auto-loaded (needs env vars) |

## Individual Tools (Each Developer Must Install)

| Tool | Type | Install Command |
|------|------|-----------------|
| `code-review` | Plugin | `/plugin code-review` |
| `vercel` | Plugin | `/plugin vercel` |
| `frontend-design` | Plugin | `/plugin frontend-design` |
| `context7` | Plugin | `/plugin context7` |
| Supabase CLI | Global | `npm install -g supabase` |
| Vercel CLI | Global | `npm install -g vercel` |

---

## Skills

Reusable prompt templates for specific domains.

| Skill | Purpose |
|-------|---------|
| `ai-sdlc-skill` | Coordinating software delivery lifecycle |
| `backend-skill` | Backend development patterns |
| `devops-deploy-skill` | Deployment readiness and infrastructure |
| `doctor-note-domain-skill` | Clinic note-taking applications domain |
| `qa-testing-skill` | Quality assurance and testing |
| `security-review-skill` | Security review and vulnerability assessment |
| `server-actions-skill` | Next.js Server Actions patterns with Supabase |
| `supabase-skill` | Supabase Auth, PostgreSQL, Storage, and RLS |
| `ui-ux-pro-max` | Comprehensive UI/UX design intelligence |
| `react-best-practices` | React/Next.js performance optimization (Vercel) |
| `design-system` | Design system management |
| `brand` | Brand guidelines and assets |
| `design` | Design deliverables |
| `banner-design` | Banner creation |
| `slides` | Presentation slides |
| `ui-styling` | UI styling patterns |

---

## Agents

Autonomous sub-agents for specialized tasks.

| Agent | Purpose |
|-------|---------|
| `orchestrator` | Coordinates workflow across all agents |
| `product-manager` | Product requirements and user stories |
| `architect` | System architecture and technical design |
| `scrum-master` | Sprint planning and task breakdown |
| `developer` | Code implementation |
| `reviewer` | Code review and quality assurance |
| `qa` | Testing and defect detection |
| `release-manager` | Release readiness and deployment |
| `devops` | Infrastructure and deployment |
| `documentation` | Documentation generation |

---

## Commands

Slash commands for quick actions.

| Command | Purpose |
|---------|---------|
| `/bootstrap` | Scaffold Next.js + Supabase project |
| `/warmup` | Fill TODO stubs in product/architecture docs |
| `/status` | Show current project status |
| `/next-task` | Pick next sprint task |
| `/feature` | Implement one MVP feature |
| `/review` | Run code review |
| `/security-review` | Security vulnerability scan |
| `/qa` | Run QA testing |
| `/bugfix` | Fix QA defects |
| `/hotfix` | Emergency production fix (fast-track) |
| `/regression` | Run regression after bug fixes |
| `/pr` | Prepare pull request draft |
| `/create-pr` | One-step PR creation (commit + push + PR) |
| `/pr-review` | Review PR on GitHub |
| `/publish-pr` | Publish pull request |
| `/deploy-check` | DevOps readiness check |
| `/release-check` | Release manager workflow |
| `/docs-sync` | Sync docs with implementation |
| `/supabase-setup` | Check/configure Supabase setup |
| `/code-review` | Review PR on GitHub (plugin) |

---

## Code Review Commands

Two code review commands serve different purposes:

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `/review` | During development | Internal review: architecture, quality, security. Creates `docs/23-Review-Report.md` |
| `/code-review` | Before merging PR | External review: posts comments directly on GitHub PRs |

**Workflow:**
1. Use `/review` during development to check code quality
2. Use `/code-review` before merging to get PR feedback on GitHub

---

## Hooks

Automated triggers on tool events.

| Hook | Trigger | Script |
|------|---------|--------|
| `secret-scan` | After Edit/Write | Scans for leaked secrets |
| `lint` | After Edit/Write | Runs ESLint |
| `typecheck` | After Edit/Write | Runs TypeScript check |
| `progress-reminder` | On Stop | Reminds to update Progress.md |
| `pre-commit` | Before git commit | Runs lint-staged + safe-code-check.sh |

### Code Safety Guardrails

The repo includes automated detection of dangerous code patterns. See `docs/guardrails.md` for full details.

**Pre-commit hook runs:**
1. `lint-staged` — ESLint with auto-fix on staged JS/TS files
2. `scripts/safe-code-check.sh` — Detects dangerous patterns (fork bombs, infinite loops, eval(), rm -rf, etc.)

**Claude Code instructions** in `.claude/CLAUDE.md` include safety rules for AI-generated code.

### Branch Protection

Main branch is protected. See `docs/guide/06-branch-protection.md` for full rules.

**Summary:**
- No direct commits to `main`
- PRs require 1 approval + CI passing (`test`, `security`)
- Squash and merge (linear history)
- Force push disabled

---

## MCP Servers

Model Context Protocol integrations.

| Server | Scope | Purpose |
|--------|-------|---------|
| `supabase` | Global + Project | Database operations, migrations, queries |
| `playwright` | Project | E2E testing, browser automation |
| `github` | Project | PR/issue management, repo operations |

---

## Plugins

Installed Claude Code plugins.

| Plugin | Marketplace | Purpose |
|--------|-------------|---------|
| `code-review` | claude-plugins-official | PR review on GitHub |
| `vercel` | claude-plugins-official | Vercel deployment integration |
| `frontend-design` | claude-plugins-official | Distinctive UI design (Anthropic) |
| `context7` | claude-plugins-official | Up-to-date library/framework documentation |

---

## Tool Conflicts

See `docs/conflict-analysis.md` for detailed analysis of tool overlaps and resolution rules.

---

## Design Philosophy

The `frontend-design` plugin provides guidance for distinctive, intentional visual design. It helps avoid "generic AI aesthetics" and creates production-grade interfaces with:

- Bold aesthetic choices
- Distinctive typography and color palettes
- High-impact animations
- Context-aware implementation

**Usage:** Claude automatically applies this skill for frontend work.

---

## Framework & Libraries

### Core

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16 | React framework (App Router) |
| TypeScript | ^5 | Type safety |
| React | ^19 | UI library |
| React DOM | ^19 | React DOM renderer |

### UI

| Library | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | ^4 | Utility-first CSS |
| shadcn/ui | ^4.13 | Component library |
| Lucide React | ^1.23 | Icons |
| CVA | ^0.7 | Component variants |
| clsx | ^2.1 | Class names |
| Tailwind Merge | ^3.6 | Merge Tailwind classes |
| tw-animate-css | ^1.4 | Animations |
| next-themes | ^0.4.6 | Light/dark/system theme switching |

### Backend/Database

| Library | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | ^2.110 | Supabase client |
| @supabase/ssr | ^0.12 | SSR support for Supabase |
| @emnapi/runtime | ^1.11.2 | Node-API runtime support for wasm/native bindings |
| @emnapi/core | ^1.11.2 | Core helpers for emnapi runtime integration |

### Forms & Validation

| Library | Version | Purpose |
|---------|---------|---------|
| React Hook Form | — | Form management |
| Zod | — | Schema validation |

### State Management

| Library | Version | Purpose |
|---------|---------|---------|
| React Query | — | Server state management |
| Zustand | — | Client state management |

### Build & Dev

| Library | Version | Purpose |
|---------|---------|---------|
| ESLint | ^9 | Linting |
| PostCSS | — | CSS processing |
| Turbopack | (built-in) | Dev server bundler |

### Monitoring & Observability

| Library | Version | Purpose |
|---------|---------|---------|
| @sentry/nextjs | latest | Error tracking, performance monitoring |

---

## Tech Stack Summary

```
Frontend:   Next.js 16 + TypeScript + Tailwind + shadcn/ui
Backend:    Supabase (PostgreSQL + auto REST API)
Hosting:    Vercel + Supabase free tier
State:      React Query + Zustand
Forms:      React Hook Form + Zod
Monitoring: Sentry (error tracking + performance)
AI Tools:   Claude Code (Skills, Agents, MCP, Commands, Hooks)
```
