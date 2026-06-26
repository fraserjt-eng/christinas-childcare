-- Migration 050: Billing ledger (pilot phase 2). The running tab the manual
-- spreadsheet never had: charges added to a family's account, payments recorded
-- against it, balance computed (charges - payments). Fills the documented "no
-- running-balance ledger" gap from migration 027. Feeds the measurement field
-- test (spiral velocity = contract decision -> first charge; the friction
-- baseline = clerical time on the cycle).
--
-- Pilot-safe: entries are only written for families flagged is_pilot on their
-- contract; everyone else stays on Brightwheel. Statements-first, no money
-- movement: these are RECORDS of charges and payments, not a payment processor.
--
-- RLS enabled, no policies = service-role-only (the fortress pattern for
-- family/financial tables). All access through the session-gated admin API.

-- A charge owed by a family. amount is signed: a normal charge is positive, a
-- 'credit' kind is negative, so SUM(amount) is the gross owed.
CREATE TABLE IF NOT EXISTS public.billing_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  center_id uuid REFERENCES public.centers(id),
  contract_id uuid REFERENCES public.family_billing_contracts(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'tuition'
    CHECK (kind IN ('tuition', 'registration', 'late_fee', 'supply_fee', 'adjustment', 'credit', 'other')),
  description text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  period_start date,
  period_end date,
  charge_date date NOT NULL DEFAULT current_date,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now()
);

-- A payment received against the family's account. amount is positive; it
-- reduces the balance. CCAP subsidy is recorded here as a payment method, so the
-- remaining balance is the parent's co-pay due.
CREATE TABLE IF NOT EXISTS public.billing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  center_id uuid REFERENCES public.centers(id),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'check'
    CHECK (method IN ('cash', 'check', 'transfer', 'card', 'ccap_subsidy', 'adjustment', 'other')),
  reference text,
  paid_on date NOT NULL DEFAULT current_date,
  note text,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_charges_family ON public.billing_charges(family_id);
CREATE INDEX IF NOT EXISTS idx_billing_charges_center ON public.billing_charges(center_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_family ON public.billing_payments(family_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_center ON public.billing_payments(center_id);

ALTER TABLE public.billing_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.billing_charges IS 'Pilot billing: charges owed by a family (signed; credit kind is negative). Service-role-only; written only for is_pilot families.';
COMMENT ON TABLE public.billing_payments IS 'Pilot billing: payments received against a family account (positive; reduces balance). CCAP subsidy is a payment method. Service-role-only.';
