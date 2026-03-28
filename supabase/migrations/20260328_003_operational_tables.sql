-- Migration 003: Operational Tables
-- Tables for enrollment inquiries, tour requests, incident reports, HR documents, and training records

-- ============================================================================
-- Enrollment Inquiries (parent enrollment form submissions)
-- ============================================================================
CREATE TABLE public.enrollment_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  child_name text NOT NULL,
  child_age text NOT NULL,
  program text NOT NULL,
  start_date date,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','touring','enrolled','waitlisted','declined')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.enrollment_inquiries IS 'Captures parent enrollment form submissions from the public-facing website; tracks inquiry through contact, tour, and enrollment outcome.';

CREATE INDEX idx_enrollment_inquiries_status ON public.enrollment_inquiries(status);
CREATE INDEX idx_enrollment_inquiries_created ON public.enrollment_inquiries(created_at);

-- ============================================================================
-- Tour Requests (tour scheduling form submissions)
-- ============================================================================
CREATE TABLE public.tour_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  number_of_children integer,
  children_ages text,
  questions text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.tour_requests IS 'Stores tour scheduling requests submitted by prospective families; used to coordinate and track visit outcomes.';

CREATE INDEX idx_tour_requests_preferred_date ON public.tour_requests(preferred_date);
CREATE INDEX idx_tour_requests_status ON public.tour_requests(status);

-- ============================================================================
-- Incident Reports (safety incident logging)
-- ============================================================================
CREATE TABLE public.incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES public.centers(id),
  incident_type text NOT NULL CHECK (incident_type IN ('child_injury','behavioral','facility','staff_injury','health','security','other')),
  severity text NOT NULL CHECK (severity IN ('minor','moderate','serious','critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','closed')),
  description text NOT NULL,
  location text,
  involved_children text[],
  involved_staff text[],
  witnesses text[],
  actions_taken text,
  follow_up_required boolean DEFAULT false,
  follow_up_notes text,
  reported_by text NOT NULL,
  reported_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.incident_reports IS 'Records safety incidents at either center; supports licensing compliance, insurance documentation, and follow-up tracking.';

CREATE INDEX idx_incident_reports_center ON public.incident_reports(center_id);
CREATE INDEX idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX idx_incident_reports_reported_at ON public.incident_reports(reported_at);

-- ============================================================================
-- HR Documents (staff HR records)
-- ============================================================================
CREATE TABLE public.hr_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id),
  document_type text NOT NULL CHECK (document_type IN ('offer_letter','onboarding','performance_review','corrective_action','termination','certification','training','other')),
  title text NOT NULL,
  content jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','signed','archived')),
  signed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.hr_documents IS 'Stores structured HR documents (offer letters, reviews, corrective actions) linked to individual employees; supports digital signing workflow.';

CREATE INDEX idx_hr_documents_employee ON public.hr_documents(employee_id);
CREATE INDEX idx_hr_documents_type ON public.hr_documents(document_type);
CREATE INDEX idx_hr_documents_status ON public.hr_documents(status);

-- ============================================================================
-- Training Records (staff certification and training tracking)
-- ============================================================================
CREATE TABLE public.training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id),
  training_type text NOT NULL,
  title text NOT NULL,
  hours numeric(5,2) NOT NULL,
  completed_date date NOT NULL,
  expiry_date date,
  certificate_url text,
  verified_by text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.training_records IS 'Tracks completed training and certifications per employee, including CPR, first aid, and state-required hours; expiry_date drives renewal reminders.';

CREATE INDEX idx_training_records_employee ON public.training_records(employee_id);
CREATE INDEX idx_training_records_completed ON public.training_records(completed_date);
CREATE INDEX idx_training_records_expiry ON public.training_records(expiry_date);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.enrollment_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;

-- Permissive policies (matching existing pattern)
CREATE POLICY "Allow all for authenticated" ON public.enrollment_inquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.enrollment_inquiries
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.tour_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.tour_requests
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.incident_reports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.incident_reports
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.hr_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.hr_documents
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.training_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.training_records
  FOR ALL TO anon USING (true) WITH CHECK (true);
