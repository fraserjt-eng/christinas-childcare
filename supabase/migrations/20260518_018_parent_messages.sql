-- 20260518_018_parent_messages
--
-- Direct messages from an admin to a registered parent. Server-only by
-- design: RLS is enabled with NO anon or authenticated policy, so the public
-- key cannot read families' messages (the same privacy class we just fixed
-- for the families tables). Only the service-role API routes touch this:
--   POST /api/admin/parent-message  (admin sends, also emails)
--   GET  /api/parent/messages       (the signed-in parent reads their own)

CREATE TABLE IF NOT EXISTS public.parent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid,
  parent_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  from_name text NOT NULL DEFAULT 'Christina''s Child Care Center',
  emailed boolean DEFAULT false,
  read_by_parent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: anon and authenticated are denied; the service-role
-- API routes bypass RLS. This keeps parent messages private.

CREATE INDEX IF NOT EXISTS idx_parent_messages_email
  ON public.parent_messages (lower(parent_email));
CREATE INDEX IF NOT EXISTS idx_parent_messages_created
  ON public.parent_messages (created_at DESC);
