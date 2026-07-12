# Security Report

Scope: reviewed after each feature per `CLAUDE.md`'s "Run security review after task implementation" rule. Entries are additive per feature — do not delete prior sections when appending.

---

## Issue #20 — Patient registration form (12 Jul 2026)

**Files reviewed:** `src/lib/supabase/service.ts`, `src/lib/utils/password.ts`, `src/lib/validators/patient.ts`, `src/app/(dashboard)/reception/patients/new/{page,actions,patient-registration-form}.tsx`, `src/components/ui/form.tsx`, `supabase/migrations/00003_patient_registration_rls.sql`.

### Findings

**[FIND-020-01] Severity: Medium — Authorization / RLS**
Category: RLS
File: `supabase/migrations/00003_patient_registration_rls.sql`
Description: The migration widening `users_insert` / `user_roles_insert` to permit receptionists to insert patient rows has been written but **not yet applied** to the live Supabase project — the Supabase MCP server was unauthorized in this session (`SUPABASE_ACCESS_TOKEN` missing) and the Supabase CLI is not installed/linked locally.
Impact: Until applied, `registerPatient` will fail at the `users` insert step for receptionist callers (RLS denies it), even though the action's own role check passes. No security exposure — the feature simply won't work — but it blocks the demo-blocker acceptance criteria.
Recommendation: Apply the migration (`mcp__supabase__apply_migration` once re-authenticated, or via Supabase Studio SQL editor / linked CLI), then re-run `get_advisors` to confirm no new lint findings. Tracked as a follow-up in this turn's summary.

**[FIND-020-02] Severity: Low — Authentication / Config dependency**
Category: Authentication
File: `src/app/(dashboard)/reception/patients/new/actions.ts` (signUp call)
Description: The flow assumes Supabase Auth's "Confirm email" setting is OFF (per issue #20/#40), so `signUp` returns an active account without the patient needing to click a confirmation link. This is a project-level Supabase Auth setting, not something enforced in application code.
Impact: If confirmation is ON, no functional break occurs today (patients don't log in this demo — D4), but a real confirmation email would be sent to whatever address staff enter, which is unexpected for demo/test data.
Recommendation: Verify the setting in the Supabase dashboard (Auth → Providers → Email) as part of #40; not a code change.

**[FIND-020-03] Severity: Low — Error handling / User enumeration**
Category: Error Handling
File: `src/app/(dashboard)/reception/patients/new/actions.ts`
Description: A duplicate-email submission returns a specific "This email is already registered" field error, which lets an authenticated receptionist/admin enumerate whether an email is already a registered patient.
Impact: Minimal — only reachable by already-authenticated staff roles (`admin`/`receptionist`), and the acceptance criteria for #20 explicitly requires this human-readable duplicate-email error. Accepted as by-design.
Recommendation: No change; documented as an accepted tradeoff.

**[FIND-020-04] Severity: Low — Error handling / brittle string match**
Category: Error Handling
File: `src/app/(dashboard)/reception/patients/new/actions.ts`
Description: Duplicate-email detection matches on `signUpError.message.toLowerCase().includes("already registered")`, a substring check against the Supabase SDK's error text rather than an error code.
Impact: If a future SDK version changes this message, the duplicate case silently falls through to the generic error instead of the field-level one — a UX regression, not a security hole. Same pattern already exists in `login/actions.ts` for `"Invalid login credentials"`.
Recommendation: No action needed now; worth switching to `error.code` if/when the JS SDK exposes a stable code for this case.

### Verified as sound
- Auth: `registerPatient` checks `auth.getUser()` before doing anything; unauthenticated calls are rejected.
- Authorization: role checked both at the page level (`redirect`) and inside the server action (defense in depth, matching the existing `(dashboard)/layout.tsx` pattern), with RLS as the ultimate backstop once FIND-020-01 is resolved.
- Secrets: only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used (already public by convention); no service-role key anywhere in the new code, per `docs/12-Architecture.md` §3.
- Input validation: all fields validated server-side via `patientRegistrationSchema.safeParse` inside the action (not just client-side); DOB tightened during this review to a strict `YYYY-MM-DD` format that can't be in the future.
- Temp password: generated with `crypto.randomBytes` (16 chars, 64-char alphabet, ~96 bits entropy), never returned to the client or logged.
- Error responses: only generic, human-readable messages cross the server/client boundary; raw Postgres/Supabase errors are logged server-side only (`console.error`), never returned.
- No rollback/service-role deletion is attempted on partial failure (no service-role key available); orphaned auth users are logged with a `[PatientRegistration]` prefix for manual cleanup, consistent with the existing orphaned-user handling in `login/actions.ts`.

### Gate status
No Critical or High findings. FIND-020-01 (Medium) blocks the feature from working end-to-end until the migration is applied — not a release-blocking vulnerability, but must be resolved before this is demo-ready.
