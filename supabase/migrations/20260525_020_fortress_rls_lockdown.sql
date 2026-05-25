-- 20260525_020_fortress_rls_lockdown
-- Fortress RLS lockdown for Christina's Child Care (Supabase dkzxcxwjhhxqfgksynjb).
-- Verified against the live schema on 2026-05-25 (get_advisors + pg_policies).
--
-- WHAT THIS CLOSES
--   CRITICAL: financial_records, revenue_scenarios were readable AND writable by the
--             anonymous browser key (and any authenticated user).
--   HIGH:     families, family_children, family_parents were readable/writable by ANY
--             authenticated user (every family's children + parents exposed).
--   MEDIUM:   is_admin_or_owner() / is_staff() had a mutable search_path and were
--             callable by anon via /rest/v1/rpc.
--
-- WHY THIS IS SAFE (no data loss, app keeps working)
--   * Policy-only. No table, column, or row DDL. Row counts cannot change.
--   * The app reads/writes these tables through the admin service-role API
--     (getServerSupabase in src/app/api/admin/* and src/app/api/parent/*), and the
--     service role bypasses RLS. The dropped policies were dead weight for real flows.
--   * authenticated KEEPS execute on the role helpers: daily_photos / food_counts /
--     enrollment_inquiries / error_logs / tour_requests admin policies call them.
--   * Verify with the dry-run in 20260525_020_dryrun_check.sql BEFORE applying for real.
--
-- NOT INCLUDED (deliberate)
--   * app_settings stays open: the admin research page (client component,
--     src/app/admin/research/page.tsx) reads/writes it via the anon key. Locking it
--     would break that feature. Follow-up: route those writes through a service-role
--     API, then lock. Tracked as a MEDIUM in the fortress report.
--   * Public-form anon INSERTs (demo_attendance, enrollment_inquiries, error_logs,
--     tour_requests) are intentional and kept.
--   * Leaked-password protection is an Auth setting, enabled separately (not SQL).
--
-- ROLLBACK: supabase/migrations/_rollback/20260525_020_rollback.sql restores the exact
--           pre-change policies + grants captured live 2026-05-25.

begin;

-- CRITICAL: financials -> service-role only (RLS on, no policy)
drop policy if exists "Allow all for anon"          on public.financial_records;
drop policy if exists "Allow all for authenticated" on public.financial_records;
drop policy if exists "Allow all for anon"          on public.revenue_scenarios;
drop policy if exists "Allow all for authenticated" on public.revenue_scenarios;

-- HIGH: family + child PII -> service-role only (RLS on, no policy)
drop policy if exists "Auth full access families" on public.families;
drop policy if exists "Auth full access children" on public.family_children;
drop policy if exists "Auth full access parents"  on public.family_parents;

-- MEDIUM: pin search_path + remove the anon/public RPC execute path on role helpers
alter function public.is_admin_or_owner() set search_path = '';
alter function public.is_staff()          set search_path = '';
revoke execute on function public.is_admin_or_owner() from anon, public;
revoke execute on function public.is_staff()          from anon, public;

commit;
