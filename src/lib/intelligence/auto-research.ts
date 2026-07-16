// Auto-Research Runner (server-side)
// Observe > Compress > Detect > Surface
// For each research question: pull data from Supabase, compress to a prompt, ask Claude Haiku
// for one non-obvious insight, store as a ResearchFinding.

import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';
import { getSupabase } from '@/lib/supabase/client';
import {
  RESEARCH_QUESTIONS,
  ResearchQuestion,
  DataSource,
} from './research-questions';
import type { ResearchFinding } from './research-findings-storage';
import { generateFindingId } from './research-findings-storage';

const SYSTEM_PROMPT = `You are an operational researcher for a small childcare center. Your job is to look at operational data and surface one non-obvious insight for the owner.

Rules:
- Return ONLY valid JSON. No markdown, no commentary, no code fences.
- Shape: {"finding": "...", "evidence": "..."}
- "finding" is ONE sentence describing the insight plainly (warm, direct, no jargon).
- "evidence" is 1-2 sentences with specific numbers from the data.
- If the data does not support an interesting insight, return {"finding": "No notable pattern this period.", "evidence": "..."}.
- Never invent numbers. Only use what's in the data.
- Frame operational issues as opportunities when the framework tag is "feedback_conductance" or "recovery_based_accountability".`;

interface CompressedData {
  summary: string;
  raw: Record<string, unknown>;
}

async function pullData(
  sources: DataSource[],
  lookbackDays: number
): Promise<CompressedData> {
  const supabase = getSupabase();
  if (!supabase) return { summary: 'Supabase not configured', raw: {} };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffIso = cutoff.toISOString();

  const raw: Record<string, unknown> = {};
  const summaryParts: string[] = [];

  for (const source of sources) {
    try {
      switch (source) {
        case 'food_counts': {
          const { data } = await supabase
            .from('food_counts')
            .select('meal_type,child_count,date')
            .gte('date', cutoffIso.split('T')[0])
            .limit(2000);
          raw.food_counts = data || [];
          const total = (data || []).reduce(
            (sum, r) => sum + (r.child_count as number || 0),
            0
          );
          const byType = (data || []).reduce((acc: Record<string, number>, r) => {
            const key = (r.meal_type as string) || 'unknown';
            acc[key] = (acc[key] || 0) + (r.child_count as number || 0);
            return acc;
          }, {});
          summaryParts.push(
            `${lookbackDays}d meals: total=${total}, by_type=${JSON.stringify(byType)}`
          );
          break;
        }
        case 'attendance': {
          const { data } = await supabase
            .from('attendance')
            .select('child_id,check_in,check_out')
            .gte('check_in', cutoffIso)
            .limit(5000);
          raw.attendance = data || [];
          const uniqueChildren = new Set((data || []).map((r) => r.child_id));
          summaryParts.push(
            `${lookbackDays}d attendance: ${data?.length || 0} check-ins, ${uniqueChildren.size} unique children`
          );
          break;
        }
        case 'employees': {
          const { data } = await supabase
            .from('employees')
            .select('id,first_name,last_name,role,employment_status,emergency_contact_name')
            .limit(200);
          raw.employees = data || [];
          const active = (data || []).filter((e) => e.employment_status === 'active').length;
          const missingEmergency = (data || []).filter(
            (e) => !e.emergency_contact_name
          ).length;
          summaryParts.push(
            `employees: ${active} active, ${missingEmergency} missing emergency contact`
          );
          break;
        }
        case 'time_entries': {
          const { data } = await supabase
            .from('time_entries')
            .select('employee_id,clock_in,clock_out')
            .gte('clock_in', cutoffIso)
            .limit(2000);
          raw.time_entries = data || [];
          const openClocks = (data || []).filter((r) => !r.clock_out).length;
          summaryParts.push(
            `${lookbackDays}d time entries: ${data?.length || 0}, ${openClocks} unclosed`
          );
          break;
        }
        case 'incident_reports': {
          const { data } = await supabase
            .from('incident_reports')
            .select('incident_type,severity,reported_at,created_at,description')
            .gte('reported_at', cutoffIso)
            .limit(500);
          raw.incident_reports = data || [];
          const bySeverity = (data || []).reduce((acc: Record<string, number>, r) => {
            const k = (r.severity as string) || 'unknown';
            acc[k] = (acc[k] || 0) + 1;
            return acc;
          }, {});
          summaryParts.push(
            `${lookbackDays}d incidents: ${data?.length || 0} total, by_severity=${JSON.stringify(bySeverity)}`
          );
          break;
        }
        case 'training_records': {
          const { data } = await supabase
            .from('training_records')
            .select('employee_id,title,expiry_date')
            .limit(500);
          raw.training_records = data || [];
          const expiringSoon = (data || []).filter((r) => {
            if (!r.expiry_date) return false;
            const exp = new Date(r.expiry_date as string);
            const diff = exp.getTime() - Date.now();
            return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
          }).length;
          summaryParts.push(
            `training records: ${data?.length || 0}, ${expiringSoon} expiring in 60d`
          );
          break;
        }
        case 'enrollment_inquiries': {
          const { data } = await supabase
            .from('enrollment_inquiries')
            .select('id,status,created_at')
            .gte('created_at', cutoffIso)
            .limit(500);
          raw.enrollment_inquiries = data || [];
          const byStatus = (data || []).reduce((acc: Record<string, number>, r) => {
            const k = (r.status as string) || 'unknown';
            acc[k] = (acc[k] || 0) + 1;
            return acc;
          }, {});
          summaryParts.push(
            `${lookbackDays}d inquiries: total=${data?.length || 0}, by_status=${JSON.stringify(byStatus)}`
          );
          break;
        }
        case 'tour_requests': {
          const { data } = await supabase
            .from('tour_requests')
            .select('id,status,preferred_date,created_at')
            .gte('created_at', cutoffIso)
            .limit(500);
          raw.tour_requests = data || [];
          summaryParts.push(`${lookbackDays}d tour requests: ${data?.length || 0}`);
          break;
        }
        case 'staff_schedules': {
          const { data } = await supabase
            .from('staff_schedules')
            .select('employee_id,date,start_time,end_time')
            .gte('date', cutoffIso.split('T')[0])
            .limit(2000);
          raw.staff_schedules = data || [];
          summaryParts.push(`${lookbackDays}d schedules: ${data?.length || 0} shifts`);
          break;
        }
        default:
          summaryParts.push(`${source}: not supported yet`);
      }
    } catch (e) {
      console.error(`pullData error for ${source}:`, e);
      summaryParts.push(`${source}: query failed`);
    }
  }

  return {
    summary: summaryParts.join(' | '),
    raw,
  };
}

async function runOne(question: ResearchQuestion, apiKey: string): Promise<ResearchFinding | null> {
  try {
    const data = await pullData(question.dataSources, question.lookbackDays);
    const userPrompt = `Research question: ${question.question}
Hypothesis: ${question.hypothesis}
Framework lens: ${question.frameworkTag}

Data summary (${question.lookbackDays} days):
${data.summary}

Raw sample (first 200 chars per source):
${JSON.stringify(data.raw).slice(0, 800)}

Return JSON: {"finding": "...", "evidence": "..."}`;

    const response = await callClaudeHaiku(SYSTEM_PROMPT, userPrompt, apiKey, 500);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.finding) return null;

    return {
      id: generateFindingId(),
      questionId: question.id,
      questionText: question.question,
      finding: parsed.finding,
      evidence: parsed.evidence || '',
      frameworkTag: question.frameworkTag,
      severity: question.severity,
      source: 'internal',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`Research runOne failed for ${question.id}:`, e);
    return null;
  }
}

export async function runResearchPass(
  questionIds?: string[]
): Promise<{ ok: boolean; error?: string; findings: ResearchFinding[] }> {
  const config = await loadAIConfig();
  if (!config.apiKey || !config.enabled || !config.features.autoResearcher) {
    return {
      ok: false,
      error: 'Auto Researcher is not configured. Enable it in Admin → Settings → AI.',
      findings: [],
    };
  }

  const questions = questionIds
    ? RESEARCH_QUESTIONS.filter((q) => questionIds.includes(q.id))
    : RESEARCH_QUESTIONS;

  const findings: ResearchFinding[] = [];
  for (const q of questions) {
    const finding = await runOne(q, config.apiKey);
    if (finding) {
      findings.push(finding);
    }
  }

  return { ok: true, findings };
}
