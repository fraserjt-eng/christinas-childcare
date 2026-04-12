'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { SectionTabs } from '@/components/training/SectionTabs';
import { KnowledgeCheck } from '@/components/training/KnowledgeCheck';
import { CompletionBridge } from '@/components/training/CompletionBridge';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { TrainingRole, SectionType, SectionStatus } from '@/types/training';
import { getModuleById, getNextModule } from '@/lib/training/modules';
import { getUnitById } from '@/lib/training/units';
import { getModulesForRole } from '@/lib/training/pathways';
import { getQuestionsForModule } from '@/lib/training/questions';
import { getPracticeTasksForModule } from '@/lib/training/practice-tasks';
import { getModuleContent } from '@/lib/training/content';
import { ActivityStepper } from '@/components/training/activities/ActivityStepper';
import { markSectionComplete } from '@/lib/training/training-storage';
import { getCurrentEmployee } from '@/lib/employee-storage';
import { getCurrentFamily } from '@/lib/family-storage';
import { sanitizeHTML } from '@/lib/sanitize';

export default function ModulePage() {
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<TrainingRole | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('learn');
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const trainingModule = useMemo(() => getModuleById(moduleId), [moduleId]);
  const unit = useMemo(() => trainingModule ? getUnitById(trainingModule.unitId) : null, [trainingModule]);
  const questions = useMemo(() => getQuestionsForModule(moduleId), [moduleId]);
  const practiceTasks = useMemo(() => getPracticeTasksForModule(moduleId), [moduleId]);
  const moduleContent = useMemo(() => getModuleContent(moduleId), [moduleId]);

  useEffect(() => {
    const employee = getCurrentEmployee();
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
  }, []);

  const { isLoading, refresh, getModuleProgress } = useTrainingProgress(userId, role);

  const roleModules = useMemo(() => role ? getModulesForRole(role) : [], [role]);
  const nextMod = useMemo(
    () => getNextModule(moduleId, roleModules),
    [moduleId, roleModules]
  );

  const moduleProgress = useMemo(
    () => (role && trainingModule) ? getModuleProgress(trainingModule.unitId) : [],
    [role, trainingModule, getModuleProgress]
  );

  const modInfo = useMemo(
    () => moduleProgress.find(mp => mp.module.id === moduleId),
    [moduleProgress, moduleId]
  );

  const sectionStatuses: Record<SectionType, SectionStatus> = modInfo?.sections ?? {
    learn: 'available',
    practice: 'locked',
    check: 'locked',
  };

  const allSectionsComplete =
    sectionStatuses.learn === 'completed' &&
    sectionStatuses.practice === 'completed' &&
    sectionStatuses.check === 'completed';

  const moduleIndex = roleModules.indexOf(moduleId);
  const totalInPathway = roleModules.length;

  const handleLearnComplete = useCallback(async () => {
    if (!userId) return;
    await markSectionComplete(userId, moduleId, 'learn');
    await refresh();
  }, [userId, moduleId, refresh]);

  const handleTaskToggle = useCallback(async (taskId: string) => {
    const newChecked = { ...checkedTasks, [taskId]: !checkedTasks[taskId] };
    setCheckedTasks(newChecked);

    const allDone = practiceTasks.every(t => newChecked[t.id]);
    if (allDone && userId) {
      await markSectionComplete(userId, moduleId, 'practice');
      await refresh();
    }
  }, [checkedTasks, practiceTasks, userId, moduleId, refresh]);

  const handleCheckPass = useCallback(async () => {
    if (!userId) return;
    await markSectionComplete(userId, moduleId, 'check');
    await refresh();
  }, [userId, moduleId, refresh]);

  if (!trainingModule || !unit) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Module not found.</p>
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

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Position bar */}
      <div className="flex items-center justify-between text-sm font-body">
        <div className="flex items-center gap-2">
          <Link
            href={`/training/unit/${trainingModule.unitId}`}
            className="text-gray-500 hover:text-christina-blue flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Unit {unit.number}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700">
            Module {moduleIndex + 1} of {totalInPathway}
          </span>
        </div>
        {nextMod && (
          <Link
            href={`/training/module/${nextMod.id}`}
            className="text-christina-blue hover:underline flex items-center gap-1"
          >
            Next: {nextMod.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Module header */}
      <div>
        <Badge variant="outline" className="mb-1 text-xs">
          Unit {unit.number}: {unit.title}
        </Badge>
        <h1 className="text-xl font-heading font-bold text-gray-900">{trainingModule.title}</h1>
        <p className="text-sm text-gray-500 font-body mt-1">{trainingModule.format}</p>
      </div>

      {/* Section tabs */}
      <SectionTabs
        activeSection={activeSection}
        sectionStatuses={sectionStatuses}
        onSectionChange={setActiveSection}
      />

      {/* Section content */}
      <Card>
        <CardContent className="p-4">
          {/* ========== LEARN SECTION ========== */}
          {activeSection === 'learn' && (
            <div className="space-y-6">
              {/* Activity-based learning (when activities exist) */}
              {moduleContent?.activities && moduleContent.activities.length > 0 ? (
                <ActivityStepper
                  activities={moduleContent.activities}
                  onAllComplete={handleLearnComplete}
                />
              ) : (
                <>
                  {/* Fallback: HTML content rendering for modules not yet converted */}
                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-2">Learning Outcomes</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {trainingModule.learningOutcomes.map((outcome, i) => (
                        <li key={i} className="text-sm text-gray-700 font-body">{outcome}</li>
                      ))}
                    </ul>
                  </div>

                  {moduleContent && moduleContent.learnSections.length > 0 && (
                    <div className="space-y-5">
                      {moduleContent.learnSections.map((section, i) => (
                        <div key={i} className="border-l-2 border-christina-blue/20 pl-4">
                          <h4 className="font-heading text-sm font-semibold text-gray-800 mb-2">
                            {section.title}
                          </h4>
                          <div
                            className="prose prose-sm max-w-none font-body text-gray-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_p]:mb-2 [&_strong]:text-gray-900"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content) }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {trainingModule.costImpact && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-widest text-amber-600 font-body mb-1">Why this matters</p>
                      <p className="text-sm text-gray-700 font-body">{trainingModule.costImpact}</p>
                    </div>
                  )}

                  {sectionStatuses.learn !== 'completed' && (
                    <Button
                      onClick={handleLearnComplete}
                      className="w-full bg-christina-red hover:bg-christina-red/90"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      I&apos;ve reviewed this material
                    </Button>
                  )}
                </>
              )}

              {sectionStatuses.learn === 'completed' && (
                <p className="text-sm text-christina-green font-body text-center">
                  Learn section complete. Move to Practice.
                </p>
              )}
            </div>
          )}

          {/* ========== PRACTICE SECTION ========== */}
          {activeSection === 'practice' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-body mb-2">
                Complete each task in the live platform, then check it off below.
              </p>

              {/* Portal page links for quick access */}
              {trainingModule.portalPages.length > 0 && (
                <div className="bg-blue-50/50 border border-christina-blue/20 rounded-lg p-3 mb-4">
                  <p className="text-xs font-heading font-semibold text-gray-600 mb-2">
                    Open these pages to practice:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trainingModule.portalPages.map(page => (
                      <a
                        key={page}
                        href={page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-md bg-white border border-christina-blue/30 text-christina-blue hover:bg-christina-blue hover:text-white transition-colors"
                      >
                        {page}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {practiceTasks.map(task => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Checkbox
                    checked={checkedTasks[task.id] || false}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    disabled={sectionStatuses.practice === 'completed'}
                  />
                  <span className="text-sm font-body text-gray-700">{task.text}</span>
                </label>
              ))}

              {sectionStatuses.practice === 'completed' && (
                <p className="text-sm text-christina-green font-body text-center mt-4">
                  Practice section complete. Move to Check.
                </p>
              )}
            </div>
          )}

          {/* ========== CHECK SECTION ========== */}
          {activeSection === 'check' && (
            <div>
              {questions.length > 0 ? (
                <KnowledgeCheck
                  questions={questions}
                  userId={userId}
                  onPass={handleCheckPass}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 font-body">
                    This module uses practice completion as your assessment.
                  </p>
                  {sectionStatuses.check === 'completed' && (
                    <p className="text-sm text-christina-green font-body mt-2">
                      Check section complete.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion bridge */}
      {allSectionsComplete && trainingModule.completionBridge && (
        <CompletionBridge bridgeText={trainingModule.completionBridge} />
      )}
    </div>
  );
}
