# Progress

## Current Phase: Phase 2: Implementation

## GitHub Configuration

- **Code Repo:** SiThuTun-mdy/Dr-Note (code, branches, PRs)
- **Issue Tracker:** SiThuTun-mdy/Dr-Note (issues, project board)
- **Project ID:** PVT_kwHOAOdsvc4BdB7j

---

## Project Status

### ✅ Done

| Task | Issue |
|------|-------|
| Supabase Auth: email/password login + logout + session | #16 |
| RBAC: roles/permissions tables wired + RLS policies | #17 |
| Protected routes + role-based navigation/middleware | #18 |
| Admin user management screen | #19 |
| Clinical notes: typed notes during consult (doctor) | #32 |
| Project restructure: move app to `app/`, consolidate docs | PR #47 |
| Supabase configured: MCP connected, schema + seed data verified live in project `irqkiyqpymeezboppkwh` | — |

### 🔄 In Progress

| Task | Issue | Priority |
|------|-------|----------|
| Scaffold Next.js 14 app + repo structure + branch strategy | #11 | 🔴 demo-blocker |
| Seed data: roles, permissions, diagnosis catalog, demo users | #15 | 🔴 demo-blocker |
| Diagnosis entry: catalog picker + visit diagnoses | #33 | 🔴 demo-blocker |
| Prescription + prescription items (doctor) | #34 | 🔴 demo-blocker |
| Production release: prod env config, public URL, deployed smoke test | #40 | 🔴 demo-blocker |

### 📋 Backlog

| Task | Issue | Epic |
|------|-------|------|
| Attachments: upload files to a visit (Supabase Storage) | #36 | Record Taking |
| Patient registration form (demographics) | — | User Registration |
| Staff onboarding: create doctor/nurse/receptionist accounts | — | User Registration |
| Patient profile page (view/edit) | — | User Registration |
| Emergency contacts (add/edit/remove on patient profile) | — | User Registration |
| Visit creation flow (receptionist) | — | Record Taking |
| Visit status workflow + patient queue view | — | Record Taking |
| Screening form: vitals (nurse) | — | Record Taking |
| Role-based access to history | — | History Management |
| Patient & visit search + filters | — | History Management |
| Test plan + manual demo checklist | — | Testing |
| E2E happy-path test | — | Testing |
| Demo script + demo data walkthrough (15 Jul) | — | Testing |

---

## Epics

| Epic | Issue | Status |
|------|-------|--------|
| Infra, CI/CD & Database Setup | #6 | 🔄 In Progress |
| Auth & User Management | #7 | ✅ Done |
| Record Taking (Visit, Screening, Diagnosis, Prescription) | #9 | 🔄 In Progress |
| User Registration (Patient, Staff, Admin) | — | 📋 Backlog |
| History Management (role-based access) | — | 📋 Backlog |

---

## Recent PRs

| PR | Title | Status |
|----|-------|--------|
| #47 | chore(project-restructure): consolidate docs, remove legacy code | ✅ Open |

---

## Documents

| Document | Location |
|----------|----------|
| PRD | `docs/02-PRD.md` |
| Architecture | `docs/12-Architecture.md` |
| ERD / Database Schema | `docs/13-ERD.md` |
| Database Schema (PM) | `docs/guide/01-database-schema.md` |
| Architecture Guide (PM) | `docs/guide/02-architecture.md` |
| Design System (PM) | `docs/guide/03-design-system.md` |
| Branch Protection | `docs/guide/06-branch-protection.md` |
| Developer Workflow | `docs/developer-workflow.md` |
| QA Report | `docs/26-QA-Report.md` |
