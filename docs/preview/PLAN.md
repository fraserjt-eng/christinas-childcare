# Christina's Simplified Summer: the /preview layer

Built 2026-06-11 on branch `preview/simple-summer`. This is a sealed, clickable
design preview for owner review. Demo fixtures only. Nothing merges into real
pages, real auth, or the real database until Christina approves.

Design source: `christinas-ui-design-exploration.html` (the ten pattern
studies, at `~/Documents/Claude/Projects/Master Project: APEX TEAM/`).
The prototype follows those patterns and the eight section-10 rules.

## Isolation contract

- Every new file lives under `src/app/preview/`, `src/lib/preview/`,
  `src/components/preview/`, `public/preview/`, or `docs/preview/`.
- Zero edits to existing routes, components, API routes, migrations, or
  `middleware.ts`. Verified: the middleware matcher runs on `/preview/*` but
  early-returns because `/preview` is not a protected route. No change needed.
- No Supabase imports anywhere in the preview namespace. All state lives in
  one zustand store persisted to localStorage. Reset Demo restores the seed.
- The passcode exists only as the `PREVIEW_PASSCODE` env var (Preview target).
  Local dev falls back to the code `preview` in development only; deployed
  environments without the var fail closed.
- This page tree carries `robots: noindex` in its own layout metadata.
- This exception to the three-portal rule (admin / employee / dashboard) is
  deliberate and temporary: the preview namespace exists to be reviewed,
  then either promoted through the pipeline or deleted.

## Phase 0 alignment audit: MISMATCHES found and resolved

From the six-agent reconciliation run on 2026-06-11:

1. **Vercel Authentication blocks preview URLs.** `ssoProtection` is
   `all_except_custom_domains`; a logged-out visitor gets a 401 Vercel login
   wall on any branch preview URL (verified empirically). Before Christina
   can open this on a tablet, one of: a branch-assigned vercel.app domain
   (assigned domains bypass protection), or a dashboard Shareable Link for
   this branch. Do not weaken project-wide protection.
2. **`PREVIEW_PASSCODE` does not exist yet** in the Vercel project. Create it
   with the Preview target before the first deploy.
3. **`ANTHROPIC_API_KEY` is scoped to Preview.** Existing AI routes in a
   preview deployment can spend real money once the URL is shareable. Remove
   the Preview target from that env var (keep Development + Production).
4. **The repo is public on GitHub.** Fixtures are fictional by rule, the
   passcode is never committed, and no PR gets opened before stage 5 (the
   Vercel bot posts preview URLs on public PRs).
5. **Supabase keys and SESSION_SECRET are Production-only**, so every
   non-preview page in a preview deployment is dead by construction. The
   preview shell keeps reviewers inside `/preview` and never links out.
6. **The existing `/demo` feature is different plumbing.** It reads and
   writes `demo_*` Supabase tables through `demoKioskClient`. The preview
   imports none of it.
7. **No `npm run typecheck` script exists.** The gate is `npm run build`
   (plus `npx tsc --noEmit` when wanted).

## The store IS the draft schema contract

`src/lib/preview/store.ts` is designed as if it were the API. At merge time
each piece maps to one table. One source of truth; no surface keeps private
data.

| Store field | Real table at merge | Notes |
|---|---|---|
| `kids` | `family_children` | avatar becomes photo_url; allergy text stays |
| `staff` | `employees` | pin, role, classroom_id already exist in prod |
| `families` | `families` | pin field exists; kiosk PIN lookup already live |
| `checkedIn` | `attendance` | kiosk POST already writes this in prod |
| `clockedIn` | `time_entries` (employee-storage) | staff PIN clock-in exists at `/api/auth/staff-pin` |
| `feed` | new `room_events` table | one row per logged event; drives family feed, daily summary, newsletter photo picker |
| `meals` | new `meal_marks` per-child table | rolls up to the existing per-room `food_counts` (CACFP count) |
| `shifts` | `staff_schedules` | same shape: staff, date, start, end, classroom |
| `newsletter` | `newsletters` | blocks serialize to the existing content model |
| `officeTiles` | new `dashboard_layout` per-user column | the gradual-introduction mechanism |

## What a real merge requires later (not built now)

- Auth: the kiosk PIN flows bind to the real `/api/kiosk` and
  `/api/auth/staff-pin` routes; the office binds to the admin session.
- Migrations for `room_events`, `meal_marks`, `dashboard_layout`, with RLS
  from migration 001 and the tenancy decision made before the first table
  (Fortress kickoff gate 11).
- Per-child meal detail rolling up to the CACFP per-room count.
- Real photos replace the SVG scene cards at the same
  `public/preview/photos/` paths (faceless classroom scenes).
- Retiring old pages behind the three-door entry after a grace period.
- Pre-merge gate: /cso security review, voice scan, nav-wire check,
  responsive sweep, rollback plan. Deploy from git only.

## Pipeline position

This branch is stage 2 of 5: Local dev, Preview (this), Dev-test (seeded
test database, real reads and writes, security built and verified), Staging
(directors use it like the real thing), Production merge.
