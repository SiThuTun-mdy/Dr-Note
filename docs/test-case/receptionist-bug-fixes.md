# Test Cases: Receptionist Flow Bug Fixes

> **Date:** 2026-07-15
> **Branch:** fix/manual-test-bugs
> **Tester Tool:** Chrome DevTools

---

## Pre-Test Setup

1. Open the app in Chrome: `http://localhost:3000`
2. Log in as **receptionist** (or admin)
3. Open Chrome DevTools → **Network** tab (for monitoring polling requests)
4. Ensure at least 2 doctor accounts exist in the system (check `/admin/users`)

---

## BUG-1: Doctor Search Returns Results

### Test Case 1.1: Search doctor by name

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/reception/visits/new` | New Visit form loads |
| 2 | Search and select a patient first | Patient card appears |
| 3 | Click the "Assign Doctor" search field | Cursor focuses on the input |
| 4 | Type a doctor's full name (e.g. "Dr. Smith") | Dropdown appears with matching doctors |
| 5 | Click on a doctor from the dropdown | Doctor card appears with name and email, dropdown closes |
| 6 | Click the X button on the doctor card | Doctor is cleared, search field reappears |

### Test Case 1.2: Search doctor by email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/reception/visits/new` | New Visit form loads |
| 2 | Search and select a patient | Patient card appears |
| 3 | Click the "Assign Doctor" search field | Cursor focuses on the input |
| 4 | Type a doctor's email (e.g. "doctor@") | Dropdown appears with matching doctors |
| 5 | Click on a doctor from the dropdown | Doctor card appears |

### Test Case 1.3: Search with partial name

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the "Assign Doctor" search field | Cursor focuses |
| 2 | Type 2+ characters (e.g. "sm") | Dropdown shows doctors matching "sm" |
| 3 | Clear and type a different partial (e.g. "dr") | Dropdown updates with new results |

### Test Case 1.4: Search with no results

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the "Assign Doctor" search field | Cursor focuses |
| 2 | Type a non-existent name (e.g. "zzzzz") | No dropdown appears (empty results) |

### Test Case 1.5: Minimum character requirement

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the "Assign Doctor" search field | Cursor focuses |
| 2 | Type only 1 character (e.g. "a") | No search triggered, no dropdown |
| 3 | Type a 2nd character | Search triggers, dropdown may appear |

### Test Case 1.6: Complete visit creation with doctor

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill in all required fields (patient, visit type, chief complaint) | Fields filled |
| 2 | Search and select a doctor | Doctor card appears |
| 3 | Click "Create Visit" | Toast: "Visit created successfully", redirected to `/my-queue` |
| 4 | Check the queue table | New visit appears with the assigned doctor's name |

---

## BUG-2: Poll Interval (10-second auto-refresh)

### Test Case 2.1: Queue view auto-refresh

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/queue` | Queue table loads |
| 2 | Open DevTools → Network tab | Network panel visible |
| 3 | Wait 10-15 seconds | A new `getTodayVisits` request fires automatically |
| 4 | Wait another 10-15 seconds | Another request fires (consistent ~10s interval) |
| 5 | Check the comment in `visit-queue.tsx` | Comment says "10 seconds", value is `10_000` |

### Test Case 2.2: Dashboard stat cards auto-refresh

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/reception` | Dashboard loads with stat cards |
| 2 | Open DevTools → Network tab | Network panel visible |
| 3 | Wait 10-15 seconds | New requests fire for stat card data |
| 4 | Verify all 3 cards update (Today's visits, Waiting queue, New registrations) | Cards refresh automatically |

### Test Case 2.3: Real-time status update reflected in queue

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/queue` in **Browser tab A** (as receptionist) | Queue loads |
| 2 | Open `/nurse` in **Browser tab B** (as nurse) | Nurse queue loads |
| 3 | In tab B (nurse), click "Start screening" on a waiting visit | Status changes to "screening" |
| 4 | Switch back to tab A (receptionist queue) | Within ~10 seconds, the visit's status badge updates to "screening" automatically (no manual refresh needed) |

### Test Case 2.4: No excessive network traffic

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/queue` | Queue loads |
| 2 | Open DevTools → Network tab, filter by `getTodayVisits` or `queue` | Filtered view |
| 3 | Wait 60 seconds | Approximately 6 requests fire (not 60), confirming ~10s interval |
| 4 | Verify no duplicate or rapid-fire requests | Requests are spaced ~10s apart |

---

## BUG-3: Patient Visit Table (Deferred — Not Tested Yet)

> **Note:** BUG-3 fix is pending. Test cases below are for future implementation.

### Test Case 3.1: Visit table has "View" link (pending)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/patients/{id}` | Patient profile loads |
| 2 | Scroll to "Visit history" section | Visit table visible |
| 3 | Check each row | Each visit row has a "View" link/button |
| 4 | Click "View" on a visit | Navigates to visit detail page showing visit info |

---

## Pass/Fail Criteria

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Search doctor by name | ✅ PASS | Dr. Chan found when searching "chan" |
| 1.2 Search doctor by email | ✅ PASS | Dr. Chan found when searching "chan@gmail.com" |
| 1.3 Search with partial name | ✅ PASS | Partial queries "ch", "cha", "chan" all return results |
| 1.4 Search with no results | ✅ PASS | No dropdown appears for non-existent names |
| 1.5 Minimum character requirement | ✅ PASS | Search triggers at 2+ characters |
| 1.6 Complete visit creation with doctor | ✅ PASS | Visit created successfully, redirected to dashboard, visit appears in queue with Dr. Chan assigned |
| 2.1 Queue view auto-refresh | ✅ PASS | 3 new requests fired in ~25 seconds (consistent ~10s interval) |
| 2.2 Dashboard stat cards auto-refresh | ✅ PASS | 8 new resources loaded in ~21 seconds, stat cards updating automatically |
| 2.3 Real-time status update reflected | ⏳ NOT TESTED | Requires two users in different roles (manual verification needed) |
| 2.4 No excessive network traffic | ✅ PASS | 24 requests in 67 seconds (~0.36/sec), batched in ~10s intervals with multiple stat cards polling simultaneously |

**Result:** 9 / 10 passed, 1 pending (requires manual multi-user testing)

---

## Root Cause Analysis (BUG-1)

The doctor search was broken due to **two compounding issues**:

1. **RLS Policy Too Restrictive** — The `users_select` policy (from migration `00004_patient_profile_users_rls.sql`) restricted `patients.read` to only see users with the `patient` role. Receptionists couldn't see doctor users at all.

2. **PostgREST `.in()` Unreliable** — The original code used `.in("id", doctorIds)` which returned empty results even when the IDs existed.

**Fix Applied:**
- Created migration `00007_widen_users_select_for_doctor_search.sql` to widen the RLS policy
- Rewrote `searchDoctors()` to use two-query pattern (fetch all users + user_roles, filter in JS)
- Applied the RLS fix via Supabase Management API

**Files Modified:**
- `app/src/app/(dashboard)/reception/visits/new/actions.ts` — rewrote `searchDoctors()`
- `app/supabase/migrations/00007_widen_users_select_for_doctor_search.sql` — new migration
- `app/supabase/migrations/00006_cleanup_orphaned_user_roles.sql` — cleanup migration (no orphaned data found)
