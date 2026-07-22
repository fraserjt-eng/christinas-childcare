-- Rollback companion for migration 054 (child center never null).
--
-- Removes only the guarantee, not the data: children already given a center
-- keep it. After this runs, a code path that inserts a child without a center
-- can once again make that child invisible to every attendance surface.

DROP TRIGGER IF EXISTS trg_family_children_inherit_center ON public.family_children;
DROP FUNCTION IF EXISTS public.family_children_inherit_center();
