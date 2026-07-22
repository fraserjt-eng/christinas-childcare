-- Migration 053: enrollment end dates for children and families.
--
-- WHY: the roster had no way to say "this child's care ended on this date".
-- The only tools were families.status = 'inactive' (all-or-nothing, no date,
-- no reason) or deleting the family, which also destroys the attendance rows
-- DHS still requires the provider to keep for six years. Owners were therefore
-- either keeping departed children on the live kiosk roster or deleting records
-- that must be retained.
--
-- SEMANTICS: end_date is INCLUSIVE -- it is the child's LAST day of care. A
-- child is on the roster while (end_date IS NULL OR end_date >= today), and
-- drops off the day after. Historical attendance is never touched: a period
-- that closed before the end date still exports exactly as it did.
--
-- A family-level end_date is the household leaving the program. A child-level
-- end_date is one child leaving while siblings stay. The kiosk applies both.

ALTER TABLE public.family_children
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS end_reason text;

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS end_reason text;

COMMENT ON COLUMN public.family_children.end_date IS
  'Last day of care for this child (inclusive). NULL = still enrolled. The kiosk hides the child the day after.';
COMMENT ON COLUMN public.family_children.end_reason IS
  'Free text: why care ended (e.g. Moved, Auth End, Dupe). Shown in admin and the attendance export.';
COMMENT ON COLUMN public.families.end_date IS
  'Last day of care for the whole household (inclusive). NULL = still enrolled.';
COMMENT ON COLUMN public.families.end_reason IS
  'Free text: why the household left the program.';

-- Partial indexes: only ended rows are indexed, so the common "still enrolled"
-- read pays nothing and the roster/export filters stay cheap.
CREATE INDEX IF NOT EXISTS idx_family_children_end_date
  ON public.family_children (end_date)
  WHERE end_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_families_end_date
  ON public.families (end_date)
  WHERE end_date IS NOT NULL;

-- No RLS changes. Both tables already have RLS enabled and are service-role
-- only for reads that carry PII (migrations 042 and 052); these columns inherit
-- the existing policies and are never exposed to the anon key.
