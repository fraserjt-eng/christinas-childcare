-- Migration 047: toddler diapering / toileting entry types.
-- Adds 'toileting' (used the potty) and 'accident' to the daily-report entry
-- types so toddler rooms can log potty-training successes + accidents distinctly
-- from infant diaper changes. Additive: existing rows and the prior allowed
-- values are unchanged; this only widens the CHECK to accept two more values.

ALTER TABLE public.child_daily_entries
  DROP CONSTRAINT IF EXISTS child_daily_entries_type_check;

ALTER TABLE public.child_daily_entries
  ADD CONSTRAINT child_daily_entries_type_check CHECK (type IN (
    'note','nap','meal','bottle','bathroom','diaper','toileting','accident',
    'medication','activity','photo','incident'
  ));
