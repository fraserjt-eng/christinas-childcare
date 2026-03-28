-- Migration: 005_storage_buckets
-- Creates the Supabase Storage bucket for data snapshots and sets RLS policies.

-- Create storage bucket for data snapshots.
-- Set to private (public = false) so only authenticated users can access files.
-- 5 MB per file is well above any realistic localStorage snapshot size.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-snapshots',
  'data-snapshots',
  false,
  5242880,
  ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload, download, list, and delete their snapshots.
-- The app uses the anon key with a valid session, so "authenticated" is the correct role.
CREATE POLICY "Authenticated users can manage snapshots"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'data-snapshots')
WITH CHECK (bucket_id = 'data-snapshots');
