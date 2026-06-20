-- Migration 042: lock the PII / roster / security tables away from the anon key
-- (security gate blocker D). These tables back client-side dual-write modules,
-- which now read/write them through the session-gated /api/store route (service
-- role) instead of the browser anon key. Removing the permissive anon policies
-- means the browser key can no longer reach them directly via PostgREST.
--
-- SAFETY: only REMOVES permissive access (and narrows app_settings). RLS stays
-- enabled; the service role bypasses RLS, so the server route still works. No
-- data touched. Idempotent (DROP POLICY IF EXISTS).

-- Full lockdown: anon / authenticated can no longer touch these PII tables.
DROP POLICY IF EXISTS "Allow all for anon" ON public.notification_prefs;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.notification_prefs;
DROP POLICY IF EXISTS "Allow all for anon" ON public.comms;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.comms;
DROP POLICY IF EXISTS "Allow all for anon" ON public.authorizations;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.authorizations;
DROP POLICY IF EXISTS "Allow all for anon" ON public.parent_conversations;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.parent_conversations;
DROP POLICY IF EXISTS "Allow all for anon" ON public.substitutes;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.substitutes;
DROP POLICY IF EXISTS "Allow all for anon" ON public.sub_assignments;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.sub_assignments;

-- app_settings is a shared key-value settings table (ai config, ai usage, etc.)
-- that legitimately needs the anon key for non-sensitive keys. But the user
-- roster ('app_users') and security settings live here too and were anon-
-- writable (privilege escalation). Replace the blanket allow-all with a policy
-- that excludes those sensitive keys; the service role (via /api/store, used by
-- user-storage) still reaches them.
DROP POLICY IF EXISTS "Allow all for anon" ON public.app_settings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.app_settings;
CREATE POLICY "anon non-sensitive settings" ON public.app_settings
  FOR ALL TO anon
  USING (key NOT IN ('app_users', 'security_settings'))
  WITH CHECK (key NOT IN ('app_users', 'security_settings'));
