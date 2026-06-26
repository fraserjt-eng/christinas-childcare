-- Migration 049: Family billing contracts (the "specific bill/contract" each
-- family carries). This replaces the owners' local spreadsheet tracking and the
-- single families.copay_default_amount prefill with a structured per-family
-- contract: the agreed rate, the CCAP subsidy/co-pay split, and a PILOT flag.
--
-- Pilot-safe by design: billing only "turns on" for a family explicitly flagged
-- is_pilot = true, so the ~99% of families still billed through Brightwheel are
-- untouched. Statements are generated from this contract in a later phase; this
-- table bills no one on its own.
--
-- RLS enabled, no policies: service-role-only, matching family_statements and
-- the fortress pattern for sensitive family/financial tables. All access routes
-- through the session-gated admin API.

CREATE TABLE IF NOT EXISTS public.family_billing_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  center_id uuid REFERENCES public.centers(id),

  -- The agreed tuition for this family (the contract amount).
  rate_amount numeric(10,2) NOT NULL DEFAULT 0,
  rate_unit text NOT NULL DEFAULT 'weekly'
    CHECK (rate_unit IN ('weekly', 'biweekly', 'monthly', 'daily')),
  schedule_note text, -- e.g. "Full-time, M-F" or "T/Th only"

  -- CCAP (MN Child Care Assistance). The subsidy/co-pay split that the owner
  -- currently keys into the state hub by hand.
  ccap_status text NOT NULL DEFAULT 'none'
    CHECK (ccap_status IN ('none', 'pending', 'active')),
  ccap_case_number text,              -- the family's assistance case/authorization id
  ccap_subsidy_amount numeric(10,2),  -- the state's share per period, when known
  copay_amount numeric(10,2),         -- the family's co-pay per period
  copay_frequency text DEFAULT 'weekly'
    CHECK (copay_frequency IN ('weekly', 'biweekly', 'monthly', 'daily')),

  -- Pilot gate: billing is OFF for a family unless this is true.
  is_pilot boolean NOT NULL DEFAULT false,

  effective_date date,
  notes text,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- One contract per family for v1 (per-child contracts can come later). The
-- upsert in the admin API keys on this.
CREATE UNIQUE INDEX IF NOT EXISTS idx_fbc_family ON public.family_billing_contracts(family_id);
CREATE INDEX IF NOT EXISTS idx_fbc_center ON public.family_billing_contracts(center_id);

ALTER TABLE public.family_billing_contracts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.family_billing_contracts IS 'Per-family billing contract (rate + CCAP subsidy/co-pay split + pilot flag). Replaces spreadsheet tracking. Service-role-only; billing is gated on is_pilot.';
