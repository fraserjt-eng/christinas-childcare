-- Migration 001: Foundation tables
-- Creates centers, employees, classrooms, and migrates food_counts, attendance, staff_schedules

-- ============================================================================
-- Centers (enables multi-site operations)
-- ============================================================================
CREATE TABLE public.centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  license_number text,
  capacity integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed the two centers
INSERT INTO public.centers (name, address, phone, is_active) VALUES
  ('Crystal Center', '5510 W Broadway Ave, Crystal, MN', '', true),
  ('Brooklyn Park Center', 'Brooklyn Park, MN', '', true);

-- ============================================================================
-- Employees
-- ============================================================================
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  pin text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'teacher' CHECK (role IN ('owner','admin','teacher','parent')),
  job_title text,
  hire_date date,
  hourly_rate numeric(10,2),
  employment_status text DEFAULT 'active' CHECK (employment_status IN ('active','inactive','on_leave','terminated')),
  certifications text[] DEFAULT '{}',
  center_id uuid REFERENCES public.centers(id),
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Classrooms
-- ============================================================================
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  name text NOT NULL,
  age_group text CHECK (age_group IN ('infant','toddler','preschool','school_age')),
  min_age_months integer,
  max_age_months integer,
  capacity integer NOT NULL DEFAULT 10,
  staff_ratio text,
  lead_teacher_id uuid REFERENCES public.employees(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Food Counts (CACFP compliance - highest-priority migration per friction report)
-- ============================================================================
CREATE TABLE public.food_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id),
  classroom_name text,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','am_snack','lunch','pm_snack')),
  child_count integer NOT NULL DEFAULT 0,
  adult_count integer NOT NULL DEFAULT 0,
  notes text,
  recorded_by uuid REFERENCES public.employees(id),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(date, classroom_id, meal_type)
);

-- ============================================================================
-- Attendance
-- ============================================================================
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text,
  child_id uuid,
  date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  checked_in_by uuid REFERENCES public.employees(id),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Staff Schedules
-- ============================================================================
CREATE TABLE public.staff_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  classroom_id uuid REFERENCES public.classrooms(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users full access
-- (Christina is the primary user; tighten when roles are fully implemented)
CREATE POLICY "Allow all for authenticated" ON public.centers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.employees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.classrooms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.food_counts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.attendance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.staff_schedules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow anon access for demo mode (no auth configured yet)
CREATE POLICY "Allow all for anon" ON public.centers
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON public.employees
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON public.classrooms
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON public.food_counts
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON public.attendance
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON public.staff_schedules
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- Indexes for common queries
-- ============================================================================
CREATE INDEX idx_food_counts_date ON public.food_counts(date);
CREATE INDEX idx_food_counts_classroom ON public.food_counts(classroom_id);
CREATE INDEX idx_food_counts_center ON public.food_counts(center_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_center ON public.attendance(center_id);
CREATE INDEX idx_staff_schedules_date ON public.staff_schedules(date);
CREATE INDEX idx_staff_schedules_employee ON public.staff_schedules(employee_id);
CREATE INDEX idx_employees_center ON public.employees(center_id);
CREATE INDEX idx_classrooms_center ON public.classrooms(center_id);
