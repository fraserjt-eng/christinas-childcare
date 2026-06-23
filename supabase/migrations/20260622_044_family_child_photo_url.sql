-- Child profile photo (avatar) persistence.
-- Avatars were kept only in the browser's localStorage (the preview store's
-- kidPhotos map), so a photo taken on one device never synced to another and a
-- re-render fell back to the generic placeholder. This column stores the
-- child_photos bucket object path for each child's avatar; the app uploads to
-- the bucket (avatars/<child_id>.<ext>, upsert) and signs the path on read.
-- Additive and nullable: safe to apply on a live database with existing rows.

ALTER TABLE public.family_children
  ADD COLUMN IF NOT EXISTS photo_url text;
