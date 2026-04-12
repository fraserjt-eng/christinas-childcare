export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { callClaudeHaiku } from '@/lib/ai/claude-client';

const NEWSLETTER_SYSTEM_PROMPT = `You are an assistant helping write a weekly newsletter for Christina's Child Care Center, a licensed childcare facility in Crystal, MN.

Write in a warm, professional tone that parents trust. Keep sentences clear and direct. No corporate speak, no filler.

For each section, write 2-3 short paragraphs. Use specific numbers when provided. Celebrate wins without exaggerating.`;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI features require ANTHROPIC_API_KEY' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { attendanceSummary, mealStats, complianceNotes, staffUpdates, dateRange } = body;

    const userPrompt = `Generate newsletter sections for ${dateRange || 'this week'}. Use the data below to write 4 sections. Return ONLY valid JSON array with objects having "title" and "content" fields.

DATA:
- Attendance: ${attendanceSummary || 'No data available'}
- Meals/CACFP: ${mealStats || 'No data available'}
- Compliance/Safety: ${complianceNotes || 'All clear'}
- Staff Updates: ${staffUpdates || 'No updates'}

Generate these 4 sections:
1. "This Week at Christina's" - attendance highlights, general center update
2. "Health & Safety Corner" - compliance status, safety reminders
3. "Nutrition Notes" - meal program update, any menu changes
4. "Staff Spotlight" - training completions, certifications, recognitions

Return as JSON array: [{"title": "...", "content": "..."}]`;

    const response = await callClaudeHaiku(
      NEWSLETTER_SYSTEM_PROMPT,
      userPrompt,
      apiKey,
      1500
    );

    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const sections = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ sections }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Newsletter generate error:', err);
    return NextResponse.json(
      { error: 'Failed to generate newsletter content' },
      { status: 500 }
    );
  }
}
