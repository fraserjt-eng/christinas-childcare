-- Migration 033: CACFP compliance module → Supabase table
-- Backs the cacfp-compliance-storage dual-write module. One table holds the
-- module's two record kinds (monthly compliance records, reimbursement records)
-- discriminated by `record_type`, each row's fields in a JSONB `data` column
-- (matches the migration-012 / 031 fast-migration shape). Schema can be
-- normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.cacfp_records (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cacfp_records_record_type
  ON public.cacfp_records(record_type);
CREATE INDEX IF NOT EXISTS idx_cacfp_records_center
  ON public.cacfp_records(center_id);

-- Enable RLS
ALTER TABLE public.cacfp_records ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.cacfp_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.cacfp_records
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.cacfp_records IS 'CACFP compliance module: monthly compliance records and reimbursement records (record_type discriminator), data in JSONB';
