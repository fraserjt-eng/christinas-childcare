/**
 * Training Completion Scan
 * Reads training progress data and surfaces actionable items.
 */

import { TrainingDigestItem } from './types';
import { TrainingProgress } from '@/types/training';
import {
  getAllProgress,
  getAllKnowledgeChecks,
  getAllGateAssessments,
} from '@/lib/training/training-storage';
import { trainingModules } from '@/lib/training/modules';
import { trainingUnits } from '@/lib/training/units';

export async function runTrainingScan(): Promise<TrainingDigestItem[]> {
  const items: TrainingDigestItem[] = [];

  const allProgress = await getAllProgress();
  const allChecks = await getAllKnowledgeChecks();
  const allGates = await getAllGateAssessments();

  // 1. Stuck learners: started a module 7+ days ago, haven't completed all 3 sections
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const progressByUserModule: Record<string, TrainingProgress[]> = {};

  for (const p of allProgress) {
    const key = `${p.user_id}::${p.module_id}`;
    if (!progressByUserModule[key]) {
      progressByUserModule[key] = [];
    }
    progressByUserModule[key].push(p);
  }

  for (const key of Object.keys(progressByUserModule)) {
    const records = progressByUserModule[key];
    const completedSections = records.filter((r: TrainingProgress) => r.completed).map((r: TrainingProgress) => r.section);
    const allDone =
      completedSections.includes('learn') &&
      completedSections.includes('practice') &&
      completedSections.includes('check');

    if (allDone) continue;

    const oldest = records.reduce(
      (min: number, r: TrainingProgress) => {
        const t = new Date(r.created_at).getTime();
        return t < min ? t : min;
      },
      Infinity
    );

    if (oldest < sevenDaysAgo) {
      const [userId, moduleId] = key.split('::');
      const mod = trainingModules.find((m) => m.id === moduleId);
      const missing = (['learn', 'practice', 'check'] as const).filter(
        (s) => !completedSections.includes(s)
      );
      items.push({
        type: 'stuck',
        severity: 'warning',
        title: `Stuck on ${mod?.title || moduleId}`,
        detail: `User ${userId} started this module over 7 days ago. Missing sections: ${missing.join(', ')}.`,
        moduleId,
        userId,
        actionLink: `/training/module/${moduleId}`,
      });
    }
  }

  // 2. Low pass rates: modules where first-attempt pass rate < 60%
  const checksByModule: Record<string, { correct: number; total: number }> = {};
  for (const check of allChecks) {
    if (!checksByModule[check.module_id]) {
      checksByModule[check.module_id] = { correct: 0, total: 0 };
    }
    const stats = checksByModule[check.module_id];
    stats.total++;
    if (check.correct) stats.correct++;
  }

  for (const moduleId of Object.keys(checksByModule)) {
    const stats = checksByModule[moduleId];
    if (stats.total < 3) continue;
    const passRate = stats.correct / stats.total;
    if (passRate < 0.6) {
      const mod = trainingModules.find((m) => m.id === moduleId);
      items.push({
        type: 'low_pass_rate',
        severity: 'warning',
        title: `Low pass rate: ${mod?.title || moduleId}`,
        detail: `First-attempt pass rate is ${Math.round(passRate * 100)}% (${stats.correct}/${stats.total}). Content may need revision.`,
        moduleId,
        actionLink: `/admin/training`,
      });
    }
  }

  // 3. Pending gate reviews: self-ratings submitted 3+ days ago without admin rating
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const pendingGates = allGates.filter(
    (g) =>
      g.self_rating !== null &&
      g.admin_rating === null &&
      g.self_assessed_at !== null &&
      new Date(g.self_assessed_at).getTime() < threeDaysAgo
  );

  if (pendingGates.length > 0) {
    const unitIds = Array.from(new Set(pendingGates.map((g) => g.unit_id)));
    for (const unitId of unitIds) {
      const unit = trainingUnits.find((u) => u.id === unitId);
      const count = pendingGates.filter((g) => g.unit_id === unitId).length;
      items.push({
        type: 'pending_review',
        severity: 'action_needed',
        title: `${count} pending gate review${count > 1 ? 's' : ''}: ${unit?.title || unitId}`,
        detail: `Staff submitted self-assessments over 3 days ago. Review needed to unlock the next unit.`,
        actionLink: `/admin/training`,
      });
    }
  }

  // 4. Completion milestones: users who completed all modules in a unit
  const completedModulesByUser: Record<string, Set<string>> = {};
  for (const p of allProgress) {
    if (!p.completed) continue;
    if (!completedModulesByUser[p.user_id]) {
      completedModulesByUser[p.user_id] = new Set();
    }
    completedModulesByUser[p.user_id].add(`${p.module_id}::${p.section}`);
  }

  for (const userId of Object.keys(completedModulesByUser)) {
    const completedSet = completedModulesByUser[userId];
    for (const unit of trainingUnits) {
      const allModulesComplete = unit.moduleIds.every((mId) =>
        ['learn', 'practice', 'check'].every((s) => completedSet.has(`${mId}::${s}`))
      );
      if (allModulesComplete) {
        items.push({
          type: 'milestone',
          severity: 'info',
          title: `Unit completed: ${unit.title}`,
          detail: `User ${userId} completed all modules in ${unit.title}.`,
          userId,
          actionLink: `/admin/training`,
        });
      }
    }
  }

  return items;
}
