-- Seed data for development
-- Note: Users must be created via Supabase Auth first, then profiles will be auto-created

-- This seed assumes you have created the following users via Supabase Auth:
-- 1. admin@drnote.com (admin)
-- 2. doctor@drnote.com (doctor)
-- 3. receptionist@drnote.com (receptionist)

-- After creating auth users, run this to add doctor profile:
-- INSERT INTO doctors (user_id, specialization, license_number, phone)
-- VALUES (
--   (SELECT id FROM users WHERE email = 'doctor@drnote.com'),
--   'General Practice',
--   'DOC-001',
--   '+1234567890'
-- );

-- Sample patients (can be inserted directly)
INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, medical_history, allergies)
VALUES
  ('John', 'Doe', '1985-03-15', 'male', '+1234567890', 'john.doe@email.com', '123 Main St', 'No significant history', 'Penicillin'),
  ('Jane', 'Smith', '1990-07-22', 'female', '+0987654321', 'jane.smith@email.com', '456 Oak Ave', 'Hypertension', 'None'),
  ('Mike', 'Johnson', '1978-11-08', 'male', '+1122334455', 'mike.j@email.com', '789 Pine Rd', 'Diabetes Type 2', 'Sulfa drugs'),
  ('Sarah', 'Williams', '1995-01-30', 'female', '+5566778899', 'sarah.w@email.com', '321 Elm St', 'Asthma', 'Aspirin'),
  ('David', 'Brown', '1982-09-12', 'male', '+9988776655', 'david.b@email.com', '654 Maple Dr', 'No significant history', 'None');
