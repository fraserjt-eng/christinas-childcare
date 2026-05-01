-- Migration: 014_backup_metadata
-- Adds metadata table for backup snapshots (size, table counts, source) and
-- ensures the data-snapshots Storage bucket exists with policies that work
-- under the service role (used by the new server-side backup API routes).
--
-- Why this exists: the original 005 migration created the bucket with an
-- "authenticated" RLS policy. Christina's app uses HMAC cookie auth, NOT
-- Supabase Auth, so the anon key has no JWT and uploads fail silently. We
-- now route backups through API routes that use the service role key, which
-- bypasses RLS entirely. The policies below are kept for future direct-from-
-- browser flows but the path of record is server-side.

-- ─── Metadata table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.backup_snapshots (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path  text          NOT NULL UNIQUE,
  envelope_version int        NOT NULL DEFAULT 2,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  byte_size     bigint        NOT NULL DEFAULT 0,
  local_key_count int         NOT NULL DEFAULT 0,
  table_count   int           NOT NULL DEFAULT 0,
  table_row_count int         NOT NULL DEFAULT 0,
  tables_included text[]      NOT NULL DEFAULT '{}',
  created_by    text          NULL,
  notes         text          NULL
);

CREATE INDEX IF NOT EXISTS backup_snapshots_created_at_idx
  ON public.backup_snapshots (created_at DESC);

ALTER TABLE public.backup_snapshots ENABLE ROW LEVEL SECURITY;

-- The metadata table is read by the admin UI through the service-role API
-- routes. The anon role gets read-only access so the legacy client lib keeps
-- working as a fallback. No public mutation paths.
DROP POLICY IF EXISTS "anon_read_backup_metadata" ON public.backup_snapshots;
CREATE POLICY "anon_read_backup_metadata"
  ON public.backup_snapshots
  FOR SELECT
  TO anon
  USING (true);

-- ─── Bucket safety net ─────────────────────────────────────────────────────

-- Idempotently ensure the bucket exists. The original 005 migration may not
-- have run on every Supabase project (some forks were created later); this
-- catches that gap.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-snapshots',
  'data-snapshots',
  false,
  10485760, -- 10 MB to leave headroom for table dumps
  ARRAY['application/json']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Also let anon list/read so the legacy client lib's listing fallback can
-- still see snapshots even when the API route is down. Service role bypasses
-- RLS for writes regardless.
DROP POLICY IF EXISTS "anon_can_read_snapshots" ON storage.objects;
CREATE POLICY "anon_can_read_snapshots"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'data-snapshots');
