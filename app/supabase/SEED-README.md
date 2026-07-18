# E2E Test Seed Data

This directory contains SQL seed data for E2E testing.

## Files

- `00002_seed_data.sql` — Base seed (roles, permissions, users, diagnoses)
- `seed-test-data.sql` — E2E test data (visits, screenings, prescriptions)

## How to Run

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `seed-test-data.sql`
4. Paste and run the query

### Option 2: Local Development

If using local Supabase:

```bash
# Reset database and run all migrations
npx supabase db reset

# Then run the test seed
npx supabase exec --file supabase/seed-test-data.sql
```

### Option 3: psql

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres" \
  -f supabase/seed-test-data.sql
```

## Test Data Overview

### Users (from 00002_seed_data.sql)

| Email | Role | Password |
|-------|------|----------|
| admin@drnote.com | Admin | testpass123 |
| doctor@drnote.com | Doctor | testpass123 |
| nurse@drnote.com | Nurse | testpass123 |
| receptionist@drnote.com | Receptionist | testpass123 |
| patient1@drnote.com | Patient | testpass123 |
| patient2@drnote.com | Patient | testpass123 |
| patient3@drnote.com | Patient | testpass123 |

### Visits (from seed-test-data.sql)

| Visit ID | Patient | Status | Chief Complaint |
|----------|---------|--------|-----------------|
| 000...001 | Ko Min Aung | waiting | Persistent headache |
| 000...002 | Daw Htay Htay | waiting | Fever and cough |
| 000...003 | U Kyaw Zin | screening | Back pain |
| 000...004 | Ko Min Aung | with_doctor | Hypertension follow-up |
| 000...005 | Daw Htay Htay | completed | Diabetes checkup |
| 000...006 | U Kyaw Zin | completed | Influenza |

### Screenings

- Visit 003: Normal vitals (168cm, 65kg, BP 125/82)
- Visit 004: Elevated BP (175cm, 78kg, BP 138/88)
- Visit 005: Pre-hypertension (160cm, 72kg, BP 142/90)
- Visit 006: Fever (172cm, 68kg, BP 118/76, Temp 38.2°C)

### Prescriptions

- Visit 005: Metformin + glucose test strips (diabetes)
- Visit 006: Oseltamivir + Paracetamol + Vitamin C (influenza)

## E2E Test Usage

The E2E tests reference specific IDs:

```typescript
// nurse-screening.spec.ts uses:
await page.goto("/nurse/visits/00000000-0000-0000-0000-000000000001/screening")
```

Visit ID `00000000-0000-0000-0000-000000000001` is a **waiting** status visit, ready for nurse screening.
