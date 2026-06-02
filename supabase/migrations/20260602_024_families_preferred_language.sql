-- Parent UI language preference. Drives return-visit language and (later) the
-- language of automated parent emails. Additive, no RLS or policy change.
ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en'
  CHECK (preferred_language IN ('en', 'es'));
