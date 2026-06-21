import {
  TrainingProgress,
  TrainingKnowledgeCheck,
  TrainingGateAssessment,
  TrainingGateOverride,
  TrainingUnitUnlock,
  SectionType,
  CompetencyLevel,
} from '@/types/training';

// The training tables are RLS-locked (service-role only). All cloud access goes
// through the session-gated /api/training route, NEVER the anon client (which
// 401'd and silently dropped to per-device localStorage). localStorage remains
// the offline / not-signed-in fallback + a local cache.

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

// Returns the rows from /api/training, or null on any failure (not signed in,
// server-side, offline) so callers fall back to localStorage exactly as before.
async function apiGet<T>(op: string, params: Record<string, string | undefined> = {}): Promise<T[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const qs = new URLSearchParams({ op });
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    const res = await fetch(`/api/training?${qs.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const d = await res.json();
    return Array.isArray(d.rows) ? (d.rows as T[]) : [];
  } catch {
    return null;
  }
}

async function apiPost(op: string, payload: Record<string, unknown>): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op, ...payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Progress ---

export async function getUserProgress(userId: string): Promise<TrainingProgress[]> {
  const cloud = await apiGet<TrainingProgress>('userProgress', { userId });
  if (cloud !== null) {
    saveToStorage(STORAGE_KEYS.progress, cloud);
    return cloud;
  }
  return getFromStorage<TrainingProgress>(STORAGE_KEYS.progress).filter((p) => p.user_id === userId);
}

export async function markSectionComplete(
  userId: string,
  moduleId: string,
  section: SectionType,
  score?: number
): Promise<void> {
  await apiPost('markSectionComplete', { userId, moduleId, section, score: score ?? null });

  // Update local cache
  const record = {
    user_id: userId,
    module_id: moduleId,
    section,
    completed: true,
    score: score ?? null,
    completed_at: new Date().toISOString(),
  };
  const local = getFromStorage<TrainingProgress>(STORAGE_KEYS.progress);
  const existingIdx = local.findIndex(
    (p) => p.user_id === userId && p.module_id === moduleId && p.section === section
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
  await apiPost('saveKnowledgeCheckAnswer', { userId, moduleId, questionId, selectedAnswer, correct });

  const record = {
    user_id: userId,
    module_id: moduleId,
    question_id: questionId,
    selected_answer: selectedAnswer,
    correct,
    attempted_at: new Date().toISOString(),
  };
  const local = getFromStorage<TrainingKnowledgeCheck>(STORAGE_KEYS.knowledgeChecks);
  local.push({ ...record, id: crypto.randomUUID() });
  saveToStorage(STORAGE_KEYS.knowledgeChecks, local);
}

export async function getKnowledgeCheckHistory(
  userId: string,
  moduleId: string
): Promise<TrainingKnowledgeCheck[]> {
  const cloud = await apiGet<TrainingKnowledgeCheck>('knowledgeCheckHistory', { userId, moduleId });
  if (cloud !== null) return cloud;
  return getFromStorage<TrainingKnowledgeCheck>(STORAGE_KEYS.knowledgeChecks).filter(
    (c) => c.user_id === userId && c.module_id === moduleId
  );
}

// --- Gate Assessments ---

export async function saveGateAssessment(
  userId: string,
  unitId: string,
  competencyId: string,
  selfRating: CompetencyLevel
): Promise<void> {
  await apiPost('saveGateAssessment', { userId, unitId, competencyId, selfRating });

  const record = {
    user_id: userId,
    unit_id: unitId,
    competency_id: competencyId,
    self_rating: selfRating,
    self_assessed_at: new Date().toISOString(),
  };
  const local = getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments);
  const idx = local.findIndex(
    (a) => a.user_id === userId && a.unit_id === unitId && a.competency_id === competencyId
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
  await apiPost('saveAdminRating', { userId, unitId, competencyId, adminRating });

  const local = getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments);
  const idx = local.findIndex(
    (a) => a.user_id === userId && a.unit_id === unitId && a.competency_id === competencyId
  );
  if (idx >= 0) {
    local[idx] = { ...local[idx], admin_rating: adminRating, admin_assessed_at: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.gateAssessments, local);
  }
}

export async function getGateAssessments(
  userId: string,
  unitId: string
): Promise<TrainingGateAssessment[]> {
  const cloud = await apiGet<TrainingGateAssessment>('gateAssessments', { userId, unitId });
  if (cloud !== null) return cloud;
  return getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments).filter(
    (a) => a.user_id === userId && a.unit_id === unitId
  );
}

export async function getAllGateAssessments(): Promise<TrainingGateAssessment[]> {
  const cloud = await apiGet<TrainingGateAssessment>('allGateAssessments');
  if (cloud !== null) return cloud;
  return getFromStorage<TrainingGateAssessment>(STORAGE_KEYS.gateAssessments);
}

// --- Gate Overrides ---

export async function saveGateOverride(
  userId: string,
  unitId: string,
  overriddenBy: string,
  reason: string
): Promise<void> {
  await apiPost('saveGateOverride', { userId, unitId, overriddenBy, reason });

  const record = {
    user_id: userId,
    unit_id: unitId,
    overridden_by: overriddenBy,
    reason,
    created_at: new Date().toISOString(),
  };
  const local = getFromStorage<TrainingGateOverride>(STORAGE_KEYS.gateOverrides);
  local.push({ ...record, id: crypto.randomUUID() });
  saveToStorage(STORAGE_KEYS.gateOverrides, local);
}

export async function getGateOverrides(): Promise<TrainingGateOverride[]> {
  const cloud = await apiGet<TrainingGateOverride>('gateOverrides');
  if (cloud !== null) return cloud;
  return getFromStorage<TrainingGateOverride>(STORAGE_KEYS.gateOverrides);
}

// --- Unit Unlocks ---

export async function toggleUnitUnlock(
  unitId: string,
  unlocked: boolean,
  unlockedBy: string
): Promise<void> {
  await apiPost('toggleUnitUnlock', { unitId, unlocked, unlockedBy });

  const record = {
    unit_id: unitId,
    unlocked,
    unlocked_at: unlocked ? new Date().toISOString() : null,
    unlocked_by: unlocked ? unlockedBy : null,
  };
  const local = getFromStorage<TrainingUnitUnlock>(STORAGE_KEYS.unitUnlocks);
  const idx = local.findIndex((u) => u.unit_id === unitId);
  const full = { ...record, id: idx >= 0 ? local[idx].id : crypto.randomUUID() };
  if (idx >= 0) {
    local[idx] = full;
  } else {
    local.push(full);
  }
  saveToStorage(STORAGE_KEYS.unitUnlocks, local);
}

export async function getUnitUnlocks(): Promise<TrainingUnitUnlock[]> {
  const cloud = await apiGet<TrainingUnitUnlock>('unitUnlocks');
  if (cloud !== null && cloud.length > 0) return cloud;
  const localData = getFromStorage<TrainingUnitUnlock>(STORAGE_KEYS.unitUnlocks);
  if (localData.length > 0) return localData;
  return cloud ?? [];
}

// --- All (Admin) ---

export async function getAllProgress(): Promise<TrainingProgress[]> {
  const cloud = await apiGet<TrainingProgress>('allProgress');
  if (cloud !== null) return cloud;
  return getFromStorage<TrainingProgress>(STORAGE_KEYS.progress);
}

export async function getAllKnowledgeChecks(): Promise<TrainingKnowledgeCheck[]> {
  const cloud = await apiGet<TrainingKnowledgeCheck>('allKnowledgeChecks');
  if (cloud !== null) return cloud;
  return getFromStorage<TrainingKnowledgeCheck>(STORAGE_KEYS.knowledgeChecks);
}
