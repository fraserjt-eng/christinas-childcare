-- Add 'bottle' to the daily-report entry types. Bottles carry structured
-- detail (contents + ounces) so infant feeding shows cleanly on the parent
-- report, separate from table meals.

ALTER TABLE public.child_daily_entries
  DROP CONSTRAINT IF EXISTS child_daily_entries_type_check;

ALTER TABLE public.child_daily_entries
  ADD CONSTRAINT child_daily_entries_type_check CHECK (type IN (
    'note','nap','meal','bottle','bathroom','diaper','medication',
    'activity','photo','incident'
  ));
