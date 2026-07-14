## Summary

Adds a patient visit history timeline feature with patient search.

### Changes
- **Shared types** (`types/visit.ts`): `VisitStatus` and `DiagnosisBadge` types
- **Server action** (`actions.ts`): `getPatientHistory()` — fetches visits, doctor names, diagnoses, and prescription flags in 3 efficient queries (no N+1)
- **Patient search API** (`/api/patients/search`): searches patients by name, email, or phone
- **Timeline component** (`timeline.tsx`): expandable visit rows with status badges, diagnosis pills, and loading/error/empty states
- **History page** (`/history`): patient search UI that navigates to the selected patient's timeline
- **Tests** (`actions.test.ts`): 5 test cases covering error paths and data assembly

### QA
- TypeScript: 0 errors
- ESLint: 0 errors (47 pre-existing warnings)
- Build: passes
- Tests: 282/282 pass

Closes #27
