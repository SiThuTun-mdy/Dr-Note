# AI Tools Usage Guide

Complete guide for using Claude Code AI tools in the DRNotes project.

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

### First-Time Setup (10 minutes)

#### Step 1: Clone & Install (Auto from repo)

```bash
# Clone the repo
git clone https://github.com/SiThuTun-mdy/Dr-Note.git
cd Dr-Note

# Install dependencies
npm install

# Copy environment variables (create from template)
cp .env.example .env.local  # Note: .env.example must be created first
```

#### Step 2: Environment Variables (Manual)

Edit `.env.local` with your personal credentials:
```bash
# Supabase (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase MCP Token (from https://supabase.com/dashboard/account/tokens)
SUPABASE_ACCESS_TOKEN=your-access-token

# GitHub Token (from https://github.com/settings/tokens)
GITHUB_TOKEN=your-github-token
```

#### Step 3: Verify MCP Servers (Auto)

MCP servers are configured in `.claude/settings.local.json`. Verify they're working:
```bash
# In Claude Code, run:
/status
```

#### Step 4: Start Development

```bash
# Start Claude Code
claude

# Run setup commands
/warmup
/bootstrap
/supabase-setup
/status
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
| `/pr` | Prepare pull request draft | When you need a detailed PR doc first |
| `/create-pr` | One-step PR creation | Quick: commit + push + PR in one command |
| `/publish-pr` | Publish PR to GitHub | After /pr prepared the draft |
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
| `backend-skill` | "Use backend-skill to implement this server action" |
| `doctor-note-domain-skill` | "Apply medical domain knowledge" |
| `qa-testing-skill` | "Use qa-testing-skill to write tests" |

### Skills by Task Type

| Task Type | Recommended Skills |
|-----------|-------------------|
| New Feature | `backend-skill`, `supabase-skill`, `react-best-practices` |
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
```
# List tables
mcp__supabase__list_tables(project_id="your-project-id", schemas=["public"], verbose=true)

# Run query
mcp__supabase__execute_sql(project_id="your-project-id", query="SELECT * FROM patients LIMIT 10")

# Apply migration
mcp__supabase__apply_migration(project_id="your-project-id", name="migration_name", query="SQL HERE")
```

**Common Operations:**
- Verify table structure
- Test RLS policies
- Check seed data
- Debug queries

### Playwright MCP

**Purpose:** Browser automation and E2E testing

**Usage:**
```
# Navigate to page
mcp__playwright__browser_navigate(url="http://localhost:3000")

# Take screenshot
mcp__playwright__browser_take_screenshot(type="png", scale="css")

# Click element
mcp__playwright__browser_click(target="button[type=submit]", element="Submit button")

# Fill form
mcp__playwright__browser_fill_form(fields=[{target: "email input", name: "email", type: "textbox", value: "test@example.com"}])
```

**Common Operations:**
- Test login flow
- Verify UI components
- Take screenshots for documentation
- Debug rendering issues

### GitHub MCP

**Purpose:** Repository and PR management

**Usage:**
```
# List issues
mcp__github__list_issues(owner="ChanOoDev", repo="DRNotes")

# Create issue
mcp__github__create_issue(owner="ChanOoDev", repo="DRNotes", title="Bug: Login fails", body="Description...")

# List PRs
mcp__github__list_pull_requests(owner="ChanOoDev", repo="DRNotes")

# Get PR details
mcp__github__get_pull_request(owner="ChanOoDev", repo="DRNotes", pull_number=123)
```

**Common Operations:**
- Check issue status
- Review PR changes
- Track sprint progress
- Manage releases

---

## Plugins

### Installed Plugins

| Plugin | Purpose | Status |
|--------|---------|--------|
| `context7` | Up-to-date library documentation | Auto-triggered |
| `supabase` | Database operations via MCP | Auto-configured |
| `playwright` | Browser automation via MCP | Auto-configured |
| `github` | Repository management via MCP | Auto-configured |

### Using Context7

**Purpose:** Up-to-date library documentation

**Usage:**
Automatic — Claude Code uses it when you ask about libraries

**Example:**
```
"How do I use Supabase.auth.getUser() in the latest version?"
```

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

7. /create-pr
   → Commit, push, and create PR in one step
   → Or use /pr + /publish-pr for detailed PR docs
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

### Workflow 3: Emergency Hotfix

```
1. /hotfix <issue or description>
   → Assess severity (confirm production affected)
   → Branch from main (NOT from feature branch)

2. Implement minimal fix
   → Fix the exact bug only
   → No refactoring, no new features

3. Self-review (fast)
   → Security, side effects, RLS, auth

4. QA checks (essential only)
   → lint + tsc + build (skip full regression)

5. Commit and push
   → "hotfix(scope): description"

6. Create PR with hotfix label
   → Fast-track review requested

7. After merge — cherry-pick to active feature branches
   → git cherry-pick <hotfix-sha>
```

**Key differences from /bugfix:**
- `/bugfix` = QA defects on feature branches (normal pace)
- `/hotfix` = production issues from main (emergency pace, minimal changes)

### Workflow 4: Sprint Start

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
- [Architecture Decisions](./10-Decisions.md)
- [Sprint Backlog](./18-Sprint-Backlog.md)
- [Tools & Stack](./tools-and-stack.md)
- [Conflict Analysis](./conflict-analysis.md)
- [Claude Changelog](./claude-changelog.md)
- [Sentry Setup Guide](./guide/05-sentry-setup.md)
- [Branch Protection Rules](./guide/06-branch-protection.md)
