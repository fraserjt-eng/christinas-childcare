// Research Findings Storage
// Where auto-research writes its output. Dual-write to Supabase + localStorage fallback.

import { getSupabase } from '@/lib/supabase/client';
import type { FrameworkTag } from './research-questions';

export type FindingStatus = 'new' | 'reviewed' | 'acted' | 'dismissed';
export type FindingSource = 'internal' | 'external';

export interface ResearchFinding {
  id: string;
  questionId: string;
  questionText: string;
  finding: string;
  evidence: string;
  frameworkTag: FrameworkTag;
  severity: 'info' | 'opportunity' | 'risk';
  source: FindingSource;
  status: FindingStatus;
  createdAt: string;
  actionPlanId?: string;
}

const STORAGE_KEY = 'christinas_research_findings';
const TABLE = 'research_findings';

function getFromLocal(): ResearchFinding[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return [];
}

function saveToLocal(findings: ResearchFinding[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(findings));
  } catch (e) {
    console.error('Failed to save research findings locally:', e);
  }
}

export async function getAllFindings(): Promise<ResearchFinding[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) {
        const mapped: ResearchFinding[] = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          questionId: String(row.question_id || ''),
          questionText: String(row.question_text || ''),
          finding: String(row.finding || ''),
          evidence: String(row.evidence || ''),
          frameworkTag: row.framework_tag as FrameworkTag,
          severity: row.severity as 'info' | 'opportunity' | 'risk',
          source: row.source as FindingSource,
          status: row.status as FindingStatus,
          createdAt: String(row.created_at || ''),
          actionPlanId: row.action_plan_id ? String(row.action_plan_id) : undefined,
        }));
        // Merge with local (local wins on duplicate id)
        const local = getFromLocal();
        const localIds = new Set(local.map((l) => l.id));
        const merged = [...local, ...mapped.filter((m) => !localIds.has(m.id))];
        return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (e) {
      console.error('Supabase research findings fetch failed:', e);
    }
  }
  return getFromLocal();
}

export async function saveFinding(finding: ResearchFinding): Promise<void> {
  // Always write local first
  const local = getFromLocal();
  const idx = local.findIndex((f) => f.id === finding.id);
  if (idx >= 0) {
    local[idx] = finding;
  } else {
    local.unshift(finding);
  }
  saveToLocal(local);

  // Try Supabase
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from(TABLE).upsert(
      {
        id: finding.id,
        question_id: finding.questionId,
        question_text: finding.questionText,
        finding: finding.finding,
        evidence: finding.evidence,
        framework_tag: finding.frameworkTag,
        severity: finding.severity,
        source: finding.source,
        status: finding.status,
        created_at: finding.createdAt,
        action_plan_id: finding.actionPlanId || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to save finding to Supabase:', e);
  }
}

export async function updateFindingStatus(
  id: string,
  status: FindingStatus,
  actionPlanId?: string
): Promise<void> {
  const local = getFromLocal();
  const idx = local.findIndex((f) => f.id === id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], status, actionPlanId };
    saveToLocal(local);
  }

  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase
      .from(TABLE)
      .update({ status, action_plan_id: actionPlanId || null })
      .eq('id', id);
  } catch (e) {
    console.error('Failed to update finding status:', e);
  }
}

export async function getUnreviewedCount(): Promise<number> {
  const all = await getAllFindings();
  return all.filter((f) => f.status === 'new').length;
}

export function generateFindingId(): string {
  return `rf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
