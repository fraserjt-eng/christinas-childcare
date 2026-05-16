export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import { checkDailyQuota, recordTokenUsage, estimateTokens } from '@/lib/ai-usage-storage';

const SYSTEM_PROMPT = `You are an operations advisor for a small childcare center. You analyze task board data and surface non-obvious patterns the owner should see.

Return ONLY valid JSON. No markdown, no commentary, no code fences.
Shape: {"patterns": ["...", "...", "..."], "rebalance": "..."}
- "patterns" is an array of exactly 3 short sentences describing non-obvious patterns you notice (workload distribution, recurring drift, overdue clusters, etc.)
- "rebalance" is ONE sentence suggesting a concrete workload rebalancing action

Be specific with names and numbers from the data. No hedging. No corporate speak.`;

interface TaskSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to?: string;
  category?: string;
  is_overdue?: boolean;
  created_at?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const rateCheck = checkAIRateLimit(request, 'recommendations');
  if (!rateCheck.success) {
    return rateLimitedResponse(rateCheck) as unknown as NextResponse;
  }

  // Daily quota
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
      { error: 'AI task insights require the intelligence feature. Enable in Admin → Settings → AI.' },
      { status: 503 }
    );
  }
  const apiKey = config.apiKey.trim();

  try {
    const body = (await request.json()) as {
      tasks?: TaskSummary[];
      delegationStats?: Record<string, number>;
    };
    const tasks = Array.isArray(body.tasks) ? body.tasks : [];
    const delegationStats = body.delegationStats || {};

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks provided. Add some tasks first.' },
        { status: 400 }
      );
    }

    const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const byAssignee = tasks.reduce<Record<string, number>>((acc, t) => {
      const key = t.assigned_to || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const overdueCount = tasks.filter((t) => t.is_overdue).length;
    const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;

    const userPrompt = `Task board snapshot:
Total tasks: ${tasks.length}
Overdue: ${overdueCount}
Urgent priority: ${urgentCount}

By status: ${JSON.stringify(byStatus)}
By assignee: ${JSON.stringify(byAssignee)}
Delegation stats: ${JSON.stringify(delegationStats)}

Sample of 10 tasks (title, status, priority, assigned_to):
${tasks
  .slice(0, 10)
  .map(
    (t) =>
      `- "${t.title}" [${t.status}, ${t.priority}, assigned to: ${t.assigned_to || 'unassigned'}]${t.is_overdue ? ' OVERDUE' : ''}`
  )
  .join('\n')}

Return JSON: {"patterns": ["...", "...", "..."], "rebalance": "..."}`;

    const response = await callClaudeHaiku(SYSTEM_PROMPT, userPrompt, apiKey, 600);

    const estimated = estimateTokens(userPrompt, response);
    await recordTokenUsage(
      'task_insights',
      Math.floor(estimated * 0.6),
      Math.floor(estimated * 0.4)
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(
      {
        patterns: Array.isArray(parsed.patterns) ? parsed.patterns.slice(0, 3) : [],
        rebalance: typeof parsed.rebalance === 'string' ? parsed.rebalance : '',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('Task insights error:', e);
    return NextResponse.json(
      { error: 'Task insights encountered an error' },
      { status: 500 }
    );
  }
}
