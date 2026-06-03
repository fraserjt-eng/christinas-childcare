-- Migration 026: Classroom-scoped access
-- Goal (owner request): a teacher should only see / log the children in their
-- own classroom; admin & owner still see everyone. Prevents logging the wrong
-- thing on the wrong child.
--
-- Model decision (locked with J): ONE room per teacher.
--   employees.classroom_id      -> the single room a teacher is assigned to
--   family_children.classroom_id -> the room a child belongs to (real FK,
--                                   replacing the free-text `classroom` label)
-- Access control is enforced in app server code (RLS is service-role-only
-- post-fortress), so these columns feed the server-side filter.

-- 1. Teacher -> classroom (single room)
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES public.classrooms(id);

CREATE INDEX IF NOT EXISTS idx_employees_classroom ON public.employees(classroom_id);

-- 2. Child -> classroom (real FK alongside the legacy free-text `classroom`)
ALTER TABLE public.family_children
  ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES public.classrooms(id);

CREATE INDEX IF NOT EXISTS idx_family_children_classroom ON public.family_children(classroom_id);

-- 3. Best-effort backfill of family_children.classroom_id from the legacy
--    free-text label. Maps the messy values currently in the DB
--    (Infant / toddler / Toddler / preschool / School Aged) to the real
--    classroom rows by name. The admin UI is the source of truth; Christina
--    confirms each child's room there. Anything unmatched stays NULL.
UPDATE public.family_children fc
SET classroom_id = c.id
FROM public.classrooms c
WHERE fc.classroom_id IS NULL
  AND fc.classroom IS NOT NULL
  AND c.name = CASE
    WHEN lower(trim(fc.classroom)) LIKE 'infant%'                                   THEN 'Infant Room (Sunshine)'
    WHEN lower(trim(fc.classroom)) LIKE 'toddler%'                                  THEN 'Toddler Room (Stars)'
    WHEN lower(trim(fc.classroom)) LIKE 'pre-k%' OR lower(trim(fc.classroom)) LIKE 'prek%' THEN 'Pre-K Room (Explorers)'
    WHEN lower(trim(fc.classroom)) LIKE 'preschool%'                                THEN 'Preschool Room (Rainbows)'
    WHEN lower(trim(fc.classroom)) LIKE 'school%'                                   THEN 'School Age (Trailblazers)'
    ELSE NULL
  END;

COMMENT ON COLUMN public.employees.classroom_id IS 'The single classroom this staff member is assigned to. Teachers are scoped to this room; admin/owner/superadmin see all rooms. Set in Admin > Staff.';
COMMENT ON COLUMN public.family_children.classroom_id IS 'The classroom this child belongs to (real FK). Drives teacher access scoping. Set/confirmed in Admin > Families. Legacy free-text `classroom` retained for display only.';
