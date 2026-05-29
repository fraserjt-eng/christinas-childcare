# Helpdesk Ticket System — Design Spec

**Project:** Christina's Child Care Center (`christinas-childcare`)
**Date:** 2026-05-29
**Status:** Approved design, awaiting spec review, then implementation plan
**Author:** J. Fraser + Claude (brainstorming session)

**Staging note:** This spec was written to `~/.claude/plans/` because the repo path lost
filesystem access mid-session (macOS Full Disk Access revocation on the Desktop folder).
Intended home once the path is unlocked: `<repo>/docs/superpowers/specs/2026-05-29-helpdesk-ticket-system-design.md`.

---

## 1. Purpose

Give the owner, staff, and parents a simple way to report a problem with the site, and give J
one place to see and resolve those reports. A report can be written, spoken as a voice memo, and
paired with a screenshot or photo, so people can flag an issue the easiest way for them.

This is an internal site-issue reporting tool, not a public support desk and not a child-incident
or family-communication channel. It exists so J hears about site problems quickly and has enough
context to fix them.

---

## 2. Decisions locked in brainstorming

| Decision | Choice |
|---|---|
| What a report can contain | Written text + optional voice memo (audio) + optional screenshot/photo |
| Who can submit | Logged-in users only: owner, staff, parents, each from their own portal |
| Where J handles them | A Helpdesk page in the admin portal, with New / In progress / Resolved statuses |
| Reply to submitter | Auto-notify on resolve **(deferred to v2 with the email feature, see Section 8)** |
| Entry point | Both: a "Report an issue" button in every portal + a Help page per portal |
| Email | **Cut from v1.** Moved to the gated / to-fix list (Section 8) |

---

## 3. What a ticket holds

**Filled in by the person:**
- Subject (short, required).
- Description (text). Optional if a voice memo is attached, so nobody is forced to type.
- Voice memo (optional). Recorded in the browser with a tap-to-record control. Works on iOS,
  Android, and desktop via the browser MediaRecorder + microphone.
- Screenshot or photo (optional). From camera or photo library, compressed on the device before
  upload to keep stored files small.

**Captured automatically (no extra effort for the submitter):**
- The page they were on when they opened the form (URL / route).
- Device and browser (user agent + viewport size).
- Who they are: account id, display name, role (owner / staff / parent), email if on file.
- Timestamp.

---

## 4. How people submit (button + Help page)

- **Button, everywhere.** A small "Report an issue" button sits in the header or footer of all
  three portals. Tapping it opens a quick modal form in place, no navigation away. The form
  auto-captures the page they were on.
- **Help page, per portal.** Each portal's menu gets a Help page. It explains how reporting works
  and lists that person's own past tickets with current status, so they can see what they have
  already flagged.
- **One shared form.** A single form component powers both the button modal and the Help page, so
  behavior and look are identical across portals. Role and identity come from the existing session.

---

## 5. J's Helpdesk inbox (admin portal)

- A new Helpdesk page lists every ticket, newest first, filterable by New / In progress / Resolved.
- A small **"New" count badge** on the Helpdesk nav item shows how many unhandled tickets are
  waiting (this stands in for the cut email ping so new tickets are not invisible).
- Opening a ticket shows: subject, description, a play control for the voice memo, the photo, and
  all captured context (page, device, who, when).
- J moves a ticket through New to In progress to Resolved with one tap. Status changes are stored
  with a timestamp.

---

## 6. Data model and storage

**Table: `support_tickets`** (Supabase, in Christina's project `dkzxcxwjhhxqfgksynjb`)
- `id` (uuid, pk)
- `subject` (text, not null)
- `description` (text, nullable)
- `audio_path` (text, nullable) — object path in the private bucket
- `image_path` (text, nullable) — object path in the private bucket
- `page_url` (text) — where they were
- `user_agent` (text), `viewport` (text)
- `submitter_id` (text/uuid), `submitter_name` (text), `submitter_role` (text), `submitter_email` (text, nullable)
- `status` (text: `new` | `in_progress` | `resolved`, default `new`)
- `created_at` (timestamptz, default now()), `resolved_at` (timestamptz, nullable)

**Private bucket: `ticket-media`**
- Holds voice memos and photos. **Private**, never public. Files served only through short-lived
  signed URLs generated server-side at view time. This follows the lesson from the child-photos
  bucket: media on a children's site starts private with signed URLs, not public links.

---

## 7. Security posture (children's site, non-negotiable)

- **All reads and writes go through server-side API routes using the service role.** This is the
  established hardened pattern in this repo (photos, family CSV import, batch entry all route this
  way after the migration 020 fortress work). Direct browser writes to RLS tables fail silently
  here, so we do not attempt them.
- The `support_tickets` table is **locked**: no anon or authenticated direct access. RLS denies
  direct client reads/writes; the service-role API is the only path.
- A submitter can only ever retrieve **their own** tickets (the "your tickets" list on the Help
  page is filtered server-side by the session user). J retrieves all tickets via the admin API.
- Media is private bucket + signed expiring URLs only.
- Every new API route checks for a valid session via `requireSession()` before doing anything, per
  the repo's security rules. Error responses never leak internal details.

**API routes (service-role, all session-gated):**
- `POST /api/support/tickets` — create a ticket; uploads audio/photo to the private bucket; inserts the row.
- `GET /api/support/tickets/mine` — the submitter's own tickets for the Help page.
- `GET /api/admin/support/tickets` — admin list with status filter (owner only).
- `GET /api/admin/support/tickets/[id]/media` — returns short-lived signed URLs for audio/photo (owner only).
- `PATCH /api/admin/support/tickets/[id]` — update status (owner only).

---

## 8. Gated / to-fix list

These are tracked, not built in v1.

1. **Email feature (deferred).** Two emails: (a) a new-ticket ping to J, (b) an auto-notify-on-resolve
   to the submitter. Requires an email service (Resend is the usual one in this stack) wired into
   Christina's site, plus confirmation that submitter emails are on file (parents and owner yes,
   staff only if their record has one). The "New" count badge covers the gap for J in v1.
2. **Desktop path filesystem permission (blocker for build).** The repo folder lost read/write
   access mid-session (macOS Full Disk Access revocation on the Desktop path). Disabling the
   sandbox did not clear it. Fix: restart Claude Code first; if that fails, restart the Mac and
   re-grant Full Disk Access. Build and file verification cannot start until this is cleared.

---

## 9. Deliberately out of scope for v1 (YAGNI)

- No category or urgency/severity picker. The form stays: subject, description, optional voice,
  optional photo.
- No back-and-forth conversation thread on a ticket.
- No assigning tickets to other people (J is the sole handler).
- No SLA timers, no analytics.

Any of these can be added later if the need is real.

---

## 10. Testing approach

- Submit a ticket from each portal (owner, staff, parent) with: text only, voice only, photo only,
  and all three. Confirm the row, the auto-captured page/device/role, and the uploaded media.
- Confirm a submitter sees only their own tickets on the Help page, never anyone else's.
- Confirm the admin Helpdesk lists all tickets, the badge counts New correctly, media plays/views
  through signed URLs, and status transitions persist.
- Confirm the table rejects direct browser reads/writes (locked), and signed URLs expire.
- Mobile pass on iPhone Safari and Android Chrome for record + photo capture (the two surfaces most
  parents and staff use).

---

## 11. Open confirmations (once the path is unlocked)

- Exact route-group names for the three portals (admin / employee / parent-or-dashboard) and where
  the global button best lives in each layout.
- Whether the repo already has an email sender configured (informs how small the v2 email add is).
- Whether a `support_tickets`-style table or any existing reporting code already exists (the earlier
  grep was blocked by the permission issue, so this is unconfirmed but very likely net-new).
