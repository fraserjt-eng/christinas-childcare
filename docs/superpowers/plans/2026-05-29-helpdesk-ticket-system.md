# Helpdesk Ticket System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let owner, staff, and parents report site issues (text + optional voice memo + optional photo) from inside their portal, and give J an admin Helpdesk inbox to triage and resolve them.

**Architecture:** A locked `support_tickets` table and a private `ticket-media` bucket in Christina's Supabase project. All reads and writes go through session-gated service-role API routes (the repo's established hardened pattern). A shared `ReportIssueForm` powers a global "Report an issue" button (in all three portal layouts) and a per-portal Help page. An owner-only Helpdesk page lists and triages tickets, with a New-count badge in the admin nav. Media is served only via short-lived signed URLs. No email in v1.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Storage), browser MediaRecorder API, Playwright for end-to-end verification.

**Spec:** `~/.claude/plans/2026-05-29-christinas-helpdesk-ticket-system-design.md` (moves to `<repo>/docs/superpowers/specs/` on unlock).

**Staging note:** This plan was written while the repo path was permission-locked (macOS Full Disk Access revocation on the Desktop folder). Intended home: `<repo>/docs/superpowers/plans/2026-05-29-helpdesk-ticket-system.md`. **Do not start Task 1 until the path is readable/writable and Task 0 passes.**

**Repo root (verify on unlock):** `~/Desktop/Desktop Spring 26/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare`

---

## Conventions used in this plan

Identifiers marked ⚠️ are **assumptions from prior sessions** that Task 0 must confirm against the live repo before they're used. If Task 0 finds a different real name, do a find-replace across the plan before continuing.

- ⚠️ `requireSession()` — auth helper that returns the current session `{ userId, name, role, email }` or throws/redirects. Likely in `src/lib/auth/session.ts` or `src/lib/auth.ts`.
- ⚠️ `createAdminClient()` — Supabase service-role client factory. Likely in `src/lib/supabase/admin.ts` or `src/lib/supabaseAdmin.ts`.
- ⚠️ Route groups: `src/app/(admin)`, `src/app/(employee)`, `src/app/(dashboard)` (parent). Real names unknown; Task 0 confirms.
- ⚠️ Next migration number: prior sessions reached `022`; assume `023` unless Task 0 finds higher.
- ⚠️ shadcn components present: `Button`, `Dialog`, `Textarea`, `Input`, `Badge`, `Select`. Task 0 confirms which exist in `src/components/ui/`.

---

## Task 0 RESULTS — confirmed identifiers + binding corrections (2026-05-29)

Path unlocked and reconciled against the live repo. These OVERRIDE the ⚠️ assumptions and several code blocks below. Apply them in every task.

**Auth (`@/lib/require-auth`):**
- `requireSession(minRole?: 'teacher' | 'admin')` returns `AuthedSession | null`. It does NOT throw.
- Replace every `try { session = await requireSession() } catch { 401 }` with:
  ```ts
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ```
- Session shape: `session.user.id`, `session.user.email`, `session.user.full_name`, `session.user.role`, plus `session.expires_at`. There is NO `session.userId/name/role/email`; always use `session.user.*`.
- Admin-only endpoints (Tasks 6, 7, 8): gate with `requireSession('admin')` (already allows admin + owner + superadmin via ROLE_RANK; the owner email is force-mapped to superadmin). Drop the manual `role === 'owner'` checks.
- Submit + my-tickets (Tasks 4, 5): `requireSession()` with no arg. Employees use the same `auth_session` cookie via PIN login, so one path covers all three portals.

**Service-role client (`@/lib/supabase/server`):**
- It's `getServerSupabase()`, NOT `createAdminClient()`. Returns `SupabaseClient | null`.
  ```ts
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  ```
- Uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS. Correct client for all ticket reads/writes + storage.

**Role normalization (submit, Task 4):**
- Real roles: `parent | teacher | employee | admin | owner | superadmin`. Normalize before insert:
  ```ts
  function normalizeRole(r: string): 'owner' | 'staff' | 'parent' {
    if (r === 'admin' || r === 'owner' || r === 'superadmin') return 'owner';
    if (r === 'teacher' || r === 'employee') return 'staff';
    return 'parent';
  }
  ```
- Migration CHECK stays `('owner','staff','parent')` because we normalize first. Use `submitter_id: session.user.id`, `submitter_name: session.user.full_name`, `submitter_email: session.user.email`.

**Migrations — merge Tasks 1+2 into ONE file:**
- Filename: `supabase/migrations/20260529_023_support_tickets.sql` (date-prefixed; latest existing is `20260525_022`).
- Put the table AND the `ticket-media` bucket insert in this single file (same-date / different-sequence is fine; 018/019 and 020/021/022 already coexist).
- Apply via Supabase MCP / Management API against `dkzxcxwjhhxqfgksynjb`, dry-run in a rolled-back txn first, then real apply ONLY after J's at-the-moment okay.

**Portal paths (plain dirs, NOT route groups):**
- `src/app/admin/` (owner), `src/app/employee/` (staff), `src/app/dashboard/` (parent).
- Button mounts in `src/app/{admin,employee,dashboard}/layout.tsx`.
- Help pages at `src/app/{admin,employee,dashboard}/help/page.tsx`. Helpdesk inbox at `src/app/admin/helpdesk/page.tsx`.
- Project rules: pages start with `'use client'`; admin/employee pages use the existing `DashboardLayout` wrapper (read an existing admin page first to match it); shared components in `src/components/support/`; brand with christina-* tokens (christina-red primary, christina-coral for the badge/alerts).

**Verification (no `typecheck` npm script exists):**
- Use `npx tsc --noEmit && npm run lint && npm run build`.
- No unit-test runner (no vitest/jest). Verify behavior via manual browser walkthrough per portal + the lockdown checks in Task 14. Base `playwright` is present for scripted checks.

**Repo conventions to honor:**
- Apply `src/lib/rate-limit.ts` (5 req/min per IP) to `POST /api/support/tickets`.
- Use `reportError()` from `src/lib/error-reporter.ts` in catch blocks; still return generic error JSON.
- Mirror the exact route shape of `src/app/api/admin/parent-message/route.ts` (runtime export at top, requireSession→401, getServerSupabase→503, generic errors).

**Email infra ALREADY EXISTS (v2 note):** `src/lib/email.ts`, `notification-service.ts`, and Resend (`RESEND_API_KEY`, from `notifications@christinaschildcare.com`) are wired. The gated v2 email add is small. Still CUT from v1 per J; the New-count badge stands in.

**Process (project standard, from `src/app/CLAUDE.md`):** work in a git worktree (never on main), execute via subagent-driven-development with review between tasks, run verification-before-completion before any "done" claim, finishing-a-development-branch to wrap.

---

## Task 0: Reconcile plan with the live repo (DONE 2026-05-29 — results above)

**Goal:** Replace every ⚠️ assumption with the real identifier so the rest of the plan compiles on the first try.

**Files:** none created. This is a read + record task.

- [ ] **Step 1: Confirm the path is unlocked**

Run: `cd "$HOME/Desktop/Desktop Spring 26/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare" && ls package.json && git status --short`
Expected: `package.json` listed, git status prints (no "Operation not permitted"). If it still errors, STOP. Restart Claude Code; if that fails, restart the Mac and re-grant Full Disk Access.

- [ ] **Step 2: Record the real identifiers**

Run these and write the answers into a scratch note at the top of the plan file:
```bash
# auth helper
grep -rn "export .*requireSession\|export .*getAuthEmail\|export .*getSession" src/lib | head
# service-role client factory
grep -rn "service_role\|SUPABASE_SERVICE_ROLE\|createClient" src/lib | grep -i admin | head
# route groups
ls -d src/app/\(*\)/
# migrations
ls supabase/migrations | tail -5
# ui components available
ls src/components/ui
# test toolchain
cat package.json | grep -A20 '"scripts"'
# is playwright config present
ls playwright.config.* e2e tests 2>/dev/null
# does an email sender already exist (informs the gated v2)
grep -rn "resend\|Resend\|nodemailer\|sendgrid" src package.json | head
# confirm no existing ticket/support code
grep -rilE "support_ticket|helpdesk|report.?issue" src | head
```

- [ ] **Step 3: Lock the names**

Find-replace each ⚠️ token in this plan with the confirmed value (auth helper, admin client factory + import paths, the three route-group folder names, the migration number, the available ui components). Note in the scratch whether a unit-test runner (vitest/jest) exists; if none, this plan verifies via `tsc`, `npm run build`, and Playwright only.

- [ ] **Step 4: Create the worktree/branch and move the docs in**

```bash
git checkout -b feature/helpdesk-tickets
mkdir -p docs/superpowers/specs docs/superpowers/plans
cp ~/.claude/plans/2026-05-29-christinas-helpdesk-ticket-system-design.md docs/superpowers/specs/2026-05-29-helpdesk-ticket-system-design.md
cp ~/.claude/plans/2026-05-29-christinas-helpdesk-ticket-system-plan.md   docs/superpowers/plans/2026-05-29-helpdesk-ticket-system.md
git add docs/superpowers && git commit -m "docs: helpdesk ticket system spec + plan"
```
Expected: branch created, two docs committed.

---

## Task 1: Database migration — `support_tickets` table (locked)

**Files:**
- Create: `supabase/migrations/023_support_tickets.sql` ⚠️(number)

- [ ] **Step 1: Write the migration**

```sql
-- 023_support_tickets.sql
-- Helpdesk tickets. Locked table: no anon/authenticated policies.
-- All access via service-role API routes (matches migration 020 fortress pattern).

create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null,
  description     text,
  audio_path      text,
  image_path      text,
  page_url        text,
  user_agent      text,
  viewport        text,
  submitter_id    text not null,
  submitter_name  text,
  submitter_role  text not null check (submitter_role in ('owner','staff','parent')),
  submitter_email text,
  status          text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

alter table public.support_tickets enable row level security;
-- Intentionally NO policies for anon/authenticated. Service role bypasses RLS.

create index if not exists support_tickets_status_created_idx
  on public.support_tickets (status, created_at desc);
create index if not exists support_tickets_submitter_idx
  on public.support_tickets (submitter_id, created_at desc);
```

- [ ] **Step 2: Dry-run in a rolled-back transaction first (repo's standing DB discipline)**

Apply via the Supabase MCP against project `dkzxcxwjhhxqfgksynjb`, or psql. First wrap in a transaction that rolls back to confirm no errors, then apply for real. Get J's at-the-moment okay before the real apply (Iron Rule: each distinct DB action on this shared infra needs its own okay).
Expected: table exists, RLS enabled, 0 rows, two indexes present.

- [ ] **Step 3: Verify RLS lock**

Run (anon key): a `select * from support_tickets` from an anon client should return 0 rows / permission-denied, never data.
Expected: locked. Record the check.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/023_support_tickets.sql
git commit -m "feat(db): add locked support_tickets table"
```

---

## Task 2: Private storage bucket — `ticket-media`

**Files:**
- Create: `supabase/migrations/024_ticket_media_bucket.sql` ⚠️(number)

- [ ] **Step 1: Write the bucket migration**

```sql
-- 024_ticket_media_bucket.sql
-- Private bucket for ticket voice memos + photos. Access only via service-role signed URLs.
insert into storage.buckets (id, name, public)
values ('ticket-media', 'ticket-media', false)
on conflict (id) do update set public = false;
-- No storage.objects policies for anon/authenticated. Service role bypasses RLS for upload + createSignedUrl.
```

- [ ] **Step 2: Apply (with J's okay) and verify it is private**

Expected: bucket `ticket-media` exists with `public = false`. A direct public object URL returns 400/403; a service-role `createSignedUrl` returns a working time-limited link.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/024_ticket_media_bucket.sql
git commit -m "feat(db): add private ticket-media storage bucket"
```

---

## Task 3: Shared types + path helpers

**Files:**
- Create: `src/lib/support/types.ts`
- Create: `src/lib/support/paths.ts`

- [ ] **Step 1: Write the types**

```typescript
// src/lib/support/types.ts
export type TicketStatus = 'new' | 'in_progress' | 'resolved';
export type SubmitterRole = 'owner' | 'staff' | 'parent';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string | null;
  audio_path: string | null;
  image_path: string | null;
  page_url: string | null;
  user_agent: string | null;
  viewport: string | null;
  submitter_id: string;
  submitter_name: string | null;
  submitter_role: SubmitterRole;
  submitter_email: string | null;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;
}

// Shape returned to the submitter's "my tickets" list (no other people's data).
export type MyTicket = Pick<
  SupportTicket,
  'id' | 'subject' | 'status' | 'created_at' | 'resolved_at'
>;
```

- [ ] **Step 2: Write the storage path helper**

```typescript
// src/lib/support/paths.ts
// Media is namespaced under the ticket id so one ticket's files are grouped + easy to purge.
export function audioObjectPath(ticketId: string, ext = 'webm') {
  return `${ticketId}/audio.${ext}`;
}
export function imageObjectPath(ticketId: string, ext = 'jpg') {
  return `${ticketId}/photo.${ext}`;
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit`
Expected: PASS (no errors in the new files).
```bash
git add src/lib/support/types.ts src/lib/support/paths.ts
git commit -m "feat(support): ticket types + media path helpers"
```

---

## Task 4: Submit API — `POST /api/support/tickets` (service-role, session-gated)

**Files:**
- Create: `src/app/api/support/tickets/route.ts`

- [ ] **Step 1: Write the route**

```typescript
// src/app/api/support/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireSession } from '@/lib/auth/session';        // ⚠️ confirm path
import { createAdminClient } from '@/lib/supabase/admin';    // ⚠️ confirm path
import { audioObjectPath, imageObjectPath } from '@/lib/support/paths';
import type { SubmitterRole } from '@/lib/support/types';

export const runtime = 'nodejs';

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;  // 8 MB (already compressed client-side)

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession(); // throws if not logged in
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const subject = String(form.get('subject') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const pageUrl = String(form.get('page_url') ?? '').slice(0, 2000);
  const viewport = String(form.get('viewport') ?? '').slice(0, 50);
  const audio = form.get('audio');
  const image = form.get('image');

  // Must have a subject, and at least one of: description, audio, image.
  if (!subject) {
    return NextResponse.json({ error: 'subject_required' }, { status: 400 });
  }
  if (!description && !(audio instanceof File) && !(image instanceof File)) {
    return NextResponse.json({ error: 'empty_ticket' }, { status: 400 });
  }
  if (audio instanceof File && audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'audio_too_large' }, { status: 400 });
  }
  if (image instanceof File && image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'image_too_large' }, { status: 400 });
  }

  const id = randomUUID();
  const admin = createAdminClient();
  let audioPath: string | null = null;
  let imagePath: string | null = null;

  try {
    if (audio instanceof File && audio.size > 0) {
      const ext = audio.type.includes('mp4') ? 'mp4' : 'webm';
      audioPath = audioObjectPath(id, ext);
      const buf = Buffer.from(await audio.arrayBuffer());
      const up = await admin.storage.from('ticket-media').upload(audioPath, buf, {
        contentType: audio.type || 'audio/webm',
        upsert: false,
      });
      if (up.error) throw up.error;
    }
    if (image instanceof File && image.size > 0) {
      imagePath = imageObjectPath(id, 'jpg');
      const buf = Buffer.from(await image.arrayBuffer());
      const up = await admin.storage.from('ticket-media').upload(imagePath, buf, {
        contentType: image.type || 'image/jpeg',
        upsert: false,
      });
      if (up.error) throw up.error;
    }

    const role = (session.role ?? 'parent') as SubmitterRole;
    const ins = await admin.from('support_tickets').insert({
      id,
      subject: subject.slice(0, 200),
      description: description || null,
      audio_path: audioPath,
      image_path: imagePath,
      page_url: pageUrl || null,
      user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      viewport: viewport || null,
      submitter_id: String(session.userId),
      submitter_name: session.name ?? null,
      submitter_role: role,
      submitter_email: session.email ?? null,
      status: 'new',
    });
    if (ins.error) throw ins.error;

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    // Best-effort cleanup of any uploaded media if the insert failed.
    const toRemove = [audioPath, imagePath].filter(Boolean) as string[];
    if (toRemove.length) {
      await admin.storage.from('ticket-media').remove(toRemove).catch(() => {});
    }
    // Never leak internal details (repo security rule).
    return NextResponse.json({ error: 'ticket_create_failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (after Task 0 path confirmations).

- [ ] **Step 3: Manual smoke via curl once dev is up (deferred to Task 14 for the full pass)**

Note: leave the live curl test for the E2E task; here just confirm the route compiles and the dev server boots without import errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/support/tickets/route.ts
git commit -m "feat(api): submit support ticket (service-role, session-gated)"
```

---

## Task 5: "My tickets" API — `GET /api/support/tickets/mine`

**Files:**
- Create: `src/app/api/support/tickets/mine/route.ts`

- [ ] **Step 1: Write the route**

```typescript
// src/app/api/support/tickets/mine/route.ts
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';      // ⚠️
import { createAdminClient } from '@/lib/supabase/admin';  // ⚠️
import type { MyTicket } from '@/lib/support/types';

export const runtime = 'nodejs';

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('support_tickets')
    .select('id, subject, status, created_at, resolved_at')
    .eq('submitter_id', String(session.userId))
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
  return NextResponse.json({ tickets: (data ?? []) as MyTicket[] });
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/app/api/support/tickets/mine/route.ts
git commit -m "feat(api): list my support tickets"
```

---

## Task 6: Admin list API — `GET /api/admin/support/tickets`

**Files:**
- Create: `src/app/api/admin/support/tickets/route.ts`

- [ ] **Step 1: Write the route (owner-only, status filter, new-count)**

```typescript
// src/app/api/admin/support/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';      // ⚠️
import { createAdminClient } from '@/lib/supabase/admin';  // ⚠️
import type { SupportTicket, TicketStatus } from '@/lib/support/types';

export const runtime = 'nodejs';

function isOwner(role?: string) {
  return role === 'owner';
}

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isOwner(session.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get('status') as TicketStatus | null;
  const admin = createAdminClient();

  let query = admin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (status === 'new' || status === 'in_progress' || status === 'resolved') {
    query = query.eq('status', status);
  }

  const [list, count] = await Promise.all([
    query,
    admin.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  if (list.error) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
  return NextResponse.json({
    tickets: (list.data ?? []) as SupportTicket[],
    newCount: count.count ?? 0,
  });
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/app/api/admin/support/tickets/route.ts
git commit -m "feat(api): admin list support tickets + new count"
```

---

## Task 7: Signed-media API — `GET /api/admin/support/tickets/[id]/media`

**Files:**
- Create: `src/app/api/admin/support/tickets/[id]/media/route.ts`

- [ ] **Step 1: Write the route (owner-only, short-lived signed URLs)**

```typescript
// src/app/api/admin/support/tickets/[id]/media/route.ts
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';      // ⚠️
import { createAdminClient } from '@/lib/supabase/admin';  // ⚠️

export const runtime = 'nodejs';
const SIGNED_TTL_SECONDS = 60 * 10; // 10 minutes

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (session.role !== 'owner') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: ticket, error } = await admin
    .from('support_tickets')
    .select('audio_path, image_path')
    .eq('id', params.id)
    .single();
  if (error || !ticket) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  async function sign(path: string | null) {
    if (!path) return null;
    const { data } = await admin.storage.from('ticket-media').createSignedUrl(path, SIGNED_TTL_SECONDS);
    return data?.signedUrl ?? null;
  }

  return NextResponse.json({
    audioUrl: await sign(ticket.audio_path),
    imageUrl: await sign(ticket.image_path),
  });
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add "src/app/api/admin/support/tickets/[id]/media/route.ts"
git commit -m "feat(api): signed URLs for ticket media (owner-only)"
```

---

## Task 8: Update-status API — `PATCH /api/admin/support/tickets/[id]`

**Files:**
- Modify: `src/app/api/admin/support/tickets/[id]/route.ts` (create alongside the media route's folder)

- [ ] **Step 1: Write the route**

```typescript
// src/app/api/admin/support/tickets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';      // ⚠️
import { createAdminClient } from '@/lib/supabase/admin';  // ⚠️
import type { TicketStatus } from '@/lib/support/types';

export const runtime = 'nodejs';
const VALID: TicketStatus[] = ['new', 'in_progress', 'resolved'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (session.role !== 'owner') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body?.status as TicketStatus | undefined;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('support_tickets')
    .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
    .eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add "src/app/api/admin/support/tickets/[id]/route.ts"
git commit -m "feat(api): update ticket status (owner-only)"
```

---

## Task 9: Client helpers — audio recorder hook + image compression + context capture

**Files:**
- Create: `src/lib/support/useAudioRecorder.ts`
- Create: `src/lib/support/compressImage.ts`
- Create: `src/lib/support/captureContext.ts`

- [ ] **Step 1: Audio recorder hook (MediaRecorder, mobile-safe mime selection)**

```typescript
// src/lib/support/useAudioRecorder.ts
'use client';
import { useCallback, useRef, useState } from 'react';

function pickMime(): string {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg'];
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  mime: string;
  seconds: number;
}

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<AudioRecording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const mimeOut = rec.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeOut });
        const seconds = Math.round((Date.now() - startedRef.current) / 1000);
        setResult({ blob, url: URL.createObjectURL(blob), mime: mimeOut, seconds });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      startedRef.current = Date.now();
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      setError('Microphone access was blocked. You can still type or add a photo.');
    }
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setRecording(false);
  }, []);

  const clear = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  }, [result]);

  return { recording, result, error, start, stop, clear };
}
```

- [ ] **Step 2: Image compression helper (shrink on-device before upload)**

```typescript
// src/lib/support/compressImage.ts
'use client';
// Downscale to max 1600px on the long edge, re-encode as JPEG ~0.8 quality.
export async function compressImage(file: File, maxEdge = 1600, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file; // fall back to original if canvas unavailable
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', quality);
  });
}
```

- [ ] **Step 3: Context capture helper**

```typescript
// src/lib/support/captureContext.ts
'use client';
export function captureContext() {
  return {
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
  };
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/lib/support/useAudioRecorder.ts src/lib/support/compressImage.ts src/lib/support/captureContext.ts
git commit -m "feat(support): audio recorder hook + image compress + context capture"
```

---

## Task 10: Shared `ReportIssueForm` component

**Files:**
- Create: `src/components/support/ReportIssueForm.tsx`

- [ ] **Step 1: Write the form**

```tsx
// src/components/support/ReportIssueForm.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';     // ⚠️ confirm casing/path
import { Input } from '@/components/ui/input';        // ⚠️
import { Textarea } from '@/components/ui/textarea';  // ⚠️
import { useAudioRecorder } from '@/lib/support/useAudioRecorder';
import { compressImage } from '@/lib/support/compressImage';
import { captureContext } from '@/lib/support/captureContext';

export function ReportIssueForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const rec = useAudioRecorder();

  const canSubmit = subject.trim().length > 0 &&
    (description.trim().length > 0 || rec.result || image) && !submitting;

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      const ctx = captureContext();
      const fd = new FormData();
      fd.set('subject', subject.trim());
      fd.set('description', description.trim());
      fd.set('page_url', ctx.page_url);
      fd.set('viewport', ctx.viewport);
      if (rec.result) {
        const ext = rec.result.mime.includes('mp4') ? 'mp4' : 'webm';
        fd.set('audio', new File([rec.result.blob], `audio.${ext}`, { type: rec.result.mime }));
      }
      if (image) {
        const blob = await compressImage(image);
        fd.set('image', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      }
      const res = await fetch('/api/support/tickets', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('failed');
      setDone(true);
      onSubmitted?.();
    } catch {
      setErr('Something went wrong sending your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="p-4 text-sm">
        <p className="font-medium">Thanks. Your report was sent.</p>
        <p className="text-muted-foreground mt-1">J will see it on the Helpdesk. You can track it on your Help page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-1">
      <label className="text-sm font-medium">What's the issue?
        <Input value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary" maxLength={200} className="mt-1" />
      </label>

      <label className="text-sm font-medium">Tell me more (optional if you record or add a photo)
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? What page were you on?" rows={4} className="mt-1" />
      </label>

      <div className="flex items-center gap-2">
        {!rec.recording && !rec.result && (
          <Button type="button" variant="secondary" onClick={rec.start}>Record a voice memo</Button>
        )}
        {rec.recording && (
          <Button type="button" variant="destructive" onClick={rec.stop}>Stop recording</Button>
        )}
        {rec.result && (
          <div className="flex items-center gap-2">
            <audio src={rec.result.url} controls className="h-9" />
            <Button type="button" variant="ghost" onClick={rec.clear}>Re-record</Button>
          </div>
        )}
      </div>
      {rec.error && <p className="text-xs text-amber-600">{rec.error}</p>}

      <label className="text-sm font-medium">Add a screenshot or photo (optional)
        <input type="file" accept="image/*" capture="environment"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="mt-1 block text-sm" />
      </label>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <Button type="button" disabled={!canSubmit} onClick={submit}>
        {submitting ? 'Sending…' : 'Send report'}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/support/ReportIssueForm.tsx
git commit -m "feat(support): shared ReportIssueForm (text + voice + photo)"
```

---

## Task 11: Global `ReportIssueButton` + modal, mounted in all three portals

**Files:**
- Create: `src/components/support/ReportIssueButton.tsx`
- Modify: ⚠️ `src/app/(admin)/layout.tsx`, `src/app/(employee)/layout.tsx`, `src/app/(dashboard)/layout.tsx` (real names from Task 0)

- [ ] **Step 1: Write the button + dialog**

```tsx
// src/components/support/ReportIssueButton.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // ⚠️
import { ReportIssueForm } from './ReportIssueForm';

export function ReportIssueButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Report an issue</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Report a site issue</DialogTitle></DialogHeader>
        <ReportIssueForm onSubmitted={() => setTimeout(() => setOpen(false), 2500)} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Mount it in each portal layout**

In each of the three ⚠️ portal layout files, import and render `<ReportIssueButton />` in the existing header/nav row (place near the user menu). Example edit shape for the admin layout:
```tsx
import { ReportIssueButton } from '@/components/support/ReportIssueButton';
// ...inside the header JSX, alongside existing actions:
<ReportIssueButton />
```
Do the same minimal insertion in the employee and parent layouts. Do not restructure the layouts; add one element each.

- [ ] **Step 3: Boot dev server, verify the button renders in each portal**

Run: `npm run dev` then load each portal (admin/employee/parent) in the browser; confirm the button appears and the modal opens. (Full submit flow is verified in Task 14.)

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/support/ReportIssueButton.tsx "src/app/(admin)/layout.tsx" "src/app/(employee)/layout.tsx" "src/app/(dashboard)/layout.tsx"
git commit -m "feat(support): global Report an issue button in all portals"
```

---

## Task 12: Help page per portal (explainer + "your tickets")

**Files:**
- Create: `src/components/support/MyTicketsList.tsx`
- Create: ⚠️ `src/app/(admin)/help/page.tsx`, `src/app/(employee)/help/page.tsx`, `src/app/(dashboard)/help/page.tsx`

- [ ] **Step 1: Write the shared MyTicketsList (client component)**

```tsx
// src/components/support/MyTicketsList.tsx
'use client';
import { useEffect, useState } from 'react';
import type { MyTicket } from '@/lib/support/types';

const LABEL: Record<string, string> = { new: 'New', in_progress: 'In progress', resolved: 'Resolved' };

export function MyTicketsList() {
  const [tickets, setTickets] = useState<MyTicket[] | null>(null);
  useEffect(() => {
    fetch('/api/support/tickets/mine')
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((d) => setTickets(d.tickets ?? []))
      .catch(() => setTickets([]));
  }, []);

  if (tickets === null) return <p className="text-sm text-muted-foreground">Loading your reports…</p>;
  if (tickets.length === 0) return <p className="text-sm text-muted-foreground">You haven't reported anything yet.</p>;
  return (
    <ul className="divide-y">
      {tickets.map((t) => (
        <li key={t.id} className="py-2 flex items-center justify-between gap-3">
          <span className="text-sm">{t.subject}</span>
          <span className="text-xs rounded px-2 py-0.5 bg-muted">{LABEL[t.status] ?? t.status}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Write the Help page (same body in each portal)**

```tsx
// src/app/(dashboard)/help/page.tsx  (repeat for (admin) and (employee))
import { ReportIssueForm } from '@/components/support/ReportIssueForm';
import { MyTicketsList } from '@/components/support/MyTicketsList';

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 flex flex-col gap-8">
      <section>
        <h1 className="text-xl font-semibold">Help &amp; reporting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See something wrong on the site? Tell us here. You can type it, record a quick voice memo,
          and add a screenshot. We'll take a look.
        </p>
      </section>
      <section>
        <h2 className="text-base font-medium mb-2">Report an issue</h2>
        <div className="rounded-lg border p-3"><ReportIssueForm /></div>
      </section>
      <section>
        <h2 className="text-base font-medium mb-2">Your reports</h2>
        <MyTicketsList />
      </section>
    </div>
  );
}
```
Add a "Help" link to each portal's existing menu/nav (one link per portal; follow the nav pattern Task 0 surfaced). This satisfies the repo's navigation-reachability rule (a page that exists but can't be reached does not exist).

- [ ] **Step 3: Verify each Help page loads + lists own tickets only**

Run: `npm run dev`, log in as a parent, submit one ticket, confirm it appears on the parent Help page. Log in as a different parent, confirm they do NOT see it.

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/support/MyTicketsList.tsx "src/app/(admin)/help/page.tsx" "src/app/(employee)/help/page.tsx" "src/app/(dashboard)/help/page.tsx"
git commit -m "feat(support): per-portal Help page with own-ticket list + nav links"
```

---

## Task 13: Admin Helpdesk inbox + New-count badge

**Files:**
- Create: `src/app/(admin)/helpdesk/page.tsx` ⚠️
- Create: `src/components/support/HelpdeskInbox.tsx`
- Modify: ⚠️ admin nav component (add Helpdesk link + badge)

- [ ] **Step 1: Write the inbox client component (list + filter + detail + media + status)**

```tsx
// src/components/support/HelpdeskInbox.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import type { SupportTicket, TicketStatus } from '@/lib/support/types';
import { Button } from '@/components/ui/button';

const STATUSES: (TicketStatus | 'all')[] = ['new', 'in_progress', 'resolved', 'all'];
const LABEL: Record<string, string> = { new: 'New', in_progress: 'In progress', resolved: 'Resolved', all: 'All' };

export function HelpdeskInbox() {
  const [filter, setFilter] = useState<TicketStatus | 'all'>('new');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [media, setMedia] = useState<Record<string, { audioUrl: string | null; imageUrl: string | null }>>({});

  const load = useCallback(() => {
    const qs = filter === 'all' ? '' : `?status=${filter}`;
    fetch(`/api/admin/support/tickets${qs}`)
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((d) => setTickets(d.tickets ?? []))
      .catch(() => setTickets([]));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function openTicket(id: string) {
    setOpenId(openId === id ? null : id);
    if (!media[id]) {
      const r = await fetch(`/api/admin/support/tickets/${id}/media`);
      if (r.ok) setMedia((m) => ({ ...m, [id]: await r.json() }));
    }
  }

  async function setStatus(id: string, status: TicketStatus) {
    await fetch(`/api/admin/support/tickets/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)}>
            {LABEL[s]}
          </Button>
        ))}
      </div>
      {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets here.</p>}
      <ul className="divide-y">
        {tickets.map((t) => (
          <li key={t.id} className="py-3">
            <button className="w-full text-left" onClick={() => openTicket(t.id)}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-sm">{t.subject}</span>
                <span className="text-xs text-muted-foreground">
                  {t.submitter_name} · {t.submitter_role} · {new Date(t.created_at).toLocaleString()}
                </span>
              </div>
            </button>
            {openId === t.id && (
              <div className="mt-2 rounded-md bg-muted/40 p-3 text-sm flex flex-col gap-2">
                {t.description && <p>{t.description}</p>}
                {media[t.id]?.audioUrl && <audio src={media[t.id]!.audioUrl!} controls />}
                {media[t.id]?.imageUrl && (
                  <a href={media[t.id]!.imageUrl!} target="_blank" rel="noreferrer">
                    <img src={media[t.id]!.imageUrl!} alt="attachment" className="max-h-64 rounded" />
                  </a>
                )}
                <p className="text-xs text-muted-foreground break-all">Page: {t.page_url}</p>
                <p className="text-xs text-muted-foreground">{t.user_agent}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setStatus(t.id, 'new')}>New</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(t.id, 'in_progress')}>In progress</Button>
                  <Button size="sm" onClick={() => setStatus(t.id, 'resolved')}>Resolved</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Write the admin Helpdesk page (owner-gated server component shell)**

```tsx
// src/app/(admin)/helpdesk/page.tsx
import { HelpdeskInbox } from '@/components/support/HelpdeskInbox';

export default function HelpdeskPage() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-xl font-semibold mb-4">Helpdesk</h1>
      <HelpdeskInbox />
    </div>
  );
}
```
Note: the admin route group already enforces owner-only access at its layout/middleware (Task 0 confirms). The list and media APIs independently re-check `role === 'owner'`, so access is gated twice.

- [ ] **Step 3: Add the Helpdesk nav link + New-count badge**

In the ⚠️ admin nav component, add a link to `/helpdesk` and show a small badge with the New count. Minimal client badge:
```tsx
// inside the admin nav (client component)
'use client';
import { useEffect, useState } from 'react';
function HelpdeskNavBadge() {
  const [n, setN] = useState(0);
  useEffect(() => {
    fetch('/api/admin/support/tickets?status=new')
      .then((r) => (r.ok ? r.json() : { newCount: 0 }))
      .then((d) => setN(d.newCount ?? 0)).catch(() => {});
  }, []);
  if (n === 0) return null;
  return <span className="ml-1 rounded-full bg-red-600 text-white text-xs px-1.5">{n}</span>;
}
```
Render `<HelpdeskNavBadge />` next to the Helpdesk link.

- [ ] **Step 4: Verify in browser as owner**

Run: `npm run dev`, log in as owner, open `/helpdesk`, confirm: list loads, filter works, a ticket expands to show text + audio playback + photo + context, status buttons move it between New/In progress/Resolved, and the nav badge reflects the New count. Confirm a non-owner (employee/parent) hitting `/api/admin/support/tickets` gets 403.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add "src/app/(admin)/helpdesk/page.tsx" src/components/support/HelpdeskInbox.tsx "<admin nav file>"
git commit -m "feat(support): admin Helpdesk inbox + new-count badge"
```

---

## Task 14: End-to-end verification + security pass

**Files:** none created (verification only). Optional: `e2e/helpdesk.spec.ts` if the repo has a Playwright e2e setup (Task 0).

- [ ] **Step 1: Build + typecheck clean**

Run: `npm run typecheck && npm run build` (use the exact script names Task 0 confirmed; fall back to `npx tsc --noEmit && npm run build`).
Expected: both PASS, no type errors, no build errors.

- [ ] **Step 2: Full submit flow per portal (Playwright or manual)**

For owner, staff, parent: open the button modal, submit (a) text only, (b) voice only, (c) photo only, (d) all three. After each, confirm a row in `support_tickets` with correct `submitter_role`, `page_url`, `user_agent`, and the media uploaded to `ticket-media`.

- [ ] **Step 3: Isolation check**

Confirm parent A cannot see parent B's tickets on the Help page. Confirm `/api/support/tickets/mine` only returns the caller's rows.

- [ ] **Step 4: Lockdown checks**

- Anon/authenticated direct `select`/`insert` on `support_tickets` is denied (table locked).
- A `ticket-media` object is NOT reachable via a public URL; only the signed URL works, and it expires after 10 minutes.
- `/api/admin/support/*` returns 403 for non-owner sessions and 401 for no session.
- No API error response leaks `error.message` or internals.

- [ ] **Step 5: Mobile pass**

On iPhone Safari and Android Chrome: record a voice memo and attach a photo from the camera; confirm both upload and play/view back in the admin inbox.

- [ ] **Step 6: Ship gate (per repo discipline)**

Run `/cso` then `/review` then `/qa` on the branch before any deploy. Get J's explicit at-the-moment okay before deploying to the shared site. (Vercel auto-deploys this repo from `main` on merge, so merging IS deploying.)

- [ ] **Step 7: Final commit / open PR**

```bash
git add -A && git commit -m "test: helpdesk e2e + security verification notes"
```
Open a PR from `feature/helpdesk-tickets` for review before merge-to-main.

---

## Self-Review (against the spec)

**Spec coverage:**
- §3 ticket fields → Task 1 (columns), Task 4 (capture). ✓
- §4 button + Help page → Task 11 (button), Task 12 (Help page). ✓
- §5 admin inbox + New badge → Task 13. ✓
- §6 table + private bucket → Tasks 1, 2. ✓
- §7 service-role APIs, locked table, own-tickets-only, signed URLs, session gating → Tasks 4-8, 12, 14. ✓
- §8 email cut → not built; Task 13 New-count badge stands in for the ping. ✓
- §9 out-of-scope → no category/severity/thread/assignment built. ✓
- §10 testing → Task 14. ✓

**Placeholder scan:** No "TBD/TODO" in steps. The ⚠️ tokens are explicit Task-0 reconciliation anchors, not silent guesses, and Task 0 resolves them before any code task runs.

**Type consistency:** `TicketStatus`, `SubmitterRole`, `SupportTicket`, `MyTicket` defined once in Task 3 and reused verbatim in Tasks 4-8, 12, 13. API shapes (`{ tickets }`, `{ newCount }`, `{ id }`, `{ audioUrl, imageUrl }`, `{ ok }`) match between routes and consumers.

**Known soft spots (acceptable, flagged):** exact portal route-group names, auth/admin helper import paths, and migration numbers are unverifiable while the path is locked; Task 0 is the gate that closes them.
