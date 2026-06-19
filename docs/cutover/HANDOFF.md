# Handoff — Christina's new front-facing portal

**Date:** 2026-06-19
**Branch:** `feature/tadpoles-flagship` (all work here; not yet merged to `main`)
**Test DB:** Supabase `klezmvokarlcchzdafge` (Brooklyn Park `3104ae69-4f26-4c1e-a767-3ff45b534860`, Crystal `b2000000-0000-0000-0000-000000000002`)
**Prod DB:** Supabase `dkzxcxwjhhxqfgksynjb` — **untouched. Cutover is J's trigger.**
**Preview:** the branch's Vercel preview, pinned to the test DB via branch-scoped Preview env vars (production env untouched). Behind Vercel Authentication (J's own login opens it).

## What this is
Promoting the new `/preview/*` design (the "Summer Version 1" portal: office, room, family, kiosk, schedule, meals, newsletter) into the real, secure, multi-center front door for staff, families, and the director, wired to the same Supabase tables the `/admin` backend reads, so one action flows everywhere. `/admin` stays as the deep backend.

## Phase status
1. Foundation — DONE (test DB, both centers, center_id in session, center-scoped queries)
2. Schema — DONE for what ships (supplies + the 8 tool tables + dashboard_layout; `room_events` folded into `child_daily_entries`)
3. Real data layer — DONE (the preview store hydrates from `/api/portal/center-data`)
4. Wire the 4 functions — DONE (check-in, staff clock, daily reports, scheduling)
5. Promote to production routes — **PENDING J's decision** (see Cutover)
6. Multi-admin — DONE (`/admin/team`)
7. Migrate localStorage tools — DONE (8 modules to dual-write, migrations 032-039)
8. Security gate + staging week + cutover — **IN PROGRESS** (gate run; staging week is J reviewing; cutover is J's trigger)

## Built + verified this session (each pushed as its own preview batch)
- **Family page** — a real signed-in parent sees their own kids + real daily reports (not fixtures). Verified headless: Brown parent sees Noah + Ava + their seeded day; cross-family child read returns 403.
- **Multi-site correctness** — the 8 back-office tools center-filter reads + stamp the current center; `getScheduleEntries` reads the portal's cloud shifts via a server route. Verified: a portal shift shows under its center, hidden from the other.
- **Owner tile picker** — `/preview/office` "Edit my screen" (add/remove/reorder), saved per center (`dashboard_layout`). Verified headless: defaults render, a saved layout reads back per center.
- **Scheduling board to cloud** — the admin drag board reads/writes `staff_schedules` (arbitrary dates, client-UUID id reconciliation, center-isolated). Verified at the data layer + the board populates headless.
- **Roster fix** — `GET /api/staff/employees` (service role, session-gated, center-scoped, strips the pin) so admin pages can list staff from the RLS-locked `employees` table. Verified: BP returns 5, Crystal 3, no pin leaked, board fills.

## Architecture + patterns (read before touching this)
- **Auth is HMAC-signed HttpOnly cookies, NOT Supabase Auth.** No DB-level identity. `requireSession` in every API route is the real control. Middleware (`src/middleware.ts`) verifies the signed cookie + role.
- **The anon-RLS split (load-bearing):** tables with an `Allow all for anon` policy (the 8 tools, `dashboard_layout`, and ~12 older tables) are readable client-side with the anon key. RLS-locked tables (`employees`, `staff_schedules`, `families`, `family_children`, `child_daily_entries`, `attendance`, `time_entries`, etc.) are service-role-only: the anon client SILENTLY returns `[]` (HTTP 200, zero rows). **Any client read of a locked table must go through a session-gated server route.** Examples: `GET /api/staff/schedule`, `GET /api/staff/employees`, `/api/portal/center-data`.
- **Current center** = `src/lib/current-center.ts` `currentCenterId()` (reads the `cc_center` cookie the `/start` picker sets, falls back to Brooklyn Park). Server routes derive center from the session (`deriveCenterId`: director picks via cc_center/?center, center-bound user forced to their session center).
- **Dual-write** = cloud-first read + localStorage fallback, cloud write then local cache (`src/lib/supabase/service.ts`).
- **PostgREST:** fetch broad, filter in JS, always `.limit(5000)`; avoid `.order()+.eq()` and `.in()` with many uuids (they drop rows).

## Security status
- **Advisor:** zero errors. The `rls_policy_always_true` warnings are the app's structural posture (app-layer auth, not RLS), not a regression. Migration 040 dropped the dead `authenticated` allow-all policies on the 9 new tables (latent landmine removed).
- **Adversarial pre-cutover gate** (`pre-cutover-security-gate` workflow): route-auth, anon-exposure, and PII-leak dimensions completed; the secrets-build dimension + the synthesized verdict were re-run after a transient rate-limit. See the gate verdict (appended to this file / the wrap-up report) for the MUST-FIX vs SHOULD-FIX list. The headline should-fix: deny anon on any allow-all table that holds PII and route it through the service role.

## The cutover (Phase 8)
Runbook: `PRODUCTION-CUTOVER.md` (this folder). Migration bundle: `030-041-prod-bundle.sql` (additive, idempotent, non-destructive; backfills existing data to Brooklyn Park). No new prod env vars needed.

## Open items
**J's decisions/actions:**
1. Finish the staging-week review on the preview.
2. Decide Phase 5 routes: (A) promote to clean routes + retire `/employee`+`/dashboard`, or (B) keep `/preview/*` but strip the demo banner + passcode gate.
3. Trigger the cutover: back up prod, apply 030-041, merge branch to `main` (auto-deploys).
4. Add the Crystal center (rooms, staff, families) when opening it.
5. Optionally rotate the test DB key after the staging week.

**Build should-fixes (after J's go on the gate):**
- Deny anon + server-route any allow-all table holding PII (from the gate).
- Production banner/gate cleanup (the "Demo data only" preview chrome).
- The legacy `employees` anon-RLS pattern is now bridged for the board; consider the same for other admin pages that still rely on a local cache.

## Critical gotchas (cost real time this session)
- `vercel link` rewrites `.env.local` (wiped the test service_role key). Back it up first.
- `tsc --noEmit` does not run ESLint; `next build` does. Run `next lint` before claiming a green build.
- Recovering a credential from text: take the LONGEST candidate and validate it (a truncated JWT decodes fine but fails).
- The anon client returns `[]` (not an error) on RLS-locked tables. Easy to miss.

## Test access (fake seeded data, test DB only)
- Staff: `/start` -> center -> PIN. Brooklyn Park owner `1000`, Crystal admin `5000`; BP teachers `1111/2222/3333/4444`, Crystal `6666/7777`.
- Parent: `/login` -> any `*@family.test` -> password `family123`.
- Kiosk: family PIN (BP `4101/4102/4103`, Crystal `5101/5102`), center-bound.

## Key files
- New: `src/lib/current-center.ts`, `src/lib/tile-catalog.ts`, `src/lib/dashboard-layout-storage.ts`; routes `src/app/api/portal/center-data`, `/api/staff/schedule`, `/api/staff/employees`, `/api/parent/me`.
- Changed: the 8 `src/lib/*-storage.ts` modules, `src/lib/employee-storage.ts`, `src/lib/schedule-optimizer-storage.ts`, `src/components/admin/DragScheduleBoard.tsx` + `ScheduleOptimizer.tsx`, `src/app/preview/{family,office}/page.tsx`.
- Migrations: `supabase/migrations/20260619_030`..`041`.
