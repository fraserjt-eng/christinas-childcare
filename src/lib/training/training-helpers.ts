import {
  TrainingProgress,
  TrainingGateAssessment,
  TrainingGateOverride,
  TrainingUnitUnlock,
  TrainingRole,
  UnitStatus,
  ModuleStatus,
  SectionStatus,
  SectionType,
  UnitProgressInfo,
  ModuleProgressInfo,
} from '@/types/training';
import { trainingUnits, getUnitById } from './units';
import { getModulesForUnit } from './modules';
import { getModulesForRole } from './pathways';
import { getCompetenciesForUnit } from './competencies';
import { getQuestionsForModule } from './questions';

// --- Unit Status ---

export function getUnitStatus(
  unitId: string,
  role: TrainingRole,
  progress: TrainingProgress[],
  gateAssessments: TrainingGateAssessment[],
  gateOverrides: TrainingGateOverride[],
  unitUnlocks: TrainingUnitUnlock[]
): UnitStatus {
  const unit = getUnitById(unitId);
  if (!unit) return 'locked';

  // Check if role has access to this unit
  if (!unit.roles.includes(role)) return 'locked';

  // Unit 1 is always open
  if (unit.number === 1) {
    return isUnitCompleted(unitId, role, progress) ? 'completed' : 'active';
  }

  // Check admin unlock toggle
  const unlock = unitUnlocks.find(u => u.unit_id === unitId);
  if (unlock?.unlocked) {
    return isUnitCompleted(unitId, role, progress) ? 'completed' : 'active';
  }

  // Check previous unit's gate
  const prevUnit = trainingUnits.find(u => u.number === unit.number - 1);
  if (!prevUnit) return 'locked';

  // Check gate override on previous unit
  const hasOverride = gateOverrides.some(o => o.unit_id === prevUnit.id);
  if (hasOverride) {
    return isUnitCompleted(unitId, role, progress) ? 'completed' : 'active';
  }

  // Check if previous unit gate is passed
  if (isGatePassed(prevUnit.id, role, gateAssessments)) {
    return isUnitCompleted(unitId, role, progress) ? 'completed' : 'active';
  }

  return 'locked';
}

function isUnitCompleted(unitId: string, role: TrainingRole, progress: TrainingProgress[]): boolean {
  const roleModules = getModulesForRole(role);
  const unitModules = getModulesForUnit(unitId).filter(m => roleModules.includes(m.id));
  return unitModules.every(m => isModuleCompleted(m.id, progress));
}

function isModuleCompleted(moduleId: string, progress: TrainingProgress[]): boolean {
  const sections: SectionType[] = ['learn', 'practice', 'check'];
  return sections.every(s => {
    const p = progress.find(p => p.module_id === moduleId && p.section === s);
    return p?.completed === true;
  });
}

export function isGatePassed(
  unitId: string,
  role: TrainingRole,
  gateAssessments: TrainingGateAssessment[]
): boolean {
  const competencies = getCompetenciesForUnit(unitId).filter(c => c.roles.includes(role));
  if (competencies.length === 0) return true; // No competencies for this unit/role = auto-pass

  return competencies.every(c => {
    const assessment = gateAssessments.find(
      a => a.unit_id === unitId && a.competency_id === c.id
    );
    if (!assessment) return false;
    const selfOk = assessment.self_rating === 'independent' || assessment.self_rating === 'mentor';
    const adminOk = assessment.admin_rating === 'independent' || assessment.admin_rating === 'mentor';
    return selfOk && adminOk;
  });
}

// --- Module Status ---

export function getModuleStatus(
  moduleId: string,
  unitId: string,
  unitStatus: UnitStatus,
  role: TrainingRole,
  progress: TrainingProgress[]
): ModuleStatus {
  if (unitStatus === 'locked') return 'locked';

  const roleModules = getModulesForRole(role);
  if (!roleModules.includes(moduleId)) return 'locked';

  const unitModules = getModulesForUnit(unitId).filter(m => roleModules.includes(m.id));
  const moduleIndex = unitModules.findIndex(m => m.id === moduleId);

  // First module in unit: available when unit opens
  if (moduleIndex > 0) {
    const prevModule = unitModules[moduleIndex - 1];
    if (!isModuleCompleted(prevModule.id, progress)) return 'locked';
  }

  if (isModuleCompleted(moduleId, progress)) return 'completed';

  // Check if any section is started
  const hasProgress = progress.some(
    p => p.module_id === moduleId && p.completed
  );
  return hasProgress ? 'in_progress' : 'available';
}

// --- Section Status ---

export function getSectionStatus(
  sectionType: SectionType,
  moduleId: string,
  moduleStatus: ModuleStatus,
  progress: TrainingProgress[]
): SectionStatus {
  if (moduleStatus === 'locked') return 'locked';

  const isComplete = progress.find(
    p => p.module_id === moduleId && p.section === sectionType && p.completed
  );
  if (isComplete) return 'completed';

  if (sectionType === 'learn') return 'available';

  if (sectionType === 'practice') {
    const learnDone = progress.find(
      p => p.module_id === moduleId && p.section === 'learn' && p.completed
    );
    return learnDone ? 'available' : 'locked';
  }

  if (sectionType === 'check') {
    const practiceDone = progress.find(
      p => p.module_id === moduleId && p.section === 'practice' && p.completed
    );
    if (!practiceDone) return 'locked';

    // Auto-complete check for modules without knowledge check questions
    const questions = getQuestionsForModule(moduleId);
    if (questions.length === 0) return 'completed';

    return 'available';
  }

  return 'locked';
}

// --- Computed Progress Info ---

export function computeUnitProgress(
  role: TrainingRole,
  progress: TrainingProgress[],
  gateAssessments: TrainingGateAssessment[],
  gateOverrides: TrainingGateOverride[],
  unitUnlocks: TrainingUnitUnlock[]
): UnitProgressInfo[] {
  const roleModules = getModulesForRole(role);

  return trainingUnits
    .filter(unit => unit.roles.includes(role))
    .map(unit => {
      const unitModules = getModulesForUnit(unit.id).filter(m => roleModules.includes(m.id));
      const completed = unitModules.filter(m => isModuleCompleted(m.id, progress)).length;
      const total = unitModules.length;
      const status = getUnitStatus(unit.id, role, progress, gateAssessments, gateOverrides, unitUnlocks);

      return {
        unit,
        status,
        completedModules: completed,
        totalModules: total,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
}

export function computeModuleProgress(
  unitId: string,
  role: TrainingRole,
  unitStatus: UnitStatus,
  progress: TrainingProgress[]
): ModuleProgressInfo[] {
  const roleModules = getModulesForRole(role);

  return getModulesForUnit(unitId)
    .filter(m => roleModules.includes(m.id))
    .map(module => {
      const status = getModuleStatus(module.id, unitId, unitStatus, role, progress);
      return {
        module,
        status,
        sections: {
          learn: getSectionStatus('learn', module.id, status, progress),
          practice: getSectionStatus('practice', module.id, status, progress),
          check: getSectionStatus('check', module.id, status, progress),
        },
      };
    });
}
