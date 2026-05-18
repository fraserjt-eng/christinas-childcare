-- 20260518_019_system_spine
--
-- The connected-system spine. Everything that should "pulse" (payroll,
-- ratios, budget, schedule, daily report) needs these. Purely ADDITIVE:
-- new tables + new nullable columns. No existing behavior changes until the
-- app is wired to read/write these in later phases. RLS on, no anon/auth
-- policy: service-role API routes only (same private pattern as
-- parent_messages).

-- ============================================================
-- time_entries — staff clock in/out (the missing spine)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  clock_in timestamptz,
  clock_out timestamptz,
  hours_worked numeric(6,2),
  break_minutes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  center_id uuid,
  classroom_id uuid,
  source text NOT NULL DEFAULT 'pin',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_time_entries_emp_date
  ON public.time_entries (employee_id, date);
-- Fast "who is clocked in right now" for ratios/dashboard.
CREATE INDEX IF NOT EXISTS idx_time_entries_open
  ON public.time_entries (date) WHERE clock_out IS NULL;

-- ============================================================
-- pay_stubs — generated payroll, persisted (was localStorage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pay_stubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  hours numeric(7,2) DEFAULT 0,
  gross numeric(10,2) DEFAULT 0,
  breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pay_stubs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pay_stubs_emp
  ON public.pay_stubs (employee_id, period_start);

-- ============================================================
-- child_daily_entries — the per-child daily report timeline
-- (notes, naps, meals, bathroom, diapers, meds, activities,
--  photos, incidents). Tadpoles model.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.family_children(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN (
    'note','nap','meal','bathroom','diaper','medication',
    'activity','photo','incident'
  )),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz DEFAULT now(),
  recorded_by uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  classroom_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.child_daily_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_child_daily_child_date
  ON public.child_daily_entries (child_id, date);
CREATE INDEX IF NOT EXISTS idx_child_daily_date
  ON public.child_daily_entries (date);

-- ============================================================
-- attendance — link to the real child + room + acting staff
-- (0 rows currently, so FK validates instantly and safely)
-- ============================================================
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS classroom_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'attendance_child_id_fkey'
      AND table_name = 'attendance'
  ) THEN
    ALTER TABLE public.attendance
      ADD CONSTRAINT attendance_child_id_fkey
      FOREIGN KEY (child_id) REFERENCES public.family_children(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_classroom_date
  ON public.attendance (classroom_id, date);

-- ============================================================
-- daily_photos — tag photos to specific children (media -> child)
-- ============================================================
ALTER TABLE public.daily_photos
  ADD COLUMN IF NOT EXISTS child_ids uuid[] DEFAULT '{}'::uuid[];
