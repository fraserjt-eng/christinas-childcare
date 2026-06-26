-- Staff profile photos. Mirrors family_children.photo_url: store the bucket
-- object path on the employee row and serve it as a short-lived SIGNED URL at
-- read time (same private child_photos bucket, under a staff/ prefix). Before
-- this, office staff avatars were single-device data URLs that never synced.
-- Additive and idempotent; no backfill needed (null = no photo = initials).
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url text;
