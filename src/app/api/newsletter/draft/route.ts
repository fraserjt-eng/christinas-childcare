export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  generateNewsletterDraft,
  type NewsletterGenerateRequest,
} from '@/lib/newsletter/ai-generator';
import { loadAIConfig } from '@/lib/ai-config';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import {
  checkDailyQuota,
  recordTokenUsage,
  estimateTokens,
} from '@/lib/ai-usage-storage';

// POST /api/newsletter/draft
// Body: { prompt, tone?, audience?, windowDays?, templateName? }
// Returns: { ok, subject, preheader, sections, groundingSummary }
//
// Distinct from /api/newsletter/generate (the legacy Haiku audience-shaped
// generator wired into the existing comms page). This route uses Opus 4.7
// and grounds the draft in real recent center activity.

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rateCheck = checkAIRateLimit(request as unknown as Request, 'newsletter');
  if (!rateCheck.success) {
    return rateLimitedResponse(rateCheck) as unknown as NextResponse;
  }

  const quota = await checkDailyQuota();
  if (!quota.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Daily AI token cap reached (${quota.used} / ${quota.cap}). Try again tomorrow or raise the cap in Admin → Settings → AI.`,
      },
      { status: 503 }
    );
  }

  let body: NewsletterGenerateRequest;
  try {
    body = (await request.json()) as NewsletterGenerateRequest;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  if (!body.prompt || body.prompt.trim().length < 5) {
    return NextResponse.json(
      { ok: false, error: 'Prompt must be at least 5 characters.' },
      { status: 400 }
    );
  }

  const config = await loadAIConfig();
  if (!config.apiKey || !config.enabled) {
    return NextResponse.json(
      {
        ok: false,
        error: 'AI is not configured. Set up an API key in Admin → Settings → AI.',
      },
      { status: 503 }
    );
  }

  try {
    const draft = await generateNewsletterDraft(body, config.apiKey);

    const promptApprox = JSON.stringify(body) + draft.groundingSummary;
    const outputApprox = JSON.stringify(draft);
    const estimated = estimateTokens(promptApprox, outputApprox);
    await recordTokenUsage(
      'newsletter',
      Math.floor(estimated * 0.6),
      Math.floor(estimated * 0.4)
    );

    return NextResponse.json({
      ok: true,
      subject: draft.subject,
      preheader: draft.preheader,
      sections: draft.sections,
      groundingSummary: draft.groundingSummary,
    });
  } catch (error) {
    console.error('Newsletter draft error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
