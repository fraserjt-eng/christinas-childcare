-- Migration: 016_newsletter_v2
-- Newsletter system upgrade: subscribers, templates, scheduling, and analytics.
-- Existing newsletters table gets new columns; existing rows are unaffected.

-- ─── Subscribers ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text          NOT NULL UNIQUE,
  name            text          NULL,
  status          text          NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed','unsubscribed','bounced','complained')),
  source          text          NULL, -- 'public_form', 'admin_import', 'parent_intake', etc.
  tags            text[]        NOT NULL DEFAULT '{}',
  subscribed_at   timestamptz   NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz   NULL,
  last_sent_at    timestamptz   NULL,
  metadata        jsonb         NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
  ON public.newsletter_subscribers (status);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx
  ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anon can SELECT (admin pages need to see counts) but not write directly.
-- All writes go through API routes that use the service role key.
DROP POLICY IF EXISTS "anon_read_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "anon_read_subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

-- ─── Templates ─────────────────────────────────────────────────────────────
-- Block-array layouts that newsletters can start from. We store the blocks as
-- JSONB so the future Plate-based editor can read/write the same shape.

CREATE TABLE IF NOT EXISTS public.newsletter_templates (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text          NOT NULL UNIQUE,
  description text          NULL,
  blocks      jsonb         NOT NULL DEFAULT '[]'::jsonb,
  thumbnail   text          NULL, -- optional URL or data URI
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),
  created_by  text          NULL,
  is_builtin  boolean       NOT NULL DEFAULT false
);

ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_templates" ON public.newsletter_templates;
CREATE POLICY "anon_read_templates"
  ON public.newsletter_templates
  FOR SELECT
  TO anon
  USING (true);

-- ─── Newsletter analytics + scheduling columns ─────────────────────────────
-- The existing `newsletters` table doesn't track these yet. Add as nullable
-- so existing rows keep working without backfill.

ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS scheduled_for       timestamptz NULL,
  ADD COLUMN IF NOT EXISTS sent_at             timestamptz NULL,
  ADD COLUMN IF NOT EXISTS recipient_count     integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS open_count          integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count         integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounce_count        integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unsubscribe_count   integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resend_message_ids  text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS from_name           text        NULL,
  ADD COLUMN IF NOT EXISTS from_email          text        NULL,
  ADD COLUMN IF NOT EXISTS dispatch_lock       text        NULL,
  ADD COLUMN IF NOT EXISTS last_error          text        NULL;

CREATE INDEX IF NOT EXISTS newsletters_scheduled_for_idx
  ON public.newsletters (scheduled_for)
  WHERE scheduled_for IS NOT NULL;

-- ─── Per-subscriber send log ────────────────────────────────────────────────
-- One row per (newsletter, subscriber) so webhook events update the right
-- record and we can show per-recipient engagement on the analytics page.

CREATE TABLE IF NOT EXISTS public.newsletter_send_log (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id   text          NOT NULL,
  subscriber_id   uuid          NULL REFERENCES public.newsletter_subscribers(id) ON DELETE SET NULL,
  email           text          NOT NULL,
  resend_message_id text        NULL UNIQUE,
  sent_at         timestamptz   NOT NULL DEFAULT now(),
  delivered_at    timestamptz   NULL,
  opened_at       timestamptz   NULL,
  open_count      integer       NOT NULL DEFAULT 0,
  clicked_at      timestamptz   NULL,
  click_count     integer       NOT NULL DEFAULT 0,
  bounced_at      timestamptz   NULL,
  unsubscribed_at timestamptz   NULL,
  complained_at   timestamptz   NULL
);

CREATE INDEX IF NOT EXISTS newsletter_send_log_newsletter_idx
  ON public.newsletter_send_log (newsletter_id);

CREATE INDEX IF NOT EXISTS newsletter_send_log_subscriber_idx
  ON public.newsletter_send_log (subscriber_id);

ALTER TABLE public.newsletter_send_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_send_log" ON public.newsletter_send_log;
CREATE POLICY "anon_read_send_log"
  ON public.newsletter_send_log
  FOR SELECT
  TO anon
  USING (true);

-- ─── Seed built-in templates ───────────────────────────────────────────────

INSERT INTO public.newsletter_templates (name, description, blocks, is_builtin)
VALUES
  (
    'Weekly Family Update',
    'Friday weekly recap with photos, milestones, upcoming events, and reminders.',
    '[
      {"type":"header","text":"This Week at Christina''s","level":1},
      {"type":"text","text":"Welcome to your weekly family update."},
      {"type":"section","title":"Photo Highlights","blocks":[
        {"type":"text","text":"Add 2-3 standout moments from the week."}
      ]},
      {"type":"section","title":"Classroom Spotlight","blocks":[
        {"type":"text","text":"Highlight one classroom''s learning theme."}
      ]},
      {"type":"section","title":"Milestones We Saw","blocks":[
        {"type":"text","text":"Name 3-4 children who hit a developmental moment this week."}
      ]},
      {"type":"section","title":"Upcoming","blocks":[
        {"type":"text","text":"Reminders, events, picture day, holiday closures."}
      ]},
      {"type":"divider"},
      {"type":"text","text":"Thank you for trusting us with your children. — The Christina''s team"}
    ]'::jsonb,
    true
  ),
  (
    'Monthly Family Newsletter',
    'Longer monthly piece for parents: program updates, enrollment news, staff spotlights.',
    '[
      {"type":"header","text":"Christina''s Monthly Newsletter","level":1},
      {"type":"text","text":"What happened this month and what is coming up."},
      {"type":"section","title":"Curriculum This Month","blocks":[
        {"type":"text","text":"Themes covered, books read, activities families can try at home."}
      ]},
      {"type":"section","title":"Staff Spotlight","blocks":[
        {"type":"text","text":"Feature one teacher: their background, why they are here, what they love."}
      ]},
      {"type":"section","title":"Enrollment + Tours","blocks":[
        {"type":"text","text":"Open spots, tour days, referral program."}
      ]},
      {"type":"section","title":"Looking Ahead","blocks":[
        {"type":"text","text":"What is on the calendar for next month."}
      ]}
    ]'::jsonb,
    true
  ),
  (
    'Special Event Announcement',
    'One-event focused: parent night, holiday party, fundraiser.',
    '[
      {"type":"header","text":"Save the Date","level":1},
      {"type":"text","text":"Event name, date, time, location."},
      {"type":"section","title":"What to Expect","blocks":[
        {"type":"text","text":"Description of the event and what families will experience."}
      ]},
      {"type":"section","title":"What to Bring","blocks":[
        {"type":"text","text":"Anything families should bring or prepare."}
      ]},
      {"type":"button","text":"RSVP","url":"https://example.com/rsvp"}
    ]'::jsonb,
    true
  ),
  (
    'Enrollment Open',
    'Driving sign-ups when there are open spots.',
    '[
      {"type":"header","text":"We Have Spots Open","level":1},
      {"type":"text","text":"Briefly state which classroom and which age group."},
      {"type":"section","title":"What Makes Us Different","blocks":[
        {"type":"text","text":"Three-bullet hook on philosophy, daily life, family experience."}
      ]},
      {"type":"section","title":"How to Tour","blocks":[
        {"type":"text","text":"Tour days, what a tour looks like, who to email."}
      ]},
      {"type":"button","text":"Schedule a Tour","url":"https://christinaschildcare.com/schedule-tour"}
    ]'::jsonb,
    true
  ),
  (
    'Holiday Closure Notice',
    'Quick utility template for closures and schedule changes.',
    '[
      {"type":"header","text":"Closure Notice","level":1},
      {"type":"text","text":"Date(s) of closure and reason."},
      {"type":"section","title":"What This Means For You","blocks":[
        {"type":"text","text":"Pickup time changes, lunch impacts, makeup days if any."}
      ]},
      {"type":"text","text":"Questions? Reply to this email or call the center."}
    ]'::jsonb,
    true
  )
ON CONFLICT (name) DO UPDATE
  SET description = EXCLUDED.description,
      blocks      = EXCLUDED.blocks,
      is_builtin  = EXCLUDED.is_builtin,
      updated_at  = now();
