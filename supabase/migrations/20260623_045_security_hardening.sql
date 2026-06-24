-- Migration 045: SOC 2 / OWASP remediation, additive + safe.
-- From the June 2026 security audit (SOC2_FINDINGS + the OWASP/STRIDE pass).
--
-- SAFETY: purely additive. Creates a PRIVATE storage bucket, adds nullable
-- columns, creates one new table, and drops a single orphaned anon policy on an
-- unused table. No existing data is touched, no shipped page depends on any of
-- it. Idempotent (IF NOT EXISTS / IF EXISTS / ON CONFLICT).

-- 1) child_photos Storage bucket. The read path already signs every photo via a
--    private signed URL (src/lib/photo-url.ts) and stores bare object paths, but
--    the bucket was never created (uploads silently failed in prod). Create it
--    PRIVATE so the feature works AND children's photos are never publicly
--    reachable by guessing an object path. Service-role server routes bypass RLS
--    to upload + sign; the anon browser key has no access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('child_photos', 'child_photos', false, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false;

-- 2) Drop the orphaned 'Allow all for anon' on research_findings. The table has
--    zero client references (its storage module persists to app_settings), so
--    this closes a public read/write surface with no code change and no breakage.
drop policy if exists "Allow all for anon" on public.research_findings;
drop policy if exists "Allow all for authenticated" on public.research_findings;

-- 3) Durable, attributable admin audit trail (closes the audit Critical: today the
--    "audit log" is a per-browser localStorage stub stamped admin@demo.com).
--    Server routes insert here with the real session actor; append-only by design
--    (no update/delete from the app). RLS denies the anon/authenticated browser
--    key entirely; only the service role (server) reads/writes it.
create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    text,
  actor_email text,
  actor_role  text,
  action      text not null,
  target_type text,
  target_id   text,
  center_id   uuid,
  detail      jsonb,
  ip          text,
  created_at  timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
-- No anon/authenticated policies: the browser key cannot read or write it.
-- The service role (server API routes) bypasses RLS for the append + admin reads.
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_actor_idx on public.admin_audit_log (actor_id);
create index if not exists admin_audit_log_center_idx on public.admin_audit_log (center_id);
