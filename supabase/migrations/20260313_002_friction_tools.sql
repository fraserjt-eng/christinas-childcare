-- Migration 002: Friction Tools (Phases 1 + 2)
-- Tables for CACFP compliance, daily photos, communications, and newsletters

-- ============================================================================
-- Extend food_counts with submission tracking (Tool 01)
-- ============================================================================
ALTER TABLE public.food_counts
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS on_time boolean DEFAULT true;

-- ============================================================================
-- CACFP Compliance (Tool 10)
-- ============================================================================
CREATE TABLE public.cacfp_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  month text NOT NULL, -- YYYY-MM
  checklist_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_score integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(center_id, month)
);

CREATE INDEX idx_cacfp_compliance_center_month ON public.cacfp_compliance(center_id, month);

-- ============================================================================
-- Daily Photos (Tool 02)
-- ============================================================================
CREATE TABLE public.daily_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id),
  employee_id uuid REFERENCES public.employees(id),
  photo_url text NOT NULL,
  caption text,
  activity_type text CHECK (activity_type IN ('art','outdoor','circle_time','free_play','meals','nap_prep','special_event','other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES public.employees(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_daily_photos_center_date ON public.daily_photos(center_id, created_at);
CREATE INDEX idx_daily_photos_classroom ON public.daily_photos(classroom_id);
CREATE INDEX idx_daily_photos_status ON public.daily_photos(status);

CREATE TABLE public.photo_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES public.daily_photos(id) ON DELETE CASCADE,
  parent_id text NOT NULL, -- parent identifier
  reaction_type text NOT NULL DEFAULT 'heart',
  created_at timestamptz DEFAULT now(),
  UNIQUE(photo_id, parent_id)
);

-- ============================================================================
-- Communications (Tool 11)
-- ============================================================================
CREATE TABLE public.communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  type text NOT NULL CHECK (type IN ('announcement','individual','daily_update','template')),
  subject text NOT NULL,
  body_html text,
  audience_type text CHECK (audience_type IN ('all','classroom','individual')),
  audience_ids text[], -- classroom IDs or parent IDs
  template_name text, -- for template type
  merge_fields jsonb, -- for templates with {child_name}, {classroom}, etc.
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_communications_center ON public.communications(center_id);
CREATE INDEX idx_communications_type ON public.communications(type);
CREATE INDEX idx_communications_sent ON public.communications(sent_at);

CREATE TABLE public.communication_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id uuid NOT NULL REFERENCES public.communications(id) ON DELETE CASCADE,
  parent_id text NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE(communication_id, parent_id)
);

-- ============================================================================
-- Newsletters (Tool 18)
-- ============================================================================
CREATE TABLE public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  subject text NOT NULL,
  body_html text,
  sections_json jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_newsletters_center ON public.newsletters(center_id);
CREATE INDEX idx_newsletters_status ON public.newsletters(status);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.cacfp_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Permissive policies (matching existing pattern)
CREATE POLICY "Allow all for authenticated" ON public.cacfp_compliance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.cacfp_compliance
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.daily_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.daily_photos
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.photo_reactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.photo_reactions
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.communications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.communications
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.communication_reads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.communication_reads
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.newsletters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.newsletters
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- Storage Buckets (run via Supabase dashboard or API)
-- ============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('daily-photos', 'daily-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('compliance-docs', 'compliance-docs', false);
