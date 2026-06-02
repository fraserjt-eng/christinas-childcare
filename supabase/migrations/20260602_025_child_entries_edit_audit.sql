-- Staff entry corrections: edit + soft-delete with audit. Additive only,
-- no RLS or policy change. updated_at/edited_by stamp edits; deleted_at/
-- deleted_by soft-delete (record retained, hidden from the timeline).
ALTER TABLE public.child_daily_entries
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.employees(id) ON DELETE SET NULL;
