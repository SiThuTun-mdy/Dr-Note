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
| Patient profile page (view/edit): patient detail view now loads from Supabase, includes editable profile data, and shows a read-only visit history table with sorting, filtering, and pagination | #22 |
| Emergency contacts on patient profile: add/edit/remove contact management is wired into the patient detail flow with server-side persistence and safe error handling | #23 |
| Password generator entropy hardening: switched temp password index selection to `crypto.randomInt` to remove modulo bias; added unit tests and refreshed review/QA/security reports | — |
| Diagnosis entry: catalog picker + visit diagnoses — PR #59 | #33 |
| Prescription + prescription items (doctor) — PR #60 | #34 |
| Visit creation flow (receptionist) — PR #62 | #24 |
| Visit status workflow + patient queue view — PR #64 | #25 |
| DataTable: reusable search + pagination component; applied to Queue & Admin Users tables | — |
| RLS fix: widen users_select to allow patients.read (patient search in visit creation) | — |
| File attachments: upload/download/delete for visits (Supabase Storage) — PR #65 | #36 |
| Screening form: vitals (nurse) — PR #65 | #26 |
| Visit summary: printable view with vitals, diagnoses, prescriptions — PR #65 | #35 |

### 📐 Standard Requirements
> **All tables must use `<DataTable>` with search and pagination.** New list/table pages must integrate the reusable `DataTable` component (`src/components/ui/data-table.tsx`) which provides client-side search and pagination out of the box. Pass `searchKeys` for columns to search, `pageSize` for rows per page, and `filters` slot for dropdowns.


### 🔄 In Progress

| Task | Issue | Priority |
|------|-------|----------|
| Production release: prod env config, public URL, deployed smoke test | #40 | 🔴 demo-blocker |
| Staff profile feature: review + QA completed, blocked by High RLS defect (`staff_profiles_update` self-update bypass) | — | 🔴 security-blocker |

### 📋 Backlog

| Task | Issue | Epic |
|------|-------|------|
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
