-- Migration 037: meeting efficiency module → Supabase table
-- Backs the meeting-storage dual-write module. One table holds the module's
-- meeting records (decisions and action items live nested inside each meeting's
-- JSONB `data` payload), discriminated by `record_type` for consistency with the
-- migration-031 fast-migration shape. Each row's fields live in a JSONB `data`
-- column. Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.meetings (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_record_type
  ON public.meetings(record_type);
CREATE INDEX IF NOT EXISTS idx_meetings_center
  ON public.meetings(center_id);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.meetings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.meetings
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.meetings IS 'Meeting efficiency module: meeting records (record_type discriminator), agenda/decisions/action items nested in JSONB data';
