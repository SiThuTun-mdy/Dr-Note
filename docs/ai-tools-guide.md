# AI Tools Usage Guide

Complete guide for using Claude Code AI tools in the Dr-Note project.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Sequence](#setup-sequence)
3. [Commands Reference](#commands-reference)
4. [Skills Usage](#skills-usage)
5. [Agents Workflow](#agents-workflow)
6. [MCP Tools](#mcp-tools)
7. [Plugins](#plugins)
8. [Common Workflows](#common-workflows)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### What is Claude Code?

Claude Code is an AI-powered coding assistant that understands your project context through:
- **Skills** — Reusable prompt templates for specific domains
- **Agents** — Autonomous sub-agents for specialized tasks
- **Commands** — Slash commands for quick actions
- **Hooks** — Automated triggers on tool events
- **MCP** — External tool integrations (Supabase, GitHub, Playwright)
- **Plugins** — Extended functionality packages

### First-Time Setup (5 minutes)

```bash
# 1. Clone the repo
git clone https://github.com/SiThuTun-mdy/Dr-Note.git
cd Dr-Note

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Edit .env.local with your credentials
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_ACCESS_TOKEN
# - GITHUB_TOKEN

# 5. Start Claude Code
claude
```

---

## Setup Sequence

**Follow this sequence when starting work on the project:**

### Day 1: Initial Setup

```
/warmup          → Generate product/architecture docs (if not exists)
/bootstrap       → Verify project scaffold is complete
/supabase-setup  → Check Supabase connection and MCP
/status          → Check current project status
/next-task       → Pick your first task from sprint backlog
```

### Daily Workflow

```
Morning:
  1. /next-task       → Pick task from sprint board
  2. /feature         → Implement the feature
  3. /security-review → Scan for vulnerabilities

Midday:
  4. /review          → Code review with AI
  5. /qa              → Run QA testing
  6. git commit       → Commit changes

Afternoon:
  7. /pr              → Create pull request
  8. /regression      → Run regression tests (if bugfix)
  9. /docs-sync       → Sync documentation
```

### Sprint Workflow

```
Sprint Start:
  /warmup            → Generate sprint docs
  /next-task         → Pick first task

During Sprint:
  [Repeat daily workflow above]

Sprint End:
  /release-check     → Check release readiness
  /deploy-check      → Verify deployment
```

---

## Commands Reference

### Setup Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/warmup` | Generate product/architecture docs | First time, or when docs are missing |
| `/bootstrap` | Verify project scaffold | After clone, or when setup issues |
| `/supabase-setup` | Check Supabase connection | When DB issues occur |
| `/status` | Show project status | Anytime to check progress |

### Development Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/next-task` | Pick next sprint task | Start of work session |
| `/feature` | Implement one MVP feature | After picking a task |
| `/bugfix` | Fix QA defects | When bugs are found |

### Review Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/review` | Internal code review | After implementation |
| `/security-review` | Security vulnerability scan | After every feature/bugfix |
| `/qa` | Run QA testing | Before creating PR |

### Git Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/pr` | Prepare pull request draft | Ready to merge |
| `/publish-pr` | Publish PR to GitHub | After /pr |
| `/regression` | Run regression tests | After bugfix |

### Release Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/deploy-check` | DevOps readiness check | Before deployment |
| `/release-check` | Release manager workflow | Sprint end |
| `/docs-sync` | Sync docs with implementation | After features |

---

## Skills Usage

### Auto-Triggered Skills

These skills are automatically applied by Claude Code when relevant:

| Skill | Triggers When |
|-------|---------------|
| `react-best-practices` | Writing React/Next.js code |
| `ui-ux-pro-max` | Designing UI components |
| `frontend-design` | Creating visual designs |
| `supabase-skill` | Working with database |
| `security-review-skill` | Running security review |

### Manual Skills (via prompts)

| Skill | How to Use |
|-------|------------|
| `server-actions-skill` | "Use server-actions-skill to implement this action" |
| `doctor-note-domain-skill` | "Apply medical domain knowledge" |
| `qa-testing-skill` | "Use qa-testing-skill to write tests" |

### Skills by Task Type

| Task Type | Recommended Skills |
|-----------|-------------------|
| New Feature | `server-actions-skill`, `supabase-skill`, `react-best-practices` |
| UI Component | `ui-ux-pro-max`, `frontend-design`, `react-best-practices` |
| Bug Fix | `security-review-skill`, `qa-testing-skill` |
| Database | `supabase-skill`, `server-actions-skill` |
| Testing | `qa-testing-skill`, Playwright |

---

## Agents Workflow

### Agent Roles

| Agent | Role | When to Use |
|-------|------|-------------|
| `orchestrator` | Coordinates workflow | Automatic |
| `product-manager` | Requirements | Sprint planning |
| `architect` | Technical design | Architecture decisions |
| `scrum-master` | Task breakdown | Sprint start |
| `developer` | Code implementation | During development |
| `reviewer` | Code review | After implementation |
| `qa` | Testing | Before PR |
| `release-manager` | Release readiness | Sprint end |
| `devops` | Deployment | Deploy time |
| `documentation` | Docs generation | After features |

### Typical Agent Flow

```
1. /next-task
   └─→ Scrum Master breaks down task

2. /feature
   └─→ Developer implements code
   └─→ Architect reviews design
   └─→ Reviewer checks quality

3. /security-review
   └─→ Security Agent scans for vulnerabilities

4. /qa
   └─→ QA Agent runs tests

5. /pr
   └─→ Documentation Agent creates PR description
```

---

## MCP Tools

### Supabase MCP

**Purpose:** Direct database operations from Claude Code

**Usage:**
```bash
# List tables
supabase list_tables

# Run query
supabase execute_sql "SELECT * FROM patients LIMIT 10"

# Check RLS policies
supabase list_policies
```

**Common Operations:**
- Verify table structure
- Test RLS policies
- Check seed data
- Debug queries

### Playwright MCP

**Purpose:** Browser automation and E2E testing

**Usage:**
```bash
# Navigate to page
playwright navigate http://localhost:3000

# Take screenshot
playwright screenshot

# Click element
playwright click "button[type=submit]"

# Fill form
playwright fill "input[name=email]" "test@example.com"
```

**Common Operations:**
- Test login flow
- Verify UI components
- Take screenshots for documentation
- Debug rendering issues

### GitHub MCP

**Purpose:** Repository and PR management

**Usage:**
```bash
# List issues
github list_issues

# Create issue
github create_issue "Bug: Login fails" "Description..."

# List PRs
github list_prs

# Get PR details
github get_pr 123
```

**Common Operations:**
- Check issue status
- Review PR changes
- Track sprint progress
- Manage releases

---

## Plugins

### code-review

**Purpose:** Automated PR review on GitHub

**Usage:**
```
/code-review
```

**What it does:**
- Analyzes changed files
- Posts review comments on GitHub
- Checks for code quality, security, performance

### vercel

**Purpose:** Deployment management

**Usage:**
```
/deploy-check
```

**What it does:**
- Checks deployment readiness
- Verifies environment variables
- Tests build process

### context7

**Purpose:** Up-to-date library documentation

**Usage:**
Automatic — Claude Code uses it when you ask about libraries

**Example:**
```
"How do I use Supabase.auth.getUser() in the latest version?"
```

### frontend-design

**Purpose:** Production-grade UI design

**Usage:**
Automatic — Applied when creating UI components

**What it does:**
- Avoids generic AI aesthetics
- Applies bold, distinctive design
- Uses proper typography and colors

---

## Common Workflows

### Workflow 1: Starting a New Task

```
1. /next-task
   → Shows next task from sprint backlog
   → Creates feature branch

2. Read the task requirements
   → Understand acceptance criteria
   → Check dependencies

3. /feature
   → Implements the feature
   → Follows server-actions-skill patterns
   → Uses supabase-skill for database

4. /security-review
   → Scans for vulnerabilities
   → Fixes any HIGH/MEDIUM issues

5. /review
   → AI code review
   → Suggests improvements

6. /qa
   → Runs tests
   → Verifies acceptance criteria

7. git commit
   → Commit with conventional message

8. /pr
   → Create pull request
   → Link to issue
```

### Workflow 2: Fixing a Bug

```
1. /bugfix
   → Analyze the bug
   → Identify root cause

2. Implement fix
   → Minimal changes
   → Follow existing patterns

3. /security-review
   → Ensure fix doesn't introduce vulnerabilities

4. /regression
   → Run regression tests
   → Verify fix works

5. git commit
   → Commit with fix message

6. /pr
   → Create PR with bug description
```

### Workflow 3: Sprint Start

```
1. /warmup
   → Generate/update product docs
   → Verify architecture docs

2. /status
   → Check current progress
   → Identify blockers

3. Review sprint backlog
   → Prioritize tasks
   → Assign to team

4. /next-task (for each developer)
   → Pick first task
   → Start development
```

### Workflow 4: Sprint End

```
1. /release-check
   → Verify all features complete
   → Check for critical bugs

2. /deploy-check
   → Verify deployment readiness
   → Check environment variables

3. /docs-sync
   → Sync documentation with code
   → Update API docs

4. Deploy to production
   → Merge PRs
   → Deploy via Vercel
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MCP server not loading | Restart Claude Code |
| Supabase connection failed | Check `.env.local` credentials |
| GitHub MCP auth error | Verify `GITHUB_TOKEN` in `.env.local` |
| Playwright not working | Run `npx playwright install` |
| ESLint errors in `.claude/` | Already fixed in `eslint.config.mjs` |

### Debug Commands

```bash
# Check MCP servers
claude mcp list

# Check environment variables
cat .env.local

# Test Supabase connection
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Check git status
git status
git log --oneline -5
```

### Getting Help

```bash
# Check project status
/status

# View current decisions
cat docs/10-Decisions.md

# View progress
cat docs/Progress.md

# View sprint backlog
cat docs/18-Sprint-Backlog.md
```

---

## Team Conventions

### Commit Messages

```
feat(scope): description     → New feature
fix(scope): description      → Bug fix
chore(scope): description    → Maintenance
docs(scope): description     → Documentation
```

### Branch Naming

```
feat/<scope>-<description>   → Feature branches
bugfix/<scope>-<description> → Bug fix branches
docs/<scope>-<description>   → Documentation branches
```

### PR Requirements

- [ ] Code reviewed (self or peer)
- [ ] Security review passed
- [ ] QA testing passed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Issue linked

---

## Resources

- [Project Documentation](./Progress.md)
- [Architecture Decisions](./adr/adr.md)
- [Sprint Backlog](./18-Sprint-Backlog.md)
- [Tools & Stack](./tools-and-stack.md)
- [Conflict Analysis](./conflict-analysis.md)
