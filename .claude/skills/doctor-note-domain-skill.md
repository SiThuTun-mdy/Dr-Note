# Doctor Note Domain Skill

Use for clinic note-taking applications.

## Data Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   doctors    │────<│consultations│>────│    patients     │
├─────────────┤     ├─────────────┤     ├─────────────────┤
│ id          │     │ id          │     │ id              │
│ user_id     │     │ doctor_id   │     │ name            │
│ name        │     │ patient_id  │     │ email           │
│ specialty   │     │ notes       │     │ phone           │
│ created_at  │     │ created_at  │     │ date_of_birth   │
└─────────────┘     └─────────────┘     │ created_at      │
                                        └─────────────────┘
```

## Role-Based Access

| Role | Patients | Doctors | Consultations | History |
|---|---|---|---|---|
| Admin | Full CRUD | Full CRUD | Full CRUD | View All |
| Doctor | View | View | Create/Edit Own | View Own Patients |
| Receptionist | Full CRUD | View | View Only | View Only |

## Core Workflows

### Patient Registration

```
1. Receptionist creates patient
   ├─ Required: name, email
   └─ Optional: phone, date_of_birth, address

2. System validates
   ├─ Email unique
   ├─ Name not empty
   └─ Phone format valid (if provided)

3. System stores
   └─ Insert into patients table

4. System confirms
   └─ Return patient record
```

### Consultation Notes

```
1. Doctor selects patient
   └─ View patient history

2. Doctor creates consultation
   ├─ Required: patient_id, notes
   └─ Optional: diagnosis, prescription

3. System validates
   ├─ Doctor is authenticated
   ├─ Patient exists
   └─ Notes not empty

4. System stores
   ├─ Insert into consultations
   └─ Link to patient

5. System confirms
   └─ Return consultation record
```

### Patient History

```
1. User searches patient
   └─ By name, email, or ID

2. System returns matches
   └─ List of patients

3. User selects patient
   └─ View profile

4. System shows
   ├─ Patient demographics
   ├─ Consultation history (sorted by date)
   └─ Recent notes
```

## Domain Rules

### Data Protection
- Patient data is PII — protect at rest and in transit
- No patient data in logs
- Audit trail for data access
- Consent for data sharing

### Access Control
- Only doctors/admins can create consultations
- Receptionists cannot see consultation notes
- Doctors see only their patients (unless admin)
- Admin can access all data

### Business Rules
- One consultation per doctor per patient per day (soft rule)
- Notes must be non-empty
- Diagnosis required for prescriptions
- Follow-up date optional

## Search Patterns

```sql
-- Patient search by name
SELECT * FROM patients
WHERE name ILIKE '%' || $1 || '%'
ORDER BY name;

-- Patient search by email
SELECT * FROM patients
WHERE email = $1;

-- Consultation history for patient
SELECT c.*, d.name as doctor_name
FROM consultations c
JOIN doctors d ON c.doctor_id = d.id
WHERE c.patient_id = $1
ORDER BY c.created_at DESC;
```

## PDF Export Structure

```
Patient Consultation Report
├─ Patient Info
│   ├─ Name
│   ├─ DOB
│   └─ Contact
├─ Consultation Details
│   ├─ Date
│   ├─ Doctor
│   ├─ Notes
│   └─ Diagnosis
└─ Footer
    ├─ Generated date
    └─ Clinic info
```

## Anti-Patterns

- ❌ Exposing patient data to unauthorized roles
- ❌ Storing consultation notes without doctor link
- ❌ No audit trail for data access
- ❌ Hardcoding role checks instead of using RLS
- ❌ Including PII in error messages
