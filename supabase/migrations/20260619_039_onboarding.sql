-- Migration 039: onboarding module → Supabase table
-- Backs the onboarding-storage dual-write module. One table holds the module's
-- two record kinds (templates, assignments) discriminated by `record_type`,
-- each row's fields in a JSONB `data` column (matches the migration-031/012
-- fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.onboarding (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_record_type
  ON public.onboarding(record_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_center
  ON public.onboarding(center_id);

-- Enable RLS
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.onboarding
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.onboarding
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.onboarding IS 'Onboarding module: templates and assignments (record_type discriminator), data in JSONB';
