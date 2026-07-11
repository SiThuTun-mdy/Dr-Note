# Post Deployment Smoke Test

Status: Draft

## Purpose

Document setup steps, troubleshoots, and lessons learned for developer guide.

---

## Initial Setup Steps

### 1. Git Repository Setup

```bash
# Initialize git
git init

# Add remote
git remote add origin git@github.com:SiThuTun-mdy/Dr-Note.git

# Rename master to main
git branch -m master main

# Stage and commit
git add -A
git commit -m "Initial commit: project scaffolding and documentation"

# Push to origin
git push -u origin main
```

**Troubleshoot:**
- `git branch` shows no output before first commit — this is normal, branches are created on first commit

---

### 2. Import Project (`/import-project`)

**Steps:**
1. Run `/import-project`
2. Provide GitHub Project URL when prompted
3. Allow `gh` CLI commands when permission prompts appear

**Troubleshoot — Permission Prompts:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Commands appear to "not work" | Permission prompt was rejected | Click "Allow" or "Always allow" |
| `gh project list` fails silently | User rejected the command | Re-run and approve |
| Import stops mid-way | Multiple rejections | Start over, approve all prompts |

**What was imported:**
- `docs/02-PRD.md` — from `docs/guide/02-architecture.md`
- `docs/12-Architecture.md` — from `docs/guide/02-architecture.md`
- `docs/13-ERD.md` — from `docs/guide/01-database-schema.md`
- `docs/Progress.md` — created with project status
- `CLAUDE.md` — updated with GitHub Project config

---

### 3. Bootstrap (`/bootstrap`)

**Steps:**
1. Run `/bootstrap`
2. Choose subdirectory for app (e.g., `app/`)
3. Wait for scaffolding to complete

**What was created:**

| Item | Location |
|------|----------|
| Next.js 16 app | `app/` |
| Supabase dependencies | `@supabase/supabase-js`, `@supabase/ssr` |
| shadcn/ui components | button, card, dialog, input, label, table, select, textarea, badge, form, sonner, skeleton, tabs, dropdown-menu |
| Supabase helpers | `app/src/lib/supabase/` (client, server, middleware) |
| Database schema | `app/supabase/migrations/00001_initial_schema.sql` |
| Seed data | `app/supabase/seed.sql` |
| TypeScript types | `app/src/types/database.ts` |
| Environment template | `app/.env.example` |

**Troubleshoot:**

| Issue | Cause | Fix |
|-------|-------|-----|
| `toast` component deprecated | shadcn/ui updated | Use `sonner` instead |
| `cd app` fails after scaffold | CWD already changed | Check `pwd` first |
| LF/CRLF warnings | Windows line endings | Normal, can ignore |

---

### 4. Run Dev Server

```bash
cd app && npm run dev
```

**Result:** Server starts at http://localhost:3000

**Troubleshoot:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Port 3000 in use | Another process | Kill process or use `-p 3001` |
| Blank page | No `.env.local` | Create with Supabase credentials |

---

## Files Modified/Created

| File | Action |
|------|--------|
| `CLAUDE.md` | Updated GitHub Project config |
| `docs/02-PRD.md` | Created from guide |
| `docs/12-Architecture.md` | Created from guide |
| `docs/13-ERD.md` | Created from guide |
| `docs/Progress.md` | Created with project status |
| `docs/dev-setup/setup-guide.md` | Added troubleshooting section |
| `app/` | Scaffolded Next.js + Supabase |

---

## Next Steps

1. Create `.env.local` with Supabase credentials
2. Run Supabase migration in dashboard
3. Run `/next-task` to start development

---

## Notes

- Owner agent: Developer
- Last updated: 2026-07-11
