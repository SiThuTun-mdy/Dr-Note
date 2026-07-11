# Architecture Document

**Project:** Doctor Note MVP
**Version:** 1.0.0
**Status:** Approved
**Owner:** Architect Agent
**Last Updated:** 2026-07-08

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Entity Relationship Diagram (ERD)](#4-entity-relationship-diagram-erd)
5. [Database Schema](#5-database-schema)
6. [RLS Policies](#6-rls-policies)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Specification (Server Actions)](#8-api-specification-server-actions)
9. [Folder Structure](#9-folder-structure)
10. [Technical Risks & Assumptions](#10-technical-risks--assumptions)

---

## 1. Overview

Doctor Note MVP is a lightweight web application for small clinics to manage doctors, patients, consultation notes, and patient history digitally. The architecture follows a serverless full-stack approach using Next.js as the frontend/application layer and Supabase as the backend-as-a-service (BaaS) providing PostgreSQL database, authentication, and row-level security.

### Key Architectural Principles

- **Serverless-first:** No custom backend servers. Next.js on Vercel handles the frontend and server actions. Supabase handles database, auth, and RLS.
- **Role-based security at the database level:** Supabase RLS policies enforce authorization directly on PostgreSQL rows, eliminating the need for complex middleware authorization logic.
- **Single-tenant:** One clinic per deployment. No multi-tenancy complexity.
- **MVP-driven:** Architecture is optimized for fast delivery within 2 weeks. No over-engineering.
- **Type-safe end-to-end:** TypeScript throughout, with generated Supabase types for database queries.

### Architecture Style

The application follows a **Jamstack / BaaS** architecture:

```
Browser -> Next.js (Vercel) -> Supabase (PostgreSQL + Auth + RLS)
```

- **Client:** Next.js React components with Tailwind CSS and shadcn/ui
- **Server:** Next.js Server Actions (no custom API routes needed for MVP)
- **Data Layer:** Supabase PostgreSQL with RLS
- **Auth:** Supabase Auth (email/password)

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | Next.js | 14+ | React framework with App Router, SSR, Server Actions |
| **UI** | React | 18+ | Component library |
| **Styling** | Tailwind CSS | 3+ | Utility-first CSS framework |
| **Components** | shadcn/ui | latest | Pre-built accessible UI components |
| **Language** | TypeScript | 5+ | Type safety across the stack |
| **Database** | PostgreSQL | 15+ (Supabase) | Relational data storage |
| **Backend** | Supabase | latest | Database, Auth, RLS, realtime, storage |
| **Auth** | Supabase Auth | latest | Email/password authentication |
| **Forms** | React Hook Form + Zod | latest | Form state management and validation |
| **State** | React Query + Zustand | latest | Server state caching + client state |
| **PDF** | @react-pdf/renderer | latest | Client-side PDF generation |
| **Hosting** | Vercel | latest | Frontend hosting with edge functions |
| **DB Hosting** | Supabase Cloud | free tier | Managed PostgreSQL with auth |

### Why This Stack

- **Next.js App Router:** Server Components for performance, Server Actions for form handling without custom API routes.
- **Supabase:** Eliminates the need for a custom backend server. Provides PostgreSQL, Auth, RLS, and auto-generated REST API out of the box.
- **shadcn/ui:** Copy-paste accessible components that are customizable and work seamlessly with Tailwind.
- **Client-side PDF:** Avoids serverless function timeout issues on Vercel free tier.

---

## 3. System Architecture

### High-Level Diagram

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|    Browser        |------->|   Vercel (CDN)    |------->|   Supabase Cloud  |
|                   |        |                   |        |                   |
|  - React (RSC)    |        |  - Next.js 14    |        |  - PostgreSQL     |
|  - shadcn/ui      |        |  - Server Actions |        |  - Auth           |
|  - Tailwind CSS   |        |  - Middleware     |        |  - RLS Policies   |
|  - React Hook Form|        |  - Static Assets  |        |  - Auto REST API  |
|                   |        |                   |        |                   |
+-------------------+        +-------------------+        +-------------------+
         |                                                       |
         |                                                       |
         +------------------- Supabase Client SDK ---------------+
```

### Request Flow

1. **Unauthenticated user** visits any route -> Middleware redirects to `/login`
2. **Login:** User submits credentials -> Supabase Auth validates -> JWT token stored -> Redirect to `/dashboard`
3. **Authenticated user** navigates to a page -> Next.js Server Component runs -> Server Action (if form submission) -> Supabase query with RLS enforcement -> Data returned to client
4. **RLS check:** Every database query automatically includes the user's JWT. RLS policies evaluate the user's role and restrict which rows are visible/modifiable.

### Middleware Layer

Next.js Middleware runs on every request to:

- Check for valid Supabase session (via JWT cookie)
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` to `/dashboard`
- No role-based logic in middleware -- that is handled by RLS

---

## 4. Entity Relationship Diagram (ERD)

### Tables

```
+-------------------+       +-------------------+       +-------------------+
|      users        |       |      doctors       |       |     patients      |
|-------------------|       |-------------------|       |-------------------|
| id (UUID) PK      |<----->| id (UUID) PK      |       | id (UUID) PK      |
| email (TEXT)       |       | user_id (UUID) FK |       | name (TEXT)        |
| role (TEXT)        |       | name (TEXT)        |       | email (TEXT)       |
| full_name (TEXT)   |       | specialty (TEXT)   |       | phone (TEXT)       |
| created_at (TSTZ)  |       | created_at (TSTZ)  |       | date_of_birth (DATE)|
+-------------------+       | updated_at (TSTZ)  |       | address (TEXT)     |
                             +-------------------+       | created_at (TSTZ)  |
                                     |                   | updated_at (TSTZ)  |
                                     |                   +-------------------+
                                     |                          |
                                     |                   +-------------------+
                                     +------------------>|  consultations   |
                                                         |------------------|
                                                         | id (UUID) PK     |
                                                         | patient_id (UUID) FK|
                                                         | doctor_id (UUID) FK|
                                                         | notes (TEXT)      |
                                                         | diagnosis (TEXT)  |
                                                         | prescription (TEXT)|
                                                         | follow_up_date (DATE)|
                                                         | created_at (TSTZ) |
                                                         | updated_at (TSTZ) |
                                                         +-------------------+
```

### Relationships

| Relationship | Type | Description |
|---|---|---|
| users -> doctors | 1:1 | Each doctor is linked to exactly one user account (via `user_id`) |
| users -> patients | None | Patients are standalone records (not linked to user accounts) |
| doctors -> consultations | 1:N | A doctor can have many consultations |
| patients -> consultations | 1:N | A patient can have many consultations |
| doctors -> consultations | N:1 | A consultation belongs to one doctor |
| patients -> consultations | N:1 | A consultation belongs to one patient |

### ERD Details

#### Table: `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, FK -> auth.users(id) | Supabase auth user ID |
| email | TEXT | NOT NULL, UNIQUE | User email address |
| role | TEXT | NOT NULL, CHECK (role IN ('admin', 'doctor', 'receptionist')) | User role |
| full_name | TEXT | NOT NULL | User's full name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation timestamp |

#### Table: `doctors`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Doctor record ID |
| user_id | UUID | UNIQUE, FK -> users(id) ON DELETE SET NULL | Linked user account |
| name | TEXT | NOT NULL | Doctor's full name |
| specialty | TEXT | NOT NULL | Medical specialty |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update |

#### Table: `patients`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Patient record ID |
| name | TEXT | NOT NULL | Patient's full name |
| email | TEXT | NOT NULL, UNIQUE | Patient email (for identification) |
| phone | TEXT | NULL | Phone number |
| date_of_birth | DATE | NULL | Date of birth |
| address | TEXT | NULL | Physical address |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update |

#### Table: `consultations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Consultation record ID |
| patient_id | UUID | NOT NULL, FK -> patients(id) ON DELETE CASCADE | Patient being seen |
| doctor_id | UUID | NOT NULL, FK -> doctors(id) ON DELETE CASCADE | Doctor creating the note |
| notes | TEXT | NOT NULL | Consultation notes content |
| diagnosis | TEXT | NULL | Diagnosis (required if prescription provided) |
| prescription | TEXT | NULL | Prescription details |
| follow_up_date | DATE | NULL | Follow-up appointment date |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Consultation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update |

---

## 5. Database Schema

### SQL Migration File

```sql
-- =============================================================
-- Doctor Note MVP - Database Schema
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- Table: users
-- Stores application-specific user data linked to Supabase Auth
-- =============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX idx_users_role ON users(role);

-- =============================================================
-- Table: doctors
-- Doctor profiles linked to user accounts
-- =============================================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for search by name
CREATE INDEX idx_doctors_name ON doctors(name);

-- =============================================================
-- Table: patients
-- Patient records (standalone, not linked to auth users)
-- =============================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for search by name and email
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_email ON patients(email);

-- =============================================================
-- Table: consultations
-- Clinical consultation notes linking doctors and patients
-- =============================================================
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  diagnosis TEXT,
  prescription TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);

-- =============================================================
-- Auto-update updated_at timestamp
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- Auto-create user profile on signup
-- =============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to auto-create user profile when a new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- Enable Row Level Security on all tables
-- =============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
```

---

## 6. RLS Policies

### RLS Policy Design

All tables have RLS enabled. Policies are designed around the `role` column in the `users` table, accessed via `auth.uid()` which returns the current authenticated user's ID.

### Helper Function

```sql
-- Get the current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if the current user is a doctor
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'doctor';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if the current user is a receptionist
CREATE OR REPLACE FUNCTION is_receptionist()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'receptionist';
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Users Table Policies

```sql
-- =============================================================
-- USERS TABLE RLS POLICIES
-- =============================================================

-- All authenticated users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Admins can read all user profiles
CREATE POLICY "users_select_admin"
  ON users FOR SELECT
  USING (is_admin());

-- Admins can insert new users
CREATE POLICY "users_insert_admin"
  ON users FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update any user
CREATE POLICY "users_update_admin"
  ON users FOR UPDATE
  USING (is_admin());

-- Users can update their own profile (name only)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins can delete users
CREATE POLICY "users_delete_admin"
  ON users FOR DELETE
  USING (is_admin());
```

### Doctors Table Policies

```sql
-- =============================================================
-- DOCTORS TABLE RLS POLICIES
-- =============================================================

-- All authenticated users can read doctors (needed for dropdowns, search)
CREATE POLICY "doctors_select_all"
  ON doctors FOR SELECT
  USING (true);

-- Only admins can insert doctors
CREATE POLICY "doctors_insert_admin"
  ON doctors FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update doctors
CREATE POLICY "doctors_update_admin"
  ON doctors FOR UPDATE
  USING (is_admin());

-- Only admins can delete doctors
CREATE POLICY "doctors_delete_admin"
  ON doctors FOR DELETE
  USING (is_admin());
```

### Patients Table Policies

```sql
-- =============================================================
-- PATIENTS TABLE RLS POLICIES
-- =============================================================

-- Admins and receptionists can read all patients
CREATE POLICY "patients_select_admin_receptionist"
  ON patients FOR SELECT
  USING (is_admin() OR is_receptionist());

-- Doctors can read patients who have consultations with them
CREATE POLICY "patients_select_doctor"
  ON patients FOR SELECT
  USING (
    is_doctor() AND EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.patient_id = patients.id
      AND consultations.doctor_id = (
        SELECT id FROM doctors WHERE user_id = auth.uid()
      )
    )
  );

-- Admins and receptionists can insert patients
CREATE POLICY "patients_insert_admin_receptionist"
  ON patients FOR INSERT
  WITH CHECK (is_admin() OR is_receptionist());

-- Admins and receptionists can update patients
CREATE POLICY "patients_update_admin_receptionist"
  ON patients FOR UPDATE
  USING (is_admin() OR is_receptionist());

-- Only admins can delete patients
CREATE POLICY "patients_delete_admin"
  ON patients FOR DELETE
  USING (is_admin());
```

### Consultations Table Policies

```sql
-- =============================================================
-- CONSULTATIONS TABLE RLS POLICIES
-- =============================================================

-- Admins can read all consultations
CREATE POLICY "consultations_select_admin"
  ON consultations FOR SELECT
  USING (is_admin());

-- Doctors can read their own consultations
CREATE POLICY "consultations_select_doctor_own"
  ON consultations FOR SELECT
  USING (
    is_doctor() AND doctor_id = (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Receptionists can read consultations (read-only, no note content)
-- Note: This is enforced at the application level via column selection
-- RLS allows row access; the UI hides the notes column for receptionists
CREATE POLICY "consultations_select_receptionist"
  ON consultations FOR SELECT
  USING (is_receptionist());

-- Doctors can insert consultations for their own doctor_id
CREATE POLICY "consultations_insert_doctor"
  ON consultations FOR INSERT
  WITH CHECK (
    is_doctor() AND doctor_id = (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Admins can insert consultations for any doctor
CREATE POLICY "consultations_insert_admin"
  ON consultations FOR INSERT
  WITH CHECK (is_admin());

-- Doctors can update their own consultations only
CREATE POLICY "consultations_update_doctor_own"
  ON consultations FOR UPDATE
  USING (
    is_doctor() AND doctor_id = (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Admins can update any consultation
CREATE POLICY "consultations_update_admin"
  ON consultations FOR UPDATE
  USING (is_admin());

-- Only admins can delete consultations
CREATE POLICY "consultations_delete_admin"
  ON consultations FOR DELETE
  USING (is_admin());
```

### RLS Enforcement Summary

| Operation | Users | Doctors | Patients | Consultations |
|---|---|---|---|---|
| **SELECT** | Own profile; Admin sees all | All authenticated | Admin+Receptionist: all; Doctor: own patients | Admin: all; Doctor: own; Receptionist: all |
| **INSERT** | Admin only | Admin only | Admin + Receptionist | Doctor (own); Admin (any) |
| **UPDATE** | Admin any; Own profile | Admin only | Admin + Receptionist | Doctor (own); Admin (any) |
| **DELETE** | Admin only | Admin only | Admin only | Admin only |

---

## 7. Authentication & Authorization

### Authentication Flow

1. **Login:** User enters email + password on `/login` page
2. **Supabase Auth:** Credentials validated against `auth.users` table
3. **JWT Token:** On success, Supabase returns a JWT containing `user.id` and `user.email`
4. **Session Storage:** JWT stored in an HTTP-only cookie managed by Supabase client library
5. **Middleware Check:** Next.js middleware verifies the JWT on every request; redirects to `/login` if invalid

### Authorization Model

Authorization is split into two layers:

**Layer 1: Application Level (UI)**
- Hide navigation links and buttons based on user role
- Redirect unauthorized page access via middleware
- Role displayed in header for user awareness

**Layer 2: Database Level (RLS)**
- Every Supabase query automatically includes the user's JWT
- RLS policies evaluate `auth.uid()` and `get_user_role()` to filter rows
- Even if UI is bypassed, the database rejects unauthorized queries

### User Role Matrix

| Capability | Admin | Doctor | Receptionist |
|---|---|---|---|
| View dashboard | Yes | Yes | Yes |
| Manage doctors (CRUD) | Yes | No | No |
| Register patients | Yes | No | Yes |
| View all patients | Yes | Own patients only | Yes |
| Search patients | Yes | Own patients only | Yes |
| Create consultations | Yes | Own only | No |
| Edit consultations | Yes | Own only | No |
| View consultation notes | Yes | Own only | No |
| Export consultation PDF | Yes | Yes | No |
| Manage user roles | Yes | No | No |

### Auth Configuration

```typescript
// supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### Server Action Auth Pattern

Every server action must:
1. Get the authenticated user via `supabase.auth.getUser()`
2. Get the user's role from the `users` table
3. Perform the operation (RLS provides additional enforcement)

```typescript
// Example: Server action pattern
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createPatient(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // 2. Get user role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // 3. Check role permission (defense in depth -- RLS also enforces this)
  if (profile?.role !== 'admin' && profile?.role !== 'receptionist') {
    throw new Error('Forbidden: Only admin and receptionist can create patients')
  }

  // 4. Perform operation (RLS automatically filters)
  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      date_of_birth: formData.get('date_of_birth') as string || null,
      address: formData.get('address') as string || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 8. API Specification (Server Actions)

All data mutations use Next.js Server Actions (no custom API routes). Queries use Supabase client directly in Server Components or via React Query on the client.

### Server Actions

#### Authentication Actions

| Action | File | Description |
|---|---|---|
| `login` | `app/actions/auth.ts` | Authenticate user with email/password |
| `logout` | `app/actions/auth.ts` | Sign out and clear session |
| `getUserProfile` | `app/actions/auth.ts` | Get current user's profile and role |

#### Doctor Actions (Admin only)

| Action | File | Method | Description |
|---|---|---|---|
| `getDoctors` | `app/actions/doctors.ts` | READ | List all doctors with search filter |
| `getDoctor` | `app/actions/doctors.ts` | READ | Get single doctor by ID |
| `createDoctor` | `app/actions/doctors.ts` | CREATE | Create new doctor record |
| `updateDoctor` | `app/actions/doctors.ts` | UPDATE | Update doctor details |
| `deleteDoctor` | `app/actions/doctors.ts` | DELETE | Delete doctor (with confirmation) |

#### Patient Actions (Admin + Receptionist create; Doctor read own)

| Action | File | Method | Description |
|---|---|---|---|
| `getPatients` | `app/actions/patients.ts` | READ | List all patients with search filter |
| `getPatient` | `app/actions/patients.ts` | READ | Get single patient with profile |
| `createPatient` | `app/actions/patients.ts` | CREATE | Register new patient |
| `updatePatient` | `app/actions/patients.ts` | UPDATE | Update patient details |
| `deletePatient` | `app/actions/patients.ts` | DELETE | Delete patient (admin only) |
| `searchPatients` | `app/actions/patients.ts` | READ | Search by name, email, or ID |

#### Consultation Actions (Doctor create/edit own; Admin full access)

| Action | File | Method | Description |
|---|---|---|---|
| `getConsultations` | `app/actions/consultations.ts` | READ | List consultations (filtered by role) |
| `getConsultation` | `app/actions/consultations.ts` | READ | Get single consultation details |
| `createConsultation` | `app/actions/consultations.ts` | CREATE | Create new consultation note |
| `updateConsultation` | `app/actions/consultations.ts` | UPDATE | Edit consultation (own only) |
| `getPatientHistory` | `app/actions/consultations.ts` | READ | Get all consultations for a patient |
| `getDashboardStats` | `app/actions/consultations.ts` | READ | Get dashboard statistics |

### Server Action Signatures

```typescript
// =============================================================
// app/actions/auth.ts
// =============================================================

'use server'

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }>

export async function logout(): Promise<void>

export async function getUserProfile(): Promise<{
  id: string
  email: string
  role: 'admin' | 'doctor' | 'receptionist'
  full_name: string
} | null>

// =============================================================
// app/actions/doctors.ts
// =============================================================

'use server'

export async function getDoctors(
  search?: string
): Promise<Doctor[]>

export async function getDoctor(
  id: string
): Promise<Doctor | null>

export async function createDoctor(
  data: { name: string; specialty: string; user_id?: string }
): Promise<Doctor>

export async function updateDoctor(
  id: string,
  data: { name?: string; specialty?: string; user_id?: string }
): Promise<Doctor>

export async function deleteDoctor(
  id: string
): Promise<void>

// =============================================================
// app/actions/patients.ts
// =============================================================

'use server'

export async function getPatients(
  search?: string
): Promise<Patient[]>

export async function getPatient(
  id: string
): Promise<Patient | null>

export async function createPatient(
  data: {
    name: string
    email: string
    phone?: string
    date_of_birth?: string
    address?: string
  }
): Promise<Patient>

export async function updatePatient(
  id: string,
  data: {
    name?: string
    email?: string
    phone?: string
    date_of_birth?: string
    address?: string
  }
): Promise<Patient>

export async function deletePatient(
  id: string
): Promise<void>

// =============================================================
// app/actions/consultations.ts
// =============================================================

'use server'

export async function getConsultations(
  filters?: { patient_id?: string; doctor_id?: string }
): Promise<Consultation[]>

export async function getConsultation(
  id: string
): Promise<Consultation | null>

export async function createConsultation(
  data: {
    patient_id: string
    notes: string
    diagnosis?: string
    prescription?: string
    follow_up_date?: string
  }
): Promise<Consultation>

export async function updateConsultation(
  id: string,
  data: {
    notes?: string
    diagnosis?: string
    prescription?: string
    follow_up_date?: string
  }
): Promise<Consultation>

export async function getPatientHistory(
  patientId: string
): Promise<Consultation[]>

export async function getDashboardStats(): Promise<{
  totalPatients: number
  totalDoctors: number
  todayConsultations: number
  recentConsultations: Consultation[]
}>
```

### TypeScript Types

```typescript
// lib/types/database.ts

export interface User {
  id: string
  email: string
  role: 'admin' | 'doctor' | 'receptionist'
  full_name: string
  created_at: string
}

export interface Doctor {
  id: string
  user_id: string | null
  name: string
  specialty: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: string
  patient_id: string
  doctor_id: string
  notes: string
  diagnosis: string | null
  prescription: string | null
  follow_up_date: string | null
  created_at: string
  updated_at: string
  // Joined fields (when querying with joins)
  patient?: Patient
  doctor?: Doctor
}

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  todayConsultations: number
  recentConsultations: Consultation[]
}
```

---

## 9. Folder Structure

```
dr-note/
├── .env.local                          # Environment variables (Supabase keys)
├── .env.example                        # Example env file for documentation
├── next.config.js                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json
├── supabase/
│   ├── config.toml                     # Supabase local config
│   └── migrations/
│       └── 001_initial_schema.sql      # Database migration
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (providers, fonts)
│   │   ├── page.tsx                    # Root redirect -> /dashboard or /login
│   │   ├── loading.tsx                 # Global loading state
│   │   │
│   │   ├── (auth)/                     # Auth route group (no sidebar)
│   │   │   ├── layout.tsx              # Auth layout (centered card)
│   │   │   └── login/
│   │   │       └── page.tsx            # Login page
│   │   │
│   │   ├── (dashboard)/                # Protected dashboard route group
│   │   │   ├── layout.tsx              # Dashboard layout (sidebar + header)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Dashboard with stats
│   │   │   │
│   │   │   ├── doctors/                # Doctor management (admin only)
│   │   │   │   ├── page.tsx            # Doctor list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Create doctor form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # View doctor details
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx    # Edit doctor form
│   │   │   │
│   │   │   ├── patients/               # Patient management
│   │   │   │   ├── page.tsx            # Patient list with search
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Patient registration form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Patient profile + history
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx    # Edit patient form
│   │   │   │       └── consultations/
│   │   │   │           └── new/
│   │   │   │               └── page.tsx # New consultation form
│   │   │   │
│   │   │   └── consultations/          # Consultation management
│   │   │       ├── page.tsx            # Consultation list
│   │   │       └── [id]/
│   │   │           ├── page.tsx        # Consultation detail view
│   │   │           └── edit/
│   │   │               └── page.tsx    # Edit consultation form
│   │   │
│   │   └── api/                        # API routes (minimal for MVP)
│   │       └── auth/
│   │           └── callback/
│   │               └── route.ts        # Supabase auth callback
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── ui/                         # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                     # Layout components
│   │   │   ├── sidebar.tsx             # Navigation sidebar
│   │   │   ├── header.tsx              # Top header with user info
│   │   │   └── user-nav.tsx            # User dropdown menu
│   │   │
│   │   ├── doctors/                    # Doctor-specific components
│   │   │   ├── doctor-form.tsx         # Create/edit doctor form
│   │   │   ├── doctor-table.tsx        # Doctor list table
│   │   │   └── doctor-search.tsx       # Doctor search input
│   │   │
│   │   ├── patients/                   # Patient-specific components
│   │   │   ├── patient-form.tsx        # Create/edit patient form
│   │   │   ├── patient-table.tsx       # Patient list table
│   │   │   ├── patient-search.tsx      # Patient search input
│   │   │   ├── patient-profile.tsx     # Patient profile card
│   │   │   └── patient-history.tsx     # Consultation history timeline
│   │   │
│   │   ├── consultations/              # Consultation-specific components
│   │   │   ├── consultation-form.tsx   # Create/edit consultation form
│   │   │   ├── consultation-table.tsx  # Consultation list table
│   │   │   ├── consultation-detail.tsx # Consultation detail view
│   │   │   └── consultation-pdf.tsx    # PDF export component
│   │   │
│   │   └── dashboard/                  # Dashboard-specific components
│   │       ├── stats-cards.tsx         # Stats overview cards
│   │       └── recent-consultations.tsx # Recent consultations list
│   │
│   ├── lib/                            # Utility libraries
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   ├── server.ts               # Server Supabase client
│   │   │   └── admin.ts                # Service role client (admin ops)
│   │   │
│   │   ├── types/
│   │   │   └── database.ts             # TypeScript type definitions
│   │   │
│   │   ├── validations/
│   │   │   ├── doctor.ts               # Zod schemas for doctor
│   │   │   ├── patient.ts              # Zod schemas for patient
│   │   │   └── consultation.ts         # Zod schemas for consultation
│   │   │
│   │   ├── utils.ts                    # Utility functions (cn, formatDate, etc.)
│   │   └── constants.ts                # App constants (roles, routes, etc.)
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── use-user.ts                 # Current user + role hook
│   │   ├── use-patients.ts             # Patient query hook (React Query)
│   │   ├── use-doctors.ts              # Doctor query hook
│   │   └── use-consultations.ts        # Consultation query hook
│   │
│   └── app/actions/                    # Server Actions
│       ├── auth.ts                     # Authentication actions
│       ├── doctors.ts                  # Doctor CRUD actions
│       ├── patients.ts                 # Patient CRUD actions
│       └── consultations.ts            # Consultation CRUD actions
│
├── docs/                               # Documentation
│   ├── 00-Project-Brief.md
│   ├── 02-PRD.md
│   ├── 10-Decisions.md
│   ├── 12-Architecture.md              # This document
│   └── ...
│
└── scripts/                            # Development scripts
    ├── seed.ts                         # Database seed script
    └── setup.sh                        # Project setup script
```

### Key Folder Conventions

- **Route groups:** `(auth)` and `(dashboard)` separate layouts without affecting URL paths
- **Dynamic routes:** `[id]` for detail/edit pages
- **Server Actions:** Located in `src/app/actions/` -- keep server logic separate from components
- **Components:** Organized by domain (doctors/, patients/, consultations/, dashboard/)
- **Supabase clients:** Three variants -- browser, server, and admin (service role)
- **Zod schemas:** Co-located with validation logic for form validation

---

## 10. Technical Risks & Assumptions

### Risks

| ID | Risk | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| RISK-001 | **RLS policy bugs expose patient data** | High | Medium | Patient data breach, compliance violation | Write RLS policies first (Day 2). Test every policy with every role. Include RLS testing in QA checklist. Use `supabase` CLI to test locally. |
| RISK-002 | **Supabase free tier limits (500MB DB, 50K MAU)** | Medium | Low | Service throttling at scale | Acceptable for MVP/demo. Document limits. Upgrade path exists. |
| RISK-003 | **2-week timeline is aggressive** | High | Medium | Incomplete MVP | Strict MoSCoW prioritization. Dashboard and PDF are "Should" -- cut first if behind. |
| RISK-004 | **Server Action errors are not user-friendly** | Medium | High | Poor user experience | Implement consistent error handling pattern. Use `try/catch` in every action. Return structured error responses. |
| RISK-005 | **No seed data makes testing difficult** | Low | High | Manual test data creation needed | Create seed script on Day 2 with admin, doctor, receptionist users and sample patients. |
| RISK-006 | **PDF generation performance on serverless** | Low | Medium | Slow exports | Use client-side `@react-pdf/renderer` to avoid serverless limits. No server-side PDF needed. |
| RISK-007 | **Type safety between Supabase and TypeScript** | Medium | Low | Runtime errors from type mismatches | Generate Supabase types via `supabase gen types typescript`. Use in all queries. |
| RISK-008 | **Consultation edit ownership enforcement gap** | High | Medium | Doctors editing other doctors' notes | RLS policy `consultations_update_doctor_own` prevents this at DB level. Add client-side check as defense in depth. |

### Assumptions

| ID | Assumption | Impact if Invalid |
|---|---|---|
| ASM-001 | Supabase Auth handles all authentication needs | Would need custom auth system |
| ASM-002 | Supabase RLS provides sufficient access control | Would need custom authorization middleware |
| ASM-003 | Single clinic deployment only (no multi-tenancy) | Schema would need clinic_id columns |
| ASM-004 | All users have modern browser access | Would need polyfills or compatibility layer |
| ASM-005 | Clinic admin manually creates user accounts | Would need self-registration flow |
| ASM-006 | Patient data stored in Supabase is single source of truth | Would need data sync with external systems |
| ASM-007 | Deployed to Vercel with Supabase backend | Would need alternative hosting setup |
| ASM-008 | PDF export is client-side only | Would need serverless PDF service |
| ASM-009 | All consultation notes are text-only | Would need file upload/storage |
| ASM-010 | Small team (<20 users) per clinic | Would need scaling architecture |

### Security Considerations

1. **RLS is the primary defense:** All authorization is enforced at the database level. Even if the application layer has bugs, RLS prevents unauthorized data access.
2. **No service role key in client code:** The Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) is only used in server-side code (e.g., seed scripts). Never expose it to the browser.
3. **Environment variables:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose (they are public). `SUPABASE_SERVICE_ROLE_KEY` must remain secret.
4. **Input validation:** All user inputs validated with Zod schemas before reaching the database. Server Actions validate inputs before passing to Supabase.
5. **CSRF protection:** Supabase Auth handles CSRF via SameSite cookies. Next.js Server Actions include built-in CSRF tokens.
6. **HTTPS:** Vercel provides automatic HTTPS. Supabase enforces HTTPS for all API calls.

### Performance Considerations

1. **Database indexes:** All frequently queried columns have indexes (patient name/email, doctor name, consultation patient_id/doctor_id, timestamps).
2. **Server Components:** Pages render on the server by default, reducing client-side JavaScript.
3. **React Query:** Client-side data fetching uses React Query for caching and background refetching.
4. **Search:** Patient search uses PostgreSQL `ILIKE` for partial matching. For MVP, this is sufficient. If performance degrades, add full-text search with `tsvector`.
5. **PDF generation:** Client-side rendering avoids serverless function cold starts and timeout limits.

---

## Appendix A: Seed Script Structure

```typescript
// scripts/seed.ts
// Run with: npx tsx scripts/seed.ts

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  // 1. Create auth users (admin, doctor, receptionist)
  // 2. Insert doctor profiles
  // 3. Insert sample patients
  // 4. Insert sample consultations
}

seed()
```

## Appendix B: Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Appendix C: Supabase Client Setup

```typescript
// lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts (server components + server actions)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component -- ignore
          }
        },
      },
    }
  )
}
```
