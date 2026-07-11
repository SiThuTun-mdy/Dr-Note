# Infrastructure Setup Guide

**Status:** Complete  
**Last Updated:** 2026-07-07  
**Owner:** DevOps

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Strategy](#3-environment-strategy)
4. [Supabase Setup](#4-supabase-setup)
5. [GitHub Setup](#5-github-setup)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Vercel Deployment](#7-vercel-deployment)
8. [Secrets Management](#8-secrets-management)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [Cost Considerations](#10-cost-considerations)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Overview

This document covers infrastructure setup and deployment for the project.

| Service | Purpose | Plan |
|---|---|---|
| **Vercel** | Frontend hosting, edge functions, CI/CD | Free tier |
| **Supabase** | PostgreSQL, Auth, REST API, Realtime | Free tier |
| **GitHub** | Source control, CI/CD, project management | Free tier |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Source Code  │  │ Actions CI  │  │ Project Mgmt│        │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘        │
└─────────┼────────────────┼─────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Preview Env │  │ Production  │  │ Edge Functions│       │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘        │
└─────────┼────────────────┼─────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │ Auth + RLS  │  │ REST API    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

Install these before starting:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 18+ | https://nodejs.org |
| **npm** | 9+ | Comes with Node.js |
| **Git** | Latest | https://git-scm.com |
| **Claude Code** | Latest | `npm install -g @anthropic-ai/claude-code` |
| **GitHub account** | — | https://github.com |
| **Supabase account** | — | https://supabase.com |
| **Vercel account** | — | https://vercel.com |

Verify installation:

```bash
node --version    # Should be v18+
npm --version     # Should be 9+
git --version     # Should be 2.x+
claude --version  # Should be latest
gh --version      # Should be 2.x+
vercel --version  # Should be latest
```

---

## 3. Environment Strategy

### 3.1 Environment Tiers

| Environment | URL | Purpose | Database |
|---|---|---|---|
| **Local** | `localhost:3000` | Development | Local or Supabase dev project |
| **Preview** | `*.vercel.app` | PR review/staging | Supabase staging project |
| **Production** | `your-domain.vercel.app` | Live app | Supabase production project |

### 3.2 Environment Variables

| Variable | Local | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ (server only) | ✅ (server only) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://*.vercel.app` | `https://your-domain.com` |

> ⚠️ **Never commit `.env.local`** — it's in `.gitignore` by default.

### 3.3 Create Local Environment

```bash
cp .env.example .env.local
```

Fill in values from Supabase dashboard (see Section 4.2).

---

## 4. Supabase Setup

### 4.1 Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Choose a name and database password
4. Wait for project to be ready (~1 minute)

### 4.2 Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Run Database Migrations

1. Go to **SQL Editor** in Supabase dashboard
2. Run the migration files in order from `supabase/migrations/`:

```bash
# Check available migrations
ls supabase/migrations/
```

3. Copy and paste each migration file's content into the SQL Editor and run it

### 4.4 Verify RLS

After running migrations, verify Row Level Security is enabled:

1. Go to **Authentication** → **Policies**
2. Check that policies exist for: `profiles`, `patients`, `doctors`, `consultations`

### 4.5 Supabase Free Tier Limits

| Resource | Free Tier Limit |
|---|---|
| Database size | 500 MB |
| Storage | 1 GB |
| Auth users | Unlimited |
| API requests | 500,000/month |
| Realtime connections | 200 concurrent |
| Edge Functions | 500,000 invocations/month |

> ⚠️ Monitor usage in Supabase dashboard → **Usage** tab.

---

## 5. GitHub Setup

### 5.1 Install GitHub CLI

```bash
# Windows (winget)
winget install GitHub.cli

# macOS
brew install gh

# Linux (apt)
sudo apt install gh
```

### 5.2 Authenticate

```bash
# Login to GitHub
gh auth login

# Follow the prompts:
# ? What account? → GitHub.com
# ? Preferred protocol? → HTTPS
# ? Authenticate Git? → Yes
# ? Login with web browser? → Yes
```

### 5.3 Verify

```bash
gh auth status
# Should show: Logged in to github.com as <your-username>
```

### 5.4 Create Repository

```bash
# Create a new repo on GitHub
gh repo create DRNotes --private --source=. --push

# Or if repo already exists, just set the remote
git remote add origin https://github.com/SiThuTun-mdy/Dr-Note.git
git push -u origin main
```

### 5.5 Configure Branch Protection

Protect the `main` branch so all changes go through PRs:

```bash
# Enable branch protection via API
gh api repos/{owner}/{repo}/branches/main/protection -X PUT -f '{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}'
```

Or manually:
1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable: **Require a pull request before merging**
5. Save changes

### 5.6 Create Issue Labels

```bash
# Create labels for the project
gh label create "type: epic" --color "A2EEEF" --description "Major delivery item"
gh label create "type: story" --color "7057FF" --description "User-facing story"
gh label create "type: task" --color "008672" --description "Implementation task"
gh label create "type: bug" --color "D73A4A" --description "Defect report"
gh label create "status: backlog" --color "C5DEF5" --description "Not yet planned"
gh label create "status: ready" --color "0E8A16" --description "Ready to start"
gh label create "status: in-progress" --color "FBCA04" --description "Currently working"
gh label create "status: in-review" --color "D4C5F9" --description "Under review"
gh label create "status: qa" --color "F9D0C4" --description "QA testing"
gh label create "status: blocked" --color "E11D48" --description "Blocked"
gh label create "status: done" --color "0E8A16" --description "Completed"
gh label create "priority: high" --color "B60205" --description "High priority"
gh label create "priority: medium" --color "FBCA04" --description "Medium priority"
gh label create "priority: low" --color "0E8A16" --description "Low priority"
gh label create "area: frontend" --color "1D76DB" --description "Frontend work"
gh label create "area: backend" --color "006B75" --description "Backend work"
gh label create "area: database" --color "5319E7" --description "Database work"
gh label create "area: devops" --color "D4C5F9" --description "DevOps work"
gh label create "area: docs" --color "0075CA" --description "Documentation"
```

### 5.7 Create GitHub Project

1. Go to https://github.com/projects
2. Click **New project**
3. Choose **Board** view
4. Name: `Doctor Note MVP`
5. Description: `Sprint board for Doctor Note MVP development`

#### Configure Status Field

| Status | Color | Description |
|---|---|---|
| Backlog | Gray | Not yet planned |
| Ready | Blue | Ready to start |
| In Progress | Yellow | Currently working |
| In Review | Purple | Under review |
| QA | Orange | QA testing |
| Blocked | Red | Blocked |
| Done | Green | Completed |

### 5.8 Create Issues from Templates

The project includes issue templates in `.github/ISSUE_TEMPLATE/`:

```bash
# Create issues from templates
gh issue create --template user-story
gh issue create --template epic
gh issue create --template task
gh issue create --template bug-report
```

### 5.9 Auto-Update Project Status with Claude Code

Instead of manually updating issue status, use Claude Code commands:

| Command | What It Does |
|---|---|
| `/next-task` | Picks next task, moves to "In Progress" |
| `/feature <desc>` | Implements feature, moves to "In Review" |
| `/bugfix <desc>` | Fixes bug, moves to "In Review" |
| `/review` | Reviews code, moves to "QA" or "Done" |
| `/qa` | Runs QA, moves to "Done" |

**How it works:**
1. Claude Code reads the issue and project board via `gh` CLI
2. Automatically moves issue to appropriate status
3. Updates issue labels and assigns work
4. No manual CLI commands needed

**Example workflow:**
```bash
# Developer types:
/next-task

# Claude Code automatically:
# 1. Lists issues in "Ready" status
# 2. Picks the next priority task
# 3. Moves it to "In Progress"
# 4. Creates a feature branch
# 5. Implements the feature
# 6. Moves to "In Review" and creates PR
```

---

## 6. CI/CD Pipeline

### 6.1 Pipeline Overview

```
┌─────────────────────────────────────────────────────────┐
│  Pull Request                                           │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Lint & Typecheck│  │ Tests           │  (parallel)  │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                        │
│  ┌────────┴────────────────────┴────────┐              │
│  │ Security Scan                         │              │
│  │ (npm audit + secret scan)             │              │
│  └────────────────────┬─────────────────┘              │
│                       │                                 │
│  ┌────────────────────┴─────────────────┐              │
│  │ Build                                 │              │
│  └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼ (merge PR)
┌─────────────────────────────────────────────────────────┐
│  Deploy Workflow (deploy.yml)                           │
│  Triggers: Push to main                                │
│                                                         │
│  Step 1: CI (lint + test + security + build)            │
│  Step 2: Deploy Preview (staging)                       │
│  Step 3: ⏸️  Approval Gate (manual)                     │
│  Step 4: UAT Verification (manual)                      │
│  Step 5: Deploy Production                              │
└─────────────────────────────────────────────────────────┘
```

### 6.2 CI Workflow (`.github/workflows/ci.yml`)

Runs automatically on **pull requests only** (not on push to main):

| Job | What It Does | Runs On |
|---|---|---|
| `lint-and-typecheck` | TypeScript check + ESLint | ubuntu-latest |
| `test` | Vitest test suite | ubuntu-latest |
| `security` | npm audit + secret scan | ubuntu-latest |
| `build` | Next.js production build | ubuntu-latest |

**Jobs run in parallel** (lint, test, security), then **build runs after all pass**.

### 6.3 Deploy Workflow (`.github/workflows/deploy.yml`)

Runs on push to main (after PR is merged):

| Step | What It Does | Requires |
|---|---|---|
| `ci` | Runs CI workflow | — |
| `deploy-preview` | Deploys to Vercel preview | CI passes |
| `approve` | Waits for manual approval | Preview deployed |
| `uat` | UAT verification | Approval received |
| `deploy-production` | Deploys to Vercel production | UAT passed |

### 6.4 Setup GitHub Environments (Required)

You need **2 environments** for the approval flow:

#### Production Environment

1. Go to https://github.com/SiThuTun-mdy/Dr-Note/settings/environments
2. Click **New environment**
3. Name: `production`
4. Enable **Required reviewers**
5. Add yourself as reviewer
6. Save

#### UAT Environment

1. Click **New environment**
2. Name: `uat`
3. Enable **Required reviewers**
4. Add yourself as reviewer
5. Save

> ⚠️ **Without these setups, the deploy workflow will fail at the approval/UAT steps.**

---

## 7. Vercel Deployment

### 7.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 7.2 Login to Vercel

```bash
vercel login
```

This opens a browser for authentication.

### 7.3 Link Project to Vercel

```bash
vercel link --yes
```

This creates a Vercel project linked to your local directory.

### 7.4 Add Environment Variables

```bash
# Get these from Supabase Dashboard → Settings → API
vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://your-project.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --value "your-anon-key"
vercel env add SUPABASE_SERVICE_ROLE_KEY production --value "your-service-role-key"
```

Verify all variables are set:

```bash
vercel env ls
```

### 7.5 Connect GitHub Repository

1. Go to https://vercel.com/your-account/your-project/settings/git
2. Click **Connect Repository**
3. Select your GitHub repository
4. Click **Connect**

### 7.6 Get Vercel Token (for GitHub Actions)

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `github-actions`
4. Copy the token
5. Add to GitHub:

```bash
gh secret set VERCEL_TOKEN --body "your-vercel-token"
```

### 7.7 Configure Domains (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

### 7.8 Deployment Flow

```
Create Pull Request
    │
    ▼
┌─────────────────────┐
│ CI runs             │
│ (lint+test+sec+build)│
└─────────┬───────────┘
          │ ✅ Pass
          ▼
┌─────────────────────┐
│ Merge PR to main   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Deploy Preview      │ ← Review staging
│ (staging URL)       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ ⏸️  Approval needed  │ ← Approve in GitHub UI
└─────────┬───────────┘
          │ ✅ Approved
          ▼
┌─────────────────────┐
│ ✅ UAT passed       │ ← Verify in GitHub UI
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Production live     │
│ (your-domain.vercel.app)│
└─────────────────────┘
```

### 7.9 Manual Deployment

To deploy manually without waiting for approval:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 7.10 Vercel Free Tier Limits

| Resource | Free Tier Limit |
|---|---|
| Bandwidth | 100 GB/month |
| Serverless Functions | 100 hours/month |
| Edge Functions | 1M invocations/month |
| Build minutes | 6,000 minutes/month |
| Projects | Unlimited |
| Team members | 1 |

> ⚠️ Monitor usage in Vercel dashboard → **Usage** tab.

---

## 8. Secrets Management

### 8.1 GitHub Repository Secrets

Add these secrets to your GitHub repository:

```bash
# Supabase
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key"

# Vercel
gh secret set VERCEL_TOKEN --body "your-vercel-token"
```

Or manually:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret

### 8.2 Secret Scanning

The project includes a pre-commit hook that scans for leaked secrets:

```bash
.claude/hooks/secret-scan.sh
```

This runs automatically on every file edit via Claude Code hooks.

### 8.3 Rotate Secrets

Rotate secrets if:
- A secret is accidentally committed
- A team member leaves
- You suspect a breach

```bash
# Rotate Supabase keys
# 1. Go to Supabase Dashboard → Settings → API
# 2. Click "Regenerate" for the affected key
# 3. Update all environments (GitHub, Vercel)
```

### 8.4 Environment Variables Checklist

| Variable | GitHub Secrets | Vercel Production | Vercel Preview |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ❌ (server only) |
| `VERCEL_TOKEN` | ✅ | N/A | N/A |

---

## 9. Monitoring & Logging

### 9.1 Vercel Monitoring

Access in Vercel Dashboard:
- **Logs** → Function logs, build logs
- **Analytics** → Web vitals, traffic
- **Speed Insights** → Core Web Vitals

### 9.2 Supabase Monitoring

Access in Supabase Dashboard:
- **Database** → Query performance, connections
- **Auth** → User activity, error logs
- **Storage** → Usage metrics
- **Logs** → API logs, Postgres logs

### 9.3 Error Tracking

For production error tracking, consider adding:

```bash
# Option 1: Sentry (free tier available)
npm install @sentry/nextjs

# Option 2: Vercel Error Monitoring (built-in)
# No setup needed, available in Vercel dashboard
```

### 9.4 Uptime Monitoring

Free options:
- **UptimeRobot** (https://uptimerobot.com) — 50 monitors free
- **Better Stack** (https://betterstack.com) — 10 monitors free

### 9.5 Alerts

Set up alerts for:
- **Vercel**: Function errors, build failures
- **Supabase**: Database connections, storage limits
- **GitHub**: CI/CD failures

---

## 10. Cost Considerations

### 10.1 Free Tier Summary

| Service | Free Tier | Overage Cost |
|---|---|---|
| **Vercel** | 100 GB bandwidth, 100 hrs functions | Pay-as-you-go |
| **Supabase** | 500 MB DB, 1 GB storage | $0.125/GB (Pro) |
| **GitHub** | Unlimited public/private repos | Free for team |
| **Claude Code** | Included with subscription | — |

### 10.2 Estimated Monthly Cost

For a small team (2-3 developers) with low traffic:

| Service | Cost |
|---|---|
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier) |
| GitHub | $0 (free tier) |
| Domain (optional) | ~$10-15/year |
| **Total** | **$0-15/month** |

### 10.3 When to Upgrade

Consider upgrading when:
- **Vercel**: >100 GB bandwidth/month or need team features
- **Supabase**: >500 MB database or need advanced features
- **Need**: Custom domains, SSL certificates, or higher limits

---

## 11. Troubleshooting

### Claude Code Permission Prompts

When running commands like `/import-project`, `/next-task`, or any `gh` CLI commands, Claude Code will ask for permission before executing shell commands.

**Symptom:** Commands appear to "not work" or fail silently.

**Cause:** The permission prompt was rejected (clicked "reject" or "Deny").

**Fix:**
1. When you see a permission prompt, click **"Allow"** or **"Always allow"**
2. For `gh` commands (GitHub CLI), always allow — they are safe read/write operations
3. If you accidentally reject, just run the command again and click "Allow"

**Example:**
```
You: /import-project
Claude: Runs `gh project list --owner SiThuTun-mdy --format json`
Permission prompt: "Allow this command?" → Click "Allow"
```

> **Tip:** If you keep rejecting prompts, commands will never complete. Always approve `gh` and `git` commands when working with GitHub projects.

---

### Supabase connection errors

1. Check `.env.local` has correct values
2. Verify Supabase project is running
3. Check RLS policies are enabled
4. Check database connections in Supabase dashboard

### Vercel deployment fails

1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Run `npm run build` locally to reproduce
4. Check Vercel status: https://vercel-status.com

### GitHub Actions fails

1. Check workflow runs in Actions tab
2. Verify secrets are set correctly
3. Check environment approvals are configured
4. Review runner logs for errors

### Build fails locally

```bash
# Check for type errors
npm run typecheck

# Check for lint errors
npm run lint

# Full build
npm run build
```

---

## Quick Start Checklist

### Local Setup
- [ ] Node.js 18+ installed
- [ ] Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- [ ] GitHub CLI installed (`gh --version`)
- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] `.env.local` created with Supabase credentials
- [ ] Database migrations run in Supabase
- [ ] `npm run dev` starts successfully
- [ ] Can access http://localhost:3000
- [ ] Can sign up and log in
- [ ] Claude Code opens with project context

### GitHub Setup
- [ ] GitHub CLI authenticated (`gh auth status`)
- [ ] Repository created and pushed
- [ ] Branch protection enabled on `main`
- [ ] Issue labels created
- [ ] GitHub Project board created
- [ ] Repository secrets added (Supabase keys)

### Vercel Setup
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Environment variables set in Vercel
- [ ] Vercel token added as GitHub secret
- [ ] First deployment successful
- [ ] GitHub environments configured (production, uat)

### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Supabase monitoring reviewed
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring configured (optional)

---

## Next Steps

After setup, refer to the [Developer Guide](./44-Developer-Guide.md) for:
- Coding standards and patterns
- Development workflow
- Component patterns
- State management patterns
