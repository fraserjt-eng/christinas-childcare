'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrainingProgress,
  TrainingGateAssessment,
  TrainingGateOverride,
  TrainingUnitUnlock,
  TrainingRole,
  UnitProgressInfo,
  ModuleProgressInfo,
} from '@/types/training';
import {
  getUserProgress,
  getGateOverrides,
  getUnitUnlocks,
  getAllGateAssessments,
} from '@/lib/training/training-storage';
import {
  computeUnitProgress,
  computeModuleProgress,
  getUnitStatus,
} from '@/lib/training/training-helpers';

interface UseTrainingProgressReturn {
  isLoading: boolean;
  progress: TrainingProgress[];
  gateAssessments: TrainingGateAssessment[];
  gateOverrides: TrainingGateOverride[];
  unitUnlocks: TrainingUnitUnlock[];
  unitProgress: UnitProgressInfo[];
  getModuleProgress: (unitId: string) => ModuleProgressInfo[];
  refresh: () => Promise<void>;
}

export function useTrainingProgress(
  userId: string | null,
  role: TrainingRole | null
): UseTrainingProgressReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [gateAssessments, setGateAssessments] = useState<TrainingGateAssessment[]>([]);
  const [gateOverrides, setGateOverrides] = useState<TrainingGateOverride[]>([]);
  const [unitUnlocks, setUnitUnlocks] = useState<TrainingUnitUnlock[]>([]);

  const loadData = useCallback(async () => {
    if (!userId || !role) {
      setIsLoading(false);
      return;
    }

    try {
      const [prog, gates, overrides, unlocks] = await Promise.all([
        getUserProgress(userId),
        getAllGateAssessments(),
        getGateOverrides(),
        getUnitUnlocks(),
      ]);

      setProgress(prog);
      setGateAssessments(gates);
      setGateOverrides(overrides);
      setUnitUnlocks(unlocks);
    } catch (error) {
      console.error('Failed to load training progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unitProgress = role
    ? computeUnitProgress(role, progress, gateAssessments, gateOverrides, unitUnlocks)
    : [];

  const getModuleProgress = useCallback(
    (unitId: string): ModuleProgressInfo[] => {
      if (!role) return [];
      const uStatus = getUnitStatus(
        unitId,
        role,
        progress,
        gateAssessments,
        gateOverrides,
        unitUnlocks
      );
      return computeModuleProgress(unitId, role, uStatus, progress);
    },
    [role, progress, gateAssessments, gateOverrides, unitUnlocks]
  );

  return {
    isLoading,
    progress,
    gateAssessments,
    gateOverrides,
    unitUnlocks,
    unitProgress,
    getModuleProgress,
    refresh: loadData,
  };
}
