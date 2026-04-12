-- Superadmin support + site content management

-- Site content key-value store for editable content
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content (public pages need it)
CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  USING (true);

-- Only admin/owner/superadmin can modify site content
CREATE POLICY "Admin can manage site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('superadmin', 'owner', 'admin')
    )
  );

-- Index for fast lookups by key
CREATE INDEX idx_site_content_key ON site_content(key);
