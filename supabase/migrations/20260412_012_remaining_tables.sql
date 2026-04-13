-- Migration 012: remaining storage modules → Supabase tables
-- These tables use a JSONB `data` column for fast migration. Each table holds
-- items for a specific storage module. Schema can be normalized later.

-- News updates (admin news page)
CREATE TABLE IF NOT EXISTS public.news_updates (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Center-wide announcements (shown in notification popups)
CREATE TABLE IF NOT EXISTS public.center_announcements (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Parent conversations (parent-to-admin messaging bridge)
CREATE TABLE IF NOT EXISTS public.parent_conversations (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  parent_email text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parent_conversations_email
  ON public.parent_conversations(parent_email);

-- Newsletters (admin communications)
CREATE TABLE IF NOT EXISTS public.newsletters (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all four
ALTER TABLE public.news_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with existing pattern
CREATE POLICY "Allow all for authenticated" ON public.news_updates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.news_updates
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.center_announcements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.center_announcements
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.parent_conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.parent_conversations
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON public.newsletters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.newsletters
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.news_updates IS 'Admin-created news updates shown on news page';
COMMENT ON TABLE public.center_announcements IS 'Center-wide announcements for notification popups';
COMMENT ON TABLE public.parent_conversations IS 'Parent-to-admin message threads';
COMMENT ON TABLE public.newsletters IS 'Admin newsletter drafts and sent items';
