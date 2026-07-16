# PR: fix: resolve 9 manual test bugs, defer 3 auth items to Phase 2

## What This PR Fixes

### Fixed (9 issues)
1. **Patient profile "New Visit" button** — admin/receptionist can now create visits directly from patient profile
2. **Doctor search returning no results** — RLS policy widened for `users_select` (migration 00007)
3. **"Please select a valid patient" validation error** — Zod v4 UUID validation replaced with lenient 8-4-4-4-12 hex regex to match PostgreSQL format
4. **Visit history "View" button** — replaced with inline expandable rows showing diagnoses, screening vitals, prescriptions
5. **Screening data not displaying** — RLS policy widened for `screenings_select` (migration 00004)
6. **BMI display showing decimals** — now rounds to integer
7. **Address field mandatory** — required in patient registration
8. **Visit status update controls** — role-based status transitions in patient profile
9. **RLS policy fixes** — additive changes via migration 00004 (no access revoked)

### Deferred to Phase 2 (requires auth redesign)
- Phone number as primary identifier
- Email as primary identifier
- Phone-based duplicate detection

## Testing
- [x] TypeScript passes
- [x] Build succeeds
- [x] ESLint passes
- [x] Doctor search works
- [x] New Visit button appears for authorized roles
- [x] Visit history expandable rows show diagnoses + screening vitals
- [x] BMI displays as integer
- [x] Address field is mandatory in registration
