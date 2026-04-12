-- Migration 010: Add classroom_id to attendance table
-- Enables real-time per-room ratio calculations from attendance data
-- Required by fitness test: "Real-time ratio calculation" (currently FAIL)

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES public.classrooms(id);

CREATE INDEX IF NOT EXISTS idx_attendance_classroom ON public.attendance(classroom_id);

-- Also add parent_notified_at to incident_reports for structured notification tracking
-- (fitness test partial: "Parent notification tracking" lacks timestamp field)
ALTER TABLE public.incident_reports ADD COLUMN IF NOT EXISTS parent_notified_at timestamptz;

-- Add emergency contact fields to employees if not already present
-- (fitness test FAIL: 0 of 10 employees have emergency contacts)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_name') THEN
    ALTER TABLE public.employees ADD COLUMN emergency_contact_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_phone') THEN
    ALTER TABLE public.employees ADD COLUMN emergency_contact_phone text;
  END IF;
END $$;
