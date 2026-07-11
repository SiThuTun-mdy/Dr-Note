-- ============================================================================
-- Dr.Note — Seed Data Migration
-- Source of truth: docs/guide/01-database-schema.md §6 (Seed Matrix)
-- ============================================================================

-- ============================================================================
-- 1. ROLES
-- ============================================================================

insert into public.roles (id, name) values
  (1, 'admin'),
  (2, 'doctor'),
  (3, 'nurse'),
  (4, 'receptionist'),
  (5, 'patient');

-- ============================================================================
-- 2. PERMISSIONS
-- ============================================================================

insert into public.permissions (id, code, description) values
  (1,  'patients.create',       'Register new patients'),
  (2,  'patients.read',         'View patient profiles'),
  (3,  'patients.update',       'Edit patient information'),
  (4,  'visits.create',         'Create new visits'),
  (5,  'visits.read',           'View visit records'),
  (6,  'visits.update_status',  'Update visit status'),
  (7,  'screenings.create',     'Record nurse vitals/screenings'),
  (8,  'diagnoses.assign',      'Assign diagnoses to visits'),
  (9,  'prescriptions.create',  'Create prescriptions'),
  (10, 'users.manage',          'Manage user accounts and roles');

-- ============================================================================
-- 3. ROLE → PERMISSION MAPPINGS (from seed matrix §6)
-- ============================================================================

-- admin: all permissions
insert into public.role_permissions (role_id, permission_id) values
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

-- doctor
insert into public.role_permissions (role_id, permission_id) values
  (2, 2),  -- patients.read
  (2, 5),  -- visits.read
  (2, 6),  -- visits.update_status
  (2, 8),  -- diagnoses.assign
  (2, 9);  -- prescriptions.create

-- nurse
insert into public.role_permissions (role_id, permission_id) values
  (3, 2),  -- patients.read
  (3, 5),  -- visits.read
  (3, 6),  -- visits.update_status
  (3, 7);  -- screenings.create

-- receptionist
insert into public.role_permissions (role_id, permission_id) values
  (4, 1),  -- patients.create
  (4, 2),  -- patients.read
  (4, 3),  -- patients.update
  (4, 4),  -- visits.create
  (4, 5),  -- visits.read
  (4, 6);  -- visits.update_status

-- patient (own-only via RLS — no explicit permission inserts needed)

-- ============================================================================
-- 4. ICD DIAGNOSES CATALOG (starter set)
-- ============================================================================

insert into public.diagnoses (code, title) values
  ('I10',   'Essential (primary) hypertension'),
  ('E11',   'Type 2 diabetes mellitus'),
  ('J11',   'Influenza, virus not identified'),
  ('J06',   'Acute upper respiratory infection, unspecified'),
  ('K21',   'Gastro-esophageal reflux disease'),
  ('M54',   'Dorsalgia (back pain)'),
  ('N39',   'Urinary tract infection, site not specified'),
  ('L30',   'Other dermatitis'),
  ('A09',   'Infectious gastroenteritis and colitis, unspecified'),
  ('R51',   'Headache'),
  ('J45',   'Asthma'),
  ('I25',   'Chronic ischemic heart disease');

-- ============================================================================
-- 5. DEMO USERS (auth.users + public.users + profiles)
--    All fictional data — no real PII (see issue #42)
-- ============================================================================

-- --- Admin ---
-- Password: testpass123
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000001', 'Admin User', 'admin@drnote.com', '+959123456780', true);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000001', 1);  -- admin

-- --- Doctor ---
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'doctor@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000002', 'Dr. Aung Myo', 'doctor@drnote.com', '+959123456781', true);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000002', 2);  -- doctor

insert into public.staff_profiles (user_id, staff_code, department) values
  ('a0000000-0000-0000-0000-000000000002', 'DOC001', 'General Medicine');

-- --- Nurse ---
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'nurse@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000003', 'Nurse Thin Thin', 'nurse@drnote.com', '+959123456782', true);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000003', 3);  -- nurse

insert into public.staff_profiles (user_id, staff_code, department) values
  ('a0000000-0000-0000-0000-000000000003', 'NRS001', 'Outpatient');

-- --- Receptionist ---
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'receptionist@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000004', 'Receptionist Su Su', 'receptionist@drnote.com', '+959123456783', true);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000004', 4);  -- receptionist

insert into public.staff_profiles (user_id, staff_code, department) values
  ('a0000000-0000-0000-0000-000000000004', 'REC001', 'Front Desk');

-- --- Patients (3 demo patients) ---
-- Patient 1
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'patient1@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000010', 'Ko Min Aung', 'patient1@drnote.com', '+959123456790', false);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000010', 5);  -- patient

insert into public.patient_profiles (user_id, nrc, dob, gender, address) values
  ('a0000000-0000-0000-0000-000000000010', '12/abc(N)123456', '1990-05-15', 'male', '123 Main St, Yangon');

insert into public.emergency_contacts (patient_id, name, relationship, phone) values
  ('a0000000-0000-0000-0000-000000000010', 'Daw Mar Mar', 'Mother', '+959123456791');

-- Patient 2
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'patient2@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000011', 'Daw Htay Htay', 'patient2@drnote.com', '+959123456792', false);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000011', 5);  -- patient

insert into public.patient_profiles (user_id, nrc, dob, gender, address) values
  ('a0000000-0000-0000-0000-000000000011', '13/xyz(N)654321', '1985-08-22', 'female', '456 Oak Rd, Mandalay');

-- Patient 3
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  'a0000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'patient3@drnote.com',
  crypt('testpass123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

insert into public.users (id, name, email, phone, is_active) values
  ('a0000000-0000-0000-0000-000000000012', 'U Kyaw Zin', 'patient3@drnote.com', '+959123456793', false);

insert into public.user_roles (user_id, role_id) values
  ('a0000000-0000-0000-0000-000000000012', 5);  -- patient

insert into public.patient_profiles (user_id, nrc, dob, gender, ethnicity, address) values
  ('a0000000-0000-0000-0000-000000000012', '14/pqr(N)789012', '1978-03-10', 'male', 'Bamar', '789 Pine Ave, Naypyidaw');

insert into public.emergency_contacts (patient_id, name, relationship, phone) values
  ('a0000000-0000-0000-0000-000000000012', 'Ma Sandar', 'Wife', '+959123456794');

-- ============================================================================
-- END OF SEED
-- ============================================================================
