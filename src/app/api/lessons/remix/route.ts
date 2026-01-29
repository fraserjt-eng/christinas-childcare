import { NextRequest, NextResponse } from 'next/server';
import {
  remixLesson,
  validateRemixRequest,
  RemixRequest,
} from '@/lib/lesson-generator';
import { getLesson, saveLesson } from '@/lib/lesson-storage';

export async function POST(request: NextRequest) {
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

    // Remix lesson
    const lessonData = await remixLesson(remixRequest, apiKey);

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
