'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Target } from 'lucide-react';
import Link from 'next/link';
import { PathStrip } from '@/components/training/PathStrip';
import { ModuleCard } from '@/components/training/ModuleCard';
import { CarryoverStrip } from '@/components/training/CarryoverStrip';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { TrainingRole } from '@/types/training';
import { getUnitById } from '@/lib/training/units';
import { getCurrentEmployee } from '@/lib/employee-storage';
import { getCurrentFamily } from '@/lib/family-storage';

export default function UnitHubPage() {
  const params = useParams();
  const unitId = params.unitId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<TrainingRole | null>(null);

  const unit = useMemo(() => getUnitById(unitId), [unitId]);

  useEffect(() => {
    const employee = getCurrentEmployee();
    if (employee) {
      setUserId(employee.id);
      const jobTitle = (employee.job_title || '').toLowerCase();
      if (jobTitle.includes('owner') || jobTitle.includes('director')) {
        setRole('owner');
      } else if (jobTitle.includes('lead')) {
        setRole('admin');
      } else {
        setRole('teacher');
      }
      return;
    }
    const family = getCurrentFamily();
    if (family) {
      setUserId(family.id);
      setRole('parent');
      return;
    }
    setUserId('demo-user');
    setRole('teacher');
  }, []);

  const { isLoading, unitProgress, getModuleProgress } = useTrainingProgress(userId, role);

  const moduleProgress = useMemo(
    () => getModuleProgress(unitId),
    [getModuleProgress, unitId]
  );
  const unitInfo = useMemo(
    () => unitProgress.find(u => u.unit.id === unitId),
    [unitProgress, unitId]
  );
  const allModulesComplete = unitInfo && unitInfo.completedModules === unitInfo.totalModules;

  if (!unit) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Unit not found.</p>
        <Link href="/training" className="text-christina-blue hover:underline text-sm">
          Back to training
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Compact path strip */}
      <PathStrip unitProgress={unitProgress} compact />

      {/* Back link */}
      <Link
        href="/training"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-christina-blue font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to training
      </Link>

      {/* Unit banner */}
      <Card className="border-l-4 border-l-christina-coral">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-1 text-xs">
                Unit {unit.number}
              </Badge>
              <CardTitle className="text-xl font-heading">{unit.title}</CardTitle>
            </div>
            {unitInfo && (
              <span className="text-sm text-gray-500 font-body">
                {unitInfo.completedModules}/{unitInfo.totalModules} complete
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 font-body">{unit.description}</p>
        </CardHeader>
      </Card>

      {/* Carryover strip */}
      <CarryoverStrip unitNumber={unit.number} />

      {/* Module card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {moduleProgress.map(mp => (
          <ModuleCard key={mp.module.id} info={mp} />
        ))}
      </div>

      {/* Gate button */}
      {allModulesComplete && (
        <div className="pt-4">
          <Link href={`/training/gate/${unitId}`}>
            <Button className="w-full bg-christina-red hover:bg-christina-red/90">
              <Target className="h-4 w-4 mr-2" />
              Take Unit Assessment
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
