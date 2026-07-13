# Menu Items vs Existing DB Schema

## Receptionist

| Menu Item | DB Tables | Status |
|-----------|-----------|--------|
| Dashboard | `visits` | ✅ Can implement |
| Register patient | `users` + `patient_profiles` + `visits` | ✅ Can implement |
| Today's queue | `visits` | ✅ Can implement |
| Patients | `users` + `patient_profiles` | ✅ Can implement |
| **Appointments** | ❌ No table | **Phase 2** |

## Nurse

| Menu Item | DB Tables | Status |
|-----------|-----------|--------|
| Dashboard | `visits` | ✅ Can implement |
| Screening queue | `visits` (status='waiting') | ✅ Can implement |
| Patients | `users` + `patient_profiles` | ✅ Can implement |
| Vitals | `screenings` | ✅ Can implement |
| Notes | `visit.diagnosis_note` | ✅ Can implement |

## Doctor

| Menu Item | DB Tables | Status |
|-----------|-----------|--------|
| Dashboard | `visits` | ✅ Can implement |
| My queue | `visits` (doctor_id) | ✅ Can implement |
| Patients | `users` + `patient_profiles` | ✅ Can implement |
| Consultations | `visits` + `screenings` + `visit_diagnoses` | ✅ Can implement |
| Prescriptions | `prescriptions` + `prescription_items` | ✅ Can implement |

## Admin

| Menu Item | DB Tables | Status |
|-----------|-----------|--------|
| Dashboard | `users`, `visits` | ✅ Can implement |
| User management | `users`, `roles`, `user_roles` | ✅ Already done |
| Settings | Use env vars | ⚠️ Skip |
| Reports | Aggregate from existing tables | ✅ Can implement |
| Audit log | `audit_log` | ✅ Can implement |

---

## Summary

| Category | Count |
|----------|-------|
| ✅ Can implement now | **14 menu items** |
| ⚠️ Skip (env vars) | **1** (Settings) |
| ❌ Phase 2 (new table) | **1** (Appointments) |

**Only Appointments needs a new table.** Everything else uses existing tables.
