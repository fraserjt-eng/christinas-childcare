export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';

const NEWSLETTER_SYSTEM_PROMPT = `You are an assistant helping write a weekly newsletter for Christina's Child Care Center, a licensed childcare facility in Crystal, MN.

Write in a warm, professional tone that parents trust. Keep sentences clear and direct. No corporate speak, no filler.

For each section, write 2-3 short paragraphs. Use specific numbers when provided. Celebrate wins without exaggerating.`;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const config = await loadAIConfig();
    if (!config.apiKey || !config.enabled || !config.features.newsletter) {
      return NextResponse.json(
        { error: 'AI newsletter generation is not configured. Set it up in Admin → Settings → AI.' },
        { status: 503 }
      );
    }
    const apiKey = config.apiKey;

    const body = await request.json();
    const {
      attendanceSummary,
      mealStats,
      complianceNotes,
      staffUpdates,
      dateRange,
      existingSections,
    } = body as {
      attendanceSummary?: string;
      mealStats?: string;
      complianceNotes?: string;
      staffUpdates?: string;
      dateRange?: string;
      existingSections?: Array<{ heading: string; body: string }>;
    };

    const empties = (existingSections || []).filter((s) => s.heading.trim() && !s.body.trim());
    const filled = (existingSections || []).filter((s) => s.heading.trim() && s.body.trim());

    let userPrompt: string;

    if (empties.length > 0) {
      // Fill in the user's existing empty sections by heading
      const headingsList = empties.map((s, i) => `${i + 1}. "${s.heading}"`).join('\n');
      const filledContext = filled.length
        ? `\n\nEXISTING SECTIONS (for tone reference, do NOT duplicate):\n${filled.map((s) => `- ${s.heading}: ${s.body.slice(0, 150)}`).join('\n')}`
        : '';
      userPrompt = `Write newsletter content for ${dateRange || 'this week'}.

Fill in content for exactly these section headings provided by the admin. Keep each to 2-3 short paragraphs. Match each heading's topic.

SECTION HEADINGS TO FILL:
${headingsList}

DATA YOU CAN USE:
- Attendance: ${attendanceSummary || 'Normal attendance'}
- Meals/CACFP: ${mealStats || 'Standard meal program'}
- Compliance/Safety: ${complianceNotes || 'All clear'}
- Staff Updates: ${staffUpdates || 'No updates'}${filledContext}

Return ONLY a JSON array with one object per heading above, in the same order. Each object has "title" (matching the heading exactly) and "content" fields. No markdown, no commentary.

Return as: [{"title": "...", "content": "..."}]`;
    } else {
      // No existing empty sections — fall back to generating default 4 sections
      userPrompt = `Generate newsletter sections for ${dateRange || 'this week'}. Use the data below to write 4 sections. Return ONLY valid JSON array with objects having "title" and "content" fields.

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
    }

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
