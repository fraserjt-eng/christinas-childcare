-- Migration 034: communications module → Supabase table
-- Backs the comms-storage dual-write module. One table holds the module's
-- three record kinds (communications, read receipts, message templates)
-- discriminated by `record_type`, each row's fields in a JSONB `data` column
-- (matches the migration-012 / migration-031 fast-migration shape). Schema can
-- be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.comms (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comms_record_type
  ON public.comms(record_type);
CREATE INDEX IF NOT EXISTS idx_comms_center
  ON public.comms(center_id);

-- Enable RLS
ALTER TABLE public.comms ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.comms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.comms
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.comms IS 'Communications module: announcements/messages, read receipts, and message templates (record_type discriminator), data in JSONB';
