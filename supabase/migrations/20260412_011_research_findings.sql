-- Migration 011: research_findings table
-- Auto-researcher writes findings here. Admin reviews and converts to action plans.

CREATE TABLE IF NOT EXISTS public.research_findings (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  question_id text NOT NULL,
  question_text text NOT NULL,
  finding text NOT NULL,
  evidence text,
  framework_tag text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'opportunity', 'risk')),
  source text NOT NULL DEFAULT 'internal' CHECK (source IN ('internal', 'external')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'acted', 'dismissed')),
  action_plan_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_findings_status ON public.research_findings(status);
CREATE INDEX IF NOT EXISTS idx_research_findings_created ON public.research_findings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_findings_framework ON public.research_findings(framework_tag);

ALTER TABLE public.research_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON public.research_findings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.research_findings
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.research_findings IS 'Auto-researcher output. Each row is a hypothesis-tested finding from nightly scans.';
