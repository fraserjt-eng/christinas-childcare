-- Migration 031: supply & inventory module → Supabase table
-- Backs the supply-inventory-storage dual-write module. One table holds the
-- module's three record kinds (items, requests, orders) discriminated by
-- `record_type`, each row's fields in a JSONB `data` column (matches the
-- migration-012 fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.supplies (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplies_record_type
  ON public.supplies(record_type);
CREATE INDEX IF NOT EXISTS idx_supplies_center
  ON public.supplies(center_id);

-- Enable RLS
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.supplies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.supplies
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.supplies IS 'Supply & inventory module: items, requests, and orders (record_type discriminator), data in JSONB';
