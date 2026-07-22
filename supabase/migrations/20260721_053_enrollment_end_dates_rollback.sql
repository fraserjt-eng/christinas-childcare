-- Rollback companion for migration 053 (enrollment end dates).
--
-- Run ONLY to undo 053. Dropping these columns DESTROYS every recorded end date
-- and reason; there is no way to recover them afterwards. Export
-- family_children(id, end_date, end_reason) and families(id, end_date,
-- end_reason) first if the data matters.

DROP INDEX IF EXISTS public.idx_family_children_end_date;
DROP INDEX IF EXISTS public.idx_families_end_date;

ALTER TABLE public.family_children
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS end_reason;

ALTER TABLE public.families
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS end_reason;
