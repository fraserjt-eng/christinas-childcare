-- Migration 004: Fix RLS policies + error_logs table
-- Replaces the blanket "allow all" policies from migrations 001, 002, and 003
-- with role-scoped policies based on auth.jwt() user_metadata.role.
--
-- Role hierarchy: owner > admin > teacher > parent
-- Admin-level operations are permitted to both 'admin' and 'owner' roles.

-- ============================================================================
-- Helper: role check expressions
-- auth.jwt() ->> 'user_metadata' is a JSON string; cast via ->> then compare.
-- ============================================================================

-- is_admin_or_owner() returns true when the JWT role is 'admin' or 'owner'
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'owner')
  );
$$;

-- is_staff() returns true for any authenticated staff member (teacher and above)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('owner', 'admin', 'teacher')
  );
$$;

-- ============================================================================
-- Drop permissive policies: centers, classrooms (keep staff access; tighten writes)
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.centers;
DROP POLICY IF EXISTS "Allow all for anon" ON public.centers;

CREATE POLICY "centers_read_authenticated" ON public.centers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "centers_write_admin" ON public.centers
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "centers_update_admin" ON public.centers
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "centers_delete_admin" ON public.centers
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.classrooms;
DROP POLICY IF EXISTS "Allow all for anon" ON public.classrooms;

CREATE POLICY "classrooms_read_authenticated" ON public.classrooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "classrooms_write_admin" ON public.classrooms
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "classrooms_update_admin" ON public.classrooms
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "classrooms_delete_admin" ON public.classrooms
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- employees table
-- Read: any authenticated user (needed for schedule lookups, dropdown lists)
-- Write: admin/owner only (HR sensitivity)
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.employees;
DROP POLICY IF EXISTS "Allow all for anon" ON public.employees;

CREATE POLICY "employees_read_authenticated" ON public.employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "employees_insert_admin" ON public.employees
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "employees_update_admin" ON public.employees
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "employees_delete_admin" ON public.employees
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- food_counts table
-- Read/Insert: any authenticated user (any staff submits meal counts)
-- Update/Delete: admin/owner only (corrections and audits)
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.food_counts;
DROP POLICY IF EXISTS "Allow all for anon" ON public.food_counts;

CREATE POLICY "food_counts_read_authenticated" ON public.food_counts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "food_counts_insert_staff" ON public.food_counts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "food_counts_update_admin" ON public.food_counts
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "food_counts_delete_admin" ON public.food_counts
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- attendance table
-- Same pattern as food_counts: staff can record, admin controls corrections
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.attendance;
DROP POLICY IF EXISTS "Allow all for anon" ON public.attendance;

CREATE POLICY "attendance_read_authenticated" ON public.attendance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "attendance_insert_staff" ON public.attendance
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "attendance_update_admin" ON public.attendance
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "attendance_delete_admin" ON public.attendance
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- staff_schedules table
-- Read: any authenticated user (staff check their own schedule)
-- Write: admin/owner only
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.staff_schedules;
DROP POLICY IF EXISTS "Allow all for anon" ON public.staff_schedules;

CREATE POLICY "staff_schedules_read_authenticated" ON public.staff_schedules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "staff_schedules_insert_admin" ON public.staff_schedules
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "staff_schedules_update_admin" ON public.staff_schedules
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "staff_schedules_delete_admin" ON public.staff_schedules
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- enrollment_inquiries table
-- Insert: anon (public enrollment form on the website)
-- Read/Update/Delete: admin/owner only
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.enrollment_inquiries;
DROP POLICY IF EXISTS "Allow all for anon" ON public.enrollment_inquiries;

CREATE POLICY "enrollment_inquiries_insert_anon" ON public.enrollment_inquiries
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "enrollment_inquiries_insert_authenticated" ON public.enrollment_inquiries
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "enrollment_inquiries_read_admin" ON public.enrollment_inquiries
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "enrollment_inquiries_update_admin" ON public.enrollment_inquiries
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "enrollment_inquiries_delete_admin" ON public.enrollment_inquiries
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- tour_requests table
-- Same pattern as enrollment_inquiries
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.tour_requests;
DROP POLICY IF EXISTS "Allow all for anon" ON public.tour_requests;

CREATE POLICY "tour_requests_insert_anon" ON public.tour_requests
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "tour_requests_insert_authenticated" ON public.tour_requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tour_requests_read_admin" ON public.tour_requests
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "tour_requests_update_admin" ON public.tour_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "tour_requests_delete_admin" ON public.tour_requests
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- incident_reports table
-- Insert: any authenticated staff member
-- Select: admin/owner see all; creator sees their own
-- Update: admin/owner only (appending to audit trail)
-- Delete: NO policy. Incidents are permanent records.
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.incident_reports;
DROP POLICY IF EXISTS "Allow all for anon" ON public.incident_reports;

CREATE POLICY "incident_reports_insert_staff" ON public.incident_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Admin/owner see every report
CREATE POLICY "incident_reports_select_admin" ON public.incident_reports
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());

-- Creator can read their own report (reported_by is stored as text, not uuid,
-- so we compare against email from the JWT).
CREATE POLICY "incident_reports_select_own" ON public.incident_reports
  FOR SELECT TO authenticated
  USING (
    reported_by = (auth.jwt() ->> 'email')
  );

CREATE POLICY "incident_reports_update_admin" ON public.incident_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- No DELETE policy. Incident records must be retained for compliance.

-- ============================================================================
-- hr_documents table
-- Full access: admin/owner only. No staff self-service reads.
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.hr_documents;
DROP POLICY IF EXISTS "Allow all for anon" ON public.hr_documents;

CREATE POLICY "hr_documents_admin_only" ON public.hr_documents
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- ============================================================================
-- training_records table
-- Read own: authenticated user reads records for their own employee_id
-- Read all: admin/owner
-- Insert/Update: admin/owner only
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.training_records;
DROP POLICY IF EXISTS "Allow all for anon" ON public.training_records;

-- Admin sees all records
CREATE POLICY "training_records_read_admin" ON public.training_records
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());

-- Staff member reads their own records (employee_id must match the employees
-- row whose email matches the authenticated user's email)
CREATE POLICY "training_records_read_own" ON public.training_records
  FOR SELECT TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "training_records_insert_admin" ON public.training_records
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "training_records_update_admin" ON public.training_records
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "training_records_delete_admin" ON public.training_records
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- cacfp_compliance, daily_photos, photo_reactions, communications,
-- communication_reads, newsletters (from migration 002)
-- ============================================================================

-- cacfp_compliance: staff read, admin write
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.cacfp_compliance;
DROP POLICY IF EXISTS "Allow all for anon" ON public.cacfp_compliance;

CREATE POLICY "cacfp_compliance_read_authenticated" ON public.cacfp_compliance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cacfp_compliance_write_admin" ON public.cacfp_compliance
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "cacfp_compliance_update_admin" ON public.cacfp_compliance
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "cacfp_compliance_delete_admin" ON public.cacfp_compliance
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- daily_photos: staff insert/read, admin update status, no anon
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.daily_photos;
DROP POLICY IF EXISTS "Allow all for anon" ON public.daily_photos;

CREATE POLICY "daily_photos_read_authenticated" ON public.daily_photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "daily_photos_insert_staff" ON public.daily_photos
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());

CREATE POLICY "daily_photos_update_admin" ON public.daily_photos
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "daily_photos_delete_admin" ON public.daily_photos
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- photo_reactions: authenticated users can react
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.photo_reactions;
DROP POLICY IF EXISTS "Allow all for anon" ON public.photo_reactions;

CREATE POLICY "photo_reactions_read_authenticated" ON public.photo_reactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "photo_reactions_insert_authenticated" ON public.photo_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "photo_reactions_delete_own" ON public.photo_reactions
  FOR DELETE TO authenticated
  USING (parent_id = auth.uid()::text);

-- communications: staff read, admin write
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.communications;
DROP POLICY IF EXISTS "Allow all for anon" ON public.communications;

CREATE POLICY "communications_read_authenticated" ON public.communications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "communications_write_admin" ON public.communications
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "communications_update_admin" ON public.communications
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "communications_delete_admin" ON public.communications
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- communication_reads: authenticated users track their own reads
-- The column is parent_id (text), stored by the app as the parent's identifier.
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.communication_reads;
DROP POLICY IF EXISTS "Allow all for anon" ON public.communication_reads;

CREATE POLICY "communication_reads_select_own" ON public.communication_reads
  FOR SELECT TO authenticated USING (auth.uid()::text = parent_id);

CREATE POLICY "communication_reads_insert_own" ON public.communication_reads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- newsletters: staff read, admin write
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.newsletters;
DROP POLICY IF EXISTS "Allow all for anon" ON public.newsletters;

CREATE POLICY "newsletters_read_authenticated" ON public.newsletters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "newsletters_write_admin" ON public.newsletters
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "newsletters_update_admin" ON public.newsletters
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "newsletters_delete_admin" ON public.newsletters
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ============================================================================
-- error_logs table (used by src/lib/error-reporter.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_stack text,
  url text,
  user_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON public.error_logs(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only admin/owner may read error logs
CREATE POLICY "error_logs_read_admin" ON public.error_logs
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());

-- Any authenticated user (or the app via service role) can insert
CREATE POLICY "error_logs_insert_authenticated" ON public.error_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Anon insert so client-side errors before login can still be captured
CREATE POLICY "error_logs_insert_anon" ON public.error_logs
  FOR INSERT TO anon WITH CHECK (true);

-- No update or delete: error logs are append-only
