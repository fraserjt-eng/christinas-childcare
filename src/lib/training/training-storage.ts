import { supabaseSelect, supabaseInsert, supabaseUpsert } from '@/lib/supabase/service';
import {
  TrainingProgress,
  TrainingKnowledgeCheck,
  TrainingGateAssessment,
  TrainingGateOverride,
  TrainingUnitUnlock,
  SectionType,
  CompetencyLevel,
} from '@/types/training';

const STORAGE_KEYS = {
  progress: 'training-progress',
  knowledgeChecks: 'training-knowledge-checks',
  gateAssessments: 'training-gate-assessments',
  gateOverrides: 'training-gate-overrides',
  unitUnlocks: 'training-unit-unlocks',
};

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

// --- Progress ---

export async function getUserProgress(userId: string): Promise<TrainingProgress[]> {
  const cloudData = await supabaseSelect<TrainingProgress>('training_progress', {
    filters: { user_id: userId },
  });
  if (cloudData !== null) {
    saveToStorage(STORAGE_KEYS.progress, cloudData);
    return cloudData;
  }
  return getFromStorage<TrainingProgress>(STORAGE_KEYS.progress).filter(
    p => p.user_id === userId
  );
}

export async function markSectionComplete(
  userId: string,
  moduleId: string,
  section: SectionType,
  score?: number
): Promise<void> {
  const record = {
    user_id: userId,
    module_id: moduleId,
    section,
    completed: true,
    score: score ?? null,
    completed_at: new Date().toISOString(),
  };

  await supabaseUpsert<TrainingProgress>(
    'training_progress',
    record,
    'user_id,module_id,section'
  );

  // Update local cache
  const local = getFromStorage<TrainingProgress>(STORAGE_KEYS.progress);
  const existingIdx = local.findIndex(
    p => p.user_id === userId && p.module_id === moduleId && p.section === section
  );
  const fullRecord = {
    ...record,
    id: existingIdx >= 0 ? local[existingIdx].id : crypto.randomUUID(),
    created_at: existingIdx >= 0 ? local[existingIdx].created_at : new Date().toISOString(),
  };
  if (existingIdx >= 0) {
    local[existingIdx] = fullRecord;
  } else {
    local.push(fullRecord);
  }
  saveToStorage(STORAGE_KEYS.progress, local);
}

// --- Knowledge Checks ---

export async function saveKnowledgeCheckAnswer(
  userId: string,
  moduleId: string,
  questionId: string,
  selectedAnswer: string,
  correct: boolean
): Promise<void> {
  const record = {
    user_id: userId,
    module_id: moduleId,
    question_id: questionId,
    selected_answer: selectedAnswer,
    correct,
    attempted_at: new Date().toISOString(),
  };

  await supabaseInsert<TrainingKnowledgeCheck>('training_knowledge_checks', record);

  const local = getFromStorage<TrainingKnowledgeCheck>(STORAGE_KEYS.knowledgeChecks);
  local.push({ ...record, id: crypto.randomUUID() });
  saveToStorage(STORAGE_KEYS.knowledgeChecks, local);
}

export async function getKnowledgeCheckHistory(
  userId: string,
  moduleId: string
): Promise<TrainingKnowledgeCheck[]> {
  const cloudData = await supabaseSelect<TrainingKnowledgeCheck>('training_knowledge_checks', {
    filters: { user_id: userId, module_id: moduleId },
    orderBy: { column: 'attempted_at', ascending: true },
  });
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingKnowledgeCheck>(STORAGE_KEYS.knowledgeChecks).filter(
    c => c.user_id === userId && c.module_id === moduleId
  );
}

// --- Gate Assessments ---

export async function saveGateAssessment(
  userId: string,
  unitId: string,
  competencyId: string,
  selfRating: CompetencyLevel
): Promise<void> {
  const record = {
    user_id: userId,
    unit_id: unitId,
    competency_id: competencyId,
    self_rating: selfRating,
    self_assessed_at: new Date().toISOString(),
  };

  await supabaseUpsert<TrainingGateAssessment>(
    'training_gate_assessments',
    record,
    'user_id,unit_id,competency_id'
  );

  const local = getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments);
  const idx = local.findIndex(
    a => a.user_id === userId && a.unit_id === unitId && a.competency_id === competencyId
  );
  const full = {
    ...record,
    id: idx >= 0 ? local[idx].id : crypto.randomUUID(),
    admin_rating: idx >= 0 ? local[idx].admin_rating : null,
    admin_assessed_at: idx >= 0 ? local[idx].admin_assessed_at : null,
  };
  if (idx >= 0) {
    local[idx] = full;
  } else {
    local.push(full);
  }
  saveToStorage(STORAGE_KEYS.gateAssessments, local);
}

export async function saveAdminRating(
  userId: string,
  unitId: string,
  competencyId: string,
  adminRating: CompetencyLevel
): Promise<void> {
  const record = {
    user_id: userId,
    unit_id: unitId,
    competency_id: competencyId,
    admin_rating: adminRating,
    admin_assessed_at: new Date().toISOString(),
  };

  await supabaseUpsert<TrainingGateAssessment>(
    'training_gate_assessments',
    record,
    'user_id,unit_id,competency_id'
  );

  const local = getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments);
  const idx = local.findIndex(
    a => a.user_id === userId && a.unit_id === unitId && a.competency_id === competencyId
  );
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...record };
    saveToStorage(STORAGE_KEYS.gateAssessments, local);
  }
}

export async function getGateAssessments(
  userId: string,
  unitId: string
): Promise<TrainingGateAssessment[]> {
  const cloudData = await supabaseSelect<TrainingGateAssessment>('training_gate_assessments', {
    filters: { user_id: userId, unit_id: unitId },
  });
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments).filter(
    a => a.user_id === userId && a.unit_id === unitId
  );
}

export async function getAllGateAssessments(): Promise<TrainingGateAssessment[]> {
  const cloudData = await supabaseSelect<TrainingGateAssessment>('training_gate_assessments');
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments);
}

// --- Gate Overrides ---

export async function saveGateOverride(
  userId: string,
  unitId: string,
  overriddenBy: string,
  reason: string
): Promise<void> {
  const record = {
    user_id: userId,
    unit_id: unitId,
    overridden_by: overriddenBy,
    reason,
    created_at: new Date().toISOString(),
  };

  await supabaseUpsert<TrainingGateOverride>(
    'training_gate_overrides',
    record,
    'user_id,unit_id'
  );

  const local = getFromStorage<TrainingGateOverride>(STORAGE_KEYS.gateOverrides);
  local.push({ ...record, id: crypto.randomUUID() });
  saveToStorage(STORAGE_KEYS.gateOverrides, local);
}

export async function getGateOverrides(): Promise<TrainingGateOverride[]> {
  const cloudData = await supabaseSelect<TrainingGateOverride>('training_gate_overrides');
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingGateOverride>(STORAGE_KEYS.gateOverrides);
}

// --- Unit Unlocks ---

export async function toggleUnitUnlock(
  unitId: string,
  unlocked: boolean,
  unlockedBy: string
): Promise<void> {
  const record = {
    unit_id: unitId,
    unlocked,
    unlocked_at: unlocked ? new Date().toISOString() : null,
    unlocked_by: unlocked ? unlockedBy : null,
  };

  await supabaseUpsert<TrainingUnitUnlock>(
    'training_unit_unlocks',
    record,
    'unit_id'
  );

  const local = getFromStorage<TrainingUnitUnlock>(STORAGE_KEYS.unitUnlocks);
  const idx = local.findIndex(u => u.unit_id === unitId);
  const full = { ...record, id: idx >= 0 ? local[idx].id : crypto.randomUUID() };
  if (idx >= 0) {
    local[idx] = full;
  } else {
    local.push(full);
  }
  saveToStorage(STORAGE_KEYS.unitUnlocks, local);
}

export async function getUnitUnlocks(): Promise<TrainingUnitUnlock[]> {
  const cloudData = await supabaseSelect<TrainingUnitUnlock>('training_unit_unlocks');
  if (cloudData !== null && cloudData.length > 0) return cloudData;
  const localData = getFromStorage<TrainingUnitUnlock>(STORAGE_KEYS.unitUnlocks);
  if (localData.length > 0) return localData;
  return cloudData ?? [];
}

// --- All Progress (Admin) ---

export async function getAllProgress(): Promise<TrainingProgress[]> {
  const cloudData = await supabaseSelect<TrainingProgress>('training_progress');
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingProgress>(STORAGE_KEYS.progress);
}

export async function getAllKnowledgeChecks(): Promise<TrainingKnowledgeCheck[]> {
  const cloudData = await supabaseSelect<TrainingKnowledgeCheck>('training_knowledge_checks');
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingKnowledgeCheck>(STORAGE_KEYS.knowledgeChecks);
}
