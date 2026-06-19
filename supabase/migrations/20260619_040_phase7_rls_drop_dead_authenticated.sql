-- Phase 7 RLS hardening: remove the dead "authenticated" allow-all policies.
--
-- This app does NOT use Supabase Auth. Sessions are HMAC-signed HttpOnly
-- cookies verified in middleware + requireSession on every API route. At the
-- Postgres layer every request is therefore either the `anon` role (the
-- publishable key, used by the browser-side dual-write helpers in
-- src/lib/supabase/service.ts) or the `service_role` (server routes, which
-- bypass RLS). The `authenticated` role is never exercised.
--
-- That makes the "Allow all for authenticated" policies created in migrations
-- 031-039 dead weight AND a latent landmine: if Supabase Auth is ever turned
-- on later, `authenticated USING (true)` would instantly grant every signed-in
-- user full read/write to every center's data. Remove them now while they are
-- provably unused.
--
-- The "Allow all for anon" policies are KEPT on purpose: the browser dual-write
-- runs as `anon`, so removing them would break these tools. The real boundary
-- for anonymous access is the application layer, not RLS, because there is no
-- DB-level identity to scope on. Closing the anon exposure for good means
-- routing these tables' reads/writes through server API routes (service role +
-- session check) and then denying anon, the same pattern child_daily_entries
-- and /api/portal/center-data already use. That is a deliberate refactor of the
-- data path, tracked as a Phase 8 hardening item, not a policy toggle.

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.authorizations;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.cacfp_records;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.comms;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.knowledge;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.lessons;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.meetings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.notification_prefs;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.onboarding;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.supplies;
