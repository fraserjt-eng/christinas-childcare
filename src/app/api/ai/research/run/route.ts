export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runResearchPass } from '@/lib/intelligence/auto-research';
import { saveManyFindings } from '@/lib/intelligence/research-findings-storage';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import { checkDailyQuota, recordTokenUsage, estimateTokens } from '@/lib/ai-usage-storage';

export async function POST(request: Request): Promise<NextResponse> {
  // Admin-only: require auth_session cookie
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check
  const rateCheck = checkAIRateLimit(request, 'research');
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

  try {
    const body = await request.json().catch(() => ({}));
    const questionIds = Array.isArray(body.questionIds) ? body.questionIds : undefined;

    const result = await runResearchPass(questionIds);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Research pass failed' },
        { status: 503 }
      );
    }

    // Persist all findings in a single write to app_settings
    if (result.findings.length > 0) {
      await saveManyFindings(result.findings);
    }

    // Record best-effort token usage estimate based on findings payload
    const findingsText = JSON.stringify(result.findings);
    const estimated = estimateTokens(JSON.stringify(questionIds || []), findingsText);
    await recordTokenUsage('research', Math.floor(estimated * 0.6), Math.floor(estimated * 0.4));

    return NextResponse.json(
      {
        ok: true,
        count: result.findings.length,
        findings: result.findings,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('Research run error:', e);
    return NextResponse.json(
      { error: 'Research pass encountered an error' },
      { status: 500 }
    );
  }
}
