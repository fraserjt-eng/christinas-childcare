-- Migration 038: notification preferences module → Supabase table
-- Backs the notification-prefs-storage dual-write module. One record kind
-- (per-family notification preferences) so there is no record_type
-- discriminator. Each row's PK is the family_id, with the preference fields
-- (channels, frequency, categories, quiet_hours, updated_at) in a JSONB `data`
-- column (matches the migration-012 fast-migration shape). Schema can be
-- normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.notification_prefs (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_center
  ON public.notification_prefs(center_id);

-- Enable RLS
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.notification_prefs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.notification_prefs
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.notification_prefs IS 'Notification preferences module: one row per family (id = family_id), preference fields in JSONB data';
