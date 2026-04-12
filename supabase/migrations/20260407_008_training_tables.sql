-- Training & Development System Tables
-- 5 new tables for tracking learner progress, quiz answers, competency assessments, and admin controls

-- 1. Module section progress (learn/practice/check per module per user)
CREATE TABLE training_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('learn', 'practice', 'check')),
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id, section)
);

-- 2. Knowledge check quiz answer tracking (every attempt, every answer)
CREATE TABLE training_knowledge_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Completion gate competency assessments (self + admin ratings)
CREATE TABLE training_gate_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  self_rating TEXT CHECK (self_rating IN ('guided', 'independent', 'mentor')),
  admin_rating TEXT CHECK (admin_rating IN ('guided', 'independent', 'mentor')),
  self_assessed_at TIMESTAMPTZ,
  admin_assessed_at TIMESTAMPTZ,
  UNIQUE(user_id, unit_id, competency_id)
);

-- 4. Gate overrides (admin bypasses gate for experienced hires)
CREATE TABLE training_gate_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  overridden_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, unit_id)
);

-- 5. Unit unlock toggles (admin opens units globally)
CREATE TABLE training_unit_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id TEXT NOT NULL UNIQUE,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  unlocked_by UUID
);

-- Enable RLS on all tables
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_knowledge_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_gate_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_gate_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_unit_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users read/write own rows

CREATE POLICY "Users can view own training progress"
  ON training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training progress"
  ON training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training progress"
  ON training_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own knowledge checks"
  ON training_knowledge_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge checks"
  ON training_knowledge_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own gate assessments"
  ON training_gate_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gate assessments"
  ON training_gate_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gate assessments"
  ON training_gate_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies: Admin/owner can read all + manage overrides and unlocks

CREATE POLICY "Admin can view all training progress"
  ON training_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admin can view all knowledge checks"
  ON training_knowledge_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admin can view all gate assessments"
  ON training_gate_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admin can update gate assessments (for admin ratings)"
  ON training_gate_assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admin can manage gate overrides"
  ON training_gate_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can view unit unlocks"
  ON training_unit_unlocks FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage unit unlocks"
  ON training_unit_unlocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('owner', 'admin')
    )
  );

-- Indexes for common queries
CREATE INDEX idx_training_progress_user ON training_progress(user_id);
CREATE INDEX idx_training_progress_module ON training_progress(module_id);
CREATE INDEX idx_training_kc_user_module ON training_knowledge_checks(user_id, module_id);
CREATE INDEX idx_training_gate_user_unit ON training_gate_assessments(user_id, unit_id);
