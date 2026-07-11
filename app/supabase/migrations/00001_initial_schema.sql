-- ============================================================================
-- Dr.Note — Initial Schema Migration (ERD v0.1)
-- Source of truth: docs/guide/01-database-schema.md
-- ============================================================================

-- ============================================
-- Identity & Access (Blue Zone)
-- ============================================

-- Users table
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Staff profiles (1:1 extension for staff)
create table staff_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  staff_code text unique not null,
  department text
);

-- Patient profiles (1:1 extension for patients)
create table patient_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  nrc text,
  dob date,
  gender text,
  religion text,
  ethnicity text,
  address text
);

-- Emergency contacts (many per patient)
create table emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patient_profiles(user_id) on delete cascade,
  name text not null,
  relationship text,
  phone text
);

-- Roles
create table roles (
  id smallint primary key,
  name text unique not null
);

-- Permissions
create table permissions (
  id smallint primary key,
  code text unique not null,
  description text
);

-- User roles (many-to-many)
create table user_roles (
  user_id uuid references users(id) on delete cascade,
  role_id smallint references roles(id),
  primary key (user_id, role_id)
);

-- Role permissions (many-to-many)
create table role_permissions (
  role_id smallint references roles(id) on delete cascade,
  permission_id smallint references permissions(id),
  primary key (role_id, permission_id)
);

-- ============================================
-- Clinical Workflow (Teal Zone)
-- ============================================

-- Visits (the hub)
create table visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references users(id),
  doctor_id uuid references users(id),
  receptionist_id uuid references users(id),
  visit_type text,
  status text not null default 'waiting' check (status in ('waiting', 'screening', 'with_doctor', 'completed')),
  chief_complaint text,
  diagnosis_note text,
  visit_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Screenings (nurse vitals, exactly one per visit — D3)
create table screenings (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null unique references visits(id) on delete cascade,
  height_cm numeric,
  weight_kg numeric,
  bmi numeric generated always as (
    case
      when height_cm is not null and height_cm > 0
      then weight_kg / power(height_cm / 100.0, 2)
      else null
    end
  ) stored,
  bp_systolic smallint,
  bp_diastolic smallint,
  heart_rate smallint,
  temperature_c numeric,
  oxygen_saturation smallint,
  screened_by uuid references users(id),
  created_at timestamptz not null default now()
);

-- Diagnoses (read-only ICD catalog)
create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null
);

-- Visit diagnoses (M:N junction, typed)
create table visit_diagnoses (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  diagnosis_id uuid not null references diagnoses(id),
  diagnosis_type text not null check (diagnosis_type in ('primary', 'secondary', 'suspected')),
  unique (visit_id, diagnosis_id)
);

-- Prescriptions
create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  doctor_id uuid not null references users(id),
  diagnosis_id uuid references diagnoses(id),
  instruction text,
  created_at timestamptz not null default now()
);

-- Prescription items
create table prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references prescriptions(id) on delete cascade,
  medicine_name text not null,
  dosage text,
  frequency text,
  duration text,
  route text,
  quantity smallint
);

-- Attachments
create table attachments (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  file_path text not null,
  file_type text,
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);

-- ============================================
-- Helper Functions
-- ============================================

-- Permission check function
create or replace function public.has_permission(perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from user_roles ur
    join role_permissions rp on rp.role_id = ur.role_id
    join permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid() and p.code = perm
  );
$$;

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table staff_profiles enable row level security;
alter table patient_profiles enable row level security;
alter table emergency_contacts enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table user_roles enable row level security;
alter table role_permissions enable row level security;
alter table visits enable row level security;
alter table screenings enable row level security;
alter table diagnoses enable row level security;
alter table visit_diagnoses enable row level security;
alter table prescriptions enable row level security;
alter table prescription_items enable row level security;
alter table attachments enable row level security;

-- Users policies
create policy users_select on users for select
  using (has_permission('users.manage') or id = auth.uid());

create policy users_insert on users for insert
  with check (has_permission('users.manage'));

create policy users_update on users for update
  using (has_permission('users.manage') or id = auth.uid());

-- Visits policies
create policy visits_select on visits for select
  using (has_permission('visits.read') or patient_id = auth.uid());

create policy visits_insert on visits for insert
  with check (has_permission('visits.create'));

create policy visits_update on visits for update
  using (has_permission('visits.update_status'));

-- Screenings policies
create policy screenings_select on screenings for select
  using (has_permission('screenings.create') or exists (
    select 1 from visits where visits.id = screenings.visit_id and visits.patient_id = auth.uid()
  ));

create policy screenings_insert on screenings for insert
  with check (has_permission('screenings.create'));

-- Diagnoses policies (read-only catalog)
create policy diagnoses_select on diagnoses for select
  using (true);

-- Visit diagnoses policies
create policy visit_diagnoses_select on visit_diagnoses for select
  using (has_permission('diagnoses.assign') or exists (
    select 1 from visits where visits.id = visit_diagnoses.visit_id and visits.patient_id = auth.uid()
  ));

create policy visit_diagnoses_insert on visit_diagnoses for insert
  with check (has_permission('diagnoses.assign'));

-- Prescriptions policies
create policy prescriptions_select on prescriptions for select
  using (has_permission('prescriptions.create') or exists (
    select 1 from visits where visits.id = prescriptions.visit_id and visits.patient_id = auth.uid()
  ));

create policy prescriptions_insert on prescriptions for insert
  with check (has_permission('prescriptions.create'));

-- Prescription items policies
create policy prescription_items_select on prescription_items for select
  using (has_permission('prescriptions.create') or exists (
    select 1 from prescriptions p
    join visits v on v.id = p.visit_id
    where p.id = prescription_items.prescription_id and v.patient_id = auth.uid()
  ));

create policy prescription_items_insert on prescription_items for insert
  with check (has_permission('prescriptions.create'));

-- Attachments policies
create policy attachments_select on attachments for select
  using (has_permission('visits.read') or exists (
    select 1 from visits where visits.id = attachments.visit_id and visits.patient_id = auth.uid()
  ));

create policy attachments_insert on attachments for insert
  with check (has_permission('visits.create'));

-- Staff profiles policies
create policy staff_profiles_select on staff_profiles for select
  using (true);  -- staff profiles visible to all authenticated users

create policy staff_profiles_insert on staff_profiles for insert
  with check (has_permission('users.manage'));

create policy staff_profiles_update on staff_profiles for update
  using (user_id = auth.uid() or has_permission('users.manage'));

-- Patient profiles policies
create policy patient_profiles_select on patient_profiles for select
  using (has_permission('patients.read') or user_id = auth.uid());

create policy patient_profiles_insert on patient_profiles for insert
  with check (has_permission('patients.create'));

create policy patient_profiles_update on patient_profiles for update
  using (has_permission('patients.update') or user_id = auth.uid());

-- Emergency contacts policies
create policy emergency_contacts_select on emergency_contacts for select
  using (has_permission('patients.read') or patient_id = auth.uid());

create policy emergency_contacts_insert on emergency_contacts for insert
  with check (has_permission('patients.create'));

create policy emergency_contacts_update on emergency_contacts for update
  using (has_permission('patients.update') or patient_id = auth.uid());

create policy emergency_contacts_delete on emergency_contacts for delete
  using (has_permission('patients.update') or patient_id = auth.uid());

-- Roles policies (read-only for most)
create policy roles_select on roles for select
  using (true);

-- Permissions policies (read-only for most)
create policy permissions_select on permissions for select
  using (true);

-- User roles policies
create policy user_roles_select on user_roles for select
  using (true);

create policy user_roles_insert on user_roles for insert
  with check (has_permission('users.manage'));

create policy user_roles_delete on user_roles for delete
  using (has_permission('users.manage'));

-- Role permissions policies
create policy role_permissions_select on role_permissions for select
  using (true);

create policy role_permissions_insert on role_permissions for insert
  with check (has_permission('users.manage'));

create policy role_permissions_delete on role_permissions for delete
  using (has_permission('users.manage'));
