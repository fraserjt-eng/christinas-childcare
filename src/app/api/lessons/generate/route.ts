export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  generateLesson,
  validateGenerateRequest,
  GenerateRequest,
} from '@/lib/lesson-generator';
import { saveLesson } from '@/lib/lesson-storage';
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

    const { topic, ageGroup, domain, duration, additionalContext, save } = body;

    const generateRequest: GenerateRequest = {
      topic,
      ageGroup,
      domain,
      duration: parseInt(duration, 10),
      additionalContext,
    };

    // Validate request
    const validationError = validateGenerateRequest(generateRequest);
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

    // Generate lesson
    const lessonData = await generateLesson(generateRequest, apiKey);

    // Record best-effort token usage
    const promptApprox = JSON.stringify(generateRequest);
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
    console.error('Lesson generation error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
