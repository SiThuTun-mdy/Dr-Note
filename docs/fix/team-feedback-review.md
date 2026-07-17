# Team Feedback Review - fix/manual-test-bugs Branch

**Date:** 2026-07-16
**Branch:** fix/manual-test-bugs
**Purpose:** Document team feedback status for PR submission

---

## Executive Summary

This branch addresses **6 out of 12** team feedback items. The remaining items are either:
- **Phase 2** (requires auth redesign): 3 items
- **Pending implementation**: 3 items (address mandatory, visit logs, visit status update)

---

## ✅ Completed in This Branch

### 1. Patient Profile - "New Visit" Button
**File:** `app/src/app/(dashboard)/patients/[id]/page.tsx`

**What was done:**
- Added "New Visit" button on patient profile page
- Button visible only to admin/receptionist roles
- Links to `/reception/visits/new?patientId=${id}` to prefill patient data

**Impact:** Improves workflow efficiency - staff can directly create visits from patient profile.

### 2. Doctor Search Fix (Assign Doctor Field)
**Files:**
- `app/src/app/(dashboard)/reception/visits/new/actions.ts`
- `app/supabase/migrations/00007_widen_users_select_for_doctor_search.sql`

**What was done:**
- Rewrote `searchDoctors` function to work with RLS policies
- Added migration to widen `users_select` policy for doctor search
- Doctor search now properly finds doctors by name/email

**Impact:** Doctor assignment field now works correctly in visit creation form.

---

## 🔄 Phase 2 Items (Requires Auth Redesign)

> **Decision:** These items are deferred to Phase 2 because Supabase Auth has limitations with email/phone as primary identifiers. A full auth redesign is required.

### 3. Phone Number as Primary Field
**Current State:** Email is primary identifier
**Proposed:** Phone number as primary field
**Blocker:** Supabase Auth requires email for user creation; auth redesign needed

### 4. Email as Primary Field
**Current State:** Anyone can have any email
**Proposed:** Email should be unique/primary
**Blocker:** Supabase Auth limitations; auth redesign needed

### 5. Phone Number as First Field
**Current State:** Phone is not the first field in registration form
**Proposed:** Phone number should be first field to prevent duplicates
**Blocker:** Tied to auth redesign

### 6. Phone Number Search for Existing Contacts
**Current State:** No phone-based duplicate detection
**Proposed:** Search existing contacts by phone before creating new patient
**Blocker:** Tied to auth redesign

**Note for PR:** These items require a separate epic/phase for auth system redesign. They cannot be implemented without breaking changes to the authentication flow.

---

## ❌ Still Needs Implementation

### 7. Address Field Should Be Mandatory
**Current State:** ✅ **FIXED** - Address is now mandatory for new patients
**Proposed:** Make address required
**Effort:** Small (1-2 hours)

**Implementation:**
1. ✅ Updated Zod schema in `app/src/lib/validators/patient.ts` (registration schema)
2. ✅ Updated form label in `patient-registration-form.tsx` (removed "(optional)")
3. ✅ Kept address optional in profile update schema (for existing patients)

### 8. Patient Page - View Visit Logs/Details
**Current State:** ✅ **FIXED** - Visit table now has "View" button
**Proposed:** Add ability to view detailed visit information
**Effort:** Medium (4-8 hours)

**Implementation:**
- ✅ Added "View" button to each visit row
- ✅ Links to appropriate visit detail page based on user role
- ✅ Doctor → `/doctor/visits/[id]`
- ✅ Nurse → `/nurse/visits/[id]/screening`
- ✅ Admin/Receptionist → `/doctor/visits/[id]` (read-only)

### 9. Patient Page - Update Visit Status
**Current State:** ✅ **FIXED** - Status update controls added
**Proposed:** Add ability to update visit status from patient profile
**Effort:** Medium (4-8 hours)

**Implementation:**
- ✅ Added status transition buttons to visit rows
- ✅ Role-based visibility (admin, nurse, doctor only)
- ✅ Shows only valid next statuses based on current status
- ✅ Uses existing `transitionVisitStatus` server action
- ✅ Refreshes visit list after status update

---

## 📊 Statistics

| Category | Count | Items |
|----------|-------|-------|
| ✅ Completed in this branch | 5 | New Visit button, Doctor search fix, Address mandatory, Visit logs, Visit status update |
| 🔄 Phase 2 (auth redesign) | 3 | Phone/email as primary, phone search |
| ❌ Still needs implementation | 0 | None |
| ✅ Already done (before branch) | 4 | Register patient, duplicates, create visits, patients page |
| **Total Team Feedback Items** | **12** | |

---

## 🎯 Recommended Next Steps

### Immediate (This Branch)
- [ ] Merge current fixes (New Visit button + Doctor search)

### Short Term (Next Sprint)
- [ ] Make address field mandatory (Item 7)
- [ ] Decide on visit logs implementation approach (Item 8)

### Medium Term (Phase 2 Planning)
- [ ] Plan auth redesign epic for phone/email as primary (Items 3-6)
- [ ] Evaluate visit status update necessity (Item 9)

---

## 📝 PR Description Template

When creating the PR, use this structure:

### What This PR Fixes
- ✅ Added "New Visit" button to patient profile page for admin/receptionist
- ✅ Fixed doctor search/assignment in visit creation form
- ✅ Made address field mandatory in patient registration
- ✅ Added "View" button to visit history table linking to visit detail pages
- ✅ Added status update controls to visit history table (role-based)
- ✅ Cleaned up dead code and lint warnings

### What This PR Does NOT Fix (Phase 2)
- Phone/email as primary identifier (requires auth redesign)
- Phone-based duplicate detection (requires auth redesign)

### Testing
- [x] TypeScript passes
- [x] Build succeeds
- [x] ESLint passes (no new warnings)
- [x] Doctor search works
- [x] New Visit button appears for authorized roles
- [x] Address field is mandatory in patient registration
- [x] Visit history table has "View" button linking to visit detail pages
- [x] Status update controls appear for authorized roles (admin, nurse, doctor)
- [x] Status update refreshes visit list after change

---

## 🔗 Related Documents

- `docs/fix/branch-analysis-fix-manual-test-bugs.md` - Technical analysis of branch changes
- `docs/fix/receptionist-flow-fixes-and-improvements.md` - Original receptionist flow documentation
- `docs/test-case/receptionist-bug-fixes.md` - Test cases for bug fixes
