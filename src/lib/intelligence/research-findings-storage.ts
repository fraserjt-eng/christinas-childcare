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
const SETTING_KEY = 'research_findings_cache';

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

// Read findings from Supabase app_settings (keyed value row).
// This works on both server and client because it uses the same app_settings
// table that already has RLS policies and is in production.
async function readFromAppSettings(): Promise<ResearchFinding[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', SETTING_KEY)
      .maybeSingle();

    if (error || !data?.value) return [];
    const value = data.value as { findings?: ResearchFinding[] };
    return value.findings || [];
  } catch (e) {
    console.error('app_settings read failed:', e);
    return [];
  }
}

async function writeToAppSettings(findings: ResearchFinding[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('app_settings').upsert(
      {
        key: SETTING_KEY,
        value: { findings },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (error) {
      console.error('app_settings write error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('app_settings write exception:', e);
    return false;
  }
}

export async function getAllFindings(): Promise<ResearchFinding[]> {
  // Prefer server-stored findings (app_settings), merge with local cache
  const cloud = await readFromAppSettings();
  const local = getFromLocal();

  if (cloud.length > 0) {
    // Merge local updates (status changes) onto cloud data by id
    const localById = new Map(local.map((f) => [f.id, f]));
    const merged = cloud.map((c) => localById.get(c.id) || c);
    // Include any local-only findings not in cloud
    const cloudIds = new Set(cloud.map((c) => c.id));
    const localOnly = local.filter((f) => !cloudIds.has(f.id));
    return [...merged, ...localOnly].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  return local.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveFinding(finding: ResearchFinding): Promise<void> {
  // Write to localStorage (client only)
  if (typeof window !== 'undefined') {
    const local = getFromLocal();
    const idx = local.findIndex((f) => f.id === finding.id);
    if (idx >= 0) {
      local[idx] = finding;
    } else {
      local.unshift(finding);
    }
    saveToLocal(local);
  }

  // Write to app_settings (works server-side too)
  const existing = await readFromAppSettings();
  const idx = existing.findIndex((f) => f.id === finding.id);
  if (idx >= 0) {
    existing[idx] = finding;
  } else {
    existing.unshift(finding);
  }
  // Cap at 200 findings to keep the JSON row small
  const trimmed = existing.slice(0, 200);
  await writeToAppSettings(trimmed);
}

export async function saveManyFindings(findings: ResearchFinding[]): Promise<void> {
  if (typeof window !== 'undefined') {
    const local = getFromLocal();
    const byId = new Map(local.map((f) => [f.id, f]));
    for (const f of findings) byId.set(f.id, f);
    saveToLocal(Array.from(byId.values()));
  }

  const existing = await readFromAppSettings();
  const byId = new Map(existing.map((f) => [f.id, f]));
  for (const f of findings) byId.set(f.id, f);
  const merged = Array.from(byId.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  await writeToAppSettings(merged.slice(0, 200));
}

export async function updateFindingStatus(
  id: string,
  status: FindingStatus,
  actionPlanId?: string
): Promise<void> {
  // Update local cache
  if (typeof window !== 'undefined') {
    const local = getFromLocal();
    const idx = local.findIndex((f) => f.id === id);
    if (idx >= 0) {
      local[idx] = { ...local[idx], status, actionPlanId };
      saveToLocal(local);
    }
  }

  // Update app_settings
  const existing = await readFromAppSettings();
  const idx = existing.findIndex((f) => f.id === id);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], status, actionPlanId };
    await writeToAppSettings(existing);
  }
}

export async function getUnreviewedCount(): Promise<number> {
  const all = await getAllFindings();
  return all.filter((f) => f.status === 'new').length;
}

export function generateFindingId(): string {
  return `rf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
