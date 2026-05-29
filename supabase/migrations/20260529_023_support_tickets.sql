-- 20260529_023_support_tickets.sql
-- Helpdesk: site-issue tickets submitted by owner / staff / parents.
-- Locked table + private media bucket. ALL access goes through service-role
-- API routes (the migration-020 fortress pattern). No anon/authenticated policies.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
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
-- Intentionally NO policies for anon/authenticated. The service role bypasses
-- RLS, so the API routes can read/write while the browser cannot touch this
-- table directly (matches families / financial_records lockdown in mig 020).

create index if not exists support_tickets_status_created_idx
  on public.support_tickets (status, created_at desc);
create index if not exists support_tickets_submitter_idx
  on public.support_tickets (submitter_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Private media bucket (voice memos + photos)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ticket-media', 'ticket-media', false)
on conflict (id) do update set public = false;
-- No storage.objects policies for anon/authenticated. Uploads and reads happen
-- only through the service role, which issues short-lived signed URLs at view
-- time. Media is never public.
