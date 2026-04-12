'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain, RefreshCw, GraduationCap, Users, UtensilsCrossed,
  TrendingUp, Sparkles
} from 'lucide-react';
import { TrainingDigestCard, StaffingAlertCard } from '@/components/admin/IntelligenceDigest';
import { RecommendationCard } from '@/components/admin/RecommendationCard';
import { DecisionDialog } from '@/components/admin/DecisionDialog';
import { DecisionLog } from '@/components/admin/DecisionLog';
import { LearnedPreferences, LearnedData } from '@/components/admin/LearnedPreferences';
import { TrainingDigestItem, StaffingAlert, AIRecommendation, RecommendationDecision, BehavioralPattern, CrossDayAnomaly } from '@/lib/intelligence/types';
import { runTrainingScan } from '@/lib/intelligence/training-scan';
import { runStaffingScan } from '@/lib/intelligence/staffing-scan';
import { detectBehavioralPatterns } from '@/lib/intelligence/behavioral-scan';
import { detectCrossDayAnomalies } from '@/lib/intelligence/cross-day-scan';
import { getPendingActionPlans, getUpcomingRechecks, updateActionPlanStatus, completeRecheck } from '@/lib/intelligence/action-plan-storage';
import { ActionPlanDialog } from '@/components/admin/ActionPlanDialog';
import type { ActionPlan, RecheckItem } from '@/lib/intelligence/types';
import {
  getRecommendations,
  saveRecommendations,
  getDecisions,
  saveDecision,
} from '@/lib/intelligence/recommendation-storage';
import { getAllProgress } from '@/lib/training/training-storage';
import { getEmployees } from '@/lib/employee-storage';
import { getFoodCounts } from '@/lib/food-storage';
import { getLeads } from '@/lib/enrollment-pipeline-storage';

export default function IntelligencePage() {
  const [trainingItems, setTrainingItems] = useState<TrainingDigestItem[]>([]);
  const [staffingAlerts, setStaffingAlerts] = useState<StaffingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Recommendations
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [decisions, setDecisions] = useState<RecommendationDecision[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Learned preferences
  const [learned, setLearned] = useState<LearnedData | null>(null);
  const [learnedLoading, setLearnedLoading] = useState(false);

  // Behavioral patterns & cross-day anomalies (Phase 3)
  const [behavioralPatterns, setBehavioralPatterns] = useState<BehavioralPattern[]>([]);
  const [crossDayAnomalies, setCrossDayAnomalies] = useState<CrossDayAnomaly[]>([]);

  // Action plans & rechecks (Phase 4)
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [rechecks, setRechecks] = useState<RecheckItem[]>([]);
  const [actionPlanDialog, setActionPlanDialog] = useState<{
    open: boolean;
    recId: string;
    recTitle: string;
  }>({ open: false, recId: '', recTitle: '' });

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'approve' | 'deny';
    recId: string;
    recTitle: string;
  }>({ open: false, mode: 'approve', recId: '', recTitle: '' });

  // Quick stats
  const [stats, setStats] = useState({
    totalProgress: 0,
    activeStaff: 0,
    mealCountsThisWeek: 0,
    pipelineLeads: 0,
  });

  const runScan = useCallback(async () => {
    setLoading(true);
    try {
      const [training, staffing] = await Promise.all([
        runTrainingScan(),
        runStaffingScan(),
      ]);
      setTrainingItems(training);
      setStaffingAlerts(staffing);
      setLastScan(new Date().toLocaleTimeString());

      const [progress, employees, foods, leads] = await Promise.all([
        getAllProgress(),
        getEmployees(),
        getFoodCounts(),
        getLeads(),
      ]);

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      setStats({
        totalProgress: progress.filter((p) => p.completed).length,
        activeStaff: employees.filter((e) => e.employment_status === 'active').length,
        mealCountsThisWeek: foods.filter((f) => f.date >= weekStartStr).length,
        pipelineLeads: leads.filter((l) => l.stage !== 'enrolled' && l.stage !== 'active').length,
      });

      // Phase 3: Behavioral patterns + cross-day anomalies
      const [patterns, anomalies] = await Promise.all([
        detectBehavioralPatterns(),
        detectCrossDayAnomalies(),
      ]);
      setBehavioralPatterns(patterns);
      setCrossDayAnomalies(anomalies);

      // Phase 4: Load action plans and rechecks
      setActionPlans(getPendingActionPlans());
      setRechecks(getUpcomingRechecks());

      // Clear pending recommendations on rescan (keep decisions)
      const existingRecs = await getRecommendations();
      const decidedRecs = existingRecs.filter((r) => r.status !== 'pending');
      setRecommendations(decidedRecs);
      if (decidedRecs.length !== existingRecs.length) {
        await saveRecommendations(decidedRecs);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function fetchLearned(decisionList: RecommendationDecision[]) {
    if (decisionList.length < 3) {
      setLearned({
        preferences: [],
        avoids: [],
        summary: 'Not enough decisions yet to identify patterns. Approve or deny at least 3 recommendations to teach the system.',
      });
      return;
    }
    setLearnedLoading(true);
    try {
      const res = await fetch('/api/intelligence/learned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions: decisionList }),
      });
      if (res.ok) {
        const data = await res.json();
        setLearned(data.learned);
      }
    } catch {
      // silently fail; learned preferences are non-critical
    } finally {
      setLearnedLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      await runScan();
      const [savedRecs, savedDecisions] = await Promise.all([
        getRecommendations(),
        getDecisions(),
      ]);
      if (savedRecs.length > 0) setRecommendations(savedRecs);
      setDecisions(savedDecisions);
      fetchLearned(savedDecisions);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerateRecs() {
    setRecLoading(true);
    setRecError(null);
    try {
      const res = await fetch('/api/intelligence/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingItems, staffingAlerts, stats, pastDecisions: decisions }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate recommendations');
      }

      const data = await res.json();
      const newRecs: AIRecommendation[] = data.recommendations || [];
      setRecommendations(newRecs);
      await saveRecommendations(newRecs);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setRecLoading(false);
    }
  }

  function handleApproveClick(id: string) {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec) return;
    setDialogState({ open: true, mode: 'approve', recId: id, recTitle: rec.title });
  }

  function handleDenyClick(id: string) {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec) return;
    setDialogState({ open: true, mode: 'deny', recId: id, recTitle: rec.title });
  }

  async function handleDecisionConfirm(reason: string) {
    const { recId, recTitle, mode } = dialogState;
    const decision: RecommendationDecision = {
      id: crypto.randomUUID(),
      recommendationId: recId,
      recommendationTitle: recTitle,
      decision: mode === 'approve' ? 'approved' : 'denied',
      reason: reason || null,
      decidedBy: 'admin',
      decidedAt: new Date().toISOString(),
    };

    await saveDecision(decision);

    // Update local state
    const updatedDecisions = [decision, ...decisions];
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: decision.decision } : r))
    );
    setDecisions(updatedDecisions);
    setDialogState({ open: false, mode: 'approve', recId: '', recTitle: '' });

    // Refresh learned preferences after decision
    fetchLearned(updatedDecisions);
  }

  const actionNeededCount =
    trainingItems.filter((t) => t.severity === 'action_needed').length +
    staffingAlerts.filter((a) => a.severity === 'action_needed').length;
  const warningCount =
    trainingItems.filter((t) => t.severity === 'warning').length +
    staffingAlerts.filter((a) => a.severity === 'warning').length;
  const pendingRecs = recommendations.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-blue/10 rounded-lg">
            <Brain className="h-6 w-6 text-christina-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Intelligence</h1>
            <p className="text-sm text-muted-foreground font-body">
              Automated scan of training, staffing, and operations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="text-xs text-muted-foreground font-body">
              Last scan: {lastScan}
            </span>
          )}
          <Button asChild variant="outline" size="sm">
            <a href="/admin/research">
              <Brain className="h-4 w-4 mr-2" />
              Research Inbox
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runScan}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Rescan'}
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateRecs}
            disabled={loading || recLoading || (trainingItems.length === 0 && staffingAlerts.length === 0)}
            className="bg-christina-blue hover:bg-christina-blue/90"
          >
            <Sparkles className={`h-4 w-4 mr-2 ${recLoading ? 'animate-spin' : ''}`} />
            {recLoading ? 'Generating...' : 'Generate Recommendations'}
          </Button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        {actionNeededCount > 0 && (
          <Badge className="bg-christina-coral/10 text-christina-coral border-0 text-sm py-1 px-3">
            {actionNeededCount} action{actionNeededCount > 1 ? 's' : ''} needed
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge className="bg-christina-yellow/10 text-christina-yellow border-0 text-sm py-1 px-3">
            {warningCount} warning{warningCount > 1 ? 's' : ''}
          </Badge>
        )}
        {pendingRecs > 0 && (
          <Badge className="bg-christina-blue/10 text-christina-blue border-0 text-sm py-1 px-3">
            {pendingRecs} recommendation{pendingRecs > 1 ? 's' : ''} pending
          </Badge>
        )}
        {actionNeededCount === 0 && warningCount === 0 && pendingRecs === 0 && !loading && (
          <Badge className="bg-christina-green/10 text-christina-green border-0 text-sm py-1 px-3">
            All clear
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-christina-blue" />
              <div>
                <p className="text-2xl font-bold">{stats.totalProgress}</p>
                <p className="text-xs text-muted-foreground font-body">Sections completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-christina-green" />
              <div>
                <p className="text-2xl font-bold">{stats.activeStaff}</p>
                <p className="text-xs text-muted-foreground font-body">Active staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-5 w-5 text-christina-coral" />
              <div>
                <p className="text-2xl font-bold">{stats.mealCountsThisWeek}</p>
                <p className="text-xs text-muted-foreground font-body">Meal counts this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-christina-yellow" />
              <div>
                <p className="text-2xl font-bold">{stats.pipelineLeads}</p>
                <p className="text-xs text-muted-foreground font-body">Active pipeline leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {(recommendations.length > 0 || recError) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-christina-blue" />
            <h2 className="text-lg font-semibold font-heading">AI Recommendations</h2>
          </div>
          {recError && (
            <Card className="border-christina-coral/30">
              <CardContent className="py-4 text-sm text-christina-coral font-body">
                {recError}
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onApprove={handleApproveClick}
                onDeny={handleDenyClick}
                onRespond={(id, title) => setActionPlanDialog({ open: true, recId: id, recTitle: title })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Learned Preferences */}
      <LearnedPreferences
        learned={learned}
        loading={learnedLoading}
        decisionCount={decisions.length}
      />

      {/* Training Digest */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-5 w-5 text-christina-blue" />
          <h2 className="text-lg font-semibold font-heading">Training Digest</h2>
        </div>
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground font-body">
              Scanning training data...
            </CardContent>
          </Card>
        ) : (
          <TrainingDigestCard items={trainingItems} />
        )}
      </div>

      {/* Staffing Alerts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-christina-coral" />
          <h2 className="text-lg font-semibold font-heading">Staffing & Operations</h2>
        </div>
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground font-body">
              Scanning staffing data...
            </CardContent>
          </Card>
        ) : (
          <StaffingAlertCard alerts={staffingAlerts} />
        )}
      </div>

      {/* Behavioral Patterns (Phase 3) */}
      {behavioralPatterns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-christina-coral/10 text-christina-coral border-0">New</Badge>
            <h2 className="text-lg font-semibold font-heading">Behavioral Patterns</h2>
          </div>
          <div className="space-y-3">
            {behavioralPatterns.map((pattern, i) => (
              <Card key={i} className="border-christina-coral/20">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{pattern.childName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pattern.incidentCount} incident{pattern.incidentCount !== 1 ? 's' : ''} in 30 days
                        {' '}
                        <Badge variant="outline" className="text-xs ml-1">
                          {pattern.pattern.replace(/_/g, ' ')}
                        </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{pattern.recommendation}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionPlanDialog({
                        open: true,
                        recId: `behavioral_${pattern.childName}`,
                        recTitle: `Behavioral pattern: ${pattern.childName}`,
                      })}
                    >
                      Respond
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Day Anomalies (Phase 3) */}
      {crossDayAnomalies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-christina-yellow/10 text-christina-yellow border-0">New</Badge>
            <h2 className="text-lg font-semibold font-heading">Cross-Day Patterns</h2>
          </div>
          <div className="space-y-3">
            {crossDayAnomalies.map((anomaly, i) => (
              <Card key={i} className={anomaly.severity === 'action_needed' ? 'border-christina-coral/20' : 'border-christina-yellow/20'}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{anomaly.metric}: {anomaly.todayValue} today vs {anomaly.averageValue} avg</p>
                      <p className="text-sm text-muted-foreground mt-1">{anomaly.description}</p>
                    </div>
                    <Badge variant={anomaly.severity === 'action_needed' ? 'destructive' : 'secondary'}>
                      {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action Plans (Phase 4: Recovery Architecture) */}
      {actionPlans.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold font-heading">Active Action Plans</h2>
            <Badge variant="secondary">{actionPlans.length}</Badge>
          </div>
          <div className="space-y-3">
            {actionPlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{plan.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned to: {plan.assignedTo} | Due: {new Date(plan.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {plan.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => {
                          updateActionPlanStatus(plan.id, 'in_progress');
                          setActionPlans(getPendingActionPlans());
                        }}>
                          Start
                        </Button>
                      )}
                      {(plan.status === 'pending' || plan.status === 'in_progress') && (
                        <Button size="sm" onClick={() => {
                          updateActionPlanStatus(plan.id, 'completed');
                          setActionPlans(getPendingActionPlans());
                          setRechecks(getUpcomingRechecks());
                        }}>
                          Complete
                        </Button>
                      )}
                      <Badge variant={plan.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Re-checks (Phase 4: Inspection Practice) */}
      {rechecks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold font-heading">Pending Re-checks</h2>
            <Badge className="bg-christina-yellow text-black">{rechecks.length}</Badge>
          </div>
          <div className="space-y-3">
            {rechecks.map((recheck) => (
              <Card key={recheck.id} className="border-christina-yellow/20">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{recheck.originalFinding}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Re-check due: {new Date(recheck.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        completeRecheck(recheck.id, 'resolved');
                        setRechecks(getUpcomingRechecks());
                      }}>
                        Resolved
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        completeRecheck(recheck.id, 'persists');
                        setRechecks(getUpcomingRechecks());
                      }}>
                        Still Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Decision Log */}
      <DecisionLog decisions={decisions} />

      {/* Decision Dialog */}
      <DecisionDialog
        open={dialogState.open}
        onClose={() => setDialogState({ ...dialogState, open: false })}
        onConfirm={handleDecisionConfirm}
        mode={dialogState.mode}
        recommendationTitle={dialogState.recTitle}
      />

      {/* Action Plan Dialog (Phase 4) */}
      <ActionPlanDialog
        open={actionPlanDialog.open}
        onOpenChange={(open) => setActionPlanDialog({ ...actionPlanDialog, open })}
        recommendationId={actionPlanDialog.recId}
        recommendationTitle={actionPlanDialog.recTitle}
        onCreated={() => setActionPlans(getPendingActionPlans())}
      />
    </div>
  );
}
