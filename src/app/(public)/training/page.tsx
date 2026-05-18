'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { PathStrip } from '@/components/training/PathStrip';
import { ModuleCard } from '@/components/training/ModuleCard';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { TrainingRole } from '@/types/training';
import { pathwayInfo, getModulesForRole } from '@/lib/training/pathways';
import { getSessionEmployee } from '@/lib/session-employee';
import { getCurrentFamily } from '@/lib/family-storage';

export default function TrainingHomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<TrainingRole | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    (async () => {
    const employee = await getSessionEmployee();
    if (employee) {
      setUserId(employee.id);
      setUserName(employee.first_name || 'there');
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
      const parentName = family.parents?.[0]?.name?.split(' ')[0];
      setUserName(parentName || 'there');
      setRole('parent');
      return;
    }

    // Default to teacher if no auth context (demo mode)
    setUserId('demo-user');
    setRole('teacher');
    setUserName('there');
    })();
  }, []);

  const { isLoading, unitProgress, getModuleProgress } = useTrainingProgress(userId, role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
      </div>
    );
  }

  const info = role ? pathwayInfo[role] : null;
  const totalModules = role ? getModulesForRole(role).length : 0;
  const completedModules = unitProgress.reduce((sum, u) => sum + u.completedModules, 0);
  const activeUnit = unitProgress.find(u => u.status === 'active');
  const activeModuleProgress = activeUnit ? getModuleProgress(activeUnit.unit.id) : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-christina-red" />
          <p className="text-xs uppercase tracking-widest text-gray-500 font-body">
            Learning and Development Path
          </p>
        </div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Welcome back, {userName}
        </h1>
        {info && (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {info.name} pathway
            </Badge>
            <span className="text-sm text-gray-500 font-body">
              {totalModules} modules &middot; {completedModules} of {totalModules} complete
            </span>
          </div>
        )}
      </div>

      {/* Path Strip */}
      <PathStrip unitProgress={unitProgress} />

      {/* Active Unit Inline Preview */}
      {activeUnit && activeModuleProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-heading">
              Unit {activeUnit.unit.number}: {activeUnit.unit.title}
            </CardTitle>
            <p className="text-sm text-gray-500 font-body">
              {activeUnit.unit.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeModuleProgress.map(mp => (
                <ModuleCard key={mp.module.id} info={mp} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All completed message */}
      {!activeUnit && completedModules > 0 && completedModules === totalModules && (
        <Card className="border-christina-green/30 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <GraduationCap className="h-12 w-12 text-christina-green mx-auto mb-3" />
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">
              Training Complete
            </h2>
            <p className="text-sm text-gray-600 font-body">
              You have completed all {totalModules} modules in your pathway. Great work.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
