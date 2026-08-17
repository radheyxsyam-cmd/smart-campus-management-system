/*
# Smart Campus Complaint & Maintenance Management System — Schema

## Overview
Creates the full database schema for a role-based campus complaint management platform.
Two roles exist: STUDENT and ADMIN. Students submit and track their own complaints;
admins view all complaints, assign them to staff, update status, manage staff, and view reports.

## Tables
1. **profiles** — extends `auth.users`. Stores full_name, email, role (STUDENT/ADMIN).
   One row per authenticated user, created automatically on signup.
2. **staff** — maintenance/department staff that complaints can be assigned to.
   staff_name, department, contact, is_active.
3. **complaints** — student-submitted complaints. category, description, status
   (Pending / In Progress / Resolved), submitted_at, updated_at.
4. **complaint_assignments** — links a complaint to a staff member, recorded by an admin.
   assignment_id, complaint_id, staff_id, assigned_by, assigned_at, notes.

## Security (RLS)
- profiles: each authenticated user reads/updates only their own profile row.
  The UPDATE policy prevents students from self-promoting to ADMIN (role must stay 'STUDENT').
- complaints: students read/insert only their own; admins (role = 'ADMIN') have full access.
- staff: students read only; admins have full CRUD.
- complaint_assignments: students read only (to see who their complaint was assigned to);
  admins have full CRUD.

## Helper functions
- `is_admin()` — returns true if the current user's profile role is ADMIN. Used in policies.
- `handle_new_user()` — trigger fired on `auth.users` INSERT that creates a matching
  `profiles` row with role 'STUDENT' (public registration is students-only).

## Notes
1. Admin accounts must be seeded manually (no public admin signup).
2. `profiles.id` references `auth.users(id)` with ON DELETE CASCADE — deleting a user
   removes their profile.
3. `complaints.updated_at` is refreshed on every UPDATE via a trigger.
*/

-- ===== Table: profiles =====
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('STUDENT','ADMIN')),
  created_at timestamptz DEFAULT now()
);

-- ===== Table: staff =====
CREATE TABLE IF NOT EXISTS public.staff (
  staff_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name text NOT NULL,
  department text NOT NULL,
  contact text NOT NULL,
  is_active boolean DEFAULT true
);

-- ===== Table: complaints =====
CREATE TABLE IF NOT EXISTS public.complaints (
  complaint_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  category text NOT NULL CHECK (category IN
    ('WiFi','Classroom Equipment','Hostel','Cleanliness','Electricity','Plumbing','Other')),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Resolved')),
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== Table: complaint_assignments =====
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(complaint_id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff(staff_id),
  assigned_by uuid NOT NULL REFERENCES public.profiles(id),
  assigned_at timestamptz DEFAULT now(),
  notes text
);

-- ===== Enable RLS on all tables =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;

-- ===== Helper function: is_admin =====
-- (Created after profiles table exists so the reference resolves.)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- ===== Profiles policies =====
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- WITH CHECK includes role = 'STUDENT' to prevent self-promotion to ADMIN
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = 'STUDENT');

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND role = 'STUDENT');

-- ===== Staff policies =====
DROP POLICY IF EXISTS "staff_select_authenticated" ON public.staff;
CREATE POLICY "staff_select_authenticated"
ON public.staff FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "staff_insert_admin" ON public.staff;
CREATE POLICY "staff_insert_admin"
ON public.staff FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "staff_update_admin" ON public.staff;
CREATE POLICY "staff_update_admin"
ON public.staff FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "staff_delete_admin" ON public.staff;
CREATE POLICY "staff_delete_admin"
ON public.staff FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Complaints policies =====
DROP POLICY IF EXISTS "complaints_select_own_or_admin" ON public.complaints;
CREATE POLICY "complaints_select_own_or_admin"
ON public.complaints FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "complaints_insert_own_student" ON public.complaints;
CREATE POLICY "complaints_insert_own_student"
ON public.complaints FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid() AND NOT public.is_admin());

DROP POLICY IF EXISTS "complaints_update_own_or_admin" ON public.complaints;
CREATE POLICY "complaints_update_own_or_admin"
ON public.complaints FOR UPDATE
TO authenticated
USING (student_id = auth.uid() OR public.is_admin())
WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "complaints_delete_admin" ON public.complaints;
CREATE POLICY "complaints_delete_admin"
ON public.complaints FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Complaint assignments policies =====
DROP POLICY IF EXISTS "assignments_select_own_or_admin" ON public.complaint_assignments;
CREATE POLICY "assignments_select_own_or_admin"
ON public.complaint_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.complaints c
          WHERE c.complaint_id = complaint_assignments.complaint_id
          AND c.student_id = auth.uid())
  OR public.is_admin()
);

DROP POLICY IF EXISTS "assignments_insert_admin" ON public.complaint_assignments;
CREATE POLICY "assignments_insert_admin"
ON public.complaint_assignments FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "assignments_update_admin" ON public.complaint_assignments;
CREATE POLICY "assignments_update_admin"
ON public.complaint_assignments FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "assignments_delete_admin" ON public.complaint_assignments;
CREATE POLICY "assignments_delete_admin"
ON public.complaint_assignments FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Trigger: auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    'STUDENT'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Trigger: refresh complaints.updated_at on UPDATE =====
CREATE OR REPLACE FUNCTION public.refresh_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS complaints_set_updated_at ON public.complaints;
CREATE TRIGGER complaints_set_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.refresh_updated_at();

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_assignments_complaint_id ON public.complaint_assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_assignments_staff_id ON public.complaint_assignments(staff_id);
