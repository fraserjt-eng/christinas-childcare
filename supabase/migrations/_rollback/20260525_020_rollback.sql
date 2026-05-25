-- ROLLBACK for 20260525_020_fortress_rls_lockdown
-- Restores the EXACT policies + grants captured live on 2026-05-25 (pre-change state).
-- Run only if the lockdown broke a real flow that cannot be fixed with a scoped policy.
-- This is in _rollback/ so the migration runner does not pick it up.

begin;

-- financial_records
create policy "Allow all for anon"          on public.financial_records for all to anon          using (true) with check (true);
create policy "Allow all for authenticated" on public.financial_records for all to authenticated using (true) with check (true);

-- revenue_scenarios
create policy "Allow all for anon"          on public.revenue_scenarios for all to anon          using (true) with check (true);
create policy "Allow all for authenticated" on public.revenue_scenarios for all to authenticated using (true) with check (true);

-- families / family_children / family_parents
create policy "Auth full access families"  on public.families        for all to authenticated using (true) with check (true);
create policy "Auth full access children"  on public.family_children for all to authenticated using (true) with check (true);
create policy "Auth full access parents"   on public.family_parents  for all to authenticated using (true) with check (true);

-- role helpers: restore mutable search_path + anon/public execute
alter function public.is_admin_or_owner() reset search_path;
alter function public.is_staff()          reset search_path;
grant execute on function public.is_admin_or_owner() to anon, public;
grant execute on function public.is_staff()          to anon, public;

commit;
