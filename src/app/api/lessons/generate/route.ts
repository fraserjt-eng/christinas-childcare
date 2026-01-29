import { NextRequest, NextResponse } from 'next/server';
import {
  generateLesson,
  validateGenerateRequest,
  GenerateRequest,
} from '@/lib/lesson-generator';
import { saveLesson } from '@/lib/lesson-storage';

export async function POST(request: NextRequest) {
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

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'ANTHROPIC_API_KEY not configured. Please add it to .env.local',
        },
        { status: 500 }
      );
    }

    // Generate lesson
    const lessonData = await generateLesson(generateRequest, apiKey);

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
