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
| Patient registration form (demographics) — RLS applied + verified live end-to-end; see `docs/24-Security-Report.md` | #20 |
| Patient activation + set-password flow: patients now `is_active` on registration, confirm their email via `/auth/confirm`, and set their own password at `/set-password`. Note: patients still cannot log in through `/login` after this — no patient dashboard exists yet (see `docs/24-Security-Report.md`) | — |
| Staff onboarding: admin creates doctor/nurse/receptionist/admin accounts at `/admin/staff/new`; temp password shown once; reviewer + QA passed (5/5 acceptance criteria) — merged via PR #54 | #21 |
| Password generator entropy hardening: switched temp password index selection to `crypto.randomInt` to remove modulo bias; added unit tests and refreshed review/QA/security reports | — |
| Visit status workflow + patient queue view — PR #64 | #25 |


### 🔄 In Progress

| Task | Issue | Priority |
|------|-------|----------|
| Production release: prod env config, public URL, deployed smoke test | #40 | 🔴 demo-blocker |

### 📋 Backlog

| Task | Issue | Epic |
|------|-------|------|
| Attachments: upload files to a visit (Supabase Storage) | #36 | Record Taking |
| Screening form: vitals (nurse) | #26 | Record Taking |
| Role-based access to history | #27 | History Management |
| Patient & visit search + filters | #28 | History Management |
| Test plan + manual demo checklist | #29 | Testing |
| E2E happy-path test | #30 | Testing |
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
| #64 | feat(queue): add visit status workflow and patient queue view (#25) | ✅ Open |
| #63 | fix(next-task): spawn developer agent for implementation step | ✅ Open |
| #62 | feat(visit): add visit creation flow for receptionist (#24) | ✅ Open |
| #61 | feat(pages): implement list pages with pagination | ✅ Open |
| #60 | feat(prescription): add prescription form with dynamic items (#34) | ✅ Open |
| #59 | feat(consult): add diagnosis entry with catalog picker (#33) | ✅ Open |
| #57 | chore(security): harden temp password entropy and refresh review/qa reports | ✅ Open |
| #54 | feat(staff): staff onboarding — admin creates doctor/nurse/receptionist accounts (#21) | ✅ Merged |
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
