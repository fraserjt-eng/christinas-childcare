'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GraduationCap, Users, Download, BarChart3, AlertTriangle,
  Shield,
} from 'lucide-react';
import {
  getAllProgress, getAllKnowledgeChecks, getAllGateAssessments,
  getGateOverrides, getUnitUnlocks, toggleUnitUnlock,
  saveAdminRating, saveGateOverride,
} from '@/lib/training/training-storage';
import {
  TrainingProgress, TrainingKnowledgeCheck, TrainingGateAssessment,
  TrainingGateOverride, TrainingUnitUnlock, CompetencyLevel,
} from '@/types/training';
import { trainingUnits } from '@/lib/training/units';
import { getModulesForUnit } from '@/lib/training/modules';
import { getCompetenciesForUnit } from '@/lib/training/competencies';
import { cn } from '@/lib/utils';

export default function AdminTrainingPage() {
  const [allProgress, setAllProgress] = useState<TrainingProgress[]>([]);
  const [allChecks, setAllChecks] = useState<TrainingKnowledgeCheck[]>([]);
  const [allAssessments, setAllAssessments] = useState<TrainingGateAssessment[]>([]);
  const [overrides, setOverrides] = useState<TrainingGateOverride[]>([]);
  const [unlocks, setUnlocks] = useState<TrainingUnitUnlock[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeUnitTab, setActiveUnitTab] = useState('unit-1');
  const [isLoading, setIsLoading] = useState(true);
  const [overrideReason, setOverrideReason] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [prog, checks, assessments, ovr, unl] = await Promise.all([
        getAllProgress(),
        getAllKnowledgeChecks(),
        getAllGateAssessments(),
        getGateOverrides(),
        getUnitUnlocks(),
      ]);
      setAllProgress(prog);
      setAllChecks(checks);
      setAllAssessments(assessments);
      setOverrides(ovr);
      setUnlocks(unl);
    } catch (e) {
      console.error('Failed to load admin training data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Unique users who have progress
  const userIds = Array.from(new Set(allProgress.map(p => p.user_id)));

  // Stats
  const totalLearners = userIds.length;
  const totalModuleCompletions = allProgress.filter(p => p.completed && p.section === 'check').length;
  const overallRate = totalLearners > 0
    ? Math.round((totalModuleCompletions / (totalLearners * 30)) * 100)
    : 0;

  // Unit-level stats
  const unitModules = getModulesForUnit(activeUnitTab);

  const handleUnitUnlockToggle = async (unitId: string, currentlyUnlocked: boolean) => {
    await toggleUnitUnlock(unitId, !currentlyUnlocked, 'admin');
    await loadData();
  };

  const handleAdminRate = async (userId: string, unitId: string, competencyId: string, rating: CompetencyLevel) => {
    await saveAdminRating(userId, unitId, competencyId, rating);
    await loadData();
  };

  const handleOverride = async (userId: string, unitId: string) => {
    if (!overrideReason.trim()) return;
    await saveGateOverride(userId, unitId, 'admin', overrideReason);
    setOverrideReason('');
    await loadData();
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="h-6 w-6 text-christina-red" />
          <h1 className="text-2xl font-heading font-bold">Training Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] gap-4">
          {/* LEFT COLUMN: Staff list + Pathway controls */}
          <div className="space-y-4">
            {/* Staff list */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Learners ({totalLearners})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {userIds.length === 0 ? (
                  <p className="text-xs text-gray-400 font-body">No learners yet</p>
                ) : (
                  userIds.map(uid => {
                    const userProgress = allProgress.filter(p => p.user_id === uid);
                    const completed = userProgress.filter(p => p.completed && p.section === 'check').length;
                    const percent = Math.round((completed / 30) * 100);

                    return (
                      <button
                        key={uid}
                        onClick={() => setSelectedUser(uid === selectedUser ? null : uid)}
                        className={cn(
                          'w-full text-left p-2 rounded-lg text-sm transition-all',
                          selectedUser === uid
                            ? 'bg-christina-blue/10 border border-christina-blue/20'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-christina-blue/20 flex items-center justify-center text-xs font-bold text-christina-blue">
                            {uid.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-heading font-semibold truncate">{uid.slice(0, 12)}</p>
                            <p className="text-[10px] text-gray-400">{percent}% complete</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Unit unlock toggles */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Unit Unlocks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trainingUnits.map(unit => {
                  const unlock = unlocks.find(u => u.unit_id === unit.id);
                  const isUnlocked = unlock?.unlocked || false;

                  return (
                    <div key={unit.id} className="flex items-center justify-between">
                      <span className="text-xs font-body">Unit {unit.number}</span>
                      <Switch
                        checked={isUnlocked}
                        onCheckedChange={() => handleUnitUnlockToggle(unit.id, isUnlocked)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* CENTER COLUMN: Unit tabs + module progress */}
          <div className="space-y-4">
            {/* Unit tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {trainingUnits.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => setActiveUnitTab(unit.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-heading font-semibold rounded-lg whitespace-nowrap transition-all',
                    activeUnitTab === unit.id
                      ? 'bg-christina-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Unit {unit.number}
                </button>
              ))}
            </div>

            {/* Module cards */}
            <div className="space-y-3">
              {unitModules.map(module => {
                const moduleCompletions = allProgress.filter(
                  p => p.module_id === module.id && p.section === 'check' && p.completed
                );
                const moduleStarters = allProgress.filter(
                  p => p.module_id === module.id && p.section === 'learn' && p.completed
                );
                const stuck = moduleStarters.filter(
                  s => !moduleCompletions.some(c => c.user_id === s.user_id)
                );

                const moduleChecks = allChecks.filter(c => c.module_id === module.id);
                const firstAttemptCorrect = moduleChecks.filter(c => c.correct).length;
                const totalAttempts = moduleChecks.length;
                const passRate = totalAttempts > 0 ? Math.round((firstAttemptCorrect / totalAttempts) * 100) : 0;

                return (
                  <Card key={module.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs text-gray-400 font-mono">M{String(module.number).padStart(2, '0')}</span>
                          <h3 className="text-sm font-heading font-semibold">{module.title}</h3>
                        </div>
                        <span className="text-sm font-heading font-bold">
                          {moduleCompletions.length}/{totalLearners}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-christina-green rounded-full"
                          style={{
                            width: `${totalLearners > 0 ? (moduleCompletions.length / totalLearners) * 100 : 0}%`
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 font-body">
                        {module.hasKnowledgeCheck && (
                          <span>Pass rate: {passRate}%</span>
                        )}
                        {stuck.length > 0 && (
                          <span className="flex items-center gap-1 text-christina-coral">
                            <AlertTriangle className="h-3 w-3" />
                            {stuck.length} stuck
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Gate management for selected user */}
            {selectedUser && (
              <Card className="border-christina-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading">
                    Gate Assessment: {selectedUser.slice(0, 12)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getCompetenciesForUnit(activeUnitTab).map(comp => {
                    const assessment = allAssessments.find(
                      a => a.user_id === selectedUser && a.unit_id === activeUnitTab && a.competency_id === comp.id
                    );

                    return (
                      <div key={comp.id} className="flex items-center justify-between gap-2 py-1">
                        <span className="text-xs font-body flex-1 truncate">{comp.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            Self: {assessment?.self_rating || 'none'}
                          </Badge>
                          <Select
                            value={assessment?.admin_rating || ''}
                            onValueChange={(v) => handleAdminRate(selectedUser, activeUnitTab, comp.id, v as CompetencyLevel)}
                          >
                            <SelectTrigger className="h-7 w-28 text-xs">
                              <SelectValue placeholder="Rate" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="guided">Guided</SelectItem>
                              <SelectItem value="independent">Independent</SelectItem>
                              <SelectItem value="mentor">Mentor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}

                  {/* Override button */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Override reason..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="flex-1 text-xs border rounded-lg px-2 py-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOverride(selectedUser, activeUnitTab)}
                        disabled={!overrideReason.trim()}
                        className="text-xs"
                      >
                        Override Gate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Stats + Export */}
          <div className="space-y-4">
            {/* Quick stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-heading font-bold">{totalLearners}</p>
                  <p className="text-xs text-gray-500 font-body">Total learners</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{overallRate}%</p>
                  <p className="text-xs text-gray-500 font-body">Overall completion</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{overrides.length}</p>
                  <p className="text-xs text-gray-500 font-body">Gate overrides</p>
                </div>
              </CardContent>
            </Card>

            {/* Gate override log */}
            {overrides.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading">Override Log</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overrides.slice(0, 5).map(ovr => (
                    <div key={ovr.id} className="text-xs font-body border-b border-gray-50 pb-1">
                      <p className="font-semibold">{ovr.unit_id}</p>
                      <p className="text-gray-500">User: {ovr.user_id.slice(0, 8)}</p>
                      {ovr.reason && <p className="text-gray-400 italic">{ovr.reason}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Export buttons */}
            <Card>
              <CardContent className="p-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => exportCSV(
                    allProgress.map(p => ({ ...p } as unknown as Record<string, unknown>)),
                    'training-progress.csv'
                  )}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Progress (CSV)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => exportCSV(
                    allAssessments.map(a => ({ ...a } as unknown as Record<string, unknown>)),
                    'competency-ratings.csv'
                  )}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Ratings (CSV)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
