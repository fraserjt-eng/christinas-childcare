export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';
import { checkAIRateLimit, rateLimitedResponse } from '@/lib/ai-rate-limit';
import { checkDailyQuota, recordTokenUsage, estimateTokens } from '@/lib/ai-usage-storage';

const NEWSLETTER_SYSTEM_PROMPT = `You write warm, professional newsletters for Christina's Child Care Center in Crystal, MN.

Voice: direct, trusted by parents, no corporate speak, no filler. 2-3 short paragraphs per content section. Use specific numbers when provided. Celebrate wins without exaggerating.

Return ONLY valid JSON. No markdown, no commentary, no code fences.`;

interface RequestBody {
  audience?: 'parent' | 'staff';
  dateRange?: string;
  existingTitle?: string;
  existingSections?: Array<{ heading: string; body: string }>;
  attendanceSummary?: string;
  mealStats?: string;
  complianceNotes?: string;
  staffUpdates?: string;
}

function buildParentPrompt(body: RequestBody): string {
  const empties = (body.existingSections || []).filter((s) => s.heading.trim() && !s.body.trim());
  const filled = (body.existingSections || []).filter((s) => s.heading.trim() && s.body.trim());

  const sectionHeadings =
    empties.length > 0
      ? empties.map((s, i) => `${i + 1}. "${s.heading}"`).join('\n')
      : '1. "Welcome"\n2. "What We Are Learning"\n3. "Important Reminders"';

  const filledContext = filled.length
    ? `\n\nALREADY-FILLED SECTIONS (tone reference, do NOT duplicate):\n${filled.map((s) => `- ${s.heading}: ${s.body.slice(0, 150)}`).join('\n')}`
    : '';

  const titleInstruction = body.existingTitle?.trim()
    ? `Use this exact title: "${body.existingTitle}"`
    : 'Generate a warm, specific title like "Sunshine Weekly Update" or "Little Explorers Weekly"';

  return `Generate a complete PARENT newsletter for ${body.dateRange || 'this week'}.

${titleInstruction}

Write content for each of these section headings (match each exactly in the "title" field):
${sectionHeadings}

Also generate:
- menu_summary: a 1-2 line description of this week's meals (format: "Monday: ... Tuesday: ... Wednesday: ... Thursday: ... Friday: ...")
- classroom_highlights: array of 3-5 short sentences, each describing something a classroom did (e.g. "Sunflowers class completed their color wheel project.")
- upcoming_events: array of 3 events, each with "title" and "date" (format YYYY-MM-DD, within next 30 days)

DATA YOU CAN USE:
- Attendance: ${body.attendanceSummary || 'Normal week'}
- Meals/CACFP: ${body.mealStats || 'Standard meal program'}
- Compliance: ${body.complianceNotes || 'All clear'}
- Staff: ${body.staffUpdates || 'No updates'}${filledContext}

Return ONLY this JSON shape:
{
  "title": "...",
  "sections": [{"title": "...", "content": "..."}, ...],
  "menu_summary": "...",
  "classroom_highlights": ["...", "...", "..."],
  "upcoming_events": [{"title": "...", "date": "YYYY-MM-DD"}, ...]
}`;
}

function buildStaffPrompt(body: RequestBody): string {
  const empties = (body.existingSections || []).filter((s) => s.heading.trim() && !s.body.trim());
  const filled = (body.existingSections || []).filter((s) => s.heading.trim() && s.body.trim());

  const sectionHeadings =
    empties.length > 0
      ? empties.map((s, i) => `${i + 1}. "${s.heading}"`).join('\n')
      : '1. "This Week at a Glance"\n2. "Important Updates"';

  const filledContext = filled.length
    ? `\n\nALREADY-FILLED SECTIONS (tone reference):\n${filled.map((s) => `- ${s.heading}: ${s.body.slice(0, 150)}`).join('\n')}`
    : '';

  const titleInstruction = body.existingTitle?.trim()
    ? `Use this exact title: "${body.existingTitle}"`
    : 'Generate a direct title like "Staff Briefing" or "Team Huddle"';

  return `Generate a complete STAFF newsletter for ${body.dateRange || 'this week'}.

${titleInstruction}

Write content for each of these section headings:
${sectionHeadings}

Also generate:
- teaching_focus: 2-3 sentences describing this week's curriculum theme or teaching focus
- policy_reminders: array of 2-4 short policy reminders relevant to staff (e.g. "Remember to log meal counts before noon.")
- announcements: array of 2-3 center announcements for staff (e.g. "All-staff training on Friday at 3 PM.")

DATA YOU CAN USE:
- Attendance: ${body.attendanceSummary || 'Normal week'}
- Meals/CACFP: ${body.mealStats || 'Standard'}
- Compliance: ${body.complianceNotes || 'All clear'}
- Staff updates: ${body.staffUpdates || 'No updates'}${filledContext}

Return ONLY this JSON shape:
{
  "title": "...",
  "sections": [{"title": "...", "content": "..."}, ...],
  "teaching_focus": "...",
  "policy_reminders": ["...", "..."],
  "announcements": ["...", "..."]
}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Rate limit check
    const rateCheck = checkAIRateLimit(request, 'newsletter');
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

    const config = await loadAIConfig();
    if (!config.apiKey || !config.enabled || !config.features.newsletter) {
      return NextResponse.json(
        { error: 'AI newsletter generation is not configured. Set it up in Admin → Settings → AI.' },
        { status: 503 }
      );
    }
    const apiKey = config.apiKey;

    const body = (await request.json()) as RequestBody;
    const audience = body.audience === 'staff' ? 'staff' : 'parent';

    const userPrompt =
      audience === 'staff' ? buildStaffPrompt(body) : buildParentPrompt(body);

    const response = await callClaudeHaiku(
      NEWSLETTER_SYSTEM_PROMPT,
      userPrompt,
      apiKey,
      2000
    );

    // Record token usage (estimate since callClaudeHaiku doesn't return usage metadata)
    const estimated = estimateTokens(userPrompt, response);
    await recordTokenUsage('newsletter', Math.floor(estimated * 0.6), Math.floor(estimated * 0.4));

    // Extract the first JSON object from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(
      { audience, ...parsed },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Newsletter generate error:', err);
    return NextResponse.json(
      { error: 'Failed to generate newsletter content' },
      { status: 500 }
    );
  }
}
