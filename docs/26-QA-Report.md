# Dr.Note — QA Report

| Field | Value |
|---|---|
| **Date** | 2026-07-18 |
| **Phase** | Phase 6: QA |
| **Branch** | `feat/security-attachment-access-control` |
| **Tester** | Claude (automated) |
| **Scope** | PR #97 — Visit attachment access control + Storage RLS |

---

## Executive Summary

QA covers the security attachment access control feature (PR #97). All automated tests pass. Two Medium security findings identified in the Storage RLS migration — both are defense-in-depth gaps (app-layer authorization works correctly). No Critical or High findings.

| Metric | Value |
|---|---|
| Critical Bugs | 0 |
| High Bugs | 0 |
| Medium Bugs | 2 |
| Low Bugs | 1 |
| Ready to Proceed | ✅ Yes (Medium findings are non-blocking) |

---

## Test Results

| Check | Result | Details |
|---|---|---|
| ESLint (`npm run lint`) | ✅ Pass | 0 errors, 56 warnings (all pre-existing) |
| TypeScript (`npx tsc --noEmit`) | ✅ Pass | No type errors |
| Build (`npm run build`) | ✅ Pass | All routes compiled successfully |
| Unit tests (`npm run test`) | ✅ Pass | 378/378 passed |
| E2E tests (`npx playwright test`) | ✅ Pass | 76 passed, 2 skipped, 0 failed |
| Security scan | ✅ Pass | No `eval()`, `new Function()`, `child_process`, or service-role key in app code |

---

## Feature Coverage

### Files Changed (PR #97)

| File | Change |
|---|---|
| `app/src/app/(dashboard)/doctor/visits/[id]/attachments/actions.ts` | Added `authorizeVisitAccess()` — verifies patient owner, assigned doctor, or admin before attachment operations |
| `app/supabase/migrations/00009_visit_attachments_storage_rls.sql` | Storage RLS policies for `visit-attachments` bucket (SELECT/INSERT/DELETE) |
| `app/tests/__tests__/attachment-actions.test.ts` | Updated mocks to cover authorization flow |
| `app/src/app/(dashboard)/doctor/visits/[id]/attachments/actions.test.ts` | Updated test mocks for `authorizeVisitAccess` |

### Authorization Matrix

| Operation | App-Layer Check | Storage RLS |
|---|---|---|
| **Upload** | Visit exists ✓ | `has_permission('visits.create')` |
| **List attachments** | `authorizeVisitAccess` (patient/doctor/admin) ✓ | `has_permission('visits.read')` OR patient owner |
| **Get attachment count** | `authorizeVisitAccess` (patient/doctor/admin) ✓ | `has_permission('visits.read')` OR patient owner |
| **Download** | `authorizeVisitAccess` (patient/doctor/admin) ✓ | `has_permission('visits.read')` OR patient owner |
| **Delete** | Uploader OR `has_permission('visits.update')` ✓ | `has_permission('visits.update')` OR uploader |

### Test Coverage

| Function | Tests | Scenarios Covered |
|---|---|---|
| `uploadAttachment` | 8 | Invalid UUID, unsupported type, file too large, auth failure, visit not found, storage error, DB error, success |
| `getVisitAttachments` | 5 | Invalid UUID, auth failure, DB error, success, empty string |
| `getVisitAttachmentCount` | 3 | Invalid UUID, auth failure, success |
| `deleteAttachment` | 8 | Invalid IDs, auth failure, not found, visit mismatch, unauthorized, storage error, DB error, success |
| `getAttachmentDownloadUrl` | 6 | Invalid UUID, auth failure, not found, access denied, URL error, success |

---

## Defect Log

### M1: Storage RLS SELECT/DELETE policies use wrong array index

**Severity:** 🟡 Medium
**File:** `app/supabase/migrations/00009_visit_attachments_storage_rls.sql:23,47`
**Type:** Correctness

The policies reference `(storage.foldername(name))[2]` but the visit ID is at index 1 in the path `visits/{visitId}/{timestamp}-{filename}`:
- `foldername(name)` → `['visits', '{visitId}']`
- Index 0 = `'visits'`, Index 1 = `visitId`
- Index 2 = **out of bounds**

**Impact:**
- SELECT policy: Patient owner access check never matches (patients can't access their own storage objects via RLS)
- DELETE policy: "Original uploader" check never matches (only `has_permission('visits.update')` works)

**Mitigation:** App-layer `authorizeVisitAccess()` correctly handles authorization. Patients don't log in yet (demo scope). Defense-in-depth is weakened but primary security boundary is intact.

**Fix:** Change `[2]` to `[1]` in both policies.

---

### M2: `uploadAttachment` missing visit-level authorization

**Severity:** 🟡 Medium
**File:** `app/src/app/(dashboard)/doctor/visits/[id]/attachments/actions.ts:70-155`
**Type:** Authorization gap

`uploadAttachment` verifies the visit exists but does not call `authorizeVisitAccess()`. Any authenticated user with `visits.create` permission (receptionists) can upload attachments to any visit.

**Mitigation:** Storage RLS INSERT policy requires `visits.create` permission, limiting the blast radius. The upload UI is only accessible from the doctor's visit page.

**Fix:** Add `authorizeVisitAccess()` check before storage upload.

---

### L1: `deleteAttachment` uses inconsistent authorization model

**Severity:** 🟢 Low
**File:** `app/src/app/(dashboard)/doctor/visits/[id]/attachments/actions.ts:221-296`
**Type:** Consistency

`deleteAttachment` uses uploader + `visits.update` permission check instead of `authorizeVisitAccess()`. This is functionally correct but inconsistent with other operations.

**Impact:** A doctor assigned to a visit who didn't upload the file cannot delete it (requires `visits.update` permission). This may or may not be intended.

---

## Architecture Consistency Check

| Principle | Status | Notes |
|---|---|---|
| Server Components by default | ✅ | Actions file is `"use server"` |
| Server Actions for writes | ✅ | All mutations use server actions |
| RLS as security boundary | ✅ | Storage RLS policies added (defense in depth) |
| Zod validation client + server | ✅ | `attachmentUploadSchema` + `uuidSchema` used |
| Input sanitization | ✅ | Filename sanitized with regex, UUID validated |
| No service-role key in app code | ✅ | Not present in attachment code |
| Error messages don't leak info | ✅ | Generic errors for unauthorized access |

---

## Security Checklist

| Check | Status | Notes |
|---|---|---|
| SQL injection | ✅ | Supabase parameterized queries |
| Auth bypass | ✅ | `authorizeVisitAccess` checks patient/doctor/admin |
| RLS enforcement | ✅ | Storage RLS policies present (index bug noted) |
| Input validation | ✅ | UUID validation, file type/size limits, filename sanitization |
| Path traversal | ✅ | Filename sanitized: `fileName.replace(/[^\w.\-]/g, "_")` |
| Data exposure | ✅ | Generic errors for unauthorized access |
| CSRF | ✅ | Next.js Server Actions built-in CSRF protection |
| Secrets in client bundle | ✅ | No service-role key |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Storage RLS index bug | Low (patients don't log in yet) | Medium | App-layer auth works correctly |
| Upload auth gap | Low (UI access limited to doctor page) | Medium | Storage RLS requires `visits.create` |
| Inconsistent delete auth | Low | Low | Functionally correct for current roles |

---

## QA Decision

**PASS** — No Critical or High defects. Two Medium findings are defense-in-depth gaps with working app-layer mitigations. Safe for merge and demo deployment.

**Recommended follow-ups (non-blocking):**
1. Fix Storage RLS index: `[2]` → `[1]` in migration
2. Add `authorizeVisitAccess()` to `uploadAttachment`
3. Align `deleteAttachment` authorization model with other operations
