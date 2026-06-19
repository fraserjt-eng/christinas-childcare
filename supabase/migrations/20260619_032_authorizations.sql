-- Migration 032: state authorization tracking module → Supabase table
-- Backs the authorization-storage dual-write module (Tool 04: State Authorization
-- Tracking). One record kind (child authorizations), so no record_type
-- discriminator: each row's typed fields live in a JSONB `data` column
-- (matches the migration-012 fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.authorizations (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authorizations_center
  ON public.authorizations(center_id);

-- Enable RLS
ALTER TABLE public.authorizations ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.authorizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.authorizations
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.authorizations IS 'State authorization tracking module: child authorizations (single record kind), typed fields in JSONB data';
