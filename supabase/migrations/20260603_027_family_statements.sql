-- Migration 027: Parent statements (send-only, no payment processing)
-- Owner request: send co-pay families a statement biweekly or monthly.
-- Christina enters the amount per period (no running-balance ledger). The app
-- generates a downloadable PDF now; emailing it is wired on later. This table
-- is the record of each statement issued.
--
-- RLS enabled, no policies: service-role-only, matching the fortress pattern
-- for all sensitive family/financial tables. All access routes through the
-- session-gated admin API.

CREATE TABLE IF NOT EXISTS public.family_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  center_id uuid REFERENCES public.centers(id),
  period_label text NOT NULL,
  period_start date,
  period_end date,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  note text,
  status text NOT NULL DEFAULT 'generated' CHECK (status IN ('draft', 'generated', 'sent')),
  pdf_path text,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_family_statements_family ON public.family_statements(family_id);
CREATE INDEX IF NOT EXISTS idx_family_statements_created ON public.family_statements(created_at);

ALTER TABLE public.family_statements ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.family_statements IS 'Co-payment statements issued to families (send-only, no payment processing). Christina enters the amount per period; the app renders a PDF and (later) emails it. Service-role-only.';

-- A default co-pay amount so the statement form can prefill for repeat families.
ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS copay_default_amount numeric(10,2);

COMMENT ON COLUMN public.families.copay_default_amount IS 'Optional default co-payment amount to prefill the statement form. Null = no co-pay family.';
