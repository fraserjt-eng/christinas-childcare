-- TRANSACTIONAL + RE-RUNNABLE bundle (fixed per cutover gate, 2026-06-21).
-- Wrapped in BEGIN/COMMIT: a partway failure rolls back clean. Every policy
-- is DROP-guarded so a re-run cannot abort on 'policy already exists'. The BP
-- backfill aborts safely if the canonical center id is missing on prod.

BEGIN;

-- ============================================================================
-- PROD CATCH-UP: tables from migrations 011/012/013 that prod never received.
-- Without these the 042 lockdown below references missing relations and the
-- whole bundle aborts. Idempotent (CREATE TABLE IF NOT EXISTS, DROP-guarded
-- policies), schema only (NO seed data). newsletters already exists on prod, so
-- its CREATE is a no-op.
-- ============================================================================

-- 011: research_findings (intelligence research inbox)
CREATE TABLE IF NOT EXISTS public.research_findings (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  question_id text NOT NULL,
  question_text text NOT NULL,
  finding text NOT NULL,
  evidence text,
  framework_tag text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'opportunity', 'risk')),
  source text NOT NULL DEFAULT 'internal' CHECK (source IN ('internal', 'external')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'acted', 'dismissed')),
  action_plan_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_findings_status ON public.research_findings(status);
CREATE INDEX IF NOT EXISTS idx_research_findings_created ON public.research_findings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_findings_framework ON public.research_findings(framework_tag);
ALTER TABLE public.research_findings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.research_findings;
CREATE POLICY "Allow all for authenticated" ON public.research_findings FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.research_findings;
CREATE POLICY "Allow all for anon" ON public.research_findings FOR ALL TO anon USING (true) WITH CHECK (true);

-- 012: news_updates, center_announcements, parent_conversations, newsletters
CREATE TABLE IF NOT EXISTS public.news_updates (id text PRIMARY KEY, center_id uuid REFERENCES public.centers(id), data jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.center_announcements (id text PRIMARY KEY, center_id uuid REFERENCES public.centers(id), data jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.parent_conversations (id text PRIMARY KEY, center_id uuid REFERENCES public.centers(id), parent_email text NOT NULL, data jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_parent_conversations_email ON public.parent_conversations(parent_email);
CREATE TABLE IF NOT EXISTS public.newsletters (id text PRIMARY KEY, center_id uuid REFERENCES public.centers(id), data jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.news_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.news_updates;
CREATE POLICY "Allow all for authenticated" ON public.news_updates FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.news_updates;
CREATE POLICY "Allow all for anon" ON public.news_updates FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.center_announcements;
CREATE POLICY "Allow all for authenticated" ON public.center_announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.center_announcements;
CREATE POLICY "Allow all for anon" ON public.center_announcements FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.parent_conversations;
CREATE POLICY "Allow all for authenticated" ON public.parent_conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.parent_conversations;
CREATE POLICY "Allow all for anon" ON public.parent_conversations FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.newsletters;
CREATE POLICY "Allow all for authenticated" ON public.newsletters FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.newsletters;
CREATE POLICY "Allow all for anon" ON public.newsletters FOR ALL TO anon USING (true) WITH CHECK (true);

-- 013: substitutes, sub_assignments (Subs feature)
CREATE TABLE IF NOT EXISTS public.substitutes (id text PRIMARY KEY, center_id uuid REFERENCES public.centers(id), data jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.sub_assignments (id text PRIMARY KEY, center_id uuid REFERENCES public.centers(id), data jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_sub_assignments_created ON public.sub_assignments(created_at DESC);
ALTER TABLE public.substitutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.substitutes;
CREATE POLICY "Allow all for authenticated" ON public.substitutes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.substitutes;
CREATE POLICY "Allow all for anon" ON public.substitutes FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.sub_assignments;
CREATE POLICY "Allow all for authenticated" ON public.sub_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.sub_assignments;
CREATE POLICY "Allow all for anon" ON public.sub_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
-- ===== END PROD CATCH-UP =====

-- Monday cutover bundle: migrations 030-043. Apply to prod (dkzxcxwjhhxqfgksynjb)
-- in order, ONLY at cutover, on J's go. All additive + idempotent.

-- ===== 20260619_030_center_id_scoping.sql =====
-- Migration 030: center_id on the remaining center-scoped tables.
--
-- Adds center_id to the three scoped tables that lacked it (family_children,
-- families, child_daily_entries) so multi-center reads can filter directly
-- instead of joining through classrooms every time.
--
-- SAFETY: additive only. ADD COLUMN ... NULL (no NOT NULL, so existing and
-- not-yet-assigned rows stay valid), backfilled from the EXISTING classroom
-- links. No DROP, no DELETE, no row mutation beyond setting the new column.
-- Cannot lose data. Idempotent (IF NOT EXISTS + WHERE center_id IS NULL).
--
-- Tables that ALREADY carry center_id (migrations 001/002/019) and need no
-- change: attendance, classrooms, daily_photos, employees, food_counts,
-- staff_schedules, time_entries.

-- 1. family_children.center_id  <- the child's classroom's center
ALTER TABLE public.family_children
  ADD COLUMN IF NOT EXISTS center_id uuid REFERENCES public.centers(id);
CREATE INDEX IF NOT EXISTS idx_family_children_center
  ON public.family_children(center_id);
UPDATE public.family_children fc
  SET center_id = c.center_id
  FROM public.classrooms c
  WHERE fc.center_id IS NULL AND fc.classroom_id = c.id;

-- 2. families.center_id  <- the family's children's center (deterministic first)
ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS center_id uuid REFERENCES public.centers(id);
CREATE INDEX IF NOT EXISTS idx_families_center
  ON public.families(center_id);
UPDATE public.families f
  SET center_id = sub.center_id
  FROM (
    SELECT family_id, MIN(center_id::text)::uuid AS center_id
    FROM public.family_children
    WHERE center_id IS NOT NULL
    GROUP BY family_id
  ) sub
  WHERE f.center_id IS NULL AND f.id = sub.family_id;

-- 3. child_daily_entries.center_id  <- the entry's classroom's center
ALTER TABLE public.child_daily_entries
  ADD COLUMN IF NOT EXISTS center_id uuid REFERENCES public.centers(id);
CREATE INDEX IF NOT EXISTS idx_child_daily_center
  ON public.child_daily_entries(center_id);
UPDATE public.child_daily_entries e
  SET center_id = c.center_id
  FROM public.classrooms c
  WHERE e.center_id IS NULL AND e.classroom_id = c.id;

-- 4. Fallback: any rows still NULL (no classroom link) belong to the single
-- legacy operating center, Brooklyn Park. All data predating multi-center is
-- Brooklyn Park, so this is factually correct, and it guarantees NO NULL center
-- can slip past the center-scoped kiosk/queries (the anti-collision guarantee:
-- a center-bound kiosk can never resolve a family or attendance row that has no
-- center). No-op where the classroom backfill already covered everything (the
-- seeded test DB). Brooklyn Park = 3104ae69-4f26-4c1e-a767-3ff45b534860.
DO $$
BEGIN
  -- Fail SAFE: if prod's Brooklyn Park center is not this canonical id (the
  -- app's OPERATING_CENTER_ID), abort the WHOLE bundle BEFORE backfilling so
  -- no real Brooklyn Park row is stamped with a phantom center it cannot
  -- resolve. The transaction wrapper rolls everything back on this abort.
  IF NOT EXISTS (SELECT 1 FROM public.centers WHERE id = '3104ae69-4f26-4c1e-a767-3ff45b534860') THEN
    RAISE EXCEPTION 'STOP: Brooklyn Park center 3104ae69-4f26-4c1e-a767-3ff45b534860 not found in public.centers. Run: SELECT id, name FROM public.centers; If prod BP has a different id, re-point this bundle AND src/lib/current-center.ts before applying. Nothing was changed.';
  END IF;
  UPDATE public.family_children     SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;
  UPDATE public.families            SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;
  UPDATE public.child_daily_entries SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;
END $$;

-- ===== 20260619_031_supplies.sql =====
-- Migration 031: supply & inventory module → Supabase table
-- Backs the supply-inventory-storage dual-write module. One table holds the
-- module's three record kinds (items, requests, orders) discriminated by
-- `record_type`, each row's fields in a JSONB `data` column (matches the
-- migration-012 fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.supplies (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplies_record_type
  ON public.supplies(record_type);
CREATE INDEX IF NOT EXISTS idx_supplies_center
  ON public.supplies(center_id);

-- Enable RLS
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.supplies;
CREATE POLICY "Allow all for authenticated" ON public.supplies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.supplies;
CREATE POLICY "Allow all for anon" ON public.supplies
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.supplies IS 'Supply & inventory module: items, requests, and orders (record_type discriminator), data in JSONB';

-- ===== 20260619_032_authorizations.sql =====
-- Migration 032: state authorization tracking module → Supabase table
-- Backs the authorization-storage dual-write module (Tool 04: State Authorization
-- Tracking). One record kind (child authorizations), so no record_type
-- discriminator: each row's typed fields live in a JSONB `data` column
-- (matches the migration-012 fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.authorizations (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authorizations_center
  ON public.authorizations(center_id);

-- Enable RLS
ALTER TABLE public.authorizations ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.authorizations;
CREATE POLICY "Allow all for authenticated" ON public.authorizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.authorizations;
CREATE POLICY "Allow all for anon" ON public.authorizations
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.authorizations IS 'State authorization tracking module: child authorizations (single record kind), typed fields in JSONB data';

-- ===== 20260619_033_cacfp_records.sql =====
-- Migration 033: CACFP compliance module → Supabase table
-- Backs the cacfp-compliance-storage dual-write module. One table holds the
-- module's two record kinds (monthly compliance records, reimbursement records)
-- discriminated by `record_type`, each row's fields in a JSONB `data` column
-- (matches the migration-012 / 031 fast-migration shape). Schema can be
-- normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.cacfp_records (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cacfp_records_record_type
  ON public.cacfp_records(record_type);
CREATE INDEX IF NOT EXISTS idx_cacfp_records_center
  ON public.cacfp_records(center_id);

-- Enable RLS
ALTER TABLE public.cacfp_records ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.cacfp_records;
CREATE POLICY "Allow all for authenticated" ON public.cacfp_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.cacfp_records;
CREATE POLICY "Allow all for anon" ON public.cacfp_records
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.cacfp_records IS 'CACFP compliance module: monthly compliance records and reimbursement records (record_type discriminator), data in JSONB';

-- ===== 20260619_034_comms.sql =====
-- Migration 034: communications module → Supabase table
-- Backs the comms-storage dual-write module. One table holds the module's
-- three record kinds (communications, read receipts, message templates)
-- discriminated by `record_type`, each row's fields in a JSONB `data` column
-- (matches the migration-012 / migration-031 fast-migration shape). Schema can
-- be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.comms (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comms_record_type
  ON public.comms(record_type);
CREATE INDEX IF NOT EXISTS idx_comms_center
  ON public.comms(center_id);

-- Enable RLS
ALTER TABLE public.comms ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.comms;
CREATE POLICY "Allow all for authenticated" ON public.comms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.comms;
CREATE POLICY "Allow all for anon" ON public.comms
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.comms IS 'Communications module: announcements/messages, read receipts, and message templates (record_type discriminator), data in JSONB';

-- ===== 20260619_035_knowledge.sql =====
-- Migration 035: knowledge base module → Supabase table
-- Backs the knowledge-storage dual-write module. One table holds the module's
-- three record kinds (entries, versions, reads) discriminated by `record_type`,
-- each row's fields in a JSONB `data` column (matches the migration-031 supplies
-- fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.knowledge (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_record_type
  ON public.knowledge(record_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_center
  ON public.knowledge(center_id);

-- Enable RLS
ALTER TABLE public.knowledge ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.knowledge;
CREATE POLICY "Allow all for authenticated" ON public.knowledge
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.knowledge;
CREATE POLICY "Allow all for anon" ON public.knowledge
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.knowledge IS 'Knowledge base module: entries, versions, and reads (record_type discriminator), data in JSONB';

-- ===== 20260619_036_lessons.sql =====
-- Migration 036: lesson module → Supabase table
-- Backs the lesson-storage dual-write module. A single-kind table (lessons only,
-- no record_type discriminator), each row's typed fields in a JSONB `data`
-- column (matches the migration-012 / migration-031 fast-migration shape).
-- Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.lessons (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_center
  ON public.lessons(center_id);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.lessons;
CREATE POLICY "Allow all for authenticated" ON public.lessons
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.lessons;
CREATE POLICY "Allow all for anon" ON public.lessons
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.lessons IS 'Lesson module: curriculum lessons, typed fields in JSONB data';

-- ===== 20260619_037_meetings.sql =====
-- Migration 037: meeting efficiency module → Supabase table
-- Backs the meeting-storage dual-write module. One table holds the module's
-- meeting records (decisions and action items live nested inside each meeting's
-- JSONB `data` payload), discriminated by `record_type` for consistency with the
-- migration-031 fast-migration shape. Each row's fields live in a JSONB `data`
-- column. Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.meetings (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_record_type
  ON public.meetings(record_type);
CREATE INDEX IF NOT EXISTS idx_meetings_center
  ON public.meetings(center_id);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.meetings;
CREATE POLICY "Allow all for authenticated" ON public.meetings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.meetings;
CREATE POLICY "Allow all for anon" ON public.meetings
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.meetings IS 'Meeting efficiency module: meeting records (record_type discriminator), agenda/decisions/action items nested in JSONB data';

-- ===== 20260619_038_notification_prefs.sql =====
-- Migration 038: notification preferences module → Supabase table
-- Backs the notification-prefs-storage dual-write module. One record kind
-- (per-family notification preferences) so there is no record_type
-- discriminator. Each row's PK is the family_id, with the preference fields
-- (channels, frequency, categories, quiet_hours, updated_at) in a JSONB `data`
-- column (matches the migration-012 fast-migration shape). Schema can be
-- normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.notification_prefs (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_center
  ON public.notification_prefs(center_id);

-- Enable RLS
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.notification_prefs;
CREATE POLICY "Allow all for authenticated" ON public.notification_prefs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.notification_prefs;
CREATE POLICY "Allow all for anon" ON public.notification_prefs
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.notification_prefs IS 'Notification preferences module: one row per family (id = family_id), preference fields in JSONB data';

-- ===== 20260619_039_onboarding.sql =====
-- Migration 039: onboarding module → Supabase table
-- Backs the onboarding-storage dual-write module. One table holds the module's
-- two record kinds (templates, assignments) discriminated by `record_type`,
-- each row's fields in a JSONB `data` column (matches the migration-031/012
-- fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.onboarding (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_record_type
  ON public.onboarding(record_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_center
  ON public.onboarding(center_id);

-- Enable RLS
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.onboarding;
CREATE POLICY "Allow all for authenticated" ON public.onboarding
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for anon" ON public.onboarding;
CREATE POLICY "Allow all for anon" ON public.onboarding
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.onboarding IS 'Onboarding module: templates and assignments (record_type discriminator), data in JSONB';

-- ===== 20260619_040_phase7_rls_drop_dead_authenticated.sql =====
-- Phase 7 RLS hardening: remove the dead "authenticated" allow-all policies.
--
-- This app does NOT use Supabase Auth. Sessions are HMAC-signed HttpOnly
-- cookies verified in middleware + requireSession on every API route. At the
-- Postgres layer every request is therefore either the `anon` role (the
-- publishable key, used by the browser-side dual-write helpers in
-- src/lib/supabase/service.ts) or the `service_role` (server routes, which
-- bypass RLS). The `authenticated` role is never exercised.
--
-- That makes the "Allow all for authenticated" policies created in migrations
-- 031-039 dead weight AND a latent landmine: if Supabase Auth is ever turned
-- on later, `authenticated USING (true)` would instantly grant every signed-in
-- user full read/write to every center's data. Remove them now while they are
-- provably unused.
--
-- The "Allow all for anon" policies are KEPT on purpose: the browser dual-write
-- runs as `anon`, so removing them would break these tools. The real boundary
-- for anonymous access is the application layer, not RLS, because there is no
-- DB-level identity to scope on. Closing the anon exposure for good means
-- routing these tables' reads/writes through server API routes (service role +
-- session check) and then denying anon, the same pattern child_daily_entries
-- and /api/portal/center-data already use. That is a deliberate refactor of the
-- data path, tracked as a Phase 8 hardening item, not a policy toggle.

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.authorizations;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.cacfp_records;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.comms;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.knowledge;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.lessons;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.meetings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.notification_prefs;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.onboarding;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.supplies;

-- ===== 20260619_041_dashboard_layout.sql =====
-- Migration 041: dashboard_layout → owner-customizable office home tiles
-- Backs the dashboard-layout-storage dual-write module. One row per center
-- holds the ordered list of tile ids the owner chose for the office home
-- (src/app/preview/office). The center_id (a centers.id UUID) is used as the
-- text primary key, so an upsert always targets exactly one row per center.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + a single permissive
-- anon RLS policy, matching the app's HMAC-cookie-auth posture (no Supabase
-- Auth; the `authenticated` role is never exercised, so it gets no policy —
-- see migration 040). No DROP, no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.dashboard_layout (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  tiles jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_layout_center
  ON public.dashboard_layout(center_id);

-- Enable RLS
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Permissive anon policy only. The browser dual-write runs as the `anon`
-- publishable key (src/lib/supabase/service.ts). The `authenticated` role is
-- never used in this app, so it gets no policy (see migration 040).
DROP POLICY IF EXISTS "Allow all for anon" ON public.dashboard_layout;
CREATE POLICY "Allow all for anon" ON public.dashboard_layout
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.dashboard_layout IS 'Owner-customizable office home tiles, one row per center (id = center_id), ordered tile-id array in JSONB tiles';

-- ===== 20260620_042_lockdown_pii_anon.sql =====
-- Migration 042: lock the PII / roster / security tables away from the anon key
-- (security gate blocker D). These tables back client-side dual-write modules,
-- which now read/write them through the session-gated /api/store route (service
-- role) instead of the browser anon key. Removing the permissive anon policies
-- means the browser key can no longer reach them directly via PostgREST.
--
-- SAFETY: only REMOVES permissive access (and narrows app_settings). RLS stays
-- enabled; the service role bypasses RLS, so the server route still works. No
-- data touched. Idempotent (DROP POLICY IF EXISTS).

-- Full lockdown: anon / authenticated can no longer touch these PII tables.
DROP POLICY IF EXISTS "Allow all for anon" ON public.notification_prefs;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.notification_prefs;
DROP POLICY IF EXISTS "Allow all for anon" ON public.comms;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.comms;
DROP POLICY IF EXISTS "Allow all for anon" ON public.authorizations;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.authorizations;
DROP POLICY IF EXISTS "Allow all for anon" ON public.parent_conversations;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.parent_conversations;
DROP POLICY IF EXISTS "Allow all for anon" ON public.substitutes;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.substitutes;
DROP POLICY IF EXISTS "Allow all for anon" ON public.sub_assignments;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.sub_assignments;

-- app_settings is a shared key-value settings table (ai config, ai usage, etc.)
-- that legitimately needs the anon key for non-sensitive keys. But the user
-- roster ('app_users') and security settings live here too and were anon-
-- writable (privilege escalation). Replace the blanket allow-all with a policy
-- that excludes those sensitive keys; the service role (via /api/store, used by
-- user-storage) still reaches them.
DROP POLICY IF EXISTS "Allow all for anon" ON public.app_settings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.app_settings;
DROP POLICY IF EXISTS "anon non-sensitive settings" ON public.app_settings;
CREATE POLICY "anon non-sensitive settings" ON public.app_settings
  FOR ALL TO anon
  USING (key NOT IN ('app_users', 'security_settings'))
  WITH CHECK (key NOT IN ('app_users', 'security_settings'));

-- ===== 20260620_043_kiosk_attestations.sql =====
-- Migration 043: kiosk_attestations — the MN DCYF compliance attestations.
-- Records (a) each family's agreement to the kiosk Privacy Notice (gates
-- check-in; required first use on/after 2026-06-22, then yearly + on version
-- change) and (b) each provider import-attendance accuracy attestation at CCAP
-- export. Reached only through the service-role kiosk route + the guarded store;
-- service-role-only RLS (no anon policy), like child_daily_entries.

CREATE TABLE IF NOT EXISTS public.kiosk_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL,            -- 'family' | 'staff'
  subject_id uuid NOT NULL,              -- family_id or employee_id
  attestation_type text NOT NULL,        -- 'privacy_notice' | 'import_attendance'
  version text NOT NULL,
  agreed_at timestamptz NOT NULL DEFAULT now(),
  agreed_name text,
  center_id uuid REFERENCES public.centers(id),
  kiosk_device text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kiosk_attest_subject
  ON public.kiosk_attestations(subject_type, subject_id, attestation_type);
CREATE INDEX IF NOT EXISTS idx_kiosk_attest_type
  ON public.kiosk_attestations(attestation_type);
CREATE INDEX IF NOT EXISTS idx_kiosk_attest_center
  ON public.kiosk_attestations(center_id);

ALTER TABLE public.kiosk_attestations ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose: only the service role (the kiosk
-- route and the guarded admin store) may read/write this compliance record.

COMMENT ON TABLE public.kiosk_attestations IS
'MN DCYF attestations: family privacy-notice agreements (kiosk gate) and provider import-attendance accuracy attestations. Service-role only.';

COMMIT;
