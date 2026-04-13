export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runExternalResearchPass } from '@/lib/intelligence/external-research';
import { saveManyFindings } from '@/lib/intelligence/research-findings-storage';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import { checkDailyQuota, recordTokenUsage, estimateTokens } from '@/lib/ai-usage-storage';

export async function POST(request: Request): Promise<NextResponse> {
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
    const sourceIds = Array.isArray(body.sourceIds) ? body.sourceIds : undefined;

    const result = await runExternalResearchPass(sourceIds);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'External research pass failed' },
        { status: 503 }
      );
    }

    if (result.findings.length > 0) {
      await saveManyFindings(result.findings);
    }

    const findingsText = JSON.stringify(result.findings);
    const estimated = estimateTokens(JSON.stringify(sourceIds || []), findingsText);
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
    console.error('External research run error:', e);
    return NextResponse.json(
      { error: 'External research pass encountered an error' },
      { status: 500 }
    );
  }
}
