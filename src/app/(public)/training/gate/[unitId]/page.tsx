'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Target, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { CompletionGate } from '@/components/training/CompletionGate';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { TrainingRole, CompetencyLevel } from '@/types/training';
import { getUnitById } from '@/lib/training/units';
import { getCompetenciesForUnit } from '@/lib/training/competencies';
import { saveGateAssessment } from '@/lib/training/training-storage';
import { isGatePassed } from '@/lib/training/training-helpers';
import { getSessionEmployee } from '@/lib/session-employee';
import { getCurrentFamily } from '@/lib/family-storage';

export default function GatePage() {
  const params = useParams();
  const unitId = params.unitId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<TrainingRole | null>(null);

  const unit = useMemo(() => getUnitById(unitId), [unitId]);
  const competencies = useMemo(() => getCompetenciesForUnit(unitId), [unitId]);

  useEffect(() => {
    (async () => {
      const employee = await getSessionEmployee();
      if (employee) {
        setUserId(employee.id);
        const jobTitle = (employee.job_title || '').toLowerCase();
        if (jobTitle.includes('owner') || jobTitle.includes('director')) setRole('owner');
        else if (jobTitle.includes('lead')) setRole('admin');
        else setRole('teacher');
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
    })();
  }, []);

  const { isLoading, gateAssessments, refresh } = useTrainingProgress(userId, role);

  const unitAssessments = useMemo(
    () => gateAssessments.filter(a => a.unit_id === unitId && a.user_id === userId),
    [gateAssessments, unitId, userId]
  );

  const gatePassed = useMemo(
    () => role ? isGatePassed(unitId, role, unitAssessments) : false,
    [unitId, role, unitAssessments]
  );

  const relevantCompetencies = useMemo(
    () => competencies.filter(c => role && c.roles.includes(role)),
    [competencies, role]
  );

  const guidedItems = useMemo(
    () => relevantCompetencies.filter(c => {
      const a = unitAssessments.find(a => a.competency_id === c.id);
      return a?.self_rating === 'guided';
    }),
    [relevantCompetencies, unitAssessments]
  );

  const handleSelfRate = useCallback(async (competencyId: string, rating: CompetencyLevel) => {
    if (!userId) return;
    await saveGateAssessment(userId, unitId, competencyId, rating);
    await refresh();
  }, [userId, unitId, refresh]);

  if (!unit) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Unit not found.</p>
        <Link href="/training" className="text-christina-blue hover:underline text-sm">Back to training</Link>
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

  const nextUnitNumber = unit.number + 1;

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Back link */}
      <Link
        href={`/training/unit/${unitId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-christina-blue font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Unit {unit.number}
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-5 w-5 text-christina-red" />
          <Badge variant="outline" className="text-xs">Unit {unit.number}</Badge>
        </div>
        <h1 className="text-xl font-heading font-bold text-gray-900">
          Unit {unit.number} Completion Gate
        </h1>
        <p className="text-sm text-gray-500 font-body mt-1">
          Rate yourself on each competency. All items must reach &quot;independent&quot; to unlock the next unit.
        </p>
      </div>

      {/* Gate status */}
      {gatePassed && (
        <Card className="border-christina-green/30 bg-green-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-6 w-6 text-christina-green" />
            <div>
              <p className="text-sm font-heading font-bold text-green-800">
                Passed! Unit {nextUnitNumber} is now unlocked.
              </p>
              <Link
                href={`/training/unit/unit-${nextUnitNumber}`}
                className="text-sm text-christina-blue hover:underline font-body"
              >
                Continue to Unit {nextUnitNumber}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {guidedItems.length > 0 && !gatePassed && (
        <Card className="border-christina-coral/30 bg-orange-50/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-christina-coral mt-0.5" />
            <div>
              <p className="text-sm font-heading font-semibold text-orange-800">
                These competencies need more practice:
              </p>
              <ul className="text-sm text-gray-600 font-body mt-1 list-disc pl-5">
                {guidedItems.map(c => (
                  <li key={c.id}>{c.title}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 font-body mt-2">
                Re-assess when ready. Admin confirmation is also required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competency grid */}
      <div>
        <h2 className="text-sm font-heading font-semibold text-gray-700 mb-2">
          Competency Assessment
        </h2>
        <div className="text-xs text-gray-400 font-body mb-3 flex items-center gap-4">
          <span>Self-rating</span>
          <span>Admin rating</span>
        </div>
        {role && (
          <CompletionGate
            competencies={competencies}
            assessments={unitAssessments}
            onSelfRate={handleSelfRate}
            role={role}
          />
        )}
      </div>
    </div>
  );
}
