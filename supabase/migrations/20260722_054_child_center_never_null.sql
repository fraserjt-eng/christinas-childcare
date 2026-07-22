-- Migration 054: a child can never be left without a center.
--
-- WHAT WENT WRONG: family_children.center_id was optional in code but load
-- bearing in every read. Family Management lists families by the FAMILY's
-- center; the Attendance page, the live kiosk roster, the daily report, and the
-- by-room views all filter CHILDREN by family_children.center_id. A child whose
-- center was NULL therefore appeared in Family Management and nowhere that
-- attendance is taken. Worse, the kiosk's cross-center guard reads
--   if (child.center_id && child.center_id !== centerId) reject
-- so a NULL center fails OPEN: that child could be checked in at any center.
--
-- Fourteen children were in this state (Mardayee Zeogar and Obarialeminsi
-- Owatechujor among them). Three separate insert paths created children without
-- a center, so patching the call sites alone would only hold until the fourth
-- one is written. This trigger makes the database itself the guarantee.
--
-- The rule: if an insert or update leaves center_id NULL, fill it from the
-- child's family. An explicit center is always respected; only NULL is filled.

CREATE OR REPLACE FUNCTION public.family_children_inherit_center()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.center_id IS NULL THEN
    SELECT f.center_id INTO NEW.center_id
    FROM public.families f
    WHERE f.id = NEW.family_id;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.family_children_inherit_center() IS
  'Fills family_children.center_id from the parent family when it would be NULL. A NULL center hides the child from every attendance surface and makes the kiosk cross-center guard fail open.';

DROP TRIGGER IF EXISTS trg_family_children_inherit_center ON public.family_children;

CREATE TRIGGER trg_family_children_inherit_center
  BEFORE INSERT OR UPDATE OF family_id, center_id
  ON public.family_children
  FOR EACH ROW
  EXECUTE FUNCTION public.family_children_inherit_center();

-- Backfill anything already in this state. Runs before the trigger can help
-- existing rows, and is a no-op on a database where the fix already ran.
UPDATE public.family_children c
SET center_id = f.center_id
FROM public.families f
WHERE c.family_id = f.id
  AND c.center_id IS NULL
  AND f.center_id IS NOT NULL;
