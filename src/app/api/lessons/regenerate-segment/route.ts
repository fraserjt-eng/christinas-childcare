export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { regenerateSegment } from '@/lib/lesson-generator';
import { loadAIConfig } from '@/lib/ai-config';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import {
  checkDailyQuota,
  recordTokenUsage,
  estimateTokens,
} from '@/lib/ai-usage-storage';
import type { Lesson } from '@/types/curriculum';

// POST /api/lessons/regenerate-segment
// Body: { lesson: Lesson, segmentIndex: number, adjustmentNotes: string }
// Returns: { success: true, segment: LessonSegmentItem }

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Same rate limit + quota guards as full generation. Single-segment runs
  // cost a fraction of a full-lesson call but the limiter is per-feature.
  const rateCheck = checkAIRateLimit(request as unknown as Request, 'lessons');
  if (!rateCheck.success) {
    return rateLimitedResponse(rateCheck) as unknown as NextResponse;
  }

  const quota = await checkDailyQuota();
  if (!quota.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `Daily AI token cap reached (${quota.used} / ${quota.cap}). Try again tomorrow or raise the cap in Admin → Settings → AI.`,
      },
      { status: 503 }
    );
  }

  let body: {
    lesson?: Lesson;
    segmentIndex?: number;
    adjustmentNotes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const { lesson, segmentIndex, adjustmentNotes } = body;
  if (!lesson || typeof segmentIndex !== 'number' || !adjustmentNotes) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required fields: lesson, segmentIndex, adjustmentNotes.',
      },
      { status: 400 }
    );
  }

  const config = await loadAIConfig();
  if (!config.apiKey || !config.enabled || !config.features.lessonBuilder) {
    return NextResponse.json(
      {
        success: false,
        error: 'AI lesson builder is not configured. Set it up in Admin → Settings → AI.',
      },
      { status: 503 }
    );
  }

  try {
    const segment = await regenerateSegment(
      { lesson, segmentIndex, adjustmentNotes },
      config.apiKey
    );

    // Best-effort token usage record. Single segment is roughly 1/5 the
    // payload of a full lesson; the estimator handles the math.
    const promptApprox = JSON.stringify({ lesson, segmentIndex, adjustmentNotes });
    const outputApprox = JSON.stringify(segment);
    const estimated = estimateTokens(promptApprox, outputApprox);
    await recordTokenUsage(
      'lessons',
      Math.floor(estimated * 0.6),
      Math.floor(estimated * 0.4)
    );

    return NextResponse.json({ success: true, segment });
  } catch (error) {
    console.error('Segment regeneration error:', error);
    return NextResponse.json(
      { success: false, error: 'Segment regeneration failed. Please try again.' },
      { status: 500 }
    );
  }
}
