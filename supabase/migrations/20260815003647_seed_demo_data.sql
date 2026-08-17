/*
# Seed Data — Admin, Students, Staff, Sample Complaints

## Overview
Populates the database with demo accounts and sample data for grading.

## What it creates
1. Auth users (via auth.users table) for:
   - 1 admin: admin@campus.edu / Admin@123
   - 2 students: student1@campus.edu / Student@123, student2@campus.edu / Student@123
2. Matching profiles rows with the correct role (STUDENT / ADMIN).
   The on_auth_user_created trigger would make them STUDENT, so we override the
   admin profile role to ADMIN after insert.
3. 5 staff members across departments (IT, Maintenance, Housekeeping, Electrical).
4. 7 sample complaints across all three statuses and multiple categories.
5. 4 assignments linking complaints to staff members.

## Notes
1. Passwords are hashed using Supabase's crypto extension (crypt + gen_salt).
2. This migration is idempotent — uses WHERE NOT EXISTS checks.
3. The admin profile role is set to ADMIN directly since public registration only
   creates STUDENT profiles.
*/

-- ===== Enable crypto extension for password hashing =====
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== Helper: create auth user if not exists =====
-- We insert into auth.users directly since there is no admin API in SQL.

-- Admin user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'admin@campus.edu',
  crypt('Admin@123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Campus Administrator"}',
  now(), now(), '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@campus.edu');

-- Student 1
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated', 'student1@campus.edu',
  crypt('Student@123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alice Student"}',
  now(), now(), '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student1@campus.edu');

-- Student 2
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated', 'student2@campus.edu',
  crypt('Student@123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Bob Student"}',
  now(), now(), '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student2@campus.edu');

-- ===== Insert/fix profiles =====
-- The trigger creates STUDENT profiles automatically. We upsert all three,
-- then set the admin's role to ADMIN.
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Campus Administrator', 'admin@campus.edu', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a0000000-0000-0000-0000-000000000001');

INSERT INTO public.profiles (id, full_name, email, role)
SELECT 'a0000000-0000-0000-0000-000000000002', 'Alice Student', 'student1@campus.edu', 'STUDENT'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a0000000-0000-0000-0000-000000000002');

INSERT INTO public.profiles (id, full_name, email, role)
SELECT 'a0000000-0000-0000-0000-000000000003', 'Bob Student', 'student2@campus.edu', 'STUDENT'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a0000000-0000-0000-0000-000000000003');

-- Ensure admin role is ADMIN (in case trigger created it as STUDENT)
UPDATE public.profiles SET role = 'ADMIN'
WHERE id = 'a0000000-0000-0000-0000-000000000001' AND role <> 'ADMIN';

-- ===== Staff =====
INSERT INTO public.staff (staff_id, staff_name, department, contact, is_active)
SELECT 'b0000000-0000-0000-0000-000000000001', 'Raj Kumar', 'IT', 'raj.kumar@campus.edu', true
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE staff_id = 'b0000000-0000-0000-0000-000000000001');

INSERT INTO public.staff (staff_id, staff_name, department, contact, is_active)
SELECT 'b0000000-0000-0000-0000-000000000002', 'Priya Sharma', 'Maintenance', 'priya.sharma@campus.edu', true
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE staff_id = 'b0000000-0000-0000-0000-000000000002');

INSERT INTO public.staff (staff_id, staff_name, department, contact, is_active)
SELECT 'b0000000-0000-0000-0000-000000000003', 'Mohammed Ali', 'Housekeeping', 'mohammed.ali@campus.edu', true
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE staff_id = 'b0000000-0000-0000-0000-000000000003');

INSERT INTO public.staff (staff_id, staff_name, department, contact, is_active)
SELECT 'b0000000-0000-0000-0000-000000000004', 'Sneha Patel', 'Electrical', 'sneha.patel@campus.edu', true
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE staff_id = 'b0000000-0000-0000-0000-000000000004');

INSERT INTO public.staff (staff_id, staff_name, department, contact, is_active)
SELECT 'b0000000-0000-0000-0000-000000000005', 'David Wilson', 'Maintenance', 'david.wilson@campus.edu', true
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE staff_id = 'b0000000-0000-0000-0000-000000000005');

-- ===== Sample Complaints =====
-- Student 1 (Alice) complaints
INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000001',
       'a0000000-0000-0000-0000-000000000002',
       'WiFi', 'The WiFi in the library has been very slow for the past three days, making it impossible to study online.', 'Pending', now() - interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000001');

INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000002',
       'a0000000-0000-0000-0000-000000000002',
       'Classroom Equipment', 'The projector in Room 204 is not working. We need it fixed before tomorrow lecture.', 'In Progress', now() - interval '5 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000002');

INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000003',
       'a0000000-0000-0000-0000-000000000002',
       'Electricity', 'The lights in the corridor of Block C are flickering and one has completely stopped working.', 'Resolved', now() - interval '10 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000003');

INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000004',
       'a0000000-0000-0000-0000-000000000002',
       'Cleanliness', 'The washroom on the second floor of the academic building has not been cleaned for two days.', 'Pending', now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000004');

-- Student 2 (Bob) complaints
INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000005',
       'a0000000-0000-0000-0000-000000000003',
       'Plumbing', 'There is a water leakage from the pipe in the hostel bathroom on the third floor.', 'In Progress', now() - interval '3 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000005');

INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000006',
       'a0000000-0000-0000-0000-000000000003',
       'Hostel', 'The water cooler in hostel block B is not dispensing cold water, students need drinking water.', 'Resolved', now() - interval '15 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000006');

INSERT INTO public.complaints (complaint_id, student_id, category, description, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000007',
       'a0000000-0000-0000-0000-000000000003',
       'Other', 'The classroom door in Room 101 does not close properly, it keeps opening on its own.', 'Pending', now() - interval '6 hours'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE complaint_id = 'c0000000-0000-0000-0000-000000000007');

-- ===== Sample Assignments =====
-- Assign the projector complaint (In Progress) to Raj Kumar (IT)
INSERT INTO public.complaint_assignments (assignment_id, complaint_id, staff_id, assigned_by, notes, assigned_at)
SELECT 'd0000000-0000-0000-0000-000000000001',
       'c0000000-0000-0000-0000-000000000002',
       'b0000000-0000-0000-0000-000000000001',
       'a0000000-0000-0000-0000-000000000001',
       'Please check the projector connectivity and lamp status in Room 204.', now() - interval '4 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaint_assignments WHERE assignment_id = 'd0000000-0000-0000-0000-000000000001');

-- Assign the plumbing complaint (In Progress) to Priya Sharma (Maintenance)
INSERT INTO public.complaint_assignments (assignment_id, complaint_id, staff_id, assigned_by, notes, assigned_at)
SELECT 'd0000000-0000-0000-0000-000000000002',
       'c0000000-0000-0000-0000-000000000005',
       'b0000000-0000-0000-0000-000000000002',
       'a0000000-0000-0000-0000-000000000001',
       'Fix the leakage in hostel block B third floor bathroom.', now() - interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaint_assignments WHERE assignment_id = 'd0000000-0000-0000-0000-000000000002');

-- Assign the resolved electricity complaint to Sneha Patel (Electrical)
INSERT INTO public.complaint_assignments (assignment_id, complaint_id, staff_id, assigned_by, notes, assigned_at)
SELECT 'd0000000-0000-0000-0000-000000000003',
       'c0000000-0000-0000-0000-000000000003',
       'b0000000-0000-0000-0000-000000000004',
       'a0000000-0000-0000-0000-000000000001',
       'Replaced the flickering tube light in Block C corridor.', now() - interval '8 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaint_assignments WHERE assignment_id = 'd0000000-0000-0000-0000-000000000003');

-- Assign the resolved hostel water cooler complaint to David Wilson (Maintenance)
INSERT INTO public.complaint_assignments (assignment_id, complaint_id, staff_id, assigned_by, notes, assigned_at)
SELECT 'd0000000-0000-0000-0000-000000000004',
       'c0000000-0000-0000-0000-000000000006',
       'b0000000-0000-0000-0000-000000000005',
       'a0000000-0000-0000-0000-000000000001',
       'Repaired the compressor in the hostel block B water cooler.', now() - interval '12 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaint_assignments WHERE assignment_id = 'd0000000-0000-0000-0000-000000000004');
