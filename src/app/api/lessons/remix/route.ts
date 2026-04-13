export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  remixLesson,
  validateRemixRequest,
  RemixRequest,
} from '@/lib/lesson-generator';
import { getLesson, saveLesson } from '@/lib/lesson-storage';
import { loadAIConfig } from '@/lib/ai-config';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import { checkDailyQuota, recordTokenUsage, estimateTokens } from '@/lib/ai-usage-storage';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check
  const rateCheck = checkAIRateLimit(request as unknown as Request, 'lessons');
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
    const body = await request.json();

    const {
      baseLessonId,
      baseLesson: baseLessonFromBody,
      newAgeGroup,
      newDuration,
      newDomain,
      adaptationNotes,
      save,
    } = body;

    // Get base lesson - either from body or from storage
    let baseLesson = baseLessonFromBody;
    if (!baseLesson && baseLessonId) {
      baseLesson = await getLesson(baseLessonId);
      if (!baseLesson) {
        return NextResponse.json(
          { success: false, error: 'Base lesson not found' },
          { status: 404 }
        );
      }
    }

    if (!baseLesson) {
      return NextResponse.json(
        { success: false, error: 'Base lesson is required' },
        { status: 400 }
      );
    }

    const remixRequest: RemixRequest = {
      baseLesson,
      newAgeGroup,
      newDuration: newDuration ? parseInt(newDuration, 10) : undefined,
      newDomain,
      adaptationNotes,
    };

    // Validate request
    const validationError = validateRemixRequest(remixRequest);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Check for API key via centralized config
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
    const apiKey = config.apiKey;

    // Remix lesson
    const lessonData = await remixLesson(remixRequest, apiKey);

    // Record best-effort token usage
    const promptApprox = JSON.stringify(remixRequest);
    const outputApprox = JSON.stringify(lessonData);
    const estimated = estimateTokens(promptApprox, outputApprox);
    await recordTokenUsage('lessons', Math.floor(estimated * 0.6), Math.floor(estimated * 0.4));

    // Optionally save to storage
    let savedLesson = null;
    if (save) {
      savedLesson = await saveLesson(lessonData);
    }

    return NextResponse.json({
      success: true,
      lesson: savedLesson || {
        ...lessonData,
        id: 'preview',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      saved: !!save,
    });
  } catch (error) {
    console.error('Lesson remix error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
