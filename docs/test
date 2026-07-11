# Doctor's Notes — Design Document

## Overview

A clinical record-keeping app for two roles: **Doctors** (log diagnoses, prescriptions, and notes) and **Patients** (view their own records and medication instructions).

| Role | Capabilities | Cannot |
|------|-------------|--------|
| Doctor | CRUD diagnoses, prescriptions, notes. View patient history. | Modify other doctors' records |
| Patient | View own diagnoses, prescriptions, notes. | Create or edit any records |

**Out of scope**: Doctor license verification, clinic/specialist referrals, file attachments, offline mode.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + TypeScript + Vite | Fast DX, strong typing, modern bundler |
| UI Kit | shadcn/ui (87 components in `pencil-shadcn.pen`) | Copy-paste primitives, fully customizable |
| Backend | Spring Boot 3 REST API | Mature ecosystem, Java ecosystem fit for healthcare |
| Database | PostgreSQL 15+ | Relational integrity, JSON support for tags |
| Auth | Email/password → JWT (httpOnly cookie) | Stateless, role-aware, simple |
| Source Control | GitHub | Spec requirement |

---

## Design System

Based on shadcn/ui. Design components live in `dr-note.pen`; source library in `pencil-shadcn.pen` (87 reusable components).

### Theme Tokens

shadcn uses CSS custom properties. The default light theme:

| Token | Value | Purpose |
|-------|-------|---------|
| `--background` | `hsl(0 0% 100%)` | Page surface |
| `--foreground` | `hsl(222.2 84% 4.9%)` | Body text |
| `--card` | `hsl(0 0% 100%)` | Card background |
| `--card-foreground` | `hsl(222.2 84% 4.9%)` | Card text |
| `--primary` | `hsl(222.2 47.4% 11.2%)` | Buttons, active links |
| `--primary-foreground` | `hsl(210 40% 98%)` | Text on primary |
| `--secondary` | `hsl(210 40% 96.1%)` | Secondary buttons, hovers |
| `--muted` | `hsl(210 40% 96.1%)` | Subtle backgrounds |
| `--muted-foreground` | `hsl(215.4 16.3% 46.9%)` | Placeholder text |
| `--accent` | `hsl(210 40% 96.1%)` | Accent highlights |
| `--destructive` | `hsl(0 84.2% 60.2%)` | Delete actions, errors |
| `--border` | `hsl(214.3 31.8% 91.4%)` | Borders, dividers |
| `--input` | `hsl(214.3 31.8% 91.4%)` | Input field borders |
| `--ring` | `hsl(222.2 84% 4.9%)` | Focus rings |
| `--radius` | `0.5rem` | Default corner radius |

Dark theme: add `dark` class to `<html>` — tokens auto-switch via `globals.css`.

### Component Inventory

From `pencil-shadcn.pen` — 87 reusable components grouped by category:

| Category | Components | Used In |
|----------|-----------|---------|
| **Buttons** | Default, Large, Secondary, Destructive, Outline, Ghost | Forms, actions, navigation |
| **Forms** | Input, Textarea, Select, Switch, Radio Group, Checkbox | All data entry screens |
| **Data Display** | Card, Badge, Avatar, Table, Data Table | Dashboards, detail views |
| **Navigation** | Sidebar, Breadcrumb, Tabs, Pagination, Dropdown Menu | Layout, page navigation |
| **Feedback** | Alert, Dialog, Modal, Progress Bar | Confirmations, errors, loading |
| **Layout** | Accordion, List Item, Icon Button | Collapsible sections, compact lists |

### Component-to-Screen Mapping

| Screen Area | Primary Components | shadcn Source |
|-------------|-------------------|---------------|
| Login / Register | Card, Input, Button, Label | Form primitives |
| Sidebar nav | Sidebar, Icon Button, Avatar | Layout components |
| Top bar | Avatar, Dropdown Menu, Breadcrumb | Navigation components |
| Patient list (doctor) | Data Table, Input (search), Badge, Button | Data display + forms |
| Patient detail | Tabs, Card, Badge | Data display + navigation |
| Diagnosis form | Input, Textarea, Button, Label | Form primitives |
| Prescription form | Input, Select, Textarea, Button, Label | Form primitives |
| Note form | Input, Textarea, Button, Label | Form primitives |
| Patient records view | Tabs, Data Table, Badge | Data display + navigation |
| Prescription detail | Card, Alert, Badge, Accordion | Data display + feedback |
| Profile / Settings | Card, Input, Switch, Button, Avatar | Form + data display |

---

## Screen Map

### Auth

| Screen | Route | Layout | Key Components |
|--------|-------|--------|---------------|
| Login | `/login` | Centered card | Card → Input (email), Input (password), Button (Sign in), Link (Register) |
| Register | `/register` | Centered card | Card → Input (full name), Input (email), Input (password), Input (confirm), Select (role), Button (Create account), Link (Login) |

### Doctor

| Screen | Route | Layout | Key Components |
|--------|-------|--------|---------------|
| Patient list | `/doctor/patients` | Sidebar + content | Data Table (name, last visit, status), Input (search), Badge (active/inactive), Button (View) |
| Patient detail | `/doctor/patients/:id` | Sidebar + content | Card (patient info), Tabs (Diagnoses \| Prescriptions \| Notes), Button (Add new) |
| Diagnosis form | `/doctor/diagnoses/new` | Sidebar + content | Card → Input (patient search/autocomplete), Input (date), Textarea (findings), Input (tags, comma-separated), Button (Save) |
| Prescription form | `/doctor/prescriptions/new` | Sidebar + content | Card → Input (patient), Input (medication), Input (dosage), Select (frequency), Input (duration), Textarea (instructions), Button (Save) |
| Note form | `/doctor/notes/new` | Sidebar + content | Card → Input (patient), Input (title), Textarea (content), Button (Save) |

### Patient

| Screen | Route | Layout | Key Components |
|--------|-------|--------|---------------|
| My records | `/patient/records` | Sidebar + content | Tabs (Diagnoses \| Prescriptions \| Notes), Data Table per tab |
| Prescription detail | `/patient/prescriptions/:id` | Sidebar + content | Card (medication, dosage, frequency), Alert (allergy/interaction warnings), Badge (status), Accordion (instructions) |
| Diagnosis detail | `/patient/diagnoses/:id` | Sidebar + content | Card (findings, date), Badge (tags) |

### Shared

| Screen | Route | Layout | Key Components |
|--------|-------|--------|---------------|
| Profile | `/profile` | Sidebar + content | Card → Avatar, Input (name), Input (email, read-only), Button (Save) |
| Settings | `/settings` | Sidebar + content | Card → Switch (email notifications), Button (Save) |

---

## Layout

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (240px)          │  Topbar (56px)           │
│  ┌──────────────────┐     │  ┌────────────────────┐  │
│  │ 🏥 Dr. Notes     │     │  │ Breadcrumb    👤 ▾ │  │
│  │                   │     │  └────────────────────┘  │
│  │ 📋 Patients       │     ├──────────────────────────┤
│  │ 📝 Diagnoses      │     │                          │
│  │ 💊 Prescriptions   │     │   Content (max 1200px)   │
│  │ 📄 Notes          │     │   ┌──────────────────┐   │
│  │                   │     │   │  Card            │   │
│  │ ─────────────     │     │   │  (page content)  │   │
│  │ 👤 Profile        │     │   │                  │   │
│  │ ⚙️ Settings       │     │   └──────────────────┘   │
│  │ 🚪 Logout         │     │                          │
│  └──────────────────┘     │                          │
└──────────────────────────────────────────────────────┘
```

- **Sidebar**: 240px, collapsible to 64px (icons only). Role-aware: doctors see Patients/Diagnoses/Prescriptions/Notes; patients see My Records.
- **Topbar**: 56px height. Left: breadcrumb trail. Right: avatar + dropdown (Profile, Settings, Logout).
- **Content**: max-width 1200px, centered with auto margins. Padding 24px. Card-based for forms and detail views.

---

## Data Models

### users

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, default gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| role | ENUM('doctor', 'patient') | NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, default NOW() |
| updated_at | TIMESTAMP | NOT NULL, default NOW() |

### diagnoses

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| doctor_id | UUID | FK → users.id, NOT NULL |
| patient_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| findings | TEXT | NOT NULL |
| tags | TEXT[] | DEFAULT '{}' |
| diagnosis_date | DATE | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, default NOW() |
| updated_at | TIMESTAMP | NOT NULL, default NOW() |

### prescriptions

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| doctor_id | UUID | FK → users.id, NOT NULL |
| patient_id | UUID | FK → users.id, NOT NULL |
| medication | VARCHAR(200) | NOT NULL |
| dosage | VARCHAR(100) | NOT NULL |
| frequency | VARCHAR(100) | NOT NULL |
| duration | VARCHAR(100) | NOT NULL |
| instructions | TEXT | |
| status | ENUM('active','completed','discontinued') | NOT NULL, default 'active' |
| created_at | TIMESTAMP | NOT NULL, default NOW() |
| updated_at | TIMESTAMP | NOT NULL, default NOW() |

### notes

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| doctor_id | UUID | FK → users.id, NOT NULL |
| patient_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, default NOW() |
| updated_at | TIMESTAMP | NOT NULL, default NOW() |

### Indexes

```sql
CREATE INDEX idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_doctor ON diagnoses(doctor_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_notes_patient ON notes(patient_id);
CREATE INDEX idx_notes_doctor ON notes(doctor_id);
```

---

## API Design

Base URL: `/api`

### Auth

| Method | Endpoint | Body | Response | Status |
|--------|----------|------|----------|--------|
| POST | `/auth/register` | `{ name, email, password, role }` | `{ user: { id, name, email, role } }` | 201 |
| POST | `/auth/login` | `{ email, password }` | `{ user: { id, name, email, role } }` (JWT in httpOnly cookie) | 200 |
| POST | `/auth/logout` | — | `{ message }` | 200 |

### Users

| Method | Endpoint | Body | Response | Status |
|--------|----------|------|----------|--------|
| GET | `/users/me` | — | `{ user }` | 200 |
| PUT | `/users/me` | `{ name? }` | `{ user }` | 200 |

### Patients (doctor-only)

| Method | Endpoint | Query | Response | Status |
|--------|----------|-------|----------|--------|
| GET | `/patients` | `?search=&page=&limit=` | `{ patients: [...], total, page, limit }` | 200 |
| GET | `/patients/:id` | — | `{ patient, diagnoses: [...], prescriptions: [...], notes: [...] }` | 200 |

### Diagnoses

| Method | Endpoint | Body / Query | Response | Status |
|--------|----------|-------------|----------|--------|
| GET | `/diagnoses` | `?patient_id=&page=&limit=` | `{ diagnoses: [...], total }` | 200 |
| POST | `/diagnoses` | `{ patient_id, title, findings, tags, diagnosis_date }` | `{ diagnosis }` | 201 |
| PUT | `/diagnoses/:id` | `{ title?, findings?, tags?, diagnosis_date? }` | `{ diagnosis }` | 200 |
| DELETE | `/diagnoses/:id` | — | `{ message }` | 200 |

### Prescriptions

| Method | Endpoint | Body / Query | Response | Status |
|--------|----------|-------------|----------|--------|
| GET | `/prescriptions` | `?patient_id=&status=&page=&limit=` | `{ prescriptions: [...], total }` | 200 |
| POST | `/prescriptions` | `{ patient_id, medication, dosage, frequency, duration, instructions }` | `{ prescription }` | 201 |
| PUT | `/prescriptions/:id` | `{ status?, instructions? }` | `{ prescription }` | 200 |
| DELETE | `/prescriptions/:id` | — | `{ message }` | 200 |

### Notes

| Method | Endpoint | Body / Query | Response | Status |
|--------|----------|-------------|----------|--------|
| GET | `/notes` | `?patient_id=&page=&limit=` | `{ notes: [...], total }` | 200 |
| POST | `/notes` | `{ patient_id, title, content }` | `{ note }` | 201 |
| PUT | `/notes/:id` | `{ title?, content? }` | `{ note }` | 200 |
| DELETE | `/notes/:id` | — | `{ message }` | 200 |

### Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
```

Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`.

---

## Auth & Authorization

```
Register ──POST /auth/register──→ 201 → redirect /login
Login    ──POST /auth/login────→ 200 → JWT in httpOnly cookie → redirect based on role
Logout   ──POST /auth/logout───→ 200 → clear cookie → redirect /login
```

- **JWT payload**: `{ sub: userId, role: "doctor"|"patient", exp: ... }`
- **Cookie**: `httpOnly`, `secure`, `sameSite=strict`, path `/api`
- **Route guards**: Frontend checks `user.role` from context — doctors go to `/doctor/*`, patients to `/patient/*`
- **API middleware**: Backend validates JWT on every `/api/*` request (except `/auth/*`). Role checked per endpoint (doctor-only routes return 403 for patients).

---

## Frontend Structure

```
src/
├── components/
│   ├── ui/                  # shadcn primitives (Button, Card, Input, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx      # Collapsible, role-aware nav
│   │   ├── Topbar.tsx       # Breadcrumb + avatar dropdown
│   │   └── PageWrapper.tsx  # Sidebar + Topbar + content slot
│   └── shared/
│       ├── PatientCard.tsx  # Patient info summary card
│       ├── RecordTable.tsx  # Reusable data table for diagnoses/prescriptions/notes
│       └── ConfirmDialog.tsx # Delete confirmation dialog
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── doctor/
│   │   ├── PatientList.tsx
│   │   ├── PatientDetail.tsx
│   │   ├── DiagnosisForm.tsx
│   │   ├── PrescriptionForm.tsx
│   │   └── NoteForm.tsx
│   ├── patient/
│   │   ├── MyRecords.tsx
│   │   ├── PrescriptionDetail.tsx
│   │   └── DiagnosisDetail.tsx
│   └── shared/
│       ├── Profile.tsx
│       └── Settings.tsx
├── hooks/
│   ├── useAuth.ts           # Login, logout, current user
│   ├── usePatients.ts       # List, search, detail
│   ├── useDiagnoses.ts      # CRUD
│   ├── usePrescriptions.ts  # CRUD
│   └── useNotes.ts          # CRUD
├── services/
│   └── api.ts               # Axios instance, interceptors, token handling
├── types/
│   ├── user.ts
│   ├── diagnosis.ts
│   ├── prescription.ts
│   └── note.ts
├── lib/
│   ├── utils.ts             # cn(), date formatting, validation helpers
│   └── constants.ts         # Route paths, status labels
├── contexts/
│   └── AuthContext.tsx       # User state, role, login/logout actions
├── App.tsx                   # Router with role-based guards
└── main.tsx
```

### Key Patterns

| Pattern | Implementation |
|---------|---------------|
| Route guards | `ProtectedRoute` component wraps private routes; checks auth + role |
| Data fetching | Custom hooks (`usePatients`, etc.) wrap `api.ts` calls; return `{ data, loading, error }` |
| Mutations | Same hooks expose `create()`, `update()`, `delete()` — refetch list on success |
| Form handling | React Hook Form + Zod schemas for validation |
| Error display | Toast (shadcn Sonner) for API errors; inline field errors for validation |
| Loading states | Skeleton components on tables; Button `loading` prop on form submit |
| Empty states | Illustration + "No records yet" message + CTA button |
| Optimistic UI | Not in v1 — wait for server response to keep medical data accurate |

---

## Responsive Behavior

| Breakpoint | Sidebar | Content |
|-----------|---------|---------|
| ≥1024px | Expanded (240px) | Full layout |
| 768–1023px | Collapsed (64px, icons) | Full width with padding |
| <768px | Hidden (hamburger toggle) | Full width, stacked cards |

Mobile: sidebar becomes a slide-over drawer. Tables switch to card-list layout.

---

## Definition of Done

- [ ] User can register and login
- [ ] Doctor can create and manage diagnosis
- [ ] Doctor can create and manage prescription
- [ ] Doctor can create and manage notes
- [ ] Patient can retrieve their own history and prescription

---

## Open Questions

1. **Patient search**: Fuzzy name matching or exact email lookup for doctor → patient assignment?
2. **Audit trail**: Track who edited what with timestamps, or just `created_at` / `updated_at`?
3. **Soft delete**: Should records be soft-deleted (kept in DB with `deleted_at`) or hard-deleted?
4. **Pagination defaults**: How many records per page — 10, 20, 50?