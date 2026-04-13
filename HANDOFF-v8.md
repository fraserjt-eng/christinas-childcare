# Christina's Platform — v8 Handoff & v9 Plan

**Last shipped:** 2026-04-12 (commit `663d6aa`)
**Live:** https://christinas-childcare.vercel.app
**Project root:** `/Users/jfraser/Desktop/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare/`

---

## 1. What v8 Shipped

### A. Mobile Task Capture + Voice
- `src/components/admin/QuickAddTaskSheet.tsx` — bottom sheet with title, "done when", priority (4 buttons), assignee
- Mic button uses Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), appends transcript into the title field, degrades gracefully if unsupported
- `src/app/admin/tasks/page.tsx` — red FAB fixed bottom-right on `lg:hidden`, opens the sheet

### B. Kanban Polish
- `src/components/admin/TaskKanban.tsx`
  - Web Audio API helpers: `playLift()` (180Hz 40ms sine) on drag start, `playDrop()` (440Hz 50ms triangle) on successful drop
  - Sound kill switch: `localStorage.christinas_kanban_sound === 'off'`
  - Haptics: `navigator.vibrate(10)` on start, `vibrate(30)` on drop, guarded by `'vibrate' in navigator`
  - Drop zone: `useDroppable` + `isOver` highlighting on each column (`ring-4 ring-christina-red/60 scale-[1.01]`), empty-column hint changes to "Release to drop here"

### B.4. AI Task Insights
- `src/app/api/ai/tasks/insights/route.ts` — admin-gated, rate-limited, quota-guarded Haiku call
- Takes task summary (by status / assignee / overdue / urgent + sample of 10), returns `{ patterns: string[3], rebalance: string }`
- "Generate Insights" button on the Insights tab of `/admin/tasks`

### C. Schedule Optimizer
- **Not rebuilt.** Explore agent's first audit was wrong. The 4 subcomponents already exist and the page returns 200. No work needed.

### D. Subs Scheduling
- `supabase/migrations/20260413_013_subs_tables.sql` — `substitutes` + `sub_assignments` tables with id/center_id/data(jsonb)/timestamps, permissive RLS
- `src/lib/sub-storage.ts` — dual-write via `createDualWrite<Substitute>` / `<SubAssignment>`; functions: `getSubs`, `getActiveSubs`, `createSub`, `updateSub`, `deactivateSub`, `assignSub` (auto-updates `last_used_at`), `getAssignmentsForDate`, `cancelAssignment`, `completeAssignment`
- `src/app/admin/subs/page.tsx` — full CRUD UI: today's assignments card, active sub cards, inactive collapsed list, edit dialog, assign-to-room dialog using `CLASSROOMS` from schedule-optimizer-storage
- Nav: added to Today group in `DashboardLayout.tsx` with `UserPlus` icon

### E. Staff Directory + Permissions
- `src/types/employee.ts` — new `EmployeePermissions` interface (8 flags), plus `permissions`, `pageAccess`, `profileImage`, `startDate`, `bio` on `Employee`
- `src/lib/permissions.ts` — `hasPermission(employee, key)` with owner/director default-allow, `hasPageAccess(employee, pathname)` with whitelist model, `PERMISSION_LABELS`, `ROUTE_ACCESS_OPTIONS`
- `src/components/admin/EditStaffDialog.tsx` — Profile / Contact / Certifications (tag pattern) / Access & Permissions (8 Switches) / Page Access (8 Checkboxes) sections
- `src/app/admin/staff/page.tsx` — rewritten to pull real data via `getEmployees()`, click-to-edit cards, inactive collapse

### F. Organizational Operations
- `src/lib/knowledge-storage.ts` — added `strategic_foundation` to `KnowledgeCategory`, new `CATEGORY_DESCRIPTIONS` + `CATEGORY_ORDER` exports, 5 placeholder seed entries (Mission / Vision / Values / Operations Philosophy / Drift Prevention), all in draft status, author "Leadership"
- `src/app/admin/staff/knowledge-base/page.tsx` — retitled to "Organizational Operations", subtitle "Operations, Organizational Handbook, Systems, and Policies and Practices that Minimize Drift", intro paragraph added, icon changed to `Building2`
- `src/components/admin/KnowledgeBaseEditor.tsx` + `src/components/employee/KnowledgeContribution.tsx` — added `strategic_foundation` to `CATEGORY_COLORS` map (required for typecheck)
- `DashboardLayout.tsx` — nav label "Knowledge Base" → "Org Operations", route unchanged

### G. Tiered Notifications
- `src/types/notifications.ts` — `UrgencyTier` enum (`urgent_0_24h | important_24_48h | upcoming_48h_1wk | informational`), `URGENCY_TIER_LABELS`, `URGENCY_TIER_ORDER`, `AdminNotificationPrefs`, `DEFAULT_ADMIN_NOTIFICATION_PREFS`, `TierDeliveryPrefs`
- `src/lib/notification-tiers.ts` — `getTierForEvent(type, metadata)` with severity + due-date overrides, `getNotificationDeliveryChannels(tier, prefs, now)` with urgent-override and quiet-hours handling (crosses midnight)
- `src/lib/create-notification.ts` — unified `createNotification()` that computes tier, honors prefs, writes in-app notification + enqueues text/email delivery queue entries in localStorage; `getAdminNotificationPrefs()` / `saveAdminNotificationPrefs()` / `getDeliveryQueue()` / `markNotificationRead()` / `getStoredAdminNotifications()`
- `src/components/admin/NotificationTierPrefs.tsx` — 4 tier cards with text/email/in-app switches, urgent badge marked "Always delivers"
- `src/app/admin/notifications/page.tsx` — new component renders above existing Preferences panel when opened

### H. Deploy Verification
- `npx tsc --noEmit` clean
- `npm run build` clean (ESLint warnings only, one blocker fixed: unused `EmployeePermissions` import in EditStaffDialog)
- `git push origin main` → `vercel --prod --force` → Deployment completed
- Live curl checks: `/admin/subs`, `/admin/staff`, `/admin/tasks`, `/admin/notifications`, `/admin/staff/knowledge-base` all return 200; "Organizational Operations" and "Substitute" strings present in HTML

---

## 2. Critical Context for Next Session

### Running project state
- **96 pages**, **23 storage modules** (10 dual-write to Supabase, 13 still localStorage-only)
- **13 migrations** in `supabase/migrations/` — migration 013 (subs) has **not been pushed** yet. It's ready, just needs `supabase db push` or Management API fallback.
- Supabase project: `dkzxcxwjhhxqfgksynjb` (Crystal center id `3104ae69-4f26-4c1e-a767-3ff45b534860`)
- Auth: HMAC-signed HttpOnly cookies (see `src/lib/auth.ts`), not Supabase Auth yet
- Demo PINs: 1234 (Brown family), 5678 (Garcia)

### Known friction points surfaced but not fixed in v8
1. **Notification triggers still write via old pathway.** The new `createNotification()` helper + tier system is wired into the UI but no production code calls it. Incident reports, ratio violations, parent messages, overdue tasks all hit the old notifications store directly.
2. **Strategic Foundation placeholders are drafts.** Christina needs to fill these during summer planning. Currently visible only to admins with draft-view on.
3. **Staff permissions are client-side only.** `hasPermission()` hides UI but nothing enforces it server-side. Any admin can still bypass by hitting API routes directly.
4. **Sub pool has no external integration.** Internal pool only. Design doc for Wonderschool / Brightwheel Sub Finder / Swing Education deferred.
5. **Voice dictation tested on desktop Chrome.** iOS Safari and Android Chrome not yet confirmed by a human.

### v7 → v8 lessons worth carrying forward
- **Don't `git add -A`.** Always stage specific files to avoid CLAUDE.md sprawl.
- **Explore agents get audits wrong.** The first pass claimed Schedule Optimizer was broken; it wasn't. Verify with `curl -o /dev/null -w "%{http_code}"` on the live URL before rebuilding anything.
- **TaskPriority is `'low' | 'normal' | 'high' | 'urgent'`** — no `'medium'`.
- **`useDroppable.isOver` handles suction animations** — no external animation library needed.
- **Web Speech API streams interim results** — append interim or final transcript to state, don't wait for `isFinal`.

---

## 3. v9 Plan — Proposed Scope

### Priority tier (do first)

#### P1. Wire real triggers into `createNotification()`
- **Files:** `src/lib/incident-log-storage.ts`, `src/lib/smart-dashboard.ts` (ratio alerts), `src/lib/comms-storage.ts` (parent messages), `src/lib/task-storage.ts` (overdue sweep)
- **Action:** Replace direct notification writes with `createNotification({ type, title, body, metadata: { severity, dueAt, link_to } })`
- **Acceptance:** Create an incident → notification appears with `urgency_tier: 'urgent_0_24h'` and shows up in delivery queue with text + email channels queued
- **Why it matters:** Tier UI currently does nothing in production. This is the gap between "built" and "working."

#### P2. Push migration 013 to Supabase
- **Command:** `supabase db push` (or Management API fallback via keychain access token if IPv6 errors)
- **Verify:** `substitutes` and `sub_assignments` tables visible in Supabase dashboard with RLS enabled
- **Acceptance:** Add a sub in the UI → row appears in Supabase (currently only in localStorage cache)

#### P3. Mobile real-device testing
- **iOS Safari:** dictate task, drag Kanban card (no haptics on iOS Safari expected — document it), FAB visible
- **Android Chrome:** same checks plus haptic confirmation
- **Acceptance:** Written test report with screenshots, filed under `docs/v8-mobile-test.md`

---

### Secondary tier (do if time)

#### S1. Server-side permission enforcement
- **New file:** `src/lib/permissions-server.ts` that reads the session cookie, looks up the employee, returns a guard function
- **Apply to:** `/api/financial/*`, `/api/incidents/*`, `/api/intelligence/*`, `/api/ai/*`
- **Acceptance:** Hitting `/api/financial/export` as a staff-level session returns 403

#### S2. Overdue task sweep → notifications
- **New file:** `src/lib/task-overdue-sweep.ts` — runs on dashboard load, finds tasks where `due_at < now` and `status !== 'done'`, dedupes against already-notified set in localStorage, creates `task_overdue` notifications
- **Acceptance:** Set a task's due_at to yesterday → reload dashboard → notification with urgent tier appears

#### S3. Delivery queue viewer (admin only)
- **New file:** `src/app/admin/notifications/queue/page.tsx`
- Shows text + email queue entries from `getDeliveryQueue()`, filter by status, mark sent/failed
- **Why:** Without real SMTP/SMS hooked up, this at least lets Christina confirm the system is trying to deliver the right things

#### S4. Staff page access enforcement (client-side guard)
- **New file:** `src/components/layout/AdminGuard.tsx`
- Wraps admin pages, checks `hasPageAccess(currentEmployee, pathname)`, redirects to `/admin` if blocked
- **Acceptance:** Log in as a staff member with `pageAccess: ['/admin/tasks']`, try to visit `/admin/financial` → redirect

---

### Deferred (v10+)
- Real SMTP/SMS integration (SendGrid, Twilio)
- External sub staffing API (Wonderschool / Brightwheel)
- Supabase Auth migration
- Remaining 13 localStorage modules → dual-write
- Strategic Foundation content replacement (needs Christina)
- Video walkthrough regeneration for v8 features

---

## 4. Deploy Checklist (reuse for v9)

```bash
cd "/Users/jfraser/Desktop/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare"
npx tsc --noEmit
npm run build
git status --short
git add <specific files, never -A>
git commit -m "v9: ..."
git push origin main
vercel --prod --force
# Verify:
for path in /admin/subs /admin/staff /admin/tasks /admin/notifications /admin/staff/knowledge-base; do
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" "https://christinas-childcare.vercel.app${path}")
  echo "$code $path"
done
```

## 5. Supabase push fallback (if `db push` fails with IPv6)

```bash
ACCESS_TOKEN=$(security find-generic-password -s "Supabase CLI" -a "supabase" -w | base64 -D)
MIGRATION=$(cat supabase/migrations/20260413_013_subs_tables.sql | jq -Rs .)
curl -X POST "https://api.supabase.com/v1/projects/dkzxcxwjhhxqfgksynjb/database/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $MIGRATION}"
```

---

## 6. Quick-Start for Next Claude Session

```
Read HANDOFF-v8.md for context.
Then ask J: "Start with P1 (wire notification triggers) or something else?"
```

The three P-items are sequenced. P1 makes the v8 tier system actually work. P2 makes subs multi-device. P3 confirms mobile quality. S-items are nice-to-have and can slip.
