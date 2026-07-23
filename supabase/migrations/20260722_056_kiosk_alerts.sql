-- Migration 056: in-app kiosk alerts.
--
-- When a center's kiosk sees an unusual burst of WRONG PIN entries (approaching
-- or hitting the per-center throttle), the server records a row here so the
-- alert lives inside the platform, no email required. An admin/director sees
-- recent alerts on the Kiosk Attendance (Live) screen. This is the durable,
-- cross-device counterpart to the on-kiosk "busy" message that staff at the
-- door already see.
--
-- Only wrong guesses drive this, so a row means something worth noticing: a
-- guessing attempt, or a systemic problem like PINs reset without telling
-- parents. It never fires on normal, correct pickups.

CREATE TABLE IF NOT EXISTS public.kiosk_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES public.centers(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('approaching', 'hit')),
  wrong_count integer NOT NULL,
  limit_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.kiosk_alerts IS
  'One row per time a center approached (level=approaching) or hit (level=hit) its wrong-PIN throttle. Surfaced in-app on the Kiosk Live screen. Written by the service-role kiosk route only.';

CREATE INDEX IF NOT EXISTS idx_kiosk_alerts_center_time
  ON public.kiosk_alerts (center_id, created_at DESC);

-- RLS on. No anon access at all (this is operational data). Authenticated staff
-- may READ so the admin surfaces can show it; writes come only from the
-- service-role kiosk route, which bypasses RLS. There is deliberately no anon
-- or authenticated INSERT/UPDATE/DELETE policy.
ALTER TABLE public.kiosk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read kiosk alerts"
  ON public.kiosk_alerts FOR SELECT TO authenticated USING (true);
