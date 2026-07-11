-- Dr.Note Seed Data
-- Based on docs/guide/01-database-schema.md §6

-- ============================================
-- Roles
-- ============================================

insert into roles (id, name) values
  (1, 'admin'),
  (2, 'doctor'),
  (3, 'nurse'),
  (4, 'receptionist'),
  (5, 'patient');

-- ============================================
-- Permissions
-- ============================================

insert into permissions (id, code, description) values
  (1, 'patients.create', 'Create new patients'),
  (2, 'patients.read', 'View patient information'),
  (3, 'patients.update', 'Update patient information'),
  (4, 'visits.create', 'Create new visits'),
  (5, 'visits.read', 'View visit information'),
  (6, 'visits.update_status', 'Update visit status'),
  (7, 'screenings.create', 'Create screening records'),
  (8, 'diagnoses.assign', 'Assign diagnoses to visits'),
  (9, 'prescriptions.create', 'Create prescriptions'),
  (10, 'users.manage', 'Manage user accounts');

-- ============================================
-- Role Permissions
-- ============================================

-- Admin: all permissions
insert into role_permissions (role_id, permission_id) values
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

-- Doctor: clinical permissions
insert into role_permissions (role_id, permission_id) values
  (2, 2), (2, 5), (2, 6), (2, 8), (2, 9);

-- Nurse: screening permissions
insert into role_permissions (role_id, permission_id) values
  (3, 2), (3, 5), (3, 6), (3, 7);

-- Receptionist: registration permissions
insert into role_permissions (role_id, permission_id) values
  (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6);

-- Patient: own data only (RLS handles this)
insert into role_permissions (role_id, permission_id) values
  (5, 2), (5, 5);

-- ============================================
-- Diagnoses (ICD Starter Catalog)
-- ============================================

insert into diagnoses (id, code, title) values
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456701', 'I10', 'Essential (primary) hypertension'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456702', 'E11', 'Type 2 diabetes mellitus'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456703', 'J11', 'Influenza, virus not identified'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456704', 'J06', 'Acute upper respiratory infection, multiple and unspecified organisms'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456705', 'K21', 'Gastro-oesophageal reflux disease'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456706', 'M54', 'Dorsalgia (back pain)'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456707', 'N39', 'Urinary tract infection'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456708', 'A09', 'Infectious gastroenteritis and colitis, unspecified'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456709', 'L30', 'Other dermatitis'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456710', 'H10', 'Conjunctivitis'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456711', 'F32', 'Depressive episode'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456712', 'I25', 'Chronic ischaemic heart disease'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456713', 'J44', 'Other chronic obstructive pulmonary disease'),
  ('a0b1c2d3-e4f5-6789-abcd-ef0123456714', 'E78', 'Disorders of lipoprotein metabolism and other lipididaemias');

-- ============================================
-- Demo Users (fictional data)
-- ============================================

-- Note: In Supabase, users must be created via auth.sign_up() or the Auth API
-- These are the profile records that will be linked to auth users

-- Admin user
insert into users (id, name, email, phone, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@drnote.demo', '+959123456789', true);

insert into staff_profiles (user_id, staff_code, department) values
  ('11111111-1111-1111-1111-111111111111', 'ADM001', 'Administration');

insert into user_roles (user_id, role_id) values
  ('11111111-1111-1111-1111-111111111111', 1);

-- Doctor user
insert into users (id, name, email, phone, is_active) values
  ('22222222-2222-2222-2222-222222222222', 'Dr. Aung Aung', 'doctor@drnote.demo', '+959234567890', true);

insert into staff_profiles (user_id, staff_code, department) values
  ('22222222-2222-2222-2222-222222222222', 'DOC001', 'General Medicine');

insert into user_roles (user_id, role_id) values
  ('22222222-2222-2222-2222-222222222222', 2);

-- Nurse user
insert into users (id, name, email, phone, is_active) values
  ('33333333-3333-3333-3333-333333333333', 'Nurse Mi Mi', 'nurse@drnote.demo', '+959345678901', true);

insert into staff_profiles (user_id, staff_code, department) values
  ('33333333-3333-3333-3333-333333333333', 'NRS001', 'General Ward');

insert into user_roles (user_id, role_id) values
  ('33333333-3333-3333-3333-333333333333', 3);

-- Receptionist user
insert into users (id, name, email, phone, is_active) values
  ('44444444-4444-4444-4444-444444444444', 'Receptionist Su Su', 'reception@drnote.demo', '+959456789012', true);

insert into staff_profiles (user_id, staff_code, department) values
  ('44444444-4444-4444-4444-444444444444', 'REC001', 'Front Desk');

insert into user_roles (user_id, role_id) values
  ('44444444-4444-4444-4444-444444444444', 4);

-- Patient users (3 demo patients)
insert into users (id, name, email, phone, is_active) values
  ('55555555-5555-5555-5555-555555555555', 'Tun Tun', 'patient1@drnote.demo', '+959567890123', false);

insert into patient_profiles (user_id, nrc, dob, gender, address) values
  ('55555555-5555-5555-5555-555555555555', '12/ABC(N)123456', '1985-03-15', 'male', '123 Main St, Yangon');

insert into user_roles (user_id, role_id) values
  ('55555555-5555-5555-5555-555555555555', 5);

insert into users (id, name, email, phone, is_active) values
  ('66666666-6666-6666-6666-666666666666', 'Khin Khin', 'patient2@drnote.demo', '+959678901234', false);

insert into patient_profiles (user_id, nrc, dob, gender, address) values
  ('66666666-6666-6666-6666-666666666666', '12/DEF(N)789012', '1990-07-22', 'female', '456 Oak Ave, Mandalay');

insert into user_roles (user_id, role_id) values
  ('66666666-6666-6666-6666-666666666666', 5);

insert into users (id, name, email, phone, is_active) values
  ('77777777-7777-7777-7777-777777777777', 'Myo Myo', 'patient3@drnote.demo', '+959789012345', false);

insert into patient_profiles (user_id, nrc, dob, gender, address) values
  ('77777777-7777-7777-7777-777777777777', '12/GHI(N)345678', '1978-11-08', 'female', '789 Pine Rd, Naypyidaw');

insert into user_roles (user_id, role_id) values
  ('77777777-7777-7777-7777-777777777777', 5);

-- Emergency contacts
insert into emergency_contacts (patient_id, name, relationship, phone) values
  ('55555555-5555-5555-5555-555555555555', 'U Ba Ba', 'Father', '+959111111111'),
  ('55555555-5555-5555-5555-555555555555', 'Daw Yi Yi', 'Mother', '+959222222222'),
  ('66666666-6666-6666-6666-666666666666', 'U Kyaw Kyaw', 'Husband', '+959333333333'),
  ('77777777-7777-7777-7777-777777777777', 'Daw Nu Nu', 'Sister', '+959444444444');
