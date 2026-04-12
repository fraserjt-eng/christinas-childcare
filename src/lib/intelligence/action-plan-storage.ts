/**
 * Action Plan Storage
 * Stores structured response plans created from intelligence recommendations.
 * Phase 4: Recovery Architecture (FC RA: 2 -> 4)
 */

import { ActionPlan, RecheckItem } from './types';

const STORAGE_KEYS = {
  actionPlans: 'christinas_action_plans',
  rechecks: 'christinas_rechecks',
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

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

// Action Plans

export function getActionPlans(): ActionPlan[] {
  return getFromStorage<ActionPlan>(STORAGE_KEYS.actionPlans);
}

export function getActionPlansByRecommendation(recommendationId: string): ActionPlan[] {
  return getActionPlans().filter((p) => p.recommendationId === recommendationId);
}

export function createActionPlan(
  recommendationId: string,
  action: string,
  assignedTo: string,
  dueDate: string
): ActionPlan {
  const plans = getActionPlans();
  const plan: ActionPlan = {
    id: `ap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    recommendationId,
    action,
    assignedTo,
    dueDate,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  plans.push(plan);
  saveToStorage(STORAGE_KEYS.actionPlans, plans);
  return plan;
}

export function updateActionPlanStatus(
  id: string,
  status: ActionPlan['status']
): ActionPlan | null {
  const plans = getActionPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  plans[idx].status = status;
  if (status === 'completed') {
    plans[idx].completedAt = new Date().toISOString();
    // Schedule re-check 7 days after completion
    const recheckDate = new Date();
    recheckDate.setDate(recheckDate.getDate() + 7);
    plans[idx].recheckDate = recheckDate.toISOString();
    plans[idx].recheckResult = 'pending';

    // Create recheck item
    scheduleRecheck(plans[idx]);
  }

  saveToStorage(STORAGE_KEYS.actionPlans, plans);
  return plans[idx];
}

export function getPendingActionPlans(): ActionPlan[] {
  const plans = getActionPlans();
  const now = new Date();
  return plans
    .map((p) => {
      if (p.status === 'pending' && new Date(p.dueDate) < now) {
        return { ...p, status: 'overdue' as const };
      }
      return p;
    })
    .filter((p) => p.status === 'pending' || p.status === 'in_progress' || p.status === 'overdue');
}

// Re-checks

export function getRechecks(): RecheckItem[] {
  return getFromStorage<RecheckItem>(STORAGE_KEYS.rechecks);
}

export function getPendingRechecks(): RecheckItem[] {
  const rechecks = getRechecks();
  const now = new Date().toISOString();
  return rechecks.filter(
    (r) => r.status === 'pending' && r.scheduledDate <= now
  );
}

export function getUpcomingRechecks(days: number = 7): RecheckItem[] {
  const rechecks = getRechecks();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return rechecks.filter(
    (r) => r.status === 'pending' && r.scheduledDate <= cutoff.toISOString()
  );
}

function scheduleRecheck(plan: ActionPlan): RecheckItem {
  const rechecks = getRechecks();
  const recheckDate = new Date();
  recheckDate.setDate(recheckDate.getDate() + 7);

  const recheck: RecheckItem = {
    id: `rc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    actionPlanId: plan.id,
    scanType: 'general',
    scheduledDate: recheckDate.toISOString(),
    status: 'pending',
    originalFinding: plan.action,
  };

  rechecks.push(recheck);
  saveToStorage(STORAGE_KEYS.rechecks, rechecks);
  return recheck;
}

export function completeRecheck(
  id: string,
  result: 'resolved' | 'persists'
): RecheckItem | null {
  const rechecks = getRechecks();
  const idx = rechecks.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  rechecks[idx].status = result === 'persists' ? 'escalated' : 'completed';
  rechecks[idx].recheckResult = result === 'resolved' ? 'Issue resolved' : 'Issue persists, escalated';

  saveToStorage(STORAGE_KEYS.rechecks, rechecks);

  // Update the linked action plan
  const plans = getActionPlans();
  const planIdx = plans.findIndex((p) => p.id === rechecks[idx].actionPlanId);
  if (planIdx !== -1) {
    plans[planIdx].recheckResult = result === 'resolved' ? 'resolved' : 'persists';
    saveToStorage(STORAGE_KEYS.actionPlans, plans);
  }

  return rechecks[idx];
}
