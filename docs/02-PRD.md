# Product Requirements Document (PRD)

**Project:** Doctor Note MVP
**Version:** 1.0.0
**Status:** Approved
**Owner:** Product Manager Agent
**Last Updated:** 2026-07-08

---

## Table of Contents

1. [Vision](#vision)
2. [Problem Statement](#problem-statement)
3. [Personas](#personas)
4. [User Stories](#user-stories)
5. [MVP Scope](#mvp-scope)
6. [Acceptance Criteria](#acceptance-criteria)
7. [Roadmap](#roadmap)
8. [Risks](#risks)
9. [Assumptions](#assumptions)
10. [Glossary](#glossary)

---

## Vision

Build a lightweight web application for small clinics to manage doctors, patients, consultation notes, and patient history digitally. The application eliminates paper-based record keeping, making patient information searchable, organized, and accessible to authorized clinic staff.

### Vision Statement

> Empower small clinics to transition from paper-based patient records to a fast, secure digital system that saves time, reduces errors, and improves patient care through instant access to consultation history.

### Key Objectives

- **Digitize patient records** -- Replace paper notes and spreadsheets with a structured digital system
- **Speed up patient lookup** -- Enable instant search by name, email, or ID
- **Maintain audit trail** -- Track who accessed or modified patient data and when
- **Enforce access control** -- Ensure only authorized roles see relevant data
- **Enable PDF export** -- Allow doctors to export consultation notes for printing or sharing

---

## Problem Statement

Small clinics typically rely on paper notes, physical filing systems, or spreadsheets to manage patient records. This creates several problems:

- Patient history is difficult to search across visits
- Paper records can be lost, damaged, or misfiled
- Multiple staff members cannot access the same record simultaneously
- No audit trail exists for who accessed or modified records
- Exporting or sharing consultation notes requires manual transcription

---

## Personas

### Persona 1: Clinic Admin (Dr. Sarah)

| Attribute | Detail |
|---|---|
| **Role** | Clinic Administrator |
| **Age** | 45 |
| **Tech Savvy** | Moderate -- uses email, basic web apps, spreadsheets |
| **Goal** | Manage clinic operations, ensure doctors are registered, oversee patient data |
| **Frustration** | Current paper system makes it impossible to quickly find a patient's history or generate reports |
| **Success Criteria** | Can register doctors, view all patient records, and manage clinic data from one place |

**Key Behaviors:**
- Logs in at the start of each business day
- Registers new doctors and manages existing doctor profiles
- Reviews patient records when needed for administrative purposes
- Needs full visibility across all clinic data

### Persona 2: Doctor (Dr. James)

| Attribute | Detail |
|---|---|
| **Role** | General Practitioner |
| **Age** | 38 |
| **Tech Savvy** | Moderate -- comfortable with web apps, prefers speed over features |
| **Goal** | Quickly access patient history, write consultation notes, export records |
| **Frustration** | Flipping through paper files to find previous visit notes wastes consultation time |
| **Success Criteria** | Can pull up patient history in seconds, write notes during or after consultation, and export a PDF |

**Key Behaviors:**
- Sees 15-25 patients per day
- Needs to reference previous consultations during current visits
- Writes consultation notes immediately after (or during) patient visits
- Occasionally needs to print or share consultation notes

### Persona 3: Receptionist (Priya)

| Attribute | Detail |
|---|---|
| **Role** | Front Desk Receptionist |
| **Age** | 28 |
| **Tech Savvy** | High -- comfortable with web apps and data entry |
| **Goal** | Register new patients quickly, look up existing patients, assist doctors with patient info |
| **Frustration** | Paper registration forms are slow, and finding existing patient files is unreliable |
| **Success Criteria** | Can register a patient in under 2 minutes, search for any patient instantly |

**Key Behaviors:**
- Registers new patients as they arrive
- Searches for existing patients when they check in
- Assists doctors by pulling up patient records
- Does not need access to consultation notes (clinical privacy)

---

## User Stories

### US-001: Authentication

**As a** clinic staff member,
**I want to** log in with my email and password,
**So that** I can securely access the application.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 0.5 days

**Acceptance Criteria:**
1. User can enter email and password on login screen
2. System validates credentials against Supabase Auth
3. Successful login redirects to dashboard
4. Failed login displays clear error message
5. User can log out from the dashboard
6. Session persists across page refreshes

### US-002: Role-Based Access Control

**As a** clinic admin,
**I want** the system to enforce role-based permissions,
**So that** each staff member only sees and does what their role allows.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 1 day

**Acceptance Criteria:**
1. Three roles exist: Admin, Doctor, Receptionist
2. Admin can perform full CRUD on doctors, patients, and consultations
3. Doctor can view patients, create/edit own consultations, view own patient history
4. Receptionist can perform full CRUD on patients, view doctors, view consultations (read-only)
5. Unauthorized actions are blocked at the UI and API level (RLS)
6. Role is displayed in the user profile/header

### US-003: Doctor Management

**As a** clinic admin,
**I want to** add, edit, and view doctors,
**So that** the clinic's doctor roster is maintained digitally.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 1 day

**Acceptance Criteria:**
1. Admin can create a new doctor with name and specialty
2. Admin can edit existing doctor details
3. Admin can view list of all doctors
4. Admin can delete a doctor (with confirmation)
5. Doctor name and specialty are required fields
6. List supports basic search/filter by name
7. Each doctor record is linked to a user account (user_id)

### US-004: Patient Registration

**As a** receptionist,
**I want to** register a new patient with their basic details,
**So that** the patient is in the system for future consultations.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 1 day

**Acceptance Criteria:**
1. Receptionist can create a new patient with name and email (required)
2. Optional fields: phone, date of birth, address
3. Email must be unique across all patients
4. Name cannot be empty
5. Phone format is validated if provided
6. Successful registration displays confirmation with patient record
7. Admin can also register patients

### US-005: Patient Search

**As a** doctor or receptionist,
**I want to** search for patients by name, email, or ID,
**So that** I can quickly find a patient's record.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 0.5 days

**Acceptance Criteria:**
1. Search bar is accessible from the patient list page
2. Search matches patient name (case-insensitive, partial match)
3. Search matches exact email
4. Search matches patient ID
5. Results display patient name, email, and phone
6. Search returns results in under 1 second
7. Empty search shows all patients

### US-006: Patient Profile View

**As a** doctor,
**I want to** view a patient's full profile including demographics and consultation history,
**So that** I have complete context before or during a consultation.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 0.5 days

**Acceptance Criteria:**
1. Patient profile shows: name, email, phone, date of birth, address
2. Profile shows consultation history sorted by date (newest first)
3. Each consultation entry shows: date, doctor name, brief note summary
4. Doctor can click into a consultation to view full details
5. Profile is read-only for doctors (edits handled by receptionist/admin)
6. Receptionists see patient profile without consultation notes

### US-007: Consultation Notes

**As a** doctor,
**I want to** create consultation notes for a patient visit,
**So that** the patient's medical history is digitally recorded.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 1.5 days

**Acceptance Criteria:**
1. Doctor can create a new consultation from the patient profile
2. Required fields: patient, notes (non-empty)
3. Optional fields: diagnosis, prescription, follow-up date
4. Consultation is linked to the creating doctor (doctor_id)
5. Consultation is linked to the patient (patient_id)
6. Timestamp is automatically recorded
7. Doctor can edit their own consultations
8. Doctor cannot edit consultations created by other doctors
9. Diagnosis is required if prescription is provided

### US-008: Patient History

**As a** doctor,
**I want to** view a chronological history of all consultations for a patient,
**So that** I can understand the patient's treatment trajectory.

**Priority:** Must Have (MoSCoW: Must)
**Estimate:** 0.5 days

**Acceptance Criteria:**
1. Patient history is accessible from the patient profile
2. History shows all consultations in reverse chronological order
3. Each entry shows: date, doctor name, notes, diagnosis
4. Doctor can view history for any patient they have treated
5. Admin can view history for all patients
6. Receptionists can view patient history (read-only, no consultation notes)

### US-009: Dashboard

**As a** clinic staff member,
**I want to** see a dashboard with key clinic statistics,
**So that** I have an at-a-glance view of clinic activity.

**Priority:** Should Have (MoSCoW: Should)
**Estimate:** 0.5 days

**Acceptance Criteria:**
1. Dashboard is the default landing page after login
2. Shows total patients count
3. Shows total doctors count
4. Shows today's consultations count
5. Shows recent consultations (last 5)
6. Stats update in real-time or on page load
7. Dashboard is responsive on desktop and tablet

### US-010: PDF Export

**As a** doctor,
**I want to** export a consultation note as a PDF,
**So that** I can print it for the patient or attach it to physical records.

**Priority:** Should Have (MoSCoW: Should)
**Estimate:** 1 day

**Acceptance Criteria:**
1. PDF export button is available on the consultation detail view
2. PDF includes: patient info (name, DOB, contact), consultation details (date, doctor, notes, diagnosis)
3. PDF includes a footer with generation date and clinic name
4. PDF is formatted for A4 paper size
5. PDF generates in under 3 seconds
6. PDF is downloadable via browser download

---

## MVP Scope

### In Scope (Must Have)

| ID | Feature | Priority | Estimate | Dependencies |
|---|---|---|---|---|
| US-001 | Authentication | Must | 0.5d | None |
| US-002 | Role-Based Access Control | Must | 1d | US-001 |
| US-003 | Doctor Management | Must | 1d | US-001, US-002 |
| US-004 | Patient Registration | Must | 1d | US-001, US-002 |
| US-005 | Patient Search | Must | 0.5d | US-004 |
| US-006 | Patient Profile View | Must | 0.5d | US-004, US-007 |
| US-007 | Consultation Notes | Must | 1.5d | US-004, US-002 |
| US-008 | Patient History | Must | 0.5d | US-007 |

**MVP Total Estimate:** 6.5 days

### Should Have (Post-MVP or End of Sprint 2)

| ID | Feature | Priority | Estimate | Dependencies |
|---|---|---|---|---|
| US-009 | Dashboard | Should | 0.5d | US-003, US-004, US-007 |
| US-010 | PDF Export | Should | 1d | US-007 |

**Should-Have Total Estimate:** 1.5 days

### Won't Have (Out of Scope)

- AI consultation summary
- Voice dictation
- Dark mode
- Billing and invoicing
- Appointment scheduling
- Insurance management
- Pharmacy integration
- Laboratory integration
- Mobile app
- Multi-clinic support

---

## Acceptance Criteria

### AC-001: User Authentication

- [ ] User can navigate to login page
- [ ] User enters valid email and password
- [ ] System authenticates via Supabase Auth
- [ ] Successful login redirects to `/dashboard`
- [ ] Failed login shows "Invalid email or password" message
- [ ] User can click logout to end session
- [ ] Unauthenticated users are redirected to login page

### AC-002: Role Enforcement

- [ ] Admin can access all CRUD operations on all entities
- [ ] Doctor can only create/edit own consultations
- [ ] Doctor cannot access admin-only pages
- [ ] Receptionist cannot create consultations
- [ ] Receptionist cannot see consultation notes content
- [ ] Supabase RLS policies enforce access at database level
- [ ] UI hides buttons/links for unauthorized actions

### AC-003: Doctor CRUD

- [ ] Admin can create a doctor with name (required) and specialty (required)
- [ ] Admin can edit doctor name and specialty
- [ ] Admin can view a table of all doctors
- [ ] Admin can delete a doctor with confirmation dialog
- [ ] Doctor list supports search by name
- [ ] Validation prevents empty name or specialty

### AC-004: Patient Registration

- [ ] Receptionist can create a patient with name (required) and email (required)
- [ ] Optional fields: phone, date of birth, address
- [ ] Duplicate email is rejected with clear error message
- [ ] Empty name is rejected with validation error
- [ ] Phone format is validated (if provided)
- [ ] Success shows patient confirmation with record details
- [ ] Admin can also register patients

### AC-005: Patient Search

- [ ] Search bar is present on the patient list page
- [ ] Typing in search filters patients by name (partial, case-insensitive)
- [ ] Searching by exact email returns matching patient
- [ ] Searching by patient ID returns matching patient
- [ ] Results display name, email, and phone
- [ ] Search completes in under 1 second
- [ ] Clearing search shows all patients

### AC-006: Patient Profile

- [ ] Patient profile displays: name, email, phone, DOB, address
- [ ] Profile shows consultation history in reverse chronological order
- [ ] Each consultation entry shows date, doctor name, and note summary
- [ ] Doctor can click into consultation for full details
- [ ] Receptionist profile view hides consultation note content
- [ ] Profile is accessible via patient list or search result

### AC-007: Consultation Notes

- [ ] Doctor can create consultation from patient profile
- [ ] Required fields: patient (auto-filled), notes (non-empty)
- [ ] Optional fields: diagnosis, prescription, follow-up date
- [ ] Consultation records doctor_id and patient_id
- [ ] Timestamp is auto-set to creation time
- [ ] Doctor can edit own consultations only
- [ ] Validation requires diagnosis if prescription is provided
- [ ] Empty notes are rejected

### AC-008: Patient History

- [ ] History is accessible from patient profile
- [ ] All consultations are listed in reverse chronological order
- [ ] Each entry shows date, doctor, notes, diagnosis
- [ ] Admin can view history for any patient
- [ ] Doctor can view history for their own patients
- [ ] Receptionist can view history without consultation note content

### AC-009: Dashboard

- [ ] Dashboard is the default landing page after login
- [ ] Total patients count is displayed
- [ ] Total doctors count is displayed
- [ ] Today's consultations count is displayed
- [ ] Recent consultations (last 5) are listed
- [ ] Stats reflect current data (no stale cache)
- [ ] Layout is responsive for desktop and tablet

### AC-010: PDF Export

- [ ] PDF export button is present on consultation detail view
- [ ] PDF contains patient name, DOB, contact info
- [ ] PDF contains consultation date, doctor name, notes, diagnosis
- [ ] PDF has footer with generation date and clinic name
- [ ] PDF is A4 formatted
- [ ] PDF generates in under 3 seconds
- [ ] Browser triggers download on click

---

## Roadmap

### Week 1: Core Foundation (Days 1-5)

| Day | Focus | Deliverables |
|---|---|---|
| **Day 1** | Project setup + Auth | Next.js project scaffold, Supabase connection, login/logout, auth middleware |
| **Day 2** | Database schema + RLS | PostgreSQL tables (doctors, patients, consultations, users), Supabase RLS policies, role seeding |
| **Day 3** | Doctor Management | Admin CRUD for doctors, doctor list page, search/filter |
| **Day 4** | Patient Registration | Patient CRUD, registration form, patient list, search |
| **Day 5** | Patient Profile + History | Patient profile view, consultation history display, patient detail page |

### Week 2: Consultation + Polish (Days 6-10)

| Day | Focus | Deliverables |
|---|---|---|
| **Day 6** | Consultation Notes (Create) | Consultation creation form, doctor-patient linking, notes entry |
| **Day 7** | Consultation Notes (Edit + View) | Consultation edit, detail view, ownership enforcement |
| **Day 8** | Dashboard + PDF Export | Dashboard stats, recent consultations, PDF generation and download |
| **Day 9** | Integration + Bug Fixes | End-to-end flow testing, bug fixes, edge case handling |
| **Day 10** | QA + Release | Final QA pass, security review, deployment to Vercel, documentation |

### Milestone Summary

| Milestone | Target Date | Status |
|---|---|---|
| M1: Auth + DB Schema | End of Day 2 | Pending |
| M2: Doctor + Patient CRUD | End of Day 5 | Pending |
| M3: Consultation Notes | End of Day 7 | Pending |
| M4: Dashboard + PDF | End of Day 8 | Pending |
| M5: QA + Release | End of Day 10 | Pending |

---

## Risks

| ID | Risk | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| RISK-001 | Supabase free tier limits (50K monthly active users, 500MB database) | Medium | Low | Service throttling for production use | Acceptable for MVP/demo. Document limits. Upgrade path available. |
| RISK-002 | RLS policy complexity leads to data exposure | High | Medium | Patient data breach | Write RLS policies early (Day 2). Test with each role. Include in QA. |
| RISK-003 | 2-week timeline is aggressive for full feature set | High | Medium | Incomplete MVP | Strict MoSCoW prioritization. Dashboard and PDF are "Should" -- cut first if behind. |
| RISK-004 | PDF generation performance on serverless (Vercel) | Low | Medium | Slow exports or timeouts | Use client-side PDF generation (e.g., @react-pdf/renderer) to avoid serverless limits. |
| RISK-005 | No existing seed data makes testing difficult | Low | High | Manual test data creation needed | Create seed script for admin, doctor, receptionist users and sample patients on Day 2. |
| RISK-006 | Scope creep from stakeholders adding "quick features" | High | Medium | Timeline slip | Strict out-of-scope list. Any additions require explicit approval and timeline adjustment. |

---

## Assumptions

| ID | Assumption | Validated | Notes |
|---|---|---|---|
| ASM-001 | Supabase Auth handles all authentication needs (email/password, session management) | Yes | No custom auth needed |
| ASM-002 | Supabase RLS provides sufficient access control at the database level | Yes | Eliminates need for custom middleware for authorization |
| ASM-003 | Single clinic deployment only (no multi-tenancy needed) | Yes | Simplifies schema and RLS |
| ASM-004 | All users have modern browser access (Chrome, Firefox, Safari, Edge) | Yes | No IE11 or legacy browser support |
| ASM-005 | Clinic admin will manually create user accounts and assign roles | Yes | No self-registration flow needed |
| ASM-006 | Patient data is stored in Supabase (PostgreSQL) and is the single source of truth | Yes | No third-party integrations |
| ASM-007 | The application will be deployed to Vercel with Supabase as the backend | Yes | No on-premise deployment needed |
| ASM-008 | PDF export can be implemented client-side without a PDF server | Yes | Avoids serverless function complexity |
| ASM-009 | All consultation notes are text-only (no images, attachments, or rich media) | Yes | Keeps MVP simple |
| ASM-010 | The application is used by a small team (< 20 users) per clinic | Yes | Within Supabase free tier limits |

---

## Glossary

| Term | Definition |
|---|---|
| **Admin (Clinic Admin)** | A user role with full access to all system features, including doctor, patient, and consultation management |
| **Consultation** | A recorded visit between a doctor and a patient, including notes, diagnosis, and optional prescription |
| **Doctor** | A registered medical practitioner in the clinic who creates consultation notes and views patient history |
| **Doctor Note** | The application name; refers to digital consultation notes created by doctors |
| **MVP** | Minimum Viable Product -- the smallest set of features that delivers core value to users |
| **Patient** | A person receiving medical care at the clinic; registered by receptionist or admin |
| **Patient History** | The chronological record of all consultations for a specific patient |
| **Patient Profile** | The complete record for a patient, including demographics and consultation history |
| **Receptionist** | A user role responsible for patient registration and front desk operations; cannot create consultations |
| **RLS** | Row-Level Security -- Supabase/PostgreSQL feature that restricts data access at the database row level based on user roles |
| **Supabase** | An open-source Firebase alternative providing database (PostgreSQL), authentication, and real-time subscriptions |
| **MoSCoW** | Prioritization method: Must have, Should have, Could have, Won't have |
| **PII** | Personally Identifiable Information -- data that can identify an individual (name, email, phone, DOB) |
| **CRUD** | Create, Read, Update, Delete -- the four basic database operations |
| **RLS Policy** | A PostgreSQL rule that determines which rows a user can read, insert, update, or delete |
