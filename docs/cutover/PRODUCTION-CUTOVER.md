# Production Cutover Runbook — Monday Go-Live

The single script to take the new portal + the MN DCYF kiosk attestation live for
real families and staff. Written so J can run it, or approve me to run each step.
Nothing here runs automatically. Prod Supabase is `dkzxcxwjhhxqfgksynjb`; prod
Vercel auto-deploys `main`.

**Hard rules:** never deploy from a dirty/unpushed tree; touch prod only in a
planned window on J's explicit go; every migration below is additive +
idempotent (no DROP TABLE / DELETE / TRUNCATE — verified). No data is lost.

---

## 0. Before the window (J)
1. **Approve the wording** of the kiosk Privacy Notice and the CCAP accuracy
   attestation (compliance sign-off).
2. **Make parent email deliverable:** verify the sending domain in Resend (add
   the SPF + DKIM DNS records it provides) and set `RESEND_API_KEY` in the prod
   Vercel project. Until then everything else works; only the email send waits.
3. **Confirm prod env:** `SESSION_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set;
   `NEXT_PUBLIC_DEMO_MODE` / `NEXT_PUBLIC_SEED_DEMO_DATA` OFF/unset.
4. **Back up prod** (Supabase dashboard -> Database -> Backups / new snapshot).
   This is the rollback floor.

---

## 1. Apply the schema to prod (additive, idempotent)
Apply migrations **030 through 043** to prod, in order. They add multi-center
scoping, the back-office tables, the PII lockdown, and the kiosk attestation
table. Two ways:
- **Dashboard:** paste `docs/cutover/030-043-prod-bundle.sql` (this folder) into
  the prod SQL editor and run. Re-running is safe.
- **Me, on your go:** I apply each via the Supabase MCP when you say "apply to prod."

What they do: backfill existing rows to Brooklyn Park (all current data is BP);
create `supplies` + the 8 back-office tables + `dashboard_layout` +
`kiosk_attestations`; lock the PII tables to service-role only (042); narrow
`app_settings` so the roster/security keys are no longer anon-reachable. They do
NOT create the Crystal center (section 5).

Verify: run the security advisor on prod — expect zero errors (matches the test DB).

---

## 2. Deploy the app to prod
1. Merge `feature/tadpoles-flagship` -> `main` (after the preview is approved).
2. Vercel builds + deploys `main` automatically. No new env vars beyond section 0.
3. This makes `/preview` the real portal (demo chrome already removed), turns on
   the kiosk privacy-notice gate, the CCAP export, the communication, and the
   PIN roster.

---

## 3. Verify on the live domain (smoke test)
- **Kiosk gate:** at `/kiosk`, a family PIN -> the Privacy Notice appears ->
  must agree before check-in; agreeing once skips it next time; declining shows
  "see staff."
- **Staff:** `/start` -> center -> owner/admin PIN -> office loads with real data.
- **Parent:** `/login` -> family email + password -> `/preview/family` shows their
  kids + the privacy-notice banner.
- **Admin compliance:** `/admin/compliance/attestations` lists who has agreed.
- **CCAP export:** `/admin/attendance/ccap-export` refuses without the checkbox,
  then downloads the CSV and records the provider attestation.
- **PIN roster:** `/admin/families/pin-roster` prints.
- Confirm `/preview` (bare) redirects to `/start` and no "demo" copy is visible.

---

## 4. Communication rollout (Monday)
- **Email:** once the Resend domain is verified, trigger the family send
  (`/api/communications/send`, admin-only) so every family gets the branded
  notice with their PIN.
- **Printable:** print + post the branded notice at both centers; print the PIN
  roster / per-family slips for the front desk and hand them out.

---

## 5. Add the Crystal center (when you open it)
The cutover makes multi-center work; it does not invent Crystal's data. When
Crystal opens: add the Crystal center row + classrooms, then Crystal's staff
(with PINs) and families (with PINs + emails). From then on every record those
people create is stamped Crystal and stays isolated from Brooklyn Park. Not a
cutover blocker.

---

## 6. Rollback
- Migrations are additive, so they need no revert (the old `/admin`, `/employee`,
  `/dashboard` keep working on the same tables).
- Revert the app instantly: redeploy the previous `main` commit on Vercel, or
  point the domain back to the prior production deployment.
- The section-0 backup is the floor if data ever looks wrong.

---

## Should-fix soon after (not blockers, from the security gate)
- Lock the remaining non-PII "allow anyone" tables (cacfp_records, meetings,
  knowledge, lessons, supplies, center_announcements, news_updates, newsletters,
  dashboard_layout, research_findings) to service-role.
- Add a login check to the unauthenticated read endpoints (daily-reports,
  staffing-alerts, training-digest) — currently empty to anon but should require
  a session.
- Drop the internal staff id from the parent child-timeline.
- Role-aware sign-out (staff -> /employee-login).
