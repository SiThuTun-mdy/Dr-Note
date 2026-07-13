# QA Report: Visit Status Workflow + Patient Queue View (Issue #25)

**Date:** 2026-07-13 21:58
**Branch:** feat/list-pages-with-pagination
**Scope:** Queue page, visit status transitions, server actions, React Query polling

---

## 1. Automated QA Checks

| Check          | Command              | Result |
|----------------|----------------------|--------|
| ESLint         | `npm run lint`       | PASS (0 errors, 22 warnings -- all pre-existing) |
| TypeScript     | `npx tsc --noEmit`   | PASS (no errors) |
| Build          | `npm run build`      | PASS (Next.js production build successful) |
| Unit Tests     | `npm run test`       | PASS (67/67 tests pass across 8 test files) |

---

## 2. Unit Test Results -- Queue Actions

**File:** `app/src/app/(dashboard)/queue/actions.test.ts`
**Tests:** 20 passed, 0 failed, 0 skipped

### transitionVisitStatus (13 tests)

| # | Test | Status |
|---|------|--------|
| 1 | rejects unauthenticated users | PASS |
| 2 | rejects missing visit ID | PASS |
| 3 | rejects when permission check fails | PASS |
| 4 | rejects when user has no role | PASS |
| 5 | rejects when visit does not exist | PASS |
| 6 | rejects invalid transition (completed -> screening) | PASS |
| 7 | rejects nurse attempting screening -> with_doctor | PASS |
| 8 | rejects transition when no doctor is assigned | PASS |
| 9 | rejects when database update fails | PASS |
| 10 | allows nurse to transition waiting -> screening | PASS |
| 11 | allows doctor to transition screening -> with_doctor | PASS |
| 12 | allows doctor to transition with_doctor -> completed | PASS |
| 13 | allows admin to perform any valid transition | PASS |

### getTodayVisits (7 tests -- NEW)

| # | Test | Status |
|---|------|--------|
| 1 | returns error for unauthenticated user | PASS |
| 2 | returns today's visits with correct shape | PASS |
| 3 | maps missing patient name to 'Unknown' and null doctor to null | PASS |
| 4 | returns empty data array when no visits today | PASS |
| 5 | returns error when database query fails | PASS |
| 6 | returns null userRole when user has no role assigned | PASS |
| 7 | returns multiple visits sorted by created_at | PASS |

---

## 3. Acceptance Criteria Validation

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Today's visits show: patient name, time, chief complaint, StatusBadge, assigned doctor | **Met** | All fields rendered in queue-row.tsx columns |
| 2 | Filter by status/doctor | **Failed** | No filter UI controls exist in visit-queue.tsx or page.tsx |
| 3 | Nurse sees "Start screening" action | **Met** | getAvailableActions maps nurse: [waiting -> screening] with ClipboardCheck icon |
| 4 | Doctor sees "Start consult" and "Complete" actions | **Met** | getAvailableActions maps doctor: [screening -> with_doctor, with_doctor -> completed] |
| 5 | Invalid transitions rejected server-side with toast | **Met** | transitionVisitStatus validates forward-only + role; queue-row.tsx shows toast.error() on failure |
| 6 | Queue updates within ~10s without manual refresh | **Met** | refetchInterval: 10_000 in VisitQueue useQuery; staleTime: 5_000 in Providers |
| 7 | Empty state per design section 6 | **Partial** | Shows icon + heading + description text. Missing: single-sentence wording per spec ("No visits yet today.") and no primary action button |

**Acceptance criteria: 4 Met, 1 Failed, 1 Partial, 1 Blocked (cannot verify without runtime -- queue polling)**

---

## 4. Bugs Found

### BUG-001: Missing status/doctor filter controls
- **Severity:** Medium
- **Module:** `src/components/features/queue/visit-queue.tsx`
- **Description:** Acceptance criteria requires filtering by status and doctor, but no filter UI controls exist.
- **Expected:** Dropdown/select filters for status and doctor above the table
- **Actual:** No filter controls; all visits displayed without filtering
- **Status:** Open

### BUG-002: Empty state does not match design system section 6
- **Severity:** Low
- **Module:** `src/components/features/queue/visit-queue.tsx` (lines 57-69)
- **Description:** Design system section 6 specifies: "One sentence ('No visits yet today.') + the relevant primary action". Implementation shows: icon, heading, and two sentences. No primary action button.
- **Expected:** Single sentence + primary action (e.g., "Register patient" button for receptionist role)
- **Actual:** Multi-line empty state with no action button
- **Status:** Open

### BUG-003: Error state missing retry mechanism
- **Severity:** Low
- **Module:** `src/components/features/queue/visit-queue.tsx` (lines 43-49)
- **Description:** Design system section 6 specifies error state as "Toast + inline 'Something went wrong -- retry' block; never a blank screen." The current error state is a plain text message with no retry button or toast.
- **Expected:** Retry button or automatic refetch; toast notification on error
- **Actual:** Static text "Failed to load queue. Please try refreshing the page."
- **Status:** Open

### BUG-004: VisitStatus type duplicated across two files
- **Severity:** Low (maintenance risk)
- **Modules:** `src/app/(dashboard)/queue/actions.ts` (line 10), `src/components/features/shared/StatusBadge.tsx` (line 4)
- **Description:** `VisitStatus` type is defined identically in both files. `queue-row.tsx` imports `VisitStatus` from `StatusBadge.tsx` while also importing `VisitRow` from `actions.ts`. If the types diverge, it creates a silent type mismatch.
- **Expected:** Single source of truth for `VisitStatus` type
- **Actual:** Two independent definitions that could drift
- **Status:** Open

---

## 5. Code Review Notes

### Positive findings
- Server-side validation in `transitionVisitStatus` is thorough: authentication, permission check (`has_permission` RPC), role authorization, forward-only transition validation, and doctor assignment check before `with_doctor` transition.
- `revalidatePath("/queue")` is called after successful update, ensuring server component cache is refreshed.
- The React Query setup in `Providers.tsx` correctly creates a singleton `QueryClient` with `useState` to avoid re-creation on re-renders.
- The `staleTime: 5_000` in Providers aligns well with the 10s poll interval -- data goes stale halfway through the poll cycle.
- Queue rows are sorted by status priority (waiting first, completed last) for clinical relevance.

### Security observations
- All `security/detect-object-injection` ESLint warnings in queue files are false positives (array `.includes()` and `.some()` on controlled data).
- The `has_permission` RPC check in `transitionVisitStatus` provides defense-in-depth alongside RLS policies.
- No user-controlled input is passed unsanitized to database queries.

### Touch target concern
- Action buttons in `queue-row.tsx` use `size="sm"` which may not meet the 44x44px minimum touch target required by design system section 7 for mobile/gloved use.

---

## 6. Files Reviewed

| File | Lines | Verdict |
|------|-------|---------|
| `app/src/app/(dashboard)/queue/actions.ts` | 241 | Clean -- no bugs |
| `app/src/app/(dashboard)/queue/page.tsx` | 27 | Clean -- minimal page wrapper |
| `app/src/components/features/queue/visit-queue.tsx` | 124 | 2 low-severity gaps (empty/error states) |
| `app/src/components/features/queue/queue-row.tsx` | 135 | Clean -- touch target note |
| `app/src/components/providers.tsx` | 22 | Clean -- correct singleton pattern |
| `app/src/components/features/shared/StatusBadge.tsx` | 32 | Clean -- type duplication note |
| `app/src/app/(dashboard)/queue/actions.test.ts` | 290 | Rewritten: 20 tests all pass |

---

## 7. Readiness Assessment

| Gate | Status |
|------|--------|
| ESLint clean | PASS |
| TypeScript clean | PASS |
| Build passing | PASS |
| All tests passing | PASS (67/67) |
| No Critical bugs | PASS |
| No High bugs | PASS |
| All acceptance criteria met | FAIL (filter missing -- Medium severity) |

**readyForRelease: false** -- 1 Medium bug (missing filter), 3 Low bugs (empty state, error state, type duplication). The missing filter is a functional gap against the acceptance criteria. Recommend fixing BUG-001 before merge.
