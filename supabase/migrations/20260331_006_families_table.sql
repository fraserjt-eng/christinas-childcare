-- Families table for kiosk check-in and parent portal
CREATE TABLE IF NOT EXISTS public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  pin text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  approved_by text,
  approved_at timestamptz,
  address text,
  family_bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  relationship text DEFAULT 'guardian',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date,
  classroom text,
  allergies text[] DEFAULT '{}',
  medical_notes text,
  created_at timestamptz DEFAULT now()
);

-- Seed demo families
INSERT INTO public.families (id, email, password_hash, pin, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'parent@demo.com', 'parent123', '1234', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'garcia@demo.com', 'garcia123', '5678', 'active');

INSERT INTO public.family_parents (family_id, name, phone, email, relationship, is_primary) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sarah Brown', '(555) 111-2222', 'parent@demo.com', 'mother', true),
  ('00000000-0000-0000-0000-000000000001', 'Michael Brown', '(555) 111-3333', 'michael@demo.com', 'father', false),
  ('00000000-0000-0000-0000-000000000002', 'Maria Garcia', '(555) 444-5555', 'garcia@demo.com', 'mother', true);

INSERT INTO public.family_children (family_id, name, date_of_birth, classroom) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Noah Brown', '2023-03-15', 'toddler'),
  ('00000000-0000-0000-0000-000000000001', 'Ava Brown', '2021-08-22', 'preschool'),
  ('00000000-0000-0000-0000-000000000002', 'Sofia Garcia', '2022-11-10', 'toddler');

-- RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_children ENABLE ROW LEVEL SECURITY;

-- Kiosk needs anon read access for PIN lookup
CREATE POLICY "Anon can read families by PIN" ON public.families FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read family parents" ON public.family_parents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read family children" ON public.family_children FOR SELECT TO anon USING (true);

-- Authenticated full access for admin
CREATE POLICY "Auth full access families" ON public.families FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access parents" ON public.family_parents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access children" ON public.family_children FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Attendance: anon can insert (kiosk writes check-ins without login)
CREATE POLICY "Anon can insert attendance" ON public.attendance FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read attendance" ON public.attendance FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update attendance" ON public.attendance FOR UPDATE TO anon USING (true) WITH CHECK (true);
