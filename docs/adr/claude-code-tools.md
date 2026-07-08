# Claude Code Tools & Capabilities - Team Discussion

**Status:** Draft
**Date:** 2026-07-07
**Purpose:** Team discussion on Claude Code capabilities and tools for the project
**Prepared By:** NCO

---

## 1. Overview

Claude Code can be extended with skills, agents, MCP servers, commands, and hooks. This document lists tools and capabilities for team discussion and exploration.

---

## 2. Skills

**What:** Reusable prompt templates that activate automatically based on file patterns.

| Skill | Triggers On | What It Does |
|---|---|---|
| `ui-ux-pro-max` | UI tasks | Comprehensive design intelligence (67 styles, 161 palettes) |
| `frontend-dev-skill` | `*.tsx`, `*.ts` | React/TypeScript patterns |
| `backend-skill` | `actions/**/*.ts` | Supabase, auth, RLS |
| `supabase-skill` | `*.sql`, migrations | Database patterns |
| `security-review-skill` | All files | Security checklist |
| `qa-testing-skill` | `*.test.ts` | Test patterns |

### Discussion Questions:
- Which skills should we create for this project?
- Do we need domain-specific skills (medical, clinic)?

---

## 3. Agents

**What:** Autonomous sub-agents that handle specific roles in parallel.

| Agent | Role | When to Use |
|---|---|---|
| `orchestrator` | Coordinates all agents | Start of feature |
| `developer` | Implements features | Coding tasks |
| `reviewer` | Code review | After implementation |
| `qa` | Quality assurance | Before release |
| `scrum-master` | Sprint planning | Sprint kickoff |
| `architect` | Architecture decisions | Design phase |
| `devops` | Infrastructure | Deployment tasks |

### Discussion Questions:
- Which agents should we use daily?
- How do we handle agent failures?

---

## 4. MCP Servers (Model Context Protocol)

**What:** External tool integration for Claude Code.

| MCP Server | Purpose | Example Use |
|---|---|---|
| `context7` | Up-to-date documentation | Library docs, API references |
| `playwright` | End-to-end testing | Browser automation, E2E tests |
| `chrome-devtools` | Browser automation | Testing UI, screenshots |
| `pencil` | Design tool integration | UI design, mockups |
| `github` | GitHub API access | PR management, issues |
| `supabase` | Direct database queries | DB management, migrations |
| `postgres` | PostgreSQL direct access | Raw SQL, debugging |
| `figma` | Design file access | Design-to-code workflow |
| `slack` | Team communication | Notifications, updates |
| `linear` | Project management | Issue tracking |
| `notion` | Documentation | Knowledge base |
| `stripe` | Payment integration | Billing features |
| `sendgrid` | Email service | Transactional email |
| `sentry` | Error tracking | Bug monitoring |
| `datadog` | Monitoring | Performance metrics |
| `aws` | Cloud services | S3, Lambda, etc. |
| `gcp` | Google Cloud | Firebase, GCS |
| `azure` | Microsoft Cloud | Azure services |

### Discussion Questions:
- Which MCP servers do we need for this project?
- Should we create custom MCP servers for clinic-specific tools?

---

## 5. Commands

**What:** Slash commands for quick actions.

| Command | What It Does | When to Use |
|---|---|---|
| `/next-task` | Picks next sprint task | Start of day |
| `/feature <desc>` | Implements feature | New feature |
| `/bugfix <desc>` | Fixes bug | Bug fix |
| `/review` | Code review | After implementation |
| `/qa` | Quality assurance | Before release |
| `/status` | Project status | Any time |
| `/bootstrap` | Scaffold project | New setup |
| `/warmup` | Fill TODO stubs | Doc completion |
| `/publish-pr` | Create PR | After review |

### Discussion Questions:
- Which commands should we use daily?
- Should we create custom commands for clinic workflows?

---

## 6. Hooks

**What:** Automated triggers on tool calls.

| Hook | Triggers On | What It Does |
|---|---|---|
| `secret-scan.sh` | File edit | Scans for secrets |
| `lint.sh` | File edit | Runs ESLint |
| `typecheck.sh` | File edit | TypeScript check |
| `build.sh` | File edit | Build check |
| `test.sh` | File edit | Run tests |
| `progress-reminder.sh` | Claude stops | Reminds to update docs |

### Discussion Questions:
- Which hooks should we enable?
- Should we create custom hooks for medical compliance?

---

## 7. Tool Integration Ideas

### For Development

| Tool | Integration | Benefit |
|---|---|---|
| **Context7** | MCP | Always up-to-date library docs |
| **Playwright** | MCP | Automated E2E testing |
| **GitHub** | MCP | PR/issue management |
| **Supabase** | MCP | Direct DB queries |

### For Design

| Tool | Integration | Benefit |
|---|---|---|
| **Figma** | MCP | Design-to-code |
| **Pencil** | MCP | UI mockups |
| **Chrome DevTools** | MCP | Browser testing |

### For Operations

| Tool | Integration | Benefit |
|---|---|---|
| **Sentry** | MCP | Error tracking |
| **Vercel** | CLI | Deployment |
| **Slack** | MCP | Team notifications |

---

## 8. Discussion Points

1. **Priority:** Which tools should we explore first?
2. **Workflow:** How do these tools fit into our development workflow?
3. **Security:** What are the security implications of MCP servers?
4. **Cost:** Are there any costs associated with these tools?
5. **Learning Curve:** How much time to learn each tool?

---

## 9. Next Steps

- [ ] Research each MCP server
- [ ] Test Context7 MCP for documentation
- [ ] Test Playwright MCP for E2E testing
- [ ] Evaluate which tools to adopt
- [ ] Create project-specific skills

---

*This is a draft for team discussion. Please add comments and suggestions.*
