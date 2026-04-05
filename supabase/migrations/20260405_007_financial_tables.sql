-- Migration 007: Financial and App Settings Tables

-- ============================================================================
-- Financial Records (revenue and expense tracking by month)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES public.centers(id),
  month text NOT NULL,
  revenue_tuition numeric(12,2) NOT NULL DEFAULT 0,
  revenue_cacfp numeric(12,2) NOT NULL DEFAULT 0,
  revenue_other numeric(12,2) NOT NULL DEFAULT 0,
  expenses_labor numeric(12,2) NOT NULL DEFAULT 0,
  expenses_supplies numeric(12,2) NOT NULL DEFAULT 0,
  expenses_fixed numeric(12,2) NOT NULL DEFAULT 0,
  expenses_other numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(center_id, month)
);

COMMENT ON TABLE public.financial_records IS 'Monthly revenue and expense records for the child care center; drives financial health dashboard and forecasting tools.';

CREATE INDEX idx_financial_records_month ON public.financial_records(month);

-- ============================================================================
-- Revenue Scenarios (what-if enrollment/rate projections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.revenue_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES public.centers(id),
  name text NOT NULL,
  enrollment_change integer NOT NULL DEFAULT 0,
  rate_change numeric(10,2) NOT NULL DEFAULT 0,
  projected_revenue numeric(12,2) NOT NULL DEFAULT 0,
  projected_expenses numeric(12,2) NOT NULL DEFAULT 0,
  projected_margin numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.revenue_scenarios IS 'Saved revenue forecasting scenarios for what-if analysis of enrollment and rate changes.';

-- ============================================================================
-- App Settings (JSONB key-value store for users, security settings, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES public.centers(id),
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(center_id, key)
);

COMMENT ON TABLE public.app_settings IS 'Generic key-value store for app-wide settings (security config, user lists, etc.) keyed by center.';

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON public.financial_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.financial_records
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.revenue_scenarios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.revenue_scenarios
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.app_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.app_settings
  FOR ALL TO anon USING (true) WITH CHECK (true);
