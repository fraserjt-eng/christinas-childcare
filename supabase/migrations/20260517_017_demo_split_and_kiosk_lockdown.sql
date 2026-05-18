-- 20260517_017_demo_split_and_kiosk_lockdown
--
-- WHY: the live kiosk reads families/parents/children directly with the public
-- anon key, so anyone with that key could read every child's record. This
-- migration locks the live family + attendance tables to deny anon entirely
-- (the live kiosk will go through the service-role /api/kiosk route instead),
-- and creates a parallel demo_* dataset that stays anon-readable for the
-- public /demo sandbox. Demo tables hold only fabricated data.
--
-- ORDER HAZARD: applying this revokes anon read on the live family tables. The
-- /api/kiosk server route MUST be deployed in the same release or the live
-- kiosk has no data path. Apply only together with that deploy.
--
-- ROLLBACK (re-open anon read on live tables) is at the bottom, commented.

-- ============================================================
-- 1. Lock live family tables: drop anon read policies
-- ============================================================
DROP POLICY IF EXISTS "Anon can read families by PIN" ON public.families;
DROP POLICY IF EXISTS "Anon can read family parents" ON public.family_parents;
DROP POLICY IF EXISTS "Anon can read family children" ON public.family_children;

-- RLS stays enabled on these tables; with no anon policy, anon is denied.
-- The "Auth full access *" policies for authenticated users remain.

-- ============================================================
-- 2. Lock live attendance: drop anon write/read policies
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anon can read attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anon can update attendance" ON public.attendance;

-- The authenticated attendance policies remain. The live kiosk writes
-- attendance via the service-role /api/kiosk route (bypasses RLS).

-- ============================================================
-- 3. Demo dataset (fabricated data only; stays anon-accessible)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.demo_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL DEFAULT 'demo',
  pin text,
  status text NOT NULL DEFAULT 'active',
  approved_by text,
  approved_at timestamptz,
  address text,
  family_bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_family_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.demo_families(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  relationship text DEFAULT 'guardian',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_family_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.demo_families(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date,
  classroom text,
  allergies text[] DEFAULT '{}',
  medical_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text,
  child_id uuid,
  date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  checked_in_by uuid,
  center_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.demo_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_family_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_family_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_attendance ENABLE ROW LEVEL SECURITY;

-- Permissive policies are intentional: these tables contain only fake data and
-- power the public /demo sandbox kiosk.
CREATE POLICY "demo families anon read" ON public.demo_families
  FOR SELECT TO anon USING (true);
CREATE POLICY "demo parents anon read" ON public.demo_family_parents
  FOR SELECT TO anon USING (true);
CREATE POLICY "demo children anon read" ON public.demo_family_children
  FOR SELECT TO anon USING (true);
CREATE POLICY "demo attendance anon read" ON public.demo_attendance
  FOR SELECT TO anon USING (true);
CREATE POLICY "demo attendance anon insert" ON public.demo_attendance
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "demo attendance anon update" ON public.demo_attendance
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- 4. Seed the demo dataset (Brown 1234, Garcia 5678, Fraser 9876)
-- ============================================================
INSERT INTO public.demo_families (id, email, password_hash, pin, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'parent@demo.com',  'demo', '1234', 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'garcia@demo.com',  'demo', '5678', 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'fraser@demo.com',  'demo', '9876', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.demo_family_parents (family_id, name, phone, email, relationship, is_primary) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Sarah Brown',  '(763) 555-0101', 'parent@demo.com', 'mother', true),
  ('d0000000-0000-0000-0000-000000000001', 'Michael Brown','(763) 555-0102', 'parent@demo.com', 'father', false),
  ('d0000000-0000-0000-0000-000000000002', 'Maria Garcia', '(763) 555-0103', 'garcia@demo.com', 'mother', true),
  ('d0000000-0000-0000-0000-000000000003', 'J Fraser',     '(763) 555-0104', 'fraser@demo.com', 'father', true);

INSERT INTO public.demo_family_children (family_id, name, date_of_birth, classroom) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Noah Brown',  '2022-03-15', 'toddler'),
  ('d0000000-0000-0000-0000-000000000001', 'Ava Brown',   '2020-07-22', 'preschool'),
  ('d0000000-0000-0000-0000-000000000002', 'Sofia Garcia','2021-11-05', 'preschool'),
  ('d0000000-0000-0000-0000-000000000003', 'Voynee Fraser','2021-01-10', 'preschool'),
  ('d0000000-0000-0000-0000-000000000003', 'Joshua-James Fraser','2023-06-30', 'toddler');

-- ============================================================
-- ROLLBACK (re-open anon on live tables; demo tables can stay):
-- ============================================================
-- CREATE POLICY "Anon can read families by PIN" ON public.families
--   FOR SELECT TO anon USING (true);
-- CREATE POLICY "Anon can read family parents" ON public.family_parents
--   FOR SELECT TO anon USING (true);
-- CREATE POLICY "Anon can read family children" ON public.family_children
--   FOR SELECT TO anon USING (true);
-- CREATE POLICY "Anon can insert attendance" ON public.attendance
--   FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Anon can read attendance" ON public.attendance
--   FOR SELECT TO anon USING (true);
-- CREATE POLICY "Anon can update attendance" ON public.attendance
--   FOR UPDATE TO anon USING (true) WITH CHECK (true);
