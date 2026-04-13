export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';
import { TrainingDigestItem, StaffingAlert, RecommendationDecision } from '@/lib/intelligence/types';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import { checkDailyQuota, recordTokenUsage, estimateTokens } from '@/lib/ai-usage-storage';

interface RequestBody {
  trainingItems: TrainingDigestItem[];
  staffingAlerts: StaffingAlert[];
  stats: {
    totalProgress: number;
    activeStaff: number;
    mealCountsThisWeek: number;
    pipelineLeads: number;
  };
  pastDecisions?: RecommendationDecision[];
}

const SYSTEM_PROMPT = `You are an operations advisor for a small childcare center.
You receive scan results from an automated monitoring system.
Your job: generate 3-5 specific, actionable recommendations the owner can approve or deny.

Each recommendation must be a JSON object with these exact fields:
- "id": a unique kebab-case slug (e.g. "follow-up-stale-inquiries")
- "category": one of "training", "staffing", "operations", "compliance", "revenue"
- "priority": one of "high", "medium", "low"
- "title": one sentence, under 80 characters
- "recommendation": 2-3 sentences explaining what to do and why
- "basedOn": array of alert titles this recommendation draws from

Return ONLY a JSON array. No markdown. No commentary outside the array.

Rules:
- Be specific to THIS center's data. Reference actual numbers and dates from the scan.
- Each recommendation must be actionable within 1 week.
- Do not recommend buying software or hiring consultants.
- Combine related alerts into single recommendations when appropriate.
- If fewer than 2 alerts exist, return 1-2 recommendations max.
- If no alerts exist, return an empty array [].
- LEARNING: You will receive the owner's past decisions (approved/denied with reasons). Study them. Do NOT repeat recommendations the owner has denied unless circumstances changed. Adapt your style and focus to match what the owner approves. The denial reasons tell you what matters to them.`;

function prioritizeItems<T extends { severity: string }>(items: T[], max: number): T[] {
  const order = { action_needed: 0, warning: 1, info: 2 };
  return [...items]
    .sort((a, b) => (order[a.severity as keyof typeof order] ?? 2) - (order[b.severity as keyof typeof order] ?? 2))
    .slice(0, max);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check
  const rateCheck = checkAIRateLimit(request as unknown as Request, 'recommendations');
  if (!rateCheck.success) {
    return rateLimitedResponse(rateCheck) as unknown as NextResponse;
  }

  // Daily quota check
  const quota = await checkDailyQuota();
  if (!quota.ok) {
    return NextResponse.json(
      {
        error: `Daily AI token cap reached (${quota.used} / ${quota.cap}). Try again tomorrow or raise the cap in Admin → Settings → AI.`,
      },
      { status: 503 }
    );
  }

  const config = await loadAIConfig();
  if (!config.apiKey || !config.enabled || !config.features.intelligence) {
    return NextResponse.json(
      { error: 'AI intelligence is not configured. Set it up in Admin → Settings → AI.' },
      { status: 503 }
    );
  }
  const apiKey = config.apiKey.trim();

  try {
    const body: RequestBody = await request.json();

    const topTraining = prioritizeItems(body.trainingItems, 10);
    const topStaffing = prioritizeItems(body.staffingAlerts, 10);

    // Build decision history context (last 20 decisions, most recent first)
    const recentDecisions = (body.pastDecisions || []).slice(0, 20);
    let decisionContext = '';
    if (recentDecisions.length > 0) {
      const decisionLines = recentDecisions.map((d) => {
        const action = d.decision === 'approved' ? 'APPROVED' : 'DENIED';
        const reason = d.reason ? ` Reason: "${d.reason}"` : '';
        return `- ${action}: "${d.recommendationTitle}" (${new Date(d.decidedAt).toLocaleDateString()})${reason}`;
      });
      decisionContext = `\n## Owner's Past Decisions (learn from these)\n${decisionLines.join('\n')}\n`;
    }

    const userPrompt = `Here are the current scan results for Christina's Child Care Center:

## Training Scan (${topTraining.length} items)
${JSON.stringify(topTraining, null, 2)}

## Staffing & Operations Scan (${topStaffing.length} items)
${JSON.stringify(topStaffing, null, 2)}

## Quick Stats
- Completed training sections: ${body.stats.totalProgress}
- Active staff: ${body.stats.activeStaff}
- Meal counts this week: ${body.stats.mealCountsThisWeek}
- Active pipeline leads: ${body.stats.pipelineLeads}
${decisionContext}
Today's date: ${new Date().toISOString().split('T')[0]}

Generate actionable recommendations.`;

    const response = await callClaudeHaiku(SYSTEM_PROMPT, userPrompt, apiKey);

    const estimated = estimateTokens(userPrompt, response);
    await recordTokenUsage('recommendations', Math.floor(estimated * 0.6), Math.floor(estimated * 0.4));

    // Parse JSON, stripping markdown fences if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    const now = new Date().toISOString();
    const recommendations = parsed.slice(0, 5).map((rec: Record<string, unknown>) => ({
      id: String(rec.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
      category: rec.category || 'operations',
      priority: rec.priority || 'medium',
      title: String(rec.title || ''),
      recommendation: String(rec.recommendation || ''),
      basedOn: Array.isArray(rec.basedOn) ? rec.basedOn.map(String) : [],
      generatedAt: now,
      status: 'pending' as const,
    }));

    return NextResponse.json({ recommendations, generatedAt: now });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
