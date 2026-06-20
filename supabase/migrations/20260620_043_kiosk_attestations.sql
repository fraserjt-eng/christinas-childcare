-- Migration 043: kiosk_attestations — the MN DCYF compliance attestations.
-- Records (a) each family's agreement to the kiosk Privacy Notice (gates
-- check-in; required first use on/after 2026-06-22, then yearly + on version
-- change) and (b) each provider import-attendance accuracy attestation at CCAP
-- export. Reached only through the service-role kiosk route + the guarded store;
-- service-role-only RLS (no anon policy), like child_daily_entries.

CREATE TABLE IF NOT EXISTS public.kiosk_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL,            -- 'family' | 'staff'
  subject_id uuid NOT NULL,              -- family_id or employee_id
  attestation_type text NOT NULL,        -- 'privacy_notice' | 'import_attendance'
  version text NOT NULL,
  agreed_at timestamptz NOT NULL DEFAULT now(),
  agreed_name text,
  center_id uuid REFERENCES public.centers(id),
  kiosk_device text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kiosk_attest_subject
  ON public.kiosk_attestations(subject_type, subject_id, attestation_type);
CREATE INDEX IF NOT EXISTS idx_kiosk_attest_type
  ON public.kiosk_attestations(attestation_type);
CREATE INDEX IF NOT EXISTS idx_kiosk_attest_center
  ON public.kiosk_attestations(center_id);

ALTER TABLE public.kiosk_attestations ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose: only the service role (the kiosk
-- route and the guarded admin store) may read/write this compliance record.

COMMENT ON TABLE public.kiosk_attestations IS
'MN DCYF attestations: family privacy-notice agreements (kiosk gate) and provider import-attendance accuracy attestations. Service-role only.';
