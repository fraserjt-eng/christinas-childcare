-- Migration 041: dashboard_layout → owner-customizable office home tiles
-- Backs the dashboard-layout-storage dual-write module. One row per center
-- holds the ordered list of tile ids the owner chose for the office home
-- (src/app/preview/office). The center_id (a centers.id UUID) is used as the
-- text primary key, so an upsert always targets exactly one row per center.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + a single permissive
-- anon RLS policy, matching the app's HMAC-cookie-auth posture (no Supabase
-- Auth; the `authenticated` role is never exercised, so it gets no policy —
-- see migration 040). No DROP, no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.dashboard_layout (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  tiles jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_layout_center
  ON public.dashboard_layout(center_id);

-- Enable RLS
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Permissive anon policy only. The browser dual-write runs as the `anon`
-- publishable key (src/lib/supabase/service.ts). The `authenticated` role is
-- never used in this app, so it gets no policy (see migration 040).
CREATE POLICY "Allow all for anon" ON public.dashboard_layout
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.dashboard_layout IS 'Owner-customizable office home tiles, one row per center (id = center_id), ordered tile-id array in JSONB tiles';
