-- Migration 046: family-communication review lifecycle (draft -> pending_review -> sent).
--
-- SAFETY: purely additive. Every existing parent_messages row was sent the moment
-- it was created (the old route emailed + inserted in one step), so the new `status`
-- defaults to 'sent' and nothing already in the table changes meaning. New messages
-- composed through the review flow start as 'pending_review' and only email/post to
-- the family once an owner approves. Current production code does not read these
-- columns, so applying this ahead of the feature merge has zero runtime effect.

alter table public.parent_messages
  add column if not exists status text not null default 'sent'
    check (status in ('draft','pending_review','sent')),
  add column if not exists created_by text,
  add column if not exists created_by_name text,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

-- The owner review queue lists pending items newest-first.
create index if not exists idx_parent_messages_status
  on public.parent_messages (status, created_at desc);
