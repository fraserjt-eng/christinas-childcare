'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, Cog, Download, Shield, GraduationCap,
  AlertTriangle, Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { trainingUnits } from '@/lib/training/units';
import {
  getUnitUnlocks, toggleUnitUnlock,
  getAllProgress, getAllKnowledgeChecks,
} from '@/lib/training/training-storage';
import { TrainingUnitUnlock } from '@/types/training';

export default function SystemSettingsPage() {
  const [unlocks, setUnlocks] = useState<TrainingUnitUnlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const unl = await getUnitUnlocks();
      setUnlocks(unl);
    } catch (e) {
      console.error('Failed to load system settings:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUnitToggle = async (unitId: string, currentlyUnlocked: boolean) => {
    await toggleUnitUnlock(unitId, !currentlyUnlocked, 'superadmin');
    await loadData();
  };

  const handleExportProgress = async () => {
    const progress = await getAllProgress();
    const csv = [
      'user_id,module_id,section,completed,score,completed_at',
      ...progress.map(p =>
        `${p.user_id},${p.module_id},${p.section},${p.completed},${p.score ?? ''},${p.completed_at ?? ''}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-progress-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportChecks = async () => {
    const checks = await getAllKnowledgeChecks();
    const csv = [
      'user_id,module_id,question_id,selected_answer,correct,attempted_at',
      ...checks.map(c =>
        `${c.user_id},${c.module_id},${c.question_id},${c.selected_answer},${c.correct},${c.attempted_at}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-checks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearTrainingProgress = () => {
    if (window.confirm('Clear ALL training progress for ALL users? This cannot be undone.')) {
      localStorage.removeItem('training-progress');
      localStorage.removeItem('training-knowledge-checks');
      localStorage.removeItem('training-gate-assessments');
      localStorage.removeItem('training-gate-overrides');
      localStorage.removeItem('training-unit-unlocks');
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-christina-blue font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-christina-red/10 rounded-lg">
          <Cog className="h-6 w-6 text-christina-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">System Settings</h1>
          <p className="text-muted-foreground font-body">Superadmin controls for training, data, and system management</p>
        </div>
      </div>

      {/* Training Unit Unlocks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-christina-blue" />
            Training Unit Unlocks
          </CardTitle>
          <p className="text-sm text-gray-500 font-body">
            Toggle units open for all users, bypassing completion gates.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {trainingUnits.map(unit => {
            const unlock = unlocks.find(u => u.unit_id === unit.id);
            const isUnlocked = unlock?.unlocked || false;

            return (
              <div key={unit.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-heading font-semibold">Unit {unit.number}: {unit.title}</p>
                  <p className="text-xs text-gray-500 font-body">{unit.moduleIds.length} modules</p>
                </div>
                <div className="flex items-center gap-2">
                  {isUnlocked && <Badge className="bg-christina-green/10 text-christina-green text-xs">Unlocked</Badge>}
                  <Switch
                    checked={isUnlocked}
                    onCheckedChange={() => handleUnitToggle(unit.id, isUnlocked)}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Download className="h-5 w-5 text-christina-blue" />
            Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={handleExportProgress}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Training Progress (CSV)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={handleExportChecks}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Knowledge Check Answers (CSV)
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-christina-coral/30">
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2 text-christina-coral">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm font-heading font-semibold text-red-800">Clear All Training Progress</p>
              <p className="text-xs text-red-600 font-body">Removes all progress, quiz answers, gate assessments, and unlocks from localStorage</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-christina-coral text-christina-coral hover:bg-christina-coral hover:text-white"
              onClick={handleClearTrainingProgress}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auth info */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-heading font-semibold text-gray-700">Superadmin Access</p>
              <p className="text-xs text-gray-500 font-body mt-1">
                This page is only visible to superadmin accounts. Superadmin status is determined by email address and cannot be changed through the UI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
