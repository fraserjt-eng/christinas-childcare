-- 20260705_052_lockdown_anon_all_policies.sql
--
-- STAGED, NOT YET APPLIED. Do not run before J's at-the-moment okay in a safe
-- window (not before tomorrow's live work). Cross-audit 2026-07-05 finding #1.
--
-- Problem: ten tables carry a catch-all `Allow all for anon` (ALL) policy, and a
-- few also `Allow all for authenticated` (ALL). USING(true)/WITH CHECK(true) for
-- ALL means an anonymous internet visitor can INSERT / UPDATE / DELETE rows,
-- including on cacfp_records (federal CACFP food-program financial data). The
-- Supabase advisor flags these as rls_policy_always_true. The cross-audit
-- confirmed no data leaks on READ today (the operational tables are empty and
-- deny-all tables block anon), so this is a live WRITE / tamper vector, not a
-- current read exposure. This migration closes the write door.
--
-- App contract (per repo CLAUDE.md): PII and operational tables are
-- service-role-only; all writes route through /api/store or /api/portal/*,
-- which use the service-role key and bypass RLS entirely. So dropping the
-- anon/authenticated ALL policies does not break the app's write path.
--
-- PUBLIC-READ ASSUMPTION (verify before applying): the three content tables
-- news_updates, center_announcements, newsletters MAY be read anonymously by the
-- public marketing site. This migration KEEPS an anon SELECT policy for those
-- three and removes only their write access. If the site actually reads them via
-- /api/store (service-role), the anon SELECT is unnecessary and can be dropped
-- too. The seven operational tables (cacfp_records, knowledge, lessons, meetings,
-- onboarding, supplies, dashboard_layout) have no public-read reason and go
-- full deny-all to anon + authenticated (service-role only).

begin;

-- ---- Operational / internal tables: full lockdown (service-role only) --------
-- Drop the catch-all policies; RLS stays enabled so anon/authenticated get zero
-- rows. Service-role (server routes) is unaffected.
drop policy if exists "Allow all for anon" on public.cacfp_records;
drop policy if exists "Allow all for anon" on public.knowledge;
drop policy if exists "Allow all for anon" on public.lessons;
drop policy if exists "Allow all for anon" on public.meetings;
drop policy if exists "Allow all for anon" on public.onboarding;
drop policy if exists "Allow all for anon" on public.supplies;
drop policy if exists "Allow all for anon" on public.dashboard_layout;

-- ---- Content tables: remove write access, keep public read (verify) ---------
-- center_announcements
drop policy if exists "Allow all for anon" on public.center_announcements;
drop policy if exists "Allow all for authenticated" on public.center_announcements;
create policy "public read announcements" on public.center_announcements
  for select to anon using (true);

-- news_updates
drop policy if exists "Allow all for anon" on public.news_updates;
drop policy if exists "Allow all for authenticated" on public.news_updates;
create policy "public read news" on public.news_updates
  for select to anon using (true);

-- newsletters: already has scoped admin policies (read/write/update/delete for
-- authenticated). Drop only the redundant catch-alls; keep the scoped set and
-- add an explicit public read.
drop policy if exists "Allow all for anon" on public.newsletters;
drop policy if exists "Allow all for authenticated" on public.newsletters;
create policy "public read newsletters" on public.newsletters
  for select to anon using (true);

commit;

-- POST-APPLY VERIFICATION (run after applying, in a safe window):
--   1. Advisor: cacfp_records / knowledge / lessons / meetings / onboarding /
--      supplies / dashboard_layout no longer appear under rls_policy_always_true.
--   2. Anon write probe (expect denied): an anon INSERT into cacfp_records returns
--      an RLS error, not success.
--   3. App smoke on a preview branch (never live data): kiosk check-in, admin
--      CACFP entry, newsletter render, announcements render all still work
--      (they use service-role via /api/store).
--   4. Public marketing pages that show news/announcements/newsletters still
--      render for a logged-out visitor.
