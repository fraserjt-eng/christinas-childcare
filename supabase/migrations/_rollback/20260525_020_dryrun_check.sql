-- DRY RUN for 20260525_020_fortress_rls_lockdown.
-- Applies every change inside a transaction, proves that anon + authenticated reads
-- do NOT raise a permission error after the change (the function revoke is the risk),
-- then ROLLBACK so nothing persists. Run this BEFORE the real apply.
-- Expected: every SELECT returns a count with NO error. Locked tables return 0 for
-- anon/authenticated (RLS denies), which is correct; the app reads them via service role.

begin;

drop policy if exists "Allow all for anon"          on public.financial_records;
drop policy if exists "Allow all for authenticated" on public.financial_records;
drop policy if exists "Allow all for anon"          on public.revenue_scenarios;
drop policy if exists "Allow all for authenticated" on public.revenue_scenarios;
drop policy if exists "Auth full access families" on public.families;
drop policy if exists "Auth full access children" on public.family_children;
drop policy if exists "Auth full access parents"  on public.family_parents;
alter function public.is_admin_or_owner() set search_path = '';
alter function public.is_staff()          set search_path = '';
revoke execute on function public.is_admin_or_owner() from anon, public;
revoke execute on function public.is_staff()          from anon, public;

-- authenticated must still evaluate the function-dependent policies WITHOUT error
set local role authenticated;
select 'auth daily_photos'         as test, count(*) from public.daily_photos;
select 'auth food_counts'          as test, count(*) from public.food_counts;
select 'auth enrollment_inquiries' as test, count(*) from public.enrollment_inquiries;
select 'auth financial (expect 0)' as test, count(*) from public.financial_records;
select 'auth families (expect 0)'  as test, count(*) from public.families;
reset role;

-- anon must not error and must be locked out of the sensitive tables
set local role anon;
select 'anon financial (expect 0)' as test, count(*) from public.financial_records;
select 'anon families (expect 0)'  as test, count(*) from public.families;
reset role;

rollback;
