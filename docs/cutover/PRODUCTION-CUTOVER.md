# Production Cutover Runbook — Christina's new front-facing portal

This is the step-by-step to take the new portal (the `/preview/*` design, the
wired functions, the 8 cloud-synced tools, the multi-center plumbing) live for
real families and staff. It is written so J can run it, or approve me to run
each step. Nothing here runs automatically.

**Hard rules**
- Never `vercel --prod` from a dirty or unpushed tree.
- The production Supabase is `dkzxcxwjhhxqfgksynjb`. Touch it only during a
  planned cutover window, on J's explicit go.
- "We can't lose any current live data." Every migration below is additive and
  idempotent. No DROP, no DELETE, no TRUNCATE. Verified.

---

## 0. Before the cutover (the staging week)

1. Use the preview like the real thing for about a week (the branch preview, on
   the test DB). Families/staff codes are in the team handoff.
2. Clear the security gate (see `SECURITY-GATE.md` in this folder once the audit
   lands): any MUST-FIX item is done and re-verified.
3. Decide Phase 5 (routes): keep the portal on `/preview/*` or promote it to
   clean production routes. See section 4.
4. Back up production first (Supabase dashboard → Database → Backups, or a fresh
   snapshot). This is the rollback floor.

---

## 1. Apply the schema to production (additive, idempotent)

The 12 migrations `030`–`041` add multi-center scoping + the new tables. They are
bundled in `030-041-prod-bundle.sql` (this folder) for a single paste.

- **Option A (dashboard):** open the prod project SQL editor, paste
  `030-041-prod-bundle.sql`, run. Idempotent, so re-running is safe.
- **Option B (me, on your go):** I apply each migration to prod via the Supabase
  MCP. Only when you explicitly say "apply to prod."

What it does: adds `center_id` to `family_children` / `families` /
`child_daily_entries` and backfills every existing row to **Brooklyn Park** (all
current live data is Brooklyn Park's), creates the `supplies`, the 8 back-office
tool tables, and `dashboard_layout`, with center-scoped RLS. It does **not**
create the Crystal center (that is section 5).

Verify after: run the security advisor (should match the test DB: zero errors).

---

## 2. Point the production app at the new code

The prod Vercel project `christinas-childcare` auto-deploys `main`. So:

1. Merge `feature/tadpoles-flagship` into `main` (after the preview is approved).
2. Vercel builds and deploys `main` to production automatically.
3. No new env vars are required. Production already has
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `SESSION_SECRET` (all pointed at prod). The
   new code reuses them.

---

## 3. Verify on production (real domain, smoke test)

- Staff: `/start` → Brooklyn Park → owner PIN → office loads with real data.
- Teacher PIN → room → log a meal → it appears in the family view and the admin.
- Parent: `/login` → a real family → sees their kids' real daily reports.
- Kiosk: a real family PIN checks a child in; the ratio/attendance reflects it.
- Confirm NO center mixing once Crystal exists (section 5).

---

## 4. Phase 5 — production routes (a decision, then work)

Today the portal lives at `/preview/*` with a "Demo data only" banner and a
preview passcode gate. Over real data that is wrong. Choose one:

- **A. Promote to clean routes** (e.g. `/portal/*` or root), drop the demo
  banner + preview gate, and redirect the old `/employee` + `/dashboard` to the
  new portal. Cleanest end state. ~half a day of routing work.
- **B. Stay on `/preview/*` for now** but remove the demo banner + passcode gate
  so real users are not told "nothing here is real." Faster, slightly awkward
  URLs.

Either way, the banner/gate cleanup is required before real families use it.
This is tracked in the security gate as a readiness item.

---

## 5. Add the Crystal center (when you open it)

The cutover makes multi-center work; it does not invent Crystal's data. When
Crystal opens:
1. Add the Crystal center row + its classrooms.
2. Add Crystal's staff (with PINs) and families.
3. From then on, every record those people create is stamped Crystal and stays
   isolated from Brooklyn Park (verified behavior).

This can happen any time after the cutover; it is not a blocker.

---

## 6. Rollback

If anything looks wrong post-deploy:
- The migrations are additive, so they do not need reverting (the old `/admin`
  and the old `/employee` + `/dashboard` keep working on the same tables).
- Revert the app: redeploy the previous `main` commit on Vercel (instant), or
  point the domain back to the prior production deployment.
- The DB backup from section 0 is the floor if data ever looks wrong.
