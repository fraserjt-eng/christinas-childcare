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
UPDATE public.family_children   SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;
UPDATE public.families          SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;
UPDATE public.child_daily_entries SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;
