-- Migration 051: staff video alongside photos (daily feed / activities).
-- 1) Allow short video in the existing private child_photos bucket and raise the
--    size limit to 50MB (photos are downscaled to ~100KB by the client, so the
--    higher ceiling only matters for video; the upload route + client still cap
--    video at <=60s / <=50MB).
-- 2) Tag each daily_photos row as a photo or a video so render surfaces pick the
--    right element (<img> vs <video>). Default 'photo' keeps existing rows correct.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg','image/jpg','image/png','image/webp','image/gif',
      'video/mp4','video/webm','video/quicktime'
    ]
where id = 'child_photos';

alter table public.daily_photos
  add column if not exists media_type text not null default 'photo'
  check (media_type in ('photo','video'));
