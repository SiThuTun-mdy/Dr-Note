# Sprint Backlog

**Project:** Doctor Note MVP
**Sprint Duration:** 2 weeks (10 working days)
**Sprint Start:** 2026-07-08
**Sprint End:** 2026-07-21
**Scrum Master:** Agent
**Total Estimated Effort:** 8.0 days (of 10 available)

---

## Table of Contents

1. [Sprint Goal](#sprint-goal)
2. [Definition of Done](#definition-of-done)
3. [Sprint Backlog](#sprint-backlog)
4. [Task Breakdown](#task-breakdown)
5. [Dependency Map](#dependency-map)
6. [Risk Register](#risk-register)
7. [Daily Plan](#daily-plan)

---

## Sprint Goal

Deliver a fully functional Doctor Note MVP that enables clinic staff to authenticate, manage doctors and patients, create consultation notes, view patient history, generate a dashboard, and export consultation PDFs. All Must-Have features must be complete and deployed. Should-Have features should be completed if capacity permits.

---

## Definition of Done

### User Story Definition of Done

A user story is considered **DONE** when ALL of the following are true:

- [ ] All acceptance criteria from the PRD are met
- [ ] Code is implemented following the architecture document (folder structure, server actions, RLS patterns)
- [ ] All server actions have proper authentication checks (`supabase.auth.getUser()`)
- [ ] All server actions have role-based permission validation (defense in depth alongside RLS)
- [ ] Supabase RLS policies are written and enforced for all relevant tables
- [ ] UI components use shadcn/ui and Tailwind CSS consistently
- [ ] Forms use React Hook Form with Zod validation schemas
- [ ] Error handling is implemented (user-facing error messages, no raw error dumps)
- [ ] TypeScript types are defined in `lib/types/database.ts` and used throughout
- [ ] No console errors or warnings in browser dev tools
- [ ] Feature works correctly for all three roles (Admin, Doctor, Receptionist) where applicable
- [ ] Code has been reviewed (self-review or peer review)
- [ ] Feature has been manually tested end-to-end
- [ ] No Critical or High severity bugs remain

### Task Definition of Done

A task is considered **DONE** when:

- [ ] Implementation is complete and functional
- [ ] Code follows the established patterns (server actions, component structure)
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Linting passes (`npm run lint`)
- [ ] Feature is testable in isolation
- [ ] Commit message follows conventional format: `feat(scope): description` or `fix(scope): description`

---

## Sprint Backlog

### Priority Order

| Priority | User Stories | Total Estimate |
|----------|-------------|----------------|
| **Must Have** | US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008 | 6.5 days |
| **Should Have** | US-009, US-010 | 1.5 days |
| **Could Have** | None in scope | 0 days |
| **Won't Have** | AI summary, Voice dictation, Dark mode, Billing, Scheduling | N/A |

### User Stories

| ID | Title | Priority | Estimate | Dependencies | Status |
|----|-------|----------|----------|--------------|--------|
| US-001 | Authentication | Must | 0.5d | None | To Do |
| US-002 | Role-Based Access Control | Must | 1.0d | US-001 | To Do |
| US-003 | Doctor Management | Must | 1.0d | US-001, US-002 | To Do |
| US-004 | Patient Registration | Must | 1.0d | US-001, US-002 | To Do |
| US-005 | Patient Search | Must | 0.5d | US-004 | To Do |
| US-006 | Patient Profile View | Must | 0.5d | US-004, US-007 | To Do |
| US-007 | Consultation Notes | Must | 1.5d | US-004, US-002 | To Do |
| US-008 | Patient History | Must | 0.5d | US-007 | To Do |
| US-009 | Dashboard | Should | 0.5d | US-003, US-004, US-007 | To Do |
| US-010 | PDF Export | Should | 1.0d | US-007 | To Do |

**Must-Have Total:** 6.5 days
**Should-Have Total:** 1.5 days
**Sprint Total:** 8.0 days (buffer: 2.0 days)

---

## Task Breakdown

### US-001: Authentication (0.5 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-001 | Initialize Next.js project with TypeScript, Tailwind CSS, and App Router | 1.0h | Project setup |
| TASK-002 | Install and configure Supabase client libraries (`@supabase/ssr`, `@supabase/supabase-js`) | 1.0h | Project setup |
| TASK-003 | Create Supabase client files (`lib/supabase/client.ts`, `lib/supabase/server.ts`) | 1.0h | AC-001 |
| TASK-004 | Create `.env.local` with Supabase URL and anon key | 0.5h | Project setup |
| TASK-005 | Implement Next.js middleware for auth redirect (unauthenticated -> `/login`, authenticated -> `/dashboard`) | 1.5h | AC-001.7 |
| TASK-006 | Build login page UI (`app/(auth)/login/page.tsx`) with email/password form | 1.5h | AC-001.1 |
| TASK-007 | Implement `login` server action (`app/actions/auth.ts`) | 1.0h | AC-001.2, AC-001.3 |
| TASK-008 | Implement `logout` server action and logout button in header | 1.0h | AC-001.5 |
| TASK-009 | Implement `getUserProfile` server action | 1.0h | AC-001.6 |
| TASK-010 | Test login/logout flow end-to-end with Supabase | 0.5h | All ACs |

**Total Tasks:** 10 | **Estimated Hours:** ~9h (1.1 days)
**Note:** TASK-001 through TASK-005 are foundational and benefit all subsequent stories.

---

### US-002: Role-Based Access Control (1.0 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-011 | Create database migration file for `users` table with role CHECK constraint | 1.0h | AC-002.1 |
| TASK-012 | Create database migration for `doctors`, `patients`, `consultations` tables | 1.5h | Schema setup |
| TASK-013 | Create Supabase helper functions (`get_user_role()`, `is_admin()`, `is_doctor()`, `is_receptionist()`) | 1.0h | RLS setup |
| TASK-014 | Write RLS policies for `users` table | 1.0h | AC-002.5 |
| TASK-015 | Write RLS policies for `doctors` table | 0.5h | AC-002.2 |
| TASK-016 | Write RLS policies for `patients` table | 1.0h | AC-002.3, AC-002.4 |
| TASK-017 | Write RLS policies for `consultations` table | 1.5h | AC-002.2, AC-002.3, AC-002.4 |
| TASK-018 | Create `handle_new_user()` trigger function for auto-creating user profile | 1.0h | User setup |
| TASK-019 | Create seed script (`scripts/seed.ts`) with admin, doctor, receptionist users | 1.5h | Testing setup |
| TASK-020 | Create TypeScript types file (`lib/types/database.ts`) | 1.0h | Type safety |

**Total Tasks:** 10 | **Estimated Hours:** ~10h (1.25 days)

---

### US-003: Doctor Management (1.0 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-021 | Create `lib/validations/doctor.ts` Zod schema for doctor form validation | 0.5h | AC-003.6 |
| TASK-022 | Implement `getDoctors` server action with search filter | 1.0h | AC-003.3, AC-003.6 |
| TASK-023 | Implement `createDoctor` server action with role check | 1.0h | AC-003.1 |
| TASK-024 | Implement `updateDoctor` server action with role check | 0.5h | AC-003.2 |
| TASK-025 | Implement `deleteDoctor` server action with role check | 0.5h | AC-003.4 |
| TASK-026 | Build `components/doctors/doctor-form.tsx` (create/edit form) | 1.5h | AC-003.1, AC-003.2 |
| TASK-027 | Build `components/doctors/doctor-table.tsx` (list with search) | 1.5h | AC-003.3, AC-003.6 |
| TASK-028 | Build `components/doctors/doctor-search.tsx` search input | 0.5h | AC-003.6 |
| TASK-029 | Create `app/(dashboard)/doctors/page.tsx` doctor list page | 1.0h | AC-003.3 |
| TASK-030 | Create `app/(dashboard)/doctors/new/page.tsx` create doctor page | 0.5h | AC-003.1 |
| TASK-031 | Create `app/(dashboard)/doctors/[id]/page.tsx` view doctor page | 0.5h | AC-003.3 |
| TASK-032 | Create `app/(dashboard)/doctors/[id]/edit/page.tsx` edit doctor page | 0.5h | AC-003.2 |
| TASK-033 | Add delete confirmation dialog component | 0.5h | AC-003.4 |

**Total Tasks:** 13 | **Estimated Hours:** ~10h (1.25 days)

---

### US-004: Patient Registration (1.0 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-034 | Create `lib/validations/patient.ts` Zod schema with email uniqueness, phone validation | 1.0h | AC-004.3, AC-004.4, AC-004.5 |
| TASK-035 | Implement `getPatients` server action | 0.5h | Patient list |
| TASK-036 | Implement `createPatient` server action with role check (admin + receptionist) | 1.0h | AC-004.1, AC-004.7 |
| TASK-037 | Implement `updatePatient` server action | 0.5h | Patient edit |
| TASK-038 | Implement `deletePatient` server action (admin only) | 0.5h | Patient delete |
| TASK-039 | Build `components/patients/patient-form.tsx` (create/edit form) | 1.5h | AC-004.1, AC-004.2 |
| TASK-040 | Build `components/patients/patient-table.tsx` (list view) | 1.0h | Patient list |
| TASK-041 | Create `app/(dashboard)/patients/page.tsx` patient list page | 1.0h | Patient list |
| TASK-042 | Create `app/(dashboard)/patients/new/page.tsx` registration page | 0.5h | AC-004.1 |
| TASK-043 | Create `app/(dashboard)/patients/[id]/page.tsx` patient profile page (stub) | 0.5h | AC-004.6 |
| TASK-044 | Create `app/(dashboard)/patients/[id]/edit/page.tsx` edit patient page | 0.5h | Patient edit |

**Total Tasks:** 11 | **Estimated Hours:** ~8.5h (1.06 days)

---

### US-005: Patient Search (0.5 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-045 | Implement `searchPatients` server action (ILIKE on name, exact on email, exact on ID) | 1.5h | AC-005.2, AC-005.3, AC-005.4 |
| TASK-046 | Build `components/patients/patient-search.tsx` search input with debounce | 1.0h | AC-005.1 |
| TASK-047 | Integrate search into patient list page with real-time filtering | 1.0h | AC-005.5, AC-005.6, AC-005.7 |
| TASK-048 | Test search performance (must return in under 1 second) | 0.5h | AC-005.6 |

**Total Tasks:** 4 | **Estimated Hours:** ~4h (0.5 days)

---

### US-006: Patient Profile View (0.5 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-049 | Implement `getPatient` server action returning patient with demographics | 1.0h | AC-006.1 |
| TASK-050 | Build `components/patients/patient-profile.tsx` (demographics card) | 1.0h | AC-006.1 |
| TASK-051 | Build `components/patients/patient-history.tsx` (consultation timeline stub) | 1.0h | AC-006.2, AC-006.3 |
| TASK-052 | Update `app/(dashboard)/patients/[id]/page.tsx` with profile and history sections | 1.0h | AC-006.4, AC-006.6 |
| TASK-053 | Add role-based visibility (hide consultation notes for receptionists) | 0.5h | AC-006.5 |

**Total Tasks:** 5 | **Estimated Hours:** ~4.5h (0.56 days)
**Note:** Consultation history will be populated by US-007 and US-008.

---

### US-007: Consultation Notes (1.5 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-054 | Create `lib/validations/consultation.ts` Zod schema (diagnosis required if prescription provided) | 1.0h | AC-007.9 |
| TASK-055 | Implement `getConsultations` server action (filtered by role) | 1.0h | Consultation list |
| TASK-056 | Implement `getConsultation` server action | 0.5h | AC-007.4 |
| TASK-057 | Implement `createConsultation` server action with doctor_id linking | 1.5h | AC-007.1, AC-007.2, AC-007.3, AC-007.4, AC-007.5, AC-007.6 |
| TASK-058 | Implement `updateConsultation` server action with ownership check | 1.0h | AC-007.7, AC-007.8 |
| TASK-059 | Build `components/consultations/consultation-form.tsx` (create/edit form) | 2.0h | AC-007.1, AC-007.2, AC-007.3 |
| TASK-060 | Build `components/consultations/consultation-table.tsx` (list view) | 1.0h | Consultation list |
| TASK-061 | Build `components/consultations/consultation-detail.tsx` (detail view) | 1.5h | AC-007.4 |
| TASK-062 | Create `app/(dashboard)/patients/[id]/consultations/new/page.tsx` (create consultation) | 1.0h | AC-007.1 |
| TASK-063 | Create `app/(dashboard)/consultations/page.tsx` consultation list page | 0.5h | Consultation list |
| TASK-064 | Create `app/(dashboard)/consultations/[id]/page.tsx` consultation detail page | 0.5h | AC-007.4 |
| TASK-065 | Create `app/(dashboard)/consultations/[id]/edit/page.tsx` edit consultation page | 0.5h | AC-007.7 |
| TASK-066 | Add ownership enforcement (UI hides edit for non-owner consultations) | 0.5h | AC-007.8 |

**Total Tasks:** 13 | **Estimated Hours:** ~12.5h (1.56 days)

---

### US-008: Patient History (0.5 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-067 | Implement `getPatientHistory` server action (reverse chronological, filtered by role) | 1.0h | AC-008.1, AC-008.2, AC-008.3 |
| TASK-068 | Update `components/patients/patient-history.tsx` to display real consultation data | 1.5h | AC-008.2, AC-008.3 |
| TASK-069 | Add role-based history visibility (admin: all, doctor: own patients, receptionist: no notes) | 1.0h | AC-008.4, AC-008.5, AC-008.6 |
| TASK-070 | Test history view for all three roles | 0.5h | All ACs |

**Total Tasks:** 4 | **Estimated Hours:** ~4h (0.5 days)

---

### US-009: Dashboard (0.5 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-071 | Implement `getDashboardStats` server action (total patients, doctors, today's consultations, recent 5) | 1.5h | AC-009.2, AC-009.3, AC-009.4, AC-009.5, AC-009.6 |
| TASK-072 | Build `components/dashboard/stats-cards.tsx` (4 stat cards) | 1.0h | AC-009.2, AC-009.3, AC-009.4 |
| TASK-073 | Build `components/dashboard/recent-consultations.tsx` (last 5 list) | 1.0h | AC-009.5 |
| TASK-074 | Create `app/(dashboard)/dashboard/page.tsx` with stats and recent consultations | 1.0h | AC-009.1 |
| TASK-075 | Make dashboard layout responsive for desktop and tablet | 0.5h | AC-009.7 |

**Total Tasks:** 5 | **Estimated Hours:** ~5h (0.63 days)

---

### US-010: PDF Export (1.0 days)

| Task ID | Task Title | Estimate | Acceptance Criteria Reference |
|---------|-----------|----------|------------------------------|
| TASK-076 | Install `@react-pdf/renderer` package | 0.5h | Project setup |
| TASK-077 | Build `components/consultations/consultation-pdf.tsx` PDF template (patient info, consultation details, footer) | 3.0h | AC-010.1, AC-010.2, AC-010.3, AC-010.4 |
| TASK-078 | Add PDF export button to `consultation-detail.tsx` | 0.5h | AC-010.1 |
| TASK-079 | Implement PDF download trigger (browser download on click) | 1.0h | AC-010.7 |
| TASK-080 | Test PDF generation performance (must be under 3 seconds) and A4 formatting | 0.5h | AC-010.5, AC-010.6 |

**Total Tasks:** 5 | **Estimated Hours:** ~5.5h (0.69 days)

---

## Task Summary

| User Story | Task Count | Estimated Hours | Estimated Days |
|-----------|------------|-----------------|----------------|
| US-001: Authentication | 10 | ~9h | 1.1d |
| US-002: RBAC | 10 | ~10h | 1.25d |
| US-003: Doctor Management | 13 | ~10h | 1.25d |
| US-004: Patient Registration | 11 | ~8.5h | 1.06d |
| US-005: Patient Search | 4 | ~4h | 0.5d |
| US-006: Patient Profile | 5 | ~4.5h | 0.56d |
| US-007: Consultation Notes | 13 | ~12.5h | 1.56d |
| US-008: Patient History | 4 | ~4h | 0.5d |
| US-009: Dashboard | 5 | ~5h | 0.63d |
| US-010: PDF Export | 5 | ~5.5h | 0.69d |
| **TOTAL** | **80** | **~73h** | **~9.1d** |

---

## Dependency Map

```
US-001 (Auth)
  |
  +---> US-002 (RBAC)
  |       |
  |       +---> US-003 (Doctor Mgmt) ----+
  |       |                               |
  |       +---> US-004 (Patient Reg) ---+ |
  |       |                              | |
  |       |       +---> US-005 (Search)  | |
  |       |       |                     | |
  |       |       +---> US-006 (Profile)+ |
  |       |              (needs US-007)   |
  |       |                              |
  |       +---> US-007 (Consultation) <--+
  |               |
  |               +---> US-008 (History)
  |               |
  |               +---> US-009 (Dashboard) [also needs US-003, US-004]
  |               |
  |               +---> US-010 (PDF Export)
```

**Critical Path:** US-001 -> US-002 -> US-004 -> US-007 -> US-008/US-009/US-010

---

## Risk Register

| ID | Risk | Severity | Likelihood | Impact | Mitigation |
|----|------|----------|------------|--------|------------|
| SR-001 | RLS policy bugs expose patient data | High | Medium | Data breach | Test every RLS policy with every role on Day 2. Include in QA checklist. |
| SR-002 | 2-week timeline is aggressive | High | Medium | Incomplete MVP | Strict MoSCoW. Dashboard and PDF are Should-Have -- cut first if behind schedule. |
| SR-003 | Supabase free tier limits | Medium | Low | Throttling | Acceptable for MVP. Document limits. |
| SR-004 | Server Action errors are not user-friendly | Medium | High | Poor UX | Implement consistent error handling pattern. Use try/catch in every action. |
| SR-005 | PDF generation performance on serverless | Low | Medium | Slow exports | Use client-side @react-pdf/renderer. No serverless PDF needed. |
| SR-006 | Consultation edit ownership enforcement gap | High | Medium | Doctors editing other doctors' notes | RLS policy prevents at DB level. Add client-side check as defense in depth. |

---

## Daily Plan

### Day 1 (2026-07-08): Project Setup + Authentication

**Focus:** Foundation scaffolding and auth flow

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-001 | Initialize Next.js project with TypeScript, Tailwind CSS, and App Router | 1.0h |
| TASK-002 | Install and configure Supabase client libraries | 1.0h |
| TASK-003 | Create Supabase client files | 1.0h |
| TASK-004 | Create `.env.local` with Supabase credentials | 0.5h |
| TASK-005 | Implement Next.js middleware for auth redirect | 1.5h |
| TASK-006 | Build login page UI | 1.5h |
| TASK-007 | Implement `login` server action | 1.0h |
| TASK-008 | Implement `logout` server action and logout button | 1.0h |
| TASK-009 | Implement `getUserProfile` server action | 1.0h |
| TASK-010 | Test login/logout flow end-to-end | 0.5h |

**Blockers:** Supabase project must be created and credentials available. GitHub repo & project board must be set up first.
**Deliverable:** Working login/logout with Supabase Auth.

---

### Day 2 (2026-07-09): Database Schema + RLS Policies

**Focus:** Database tables, RLS policies, seed data

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-011 | Create database migration for `users` table | 1.0h |
| TASK-012 | Create database migration for `doctors`, `patients`, `consultations` tables | 1.5h |
| TASK-013 | Create Supabase helper functions | 1.0h |
| TASK-014 | Write RLS policies for `users` table | 1.0h |
| TASK-015 | Write RLS policies for `doctors` table | 0.5h |
| TASK-016 | Write RLS policies for `patients` table | 1.0h |
| TASK-017 | Write RLS policies for `consultations` table | 1.5h |
| TASK-018 | Create `handle_new_user()` trigger function | 1.0h |
| TASK-019 | Create seed script with test users | 1.5h |
| TASK-020 | Create TypeScript types file | 1.0h |

**Blockers:** Supabase project must be accessible for running migrations.
**Deliverable:** All tables created, RLS enforced, seed data ready for testing.
**Milestone:** M1: Auth + DB Schema complete.

---

### Day 3 (2026-07-10): Doctor Management

**Focus:** Admin CRUD for doctors

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-021 | Create doctor Zod validation schema | 0.5h |
| TASK-022 | Implement `getDoctors` server action | 1.0h |
| TASK-023 | Implement `createDoctor` server action | 1.0h |
| TASK-024 | Implement `updateDoctor` server action | 0.5h |
| TASK-025 | Implement `deleteDoctor` server action | 0.5h |
| TASK-026 | Build doctor form component | 1.5h |
| TASK-027 | Build doctor table component | 1.5h |
| TASK-028 | Build doctor search component | 0.5h |
| TASK-029 | Create doctor list page | 1.0h |
| TASK-030 | Create create doctor page | 0.5h |
| TASK-031 | Create view doctor page | 0.5h |
| TASK-032 | Create edit doctor page | 0.5h |
| TASK-033 | Add delete confirmation dialog | 0.5h |

**Blockers:** Day 2 must be complete (RLS policies for doctors table).
**Deliverable:** Full doctor CRUD for admin users.

---

### Day 4 (2026-07-11): Patient Registration

**Focus:** Patient CRUD and registration

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-034 | Create patient Zod validation schema | 1.0h |
| TASK-035 | Implement `getPatients` server action | 0.5h |
| TASK-036 | Implement `createPatient` server action | 1.0h |
| TASK-037 | Implement `updatePatient` server action | 0.5h |
| TASK-038 | Implement `deletePatient` server action | 0.5h |
| TASK-039 | Build patient form component | 1.5h |
| TASK-040 | Build patient table component | 1.0h |
| TASK-041 | Create patient list page | 1.0h |
| TASK-042 | Create registration page | 0.5h |
| TASK-043 | Create patient profile page (stub) | 0.5h |
| TASK-044 | Create edit patient page | 0.5h |

**Blockers:** Day 2 must be complete (RLS policies for patients table).
**Deliverable:** Full patient registration for admin and receptionist.

---

### Day 5 (2026-07-12): Patient Search + Profile View

**Focus:** Patient search and profile display

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-045 | Implement `searchPatients` server action | 1.5h |
| TASK-046 | Build patient search component | 1.0h |
| TASK-047 | Integrate search into patient list page | 1.0h |
| TASK-048 | Test search performance | 0.5h |
| TASK-049 | Implement `getPatient` server action | 1.0h |
| TASK-050 | Build patient profile component | 1.0h |
| TASK-051 | Build patient history component (stub) | 1.0h |
| TASK-052 | Update patient profile page with profile and history | 1.0h |
| TASK-053 | Add role-based visibility for consultation notes | 0.5h |

**Blockers:** Day 4 must be complete (patient data in database).
**Deliverable:** Patient search works, patient profile displays demographics and consultation stubs.
**Milestone:** M2: Doctor + Patient CRUD complete.

---

### Day 6 (2026-07-13): Consultation Notes (Create)

**Focus:** Consultation creation flow

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-054 | Create consultation Zod validation schema | 1.0h |
| TASK-055 | Implement `getConsultations` server action | 1.0h |
| TASK-056 | Implement `getConsultation` server action | 0.5h |
| TASK-057 | Implement `createConsultation` server action | 1.5h |
| TASK-059 | Build consultation form component | 2.0h |
| TASK-060 | Build consultation table component | 1.0h |
| TASK-062 | Create create consultation page | 1.0h |
| TASK-063 | Create consultation list page | 0.5h |

**Blockers:** Day 4 must be complete (patients exist in database).
**Deliverable:** Doctors can create consultation notes for patients.

---

### Day 7 (2026-07-14): Consultation Notes (Edit + View) + Patient History

**Focus:** Consultation edit, detail view, and patient history

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-058 | Implement `updateConsultation` server action | 1.0h |
| TASK-061 | Build consultation detail component | 1.5h |
| TASK-064 | Create consultation detail page | 0.5h |
| TASK-065 | Create edit consultation page | 0.5h |
| TASK-066 | Add ownership enforcement (UI) | 0.5h |
| TASK-067 | Implement `getPatientHistory` server action | 1.0h |
| TASK-068 | Update patient history component with real data | 1.5h |
| TASK-069 | Add role-based history visibility | 1.0h |
| TASK-070 | Test history view for all roles | 0.5h |

**Blockers:** Day 6 must be complete (consultation creation works).
**Deliverable:** Full consultation CRUD with ownership enforcement, patient history populated.
**Milestone:** M3: Consultation Notes complete.

---

### Day 8 (2026-07-15): Dashboard + PDF Export

**Focus:** Dashboard stats and PDF generation

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| TASK-071 | Implement `getDashboardStats` server action | 1.5h |
| TASK-072 | Build stats cards component | 1.0h |
| TASK-073 | Build recent consultations component | 1.0h |
| TASK-074 | Create dashboard page | 1.0h |
| TASK-075 | Make dashboard responsive | 0.5h |
| TASK-076 | Install @react-pdf/renderer | 0.5h |
| TASK-077 | Build PDF template component | 3.0h |
| TASK-078 | Add PDF export button to consultation detail | 0.5h |
| TASK-079 | Implement PDF download trigger | 1.0h |
| TASK-080 | Test PDF generation performance | 0.5h |

**Blockers:** Days 3-7 must be complete (doctors, patients, consultations exist).
**Deliverable:** Dashboard shows stats, PDF export works for consultations.
**Milestone:** M4: Dashboard + PDF complete.

---

### Day 9 (2026-07-16): Integration + Bug Fixes

**Focus:** End-to-end flow testing, bug fixes, edge cases

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| -- | End-to-end testing: Admin flow (login, manage doctors, view patients, view consultations) | 2.0h |
| -- | End-to-end testing: Doctor flow (login, view patients, create/edit consultation, export PDF) | 2.0h |
| -- | End-to-end testing: Receptionist flow (login, register patients, view profile, search) | 1.5h |
| -- | Fix any bugs discovered during testing | 2.0h |
| -- | Edge case handling (empty states, error states, loading states) | 1.0h |

**Blockers:** All features must be implemented.
**Deliverable:** All flows work end-to-end for all three roles.

---

### Day 10 (2026-07-17): QA + Release

**Focus:** Final QA, security review, deployment

| Task ID | Task Title | Est. Hours |
|---------|-----------|------------|
| -- | Security review: RLS policies tested with all roles | 2.0h |
| -- | Security review: No service role key in client code | 0.5h |
| -- | QA checklist execution | 2.0h |
| -- | Deploy to Vercel | 1.0h |
| -- | Smoke test on deployed environment | 1.0h |
| -- | Update documentation (README, setup instructions) | 1.0h |

**Blockers:** All features must be complete and bug-free.
**Deliverable:** MVP deployed to Vercel, documentation updated.
**Milestone:** M5: QA + Release complete.

---

## Acceptance Checklist (Sprint Review)

### Must-Have Features Verification

- [ ] User can log in with email/password (US-001)
- [ ] User can log out (US-001)
- [ ] Admin can add/edit/delete doctors (US-003)
- [ ] Receptionist can register patients (US-004)
- [ ] Doctor can create consultation notes (US-007)
- [ ] Doctor can edit own consultations only (US-007)
- [ ] User can view patient history (US-008)
- [ ] User can export consultation PDF (US-010)
- [ ] Role-based access enforced at UI and RLS level (US-002)
- [ ] Patient search works by name, email, and ID (US-005)

### Should-Have Features Verification

- [ ] Dashboard shows clinic statistics (US-009)
- [ ] Dashboard is responsive on desktop and tablet (US-009)
- [ ] PDF generates in under 3 seconds (US-010)
- [ ] PDF is A4 formatted (US-010)

---

## Notes

1. **Buffer Time:** 2.0 days of buffer built into the sprint (8.0 estimated vs 10.0 available). This accounts for unexpected bugs, integration issues, or scope adjustments.

2. **Should-Have Prioritization:** If the team falls behind schedule, US-009 (Dashboard) and US-010 (PDF Export) can be deferred to a follow-up sprint without impacting core MVP functionality.

3. **Seed Data:** The seed script (TASK-019) is critical for testing. It should create:
   - 1 Admin user
   - 2 Doctor users (with doctor profiles)
   - 1 Receptionist user
   - 5-10 sample patients
   - 10-15 sample consultations

4. **Testing Strategy:** Manual testing is sufficient for MVP. Each role should be tested independently to verify RLS policies work correctly.

5. **Deployment:** Vercel deployment should happen on Day 10 after all QA is complete. Environment variables must be configured in Vercel dashboard.
