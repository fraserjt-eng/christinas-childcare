-- Migration 013: substitute staff pool + assignments

CREATE TABLE IF NOT EXISTS public.substitutes (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sub_assignments (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_assignments_created ON public.sub_assignments(created_at DESC);

ALTER TABLE public.substitutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON public.substitutes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.substitutes
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.sub_assignments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.sub_assignments
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.substitutes IS 'Substitute staff pool (internal list of known subs)';
COMMENT ON TABLE public.sub_assignments IS 'Sub assignments to specific rooms + shifts';
