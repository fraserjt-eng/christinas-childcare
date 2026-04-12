'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  X,
  AlertTriangle,
  Lightbulb,
  Info,
  ClipboardList,
  Undo2,
} from 'lucide-react';
import {
  getAllFindings,
  updateFindingStatus,
  ResearchFinding,
} from '@/lib/intelligence/research-findings-storage';
import { ActionPlanDialog } from '@/components/admin/ActionPlanDialog';

const SEVERITY_META = {
  risk: {
    label: 'Risk',
    icon: AlertTriangle,
    class: 'bg-christina-coral/10 text-christina-coral border-christina-coral/30',
  },
  opportunity: {
    label: 'Opportunity',
    icon: Lightbulb,
    class: 'bg-christina-yellow/10 text-yellow-700 border-christina-yellow/40',
  },
  info: {
    label: 'Info',
    icon: Info,
    class: 'bg-christina-blue/10 text-christina-blue border-christina-blue/30',
  },
} as const;

const FRAMEWORK_LABELS: Record<string, string> = {
  four_friction_types: 'Four Friction Types',
  feedback_conductance: 'Feedback Conductance',
  recovery_based_accountability: 'Recovery-Based Accountability',
  high_warmth_high_structure: 'High Warmth + High Structure',
  equity_typologies: 'Equity Typologies',
  operational: 'Operational',
  compliance: 'Compliance',
  financial: 'Financial',
};

const STATUS_FILTERS = ['all', 'new', 'reviewed', 'acted', 'dismissed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function ResearchInboxPage() {
  const [findings, setFindings] = useState<ResearchFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [lastRunCount, setLastRunCount] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('new');
  const [actionPlanDialog, setActionPlanDialog] = useState<{
    open: boolean;
    findingId: string;
    title: string;
  }>({ open: false, findingId: '', title: '' });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllFindings();
      setFindings(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRunNow() {
    setRunning(true);
    setRunError('');
    setLastRunCount(null);
    try {
      const res = await fetch('/api/ai/research/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setRunError(data.error || 'Research run failed');
        setRunning(false);
        return;
      }
      setLastRunCount(data.count || 0);
      // The API response is the source of truth after a run. Persist to
      // localStorage directly so the findings survive refresh without
      // depending on Supabase app_settings writes.
      if (Array.isArray(data.findings) && data.findings.length > 0) {
        const incoming = data.findings as ResearchFinding[];
        try {
          const existing = JSON.parse(
            localStorage.getItem('christinas_research_findings') || '[]'
          ) as ResearchFinding[];
          const byId = new Map(existing.map((f) => [f.id, f]));
          for (const f of incoming) byId.set(f.id, f);
          const merged = Array.from(byId.values()).sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          );
          localStorage.setItem(
            'christinas_research_findings',
            JSON.stringify(merged)
          );
          setFindings(merged);
        } catch (err) {
          console.error('Failed to persist findings locally:', err);
          setFindings(incoming);
        }
      }
    } catch (e) {
      console.error(e);
      setRunError('Network error while running research');
    } finally {
      setRunning(false);
    }
  }

  async function handleMarkReviewed(id: string) {
    await updateFindingStatus(id, 'reviewed');
    // Also update local cache in place so UI updates immediately
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'reviewed' } : f))
    );
  }

  async function handleDismiss(id: string) {
    await updateFindingStatus(id, 'dismissed');
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'dismissed' } : f))
    );
  }

  async function handleMoveToNew(id: string) {
    await updateFindingStatus(id, 'new');
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'new' } : f))
    );
    // Jump the user to the New tab so they see the restored finding
    setStatusFilter('new');
  }

  function openActionPlan(finding: ResearchFinding) {
    setActionPlanDialog({
      open: true,
      findingId: finding.id,
      title: finding.finding,
    });
  }

  async function handleActionPlanCreated() {
    // Mark the finding as acted
    if (actionPlanDialog.findingId) {
      await updateFindingStatus(actionPlanDialog.findingId, 'acted');
      await refresh();
    }
  }

  const filtered =
    statusFilter === 'all' ? findings : findings.filter((f) => f.status === statusFilter);

  const counts = {
    all: findings.length,
    new: findings.filter((f) => f.status === 'new').length,
    reviewed: findings.filter((f) => f.status === 'reviewed').length,
    acted: findings.filter((f) => f.status === 'acted').length,
    dismissed: findings.filter((f) => f.status === 'dismissed').length,
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Research Inbox</h1>
            <p className="text-muted-foreground text-sm">
              Auto-researcher scans your operational data and surfaces non-obvious insights.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleRunNow}
          disabled={running}
          className="bg-christina-red hover:bg-christina-red/90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Researching...' : 'Run Research Now'}
        </Button>
      </div>

      {lastRunCount !== null && !running && (
        <div className="rounded-lg border border-christina-green/30 bg-christina-green/10 p-3 text-sm text-christina-green flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Research pass complete. {lastRunCount} finding{lastRunCount === 1 ? '' : 's'} generated.
        </div>
      )}

      {runError && (
        <div className="rounded-lg border border-christina-coral/30 bg-christina-coral/10 p-3 text-sm text-christina-coral flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {runError}
          </div>
          <Link href="/admin/settings/ai" className="text-xs underline">
            Open AI Settings →
          </Link>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize border transition-colors ${
              statusFilter === s
                ? 'bg-christina-red text-white border-christina-red'
                : 'bg-background hover:bg-muted border-border'
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Findings list */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading findings...
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No findings in this view.</p>
            <p className="text-sm mt-1">
              {statusFilter === 'new'
                ? 'Click "Run Research Now" to scan for insights.'
                : 'Try a different filter or run a new research pass.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((finding) => {
            const meta = SEVERITY_META[finding.severity];
            const Icon = meta.icon;
            return (
              <Card key={finding.id} className={`border-l-4 ${meta.class.split(' ').slice(-1)[0]}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${meta.class} border-0`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {meta.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {FRAMEWORK_LABELS[finding.frameworkTag] || finding.frameworkTag}
                      </Badge>
                      {finding.status !== 'new' && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {finding.status}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(finding.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug mt-2">
                    {finding.finding}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {finding.evidence && (
                    <p className="text-sm text-muted-foreground italic">
                      Evidence: {finding.evidence}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Question: {finding.questionText}
                  </p>
                  <div className="flex gap-2 flex-wrap pt-2 border-t">
                    {finding.status === 'new' ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openActionPlan(finding)}
                        >
                          <ClipboardList className="h-4 w-4 mr-1" />
                          Create Action Plan
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkReviewed(finding.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Reviewed
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(finding.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToNew(finding.id)}
                        >
                          <Undo2 className="h-4 w-4 mr-1" />
                          Move back to New
                        </Button>
                        {finding.status !== 'acted' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openActionPlan(finding)}
                          >
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Create Action Plan
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ActionPlanDialog
        open={actionPlanDialog.open}
        onOpenChange={(open) =>
          setActionPlanDialog({ ...actionPlanDialog, open })
        }
        recommendationId={actionPlanDialog.findingId}
        recommendationTitle={actionPlanDialog.title}
        onCreated={handleActionPlanCreated}
      />
    </div>
  );
}
