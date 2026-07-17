# Receptionist Flow — Fixes & Improvements Plan

> **Status:** Pending PM review
> **Date:** 2026-07-15
> **Source:** Tester feedback + codebase analysis

---

## Current State Summary

| Area | Status | Key Issue |
|------|--------|-----------|
| Patient registration | Works | Email is required (primary field), phone is optional |
| Visit creation | Works | Doctor search may not return results |
| Doctor assignment | **Broken** | `searchDoctors` filters in JS after fetching — may return empty |
| Patient profile | Partial | Shows visit table but no logs/status update/quick actions |
| Real-time updates | **Broken** | Poll interval is 30 minutes (should be 10s per requirements) |
| Visit status logs | **Missing** | No audit trail — status transitions are overwritten silently |

---

## Issues Found (Code Analysis)

### BUG-1: Doctor Search Returns Empty (Critical)
**File:** `app/src/app/(dashboard)/reception/visits/new/actions.ts:214-235`

The `searchDoctors` function queries `users` with a join to `user_roles`, then **filters in JavaScript** to only include users whose role is "doctor". The problem: the Supabase query uses `.or()` on `name/email` but the `user_roles` join uses `!inner` (inner join). If the Supabase PostgREST query doesn't return the nested role data correctly, the JS filter produces an empty array.

Additionally, the search requires **min 2 characters** but the placeholder says "Search by doctor name or email..." — users may type 1 char and see nothing.

**Root cause:** The `!inner` join + `or()` filter combination may not work as expected with PostgREST's nested filtering. The filter `roles?.some(r => r.roles?.name === "doctor")` accesses `roles.roles.name` which depends on exact PostgREST nesting.

### BUG-2: Poll Interval Contradicts Requirements (Critical)
**Files:**
- `app/src/components/features/queue/visit-queue.tsx:22` — comment says "10 seconds", value is `1_800_000` (30 min)
- `app/src/components/features/patients/use-today-visit-count.ts:7` — same 30 min value

The queue and dashboard cards poll every **30 minutes**, meaning real-time awareness of patient flow is completely broken. The code comment says "10 seconds as per requirements."

### BUG-3: Patient Visit Table Has No Actions Column
**File:** `app/src/components/features/patients/patient-visits-data-table.tsx`

The visit history table shows: visit date, status, visit type, chief complaint. There is **no "View" link** to drill into a visit, and **no status update action**. The tester's complaint "we can not view logs or update status" is correct.

### ISSUE-4: Email Required at Registration — Inaccessible for Many Patients
**File:** `app/src/lib/validators/patient.ts:7-10`

Email is `z.string().min(1, "Email is required").email()`. In the DB, `users.email` is `UNIQUE NOT NULL`. This blocks registration for patients without email. However, Supabase Auth **requires email** for the confirmation/password-set flow. This is a design tension.

### ISSUE-5: No Duplicate Prevention Before Registration
The current flow creates an Auth user first, then checks for duplicate email on insert. If a patient was previously registered with a different email but same phone, the system won't detect the duplicate. The tester suggests searching by phone **before** creating.

### ISSUE-6: No "New Visit" Button on Patient Profile
The patient profile page (`app/src/app/(dashboard)/patients/[id]/page.tsx`) shows demographics, emergency contacts, and visit history — but no quick-action button to create a new visit for this patient.

---

## Proposed Changes

### Phase 1: Critical Bug Fixes

#### Fix 1: Doctor Search (BUG-1)
**Approach:** Rewrite `searchDoctors` to avoid the JS filter problem. Instead of relying on nested PostgREST joins, fetch doctor IDs in two steps:
1. Query `user_roles` + `roles` to get all user IDs with role "doctor"
2. Query `users` filtered by those IDs + the search term

This is the same pattern already used successfully in `searchPatients` (which filters patient role IDs separately).

**Files to modify:**
- `app/src/app/(dashboard)/reception/visits/new/actions.ts` — rewrite `searchDoctors()`

#### Fix 2: Poll Interval (BUG-2)
**Approach:** Change `1_800_000` -> `10_000` (10 seconds) in both files. This aligns with the code comments and requirements.

**Files to modify:**
- `app/src/components/features/queue/visit-queue.tsx` — line 22
- `app/src/components/features/patients/use-today-visit-count.ts` — line 7

---

### Phase 2: Patient Registration Improvements

#### Change 1: Make Phone the Primary Search Field
**Approach:** In the patient registration form:
1. Reorder fields: **Phone** first (as primary identifier), then Name, Email, DOB, Gender, etc.
2. Add a "Check existing patient" action — when phone is entered, search for existing patients with that phone number and show a suggestion to go to their profile/create visit instead of registering new.

**Files to modify:**
- `app/src/lib/validators/patient.ts` — reorder schema (cosmetic), make phone required or strongly encouraged
- `app/src/app/(dashboard)/reception/patients/new/patient-registration-form.tsx` — reorder fields, add phone search

#### Change 2: Make Address Mandatory
**Approach:** Change `address` from `optional()` to required (min 1 char).

**Files to modify:**
- `app/src/lib/validators/patient.ts` — line 23, add `.min(1, "Address is required")`
- `app/src/app/(dashboard)/reception/patients/new/patient-registration-form.tsx` — update label from "Address (optional)" to "Address *"

#### Change 3: Phone Duplicate Check Before Registration
**Approach:** Add a phone search step at the start of registration. When the receptionist enters a phone number, call `searchPatients` to check if a patient with that phone already exists. If found, show a suggestion card: "Patient found: [Name] — [View Profile] or [Create Visit]".

**Files to modify:**
- `app/src/app/(dashboard)/reception/patients/new/patient-registration-form.tsx` — add phone search step

---

### Phase 3: Patient Profile Improvements

#### Change 1: Add "New Visit" Button
**Approach:** Add a "New Visit" button on the patient profile page that links to `/reception/visits/new?patientId={id}` (or prefills the patient search). This lets receptionists quickly create a follow-up visit.

**Files to modify:**
- `app/src/app/(dashboard)/patients/[id]/page.tsx` — add button in header area
- `app/src/app/(dashboard)/reception/visits/new/page.tsx` — accept `patientId` query param
- `app/src/app/(dashboard)/reception/visits/new/visit-creation-form.tsx` — auto-select patient from query param

#### Change 2: Add Visit Detail/Logs View
**Approach:** Add a "View" link in the patient visit history table that navigates to a visit detail page. The visit detail page shows:
- Visit info (date, type, status, chief complaint)
- Screening data (if any)
- Diagnoses (if any)
- Prescriptions (if any)

This addresses the "can't view logs" complaint. Status updates from the patient profile are **not recommended** — status should be managed from the queue view per role-based rules.

**Files to modify:**
- `app/src/components/features/patients/patient-visits-data-table.tsx` — add "View" column with link
- Potentially: create a visit detail page if one doesn't exist (check needed)

---

### Phase 4: Visit Status & Real-time (Needs Discussion)

#### Option A: Fix Polling (Quick Win)
Simply fix the poll interval to 10 seconds. This gives near-real-time updates without infrastructure changes.

**Pros:** 5-minute fix, no new dependencies
**Cons:** 10-second polling is still not "real-time"; increases API calls

#### Option B: Supabase Realtime (Recommended)
Enable Supabase Realtime on the `visits` table and subscribe to changes in the queue component.

**Approach:**
1. Enable Realtime on `visits` table via Supabase dashboard or migration
2. Create a `useRealtimeVisits` hook that subscribes to `visits` table changes
3. Replace `refetchInterval` with Realtime subscription
4. Update `app/src/lib/supabase/client.ts` if needed

**Pros:** True real-time, lower bandwidth, instant updates
**Cons:** Requires Supabase Realtime to be enabled, more code changes

#### Option C: Visit Status Audit Trail
Add a `visit_status_history` table to log every status transition with timestamp, actor, and previous status.

**Schema:**
```sql
create table visit_status_history (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid not null references users(id),
  changed_at timestamptz not null default now()
);
```

Update `transitionVisitStatus` in `queue/actions.ts` to insert a history record before each transition.

**Pros:** Full audit trail, supports "view logs" feature
**Cons:** Requires migration, changes to transition function

---

## Verification Checklist

After implementation, verify each item:

- [ ] **BUG-1 Fixed:** Doctor search returns results when doctors exist in the system
- [ ] **BUG-2 Fixed:** Queue view polls every ~10 seconds (not 30 minutes)
- [ ] **BUG-3 Fixed:** Patient visit table has "View" link for each visit
- [ ] **Phone first:** Registration form shows Phone as the first field
- [ ] **Address required:** Registration form shows Address as required (*)
- [ ] **Phone duplicate check:** Entering a phone number searches for existing patients before allowing registration
- [ ] **New Visit button:** Patient profile page has a "New Visit" button
- [ ] **Visit detail view:** Clicking a visit in the patient profile shows visit details (screening, diagnoses, prescriptions)
- [ ] **No regressions:** Existing registration, visit creation, and queue flows still work

---

## Recommendations for PM Decision

| Item | Recommendation | Needs PM Input? |
|------|---------------|-----------------|
| Phone as primary field | Yes — reorder form, add phone duplicate check | Confirm field order |
| Email still required? | Keep required (Supabase Auth needs it), but consider generating a placeholder for patients without email | Confirm approach |
| Address mandatory | Yes — make required | Confirm |
| Doctor search fix | Yes — critical bug, fix immediately | No |
| Poll interval fix | Yes — change to 10 seconds | No |
| "New Visit" button on profile | Yes — good UX improvement | Confirm placement |
| Visit logs/status view | Yes — add view link in patient visits table | Confirm scope |
| Real-time vs polling | Recommend Option A (fix poll) for now, Option B (Realtime) as follow-up | Confirm approach |
| Visit status audit trail | Recommend Option C as separate task | Confirm priority |
| Patient member status field | Not preferred by tester — skip unless PM wants it | Confirm to skip |
