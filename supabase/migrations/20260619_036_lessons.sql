-- Migration 036: lesson module → Supabase table
-- Backs the lesson-storage dual-write module. A single-kind table (lessons only,
-- no record_type discriminator), each row's typed fields in a JSONB `data`
-- column (matches the migration-012 / migration-031 fast-migration shape).
-- Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.lessons (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_center
  ON public.lessons(center_id);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.lessons
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.lessons
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.lessons IS 'Lesson module: curriculum lessons, typed fields in JSONB data';
