-- Migration: 029_data_deletion_requests
-- A tracked, retention-aware data deletion request queue. Families file a
-- request from /delete-data; the director fulfills it from /admin/data-requests
-- within childcare record-retention limits. The request row stores only who is
-- asking and for what, never child records.

CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  relationship text,
  child_name text,
  reason text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'completed', 'denied')),
  admin_notes text,
  handled_by text,
  handled_at timestamptz,
  center_id uuid
);

CREATE INDEX IF NOT EXISTS idx_ddr_status_created
  ON public.data_deletion_requests (status, created_at DESC);

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Anyone may FILE a request (the public form). There is deliberately no anon
-- SELECT or UPDATE policy: reading the queue and actioning requests happen in
-- the admin routes through the service role, which bypasses RLS. So a stranger
-- can submit a request but can never read or change the queue.
DROP POLICY IF EXISTS "ddr_insert_anon" ON public.data_deletion_requests;
CREATE POLICY "ddr_insert_anon" ON public.data_deletion_requests
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "ddr_insert_authenticated" ON public.data_deletion_requests;
CREATE POLICY "ddr_insert_authenticated" ON public.data_deletion_requests
  FOR INSERT TO authenticated WITH CHECK (true);
