-- ============================================================================
-- Dr.Note — E2E Test Seed Data
-- Run AFTER 00002_seed_data.sql
-- Provides visits, screenings, diagnoses, and prescriptions for E2E tests
-- ============================================================================

-- ============================================================================
-- 1. TEST VISITS (various statuses for different test scenarios)
-- ============================================================================

-- Visit 1: waiting status (nurse queue test)
INSERT INTO public.visits (id, patient_id, doctor_id, receptionist_id, visit_type, status, chief_complaint, visit_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000010',  -- Ko Min Aung
  NULL,
  'a0000000-0000-0000-0000-000000000004',  -- Receptionist Su Su
  'outpatient',
  'waiting',
  'Persistent headache for 3 days',
  now()
);

-- Visit 2: waiting status (another patient in queue — doctor assigned so screening can proceed)
INSERT INTO public.visits (id, patient_id, doctor_id, receptionist_id, visit_type, status, chief_complaint, visit_date)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000011',  -- Daw Htay Htay
  'a0000000-0000-0000-0000-000000000002',  -- Dr. Aung Myo (assigned for screening test)
  'a0000000-0000-0000-0000-000000000004',  -- Receptionist Su Su
  'outpatient',
  'waiting',
  'Fever and cough for 2 days',
  now()
);

-- Visit 3: screening status (nurse is screening)
INSERT INTO public.visits (id, patient_id, doctor_id, receptionist_id, visit_type, status, chief_complaint, visit_date)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000012',  -- U Kyaw Zin
  NULL,
  'a0000000-0000-0000-0000-000000000004',  -- Receptionist Su Su
  'outpatient',
  'screening',
  'Back pain and numbness in legs',
  now()
);

-- Visit 4: with_doctor status (doctor consultation)
INSERT INTO public.visits (id, patient_id, doctor_id, receptionist_id, visit_type, status, chief_complaint, visit_date)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000010',  -- Ko Min Aung
  'a0000000-0000-0000-0000-000000000002',  -- Dr. Aung Myo
  'a0000000-0000-0000-0000-000000000004',  -- Receptionist Su Su
  'outpatient',
  'with_doctor',
  'Follow-up for hypertension',
  now() - interval '1 day'
);

-- Visit 5: completed status (for history tests)
INSERT INTO public.visits (id, patient_id, doctor_id, receptionist_id, visit_type, status, chief_complaint, diagnosis_note, visit_date)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000011',  -- Daw Htay Htay
  'a0000000-0000-0000-0000-000000000002',  -- Dr. Aung Myo
  'a0000000-0000-0000-0000-000000000004',  -- Receptionist Su Su
  'outpatient',
  'completed',
  'Type 2 diabetes checkup',
  'Patient presents with elevated blood glucose. HbA1c at 7.2%. Continue metformin regimen.',
  now() - interval '2 days'
);

-- Visit 6: completed status (another completed visit)
INSERT INTO public.visits (id, patient_id, doctor_id, receptionist_id, visit_type, status, chief_complaint, diagnosis_note, visit_date)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000012',  -- U Kyaw Zin
  'a0000000-0000-0000-0000-000000000002',  -- Dr. Aung Myo
  'a0000000-0000-0000-0000-000000000004',  -- Receptionist Su Su
  'outpatient',
  'completed',
  'Seasonal influenza',
  'Influenza-like illness. Prescribed antiviral and rest.',
  now() - interval '3 days'
);

-- ============================================================================
-- 2. TEST SCREENINGS (vital signs for visits in screening/with_doctor/completed)
-- ============================================================================

-- Screening for Visit 3 (screening status - in progress)
INSERT INTO public.screenings (id, visit_id, height_cm, weight_kg, bp_systolic, bp_diastolic, heart_rate, temperature_c, oxygen_saturation, screened_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  168, 65, 125, 82, 78, 36.8, 98,
  'a0000000-0000-0000-0000-000000000003'  -- Nurse Thin Thin
);

-- Screening for Visit 4 (with_doctor status)
INSERT INTO public.screenings (id, visit_id, height_cm, weight_kg, bp_systolic, bp_diastolic, heart_rate, temperature_c, oxygen_saturation, screened_by)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000004',
  175, 78, 138, 88, 72, 36.5, 97,
  'a0000000-0000-0000-0000-000000000003'  -- Nurse Thin Thin
);

-- Screening for Visit 5 (completed status)
INSERT INTO public.screenings (id, visit_id, height_cm, weight_kg, bp_systolic, bp_diastolic, heart_rate, temperature_c, oxygen_saturation, screened_by)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000005',
  160, 72, 142, 90, 80, 37.0, 96,
  'a0000000-0000-0000-0000-000000000003'  -- Nurse Thin Thin
);

-- Screening for Visit 6 (completed status)
INSERT INTO public.screenings (id, visit_id, height_cm, weight_kg, bp_systolic, bp_diastolic, heart_rate, temperature_c, oxygen_saturation, screened_by)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000006',
  172, 68, 118, 76, 88, 38.2, 95,
  'a0000000-0000-0000-0000-000000000003'  -- Nurse Thin Thin
);

-- ============================================================================
-- 3. TEST VISIT DIAGNOSES (for completed/with_doctor visits)
-- ============================================================================

-- Visit 4 diagnosis (with_doctor - hypertension follow-up)
INSERT INTO public.visit_diagnoses (id, visit_id, diagnosis_id, diagnosis_type)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM public.diagnoses WHERE code = 'I10'),  -- Hypertension
  'primary'
);

-- Visit 5 diagnoses (completed - diabetes)
INSERT INTO public.visit_diagnoses (id, visit_id, diagnosis_id, diagnosis_type)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM public.diagnoses WHERE code = 'E11'),  -- Type 2 Diabetes
  'primary'
);

-- Visit 6 diagnoses (completed - influenza)
INSERT INTO public.visit_diagnoses (id, visit_id, diagnosis_id, diagnosis_type)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM public.diagnoses WHERE code = 'J11'),  -- Influenza
  'primary'
);

-- ============================================================================
-- 4. TEST PRESCRIPTIONS (for completed visits)
-- ============================================================================

-- Prescription for Visit 5 (diabetes)
INSERT INTO public.prescriptions (id, visit_id, doctor_id, diagnosis_id, instruction)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000002',  -- Dr. Aung Myo
  (SELECT id FROM public.diagnoses WHERE code = 'E11'),
  'Continue metformin 500mg twice daily. Monitor blood sugar daily. Return in 2 weeks for follow-up.'
);

-- Prescription items for Visit 5
INSERT INTO public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, route, quantity)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Metformin', '500mg', '2/day', '30 days', 'oral', 60),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Glucose test strips', '1 strip', 'as needed', '30 days', 'oral', 30);

-- Prescription for Visit 6 (influenza)
INSERT INTO public.prescriptions (id, visit_id, doctor_id, diagnosis_id, instruction)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000002',  -- Dr. Aung Myo
  (SELECT id FROM public.diagnoses WHERE code = 'J11'),
  'Rest and fluids. Take antiviral if symptoms worsen. Return if fever persists beyond 5 days.'
);

-- Prescription items for Visit 6
INSERT INTO public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, route, quantity)
VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Oseltamivir', '75mg', '2/day', '5 days', 'oral', 10),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Paracetamol', '500mg', '3/day', '5 days', 'oral', 15),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Vitamin C', '1000mg', '1/day', '7 days', 'oral', 7);

-- ============================================================================
-- END OF E2E TEST SEED
-- ============================================================================
