# Production Cutover Runbook — Sunday Go-Live

Takes the new portal + the MN DCYF kiosk attendance live for real families and
staff. Prod Supabase is `dkzxcxwjhhxqfgksynjb`; prod Vercel auto-deploys `main`.
Nothing here runs automatically.

## Gate verdict (2026-06-21 adversarial readiness gate)
**NO-GO as originally written → GO after 3 zero-data fixes.** No step loses,
alters, or exposes existing Brooklyn Park data. The blockers were operational
fragility, now fixed:

- **Fix A (done):** the SQL bundle is now wrapped in `BEGIN; … COMMIT;` and every
  `CREATE POLICY` has a `DROP POLICY IF EXISTS` guard, so a partway failure rolls
  back clean and a re-run cannot abort on "policy already exists." (It is now
  genuinely re-runnable — re-running IS safe.)
- **Fix B (VERIFY at the dashboard — Step 2):** the BP backfill is now inside a
  `DO` block that **aborts the whole bundle** if the canonical Brooklyn Park
  center id is not present in prod, so no real BP row can be stamped with a
  phantom center. You still confirm the id first (read-only) before applying.
- **Fix C (done):** the Crystal importer now ALWAYS checks the live target DB for
  PIN collisions before any write and aborts if a PIN is already owned by another
  family (there is no DB unique constraint on `families.pin`). Verified clean
  against the test DB.

**Restore point:** git tag `pre-cutover-2026-06-21` is the full pre-merge build.
`git checkout pre-cutover-2026-06-21` to recover any piece.

---

## Why this order is safe: schema before code
The new code expects the new columns/tables/locked-down policies. If code deploys
first, the live site queries objects that don't exist yet and breaks for real
families. Applying the additive schema first leaves the running OLD code
unaffected (every change is additive or a policy tightening the old code doesn't
depend on); the NEW code then lands onto a schema that already matches it. Crystal
import sits after the bundle (needs the multi-center columns) and before the merge
(so the portal shows a full roster on first paint). Env is confirmed before the
merge because `NEXT_PUBLIC_*` vars bake in at build time. Demo-row deletions go
last, after the smoke test proves real data renders.

---

## STEP 1 — Back up prod (J, dashboard) — the rollback floor
Supabase `dkzxcxwjhhxqfgksynjb` → Database → Backups → take a fresh snapshot.
Record the timestamp. Nothing else proceeds until this exists.

## STEP 2 — Confirm the BP center id (J, dashboard) — Fix B precondition
SQL editor, read-only:
```sql
SELECT id, name FROM public.centers;
```
- If a row exists with id `3104ae69-4f26-4c1e-a767-3ff45b534860` named Brooklyn
  Park: proceed.
- If the BP id is **different**: STOP. Re-point the bundle's backfill id AND
  `src/lib/current-center.ts` `OPERATING_CENTER_ID` to the real id first. (The
  bundle will abort safely on its own if you skip this, but fixing it up front
  saves a round trip.)

## STEP 3 — Apply the SQL bundle (J, dashboard)
Paste **`docs/cutover/030-043-prod-bundle.sql`** into the prod SQL editor and run.
It is transactional + re-runnable; if anything drops mid-apply, just run it again.
Then verify:
```sql
SELECT count(*) FROM public.families WHERE center_id IS NULL;   -- expect 0
```
Run the Supabase security advisor on prod — expect zero errors (matches test).

## STEP 4 — Import the Crystal roster (J, with prod creds)
```bash
SUPA_URL=https://dkzxcxwjhhxqfgksynjb.supabase.co \
SUPA_SERVICE_ROLE=<prod service_role key> \
node scripts/import-crystal-roster.mjs --check     # confirms 0 PIN collisions
# then, only if --check is clean:
SUPA_URL=… SUPA_SERVICE_ROLE=… node scripts/import-crystal-roster.mjs --apply
```
The importer aborts if any of the 66 PINs is already used by a live BP family.
It regenerates the printable PIN list (`~/Desktop/crystal-kiosk-pins.html`) —
print THAT (the prod copy), not an earlier one.

## STEP 5 — Confirm prod env on Vercel (J, dashboard) — BEFORE the merge
On the `christinas-childcare` Vercel project, paste-compare exactly:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://dkzxcxwjhhxqfgksynjb.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = the service_role key whose ref is `dkzxcxwjhhxqfgksynjb` (server-only, never `NEXT_PUBLIC`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon key for the same project
- `SESSION_SECRET` = set (else middleware fails closed)
- `NEXT_PUBLIC_SEED_DEMO_DATA` = absent or anything other than the literal `true`; `NEXT_PUBLIC_DEMO_MODE` off/unset
- `RESEND_API_KEY` only gates email send; absence is safe (email just waits).

A wrong-but-valid URL/key silently points the live app at the wrong database —
the single biggest data-loss/exposure vector. These bake in at build time, so they
must be right before the merge triggers the build.

## STEP 6 — Merge to main = deploy (Claude, on J's explicit "go")
On your explicit go, merge `feature/tadpoles-flagship` → `main` from the clean,
pushed tree. Vercel auto-builds and deploys.

## STEP 7 — Smoke test on the live domain (J, Claude reads results)
Any failure = halt before the deletions.
- **Kiosk PIN check-in:** `/kiosk` → family PIN → Privacy Notice → agree → check-in completes.
- **Admin login:** `/start` → center → owner/admin PIN → office loads with REAL data (not empty, not demo).
- **Center switch:** Brooklyn Park ↔ Crystal in the header switcher; each shows only its own roster.
- **Attendance hub:** the kiosk check-in appears for the correct center; Combined shows both.
- **Export:** `/admin/attendance/ccap-export` refuses without the checkbox, then downloads a CSV + records the attestation.
- `/preview` (bare) redirects to `/start`; no "demo" copy anywhere.

## STEP 8 — Approved demo-row deletions (J, dashboard) — LAST
Only after the smoke test passes. Run the section 1 + 2 SELECTs in
`REAL-DATA-PURGE.md`, eyeball the rows, then run the matching DELETEs. The keep
list (`~/Desktop/cc-keep-list.html`) is the approved "what stays": real BP data +
the `@roster.local` Crystal kids stay; demo markers go.

---

## Rollback
Migrations are additive (old `/admin`, `/employee`, `/dashboard` keep working).
Revert the app instantly by redeploying the previous `main` commit on Vercel. The
Step-1 snapshot is the data floor. The `pre-cutover-2026-06-21` git tag restores
any code piece.

## Known non-blockers (fix after go-live)
- Training intelligence reads (`training_progress`, `training_knowledge_checks`,
  `training_gate_assessments`) hit the anon client and 401 (locked tables). They
  fail safe (empty), but route them through a session-gated server route so the
  training scan shows data. Not a cutover blocker.
- `/images/icon-192.png` 404 (PWA manifest icon) — cosmetic.
