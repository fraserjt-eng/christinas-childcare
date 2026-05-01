// Newsletter draft generation via Opus 4.7. Grounded in real center activity
// from the last 7-30 days so the AI doesn't write generic filler.
//
// Returns a Newsletter draft shape (subject + sections) ready to drop into
// the existing communications page or, later, the block editor.

import { WRITING_STANDARDS_SYSTEM_PROMPT } from '@/lib/ai/writing-standards';
import { callClaudeWithFallback } from '@/lib/ai/model-fallback';
import { getCenterActivitySnapshot } from '@/lib/newsletter/center-activity';
import type { Newsletter, NewsletterSection } from '@/lib/newsletter-storage';

export type NewsletterTone = 'warm-weekly' | 'professional-monthly' | 'urgent-event' | 'enrollment-push';

export interface NewsletterGenerateRequest {
  prompt: string;                       // teacher's intent ("recap of this week's harvest unit")
  tone?: NewsletterTone;
  audience?: 'families' | 'staff';
  windowDays?: number;
  templateName?: string | null;
}

export interface NewsletterGenerateResult {
  subject: string;
  preheader?: string;
  sections: NewsletterSection[];
  groundingSummary: string;
}

const TONE_GUIDELINES: Record<NewsletterTone, string> = {
  'warm-weekly':
    'Warm, parent-friendly, conversational. Short paragraphs. Specific details over generic claims.',
  'professional-monthly':
    'Polished but warm. Longer pieces are fine. Show monthly arc and what is coming next.',
  'urgent-event':
    'Direct and useful. Lead with the date and location. Cut anything that is not actionable.',
  'enrollment-push':
    'Confidence and clarity. Highlight what makes the center different. End with a clear next step.',
};

function generateSectionId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function generateNewsletterDraft(
  req: NewsletterGenerateRequest,
  apiKey: string
): Promise<NewsletterGenerateResult> {
  const tone = req.tone ?? 'warm-weekly';
  const audience = req.audience ?? 'families';
  const windowDays = req.windowDays ?? 14;

  const snapshot = await getCenterActivitySnapshot(windowDays);

  const systemPrompt = `You are an experienced early childhood center director writing a newsletter for Christina's Child Care Center. You write the way a real director writes: specific, warm, professional, never generic. You always anchor in real recent events instead of inventing them.

Always respond with valid JSON only, no markdown, no explanation.`;

  const userPrompt = `Write a newsletter for ${audience}.

Tone: ${tone}. ${TONE_GUIDELINES[tone]}

Teacher / director intent:
"${req.prompt}"

${snapshot.asPromptText.trim().length > 0 ? `Real center activity to anchor on:\n${snapshot.asPromptText}` : 'No recent center activity is available; write from the intent only and keep claims modest.'}

${req.templateName ? `Use the structure of the "${req.templateName}" template.` : ''}

Constraints:
- Pull from the real activity above. Do not invent events that didn't happen.
- 3-6 sections. Give each a short title and 2-5 sentences of content. Use HTML inside content_html (paragraphs, lists, simple <strong>/<em>).
- Voice rules: zero em dashes, no staccato (3+ short sentences in a row on the same idea), no hedging, no buzzwords.
- The preheader is the one-line preview that shows in inboxes. ~50-100 chars.

Return ONLY valid JSON in this exact shape:
{
  "subject": "Short, specific subject line",
  "preheader": "Inbox preview line",
  "sections": [
    {
      "type": "photos" | "events" | "menu" | "classroom_spotlight" | "milestones" | "announcements" | "custom",
      "title": "Section title",
      "content_html": "<p>HTML paragraph</p>"
    }
  ]
}`;

  const result = await callClaudeWithFallback({
    apiKey,
    systemPrompt: WRITING_STANDARDS_SYSTEM_PROMPT + '\n\n' + systemPrompt,
    userPrompt,
    maxTokens: 4000,
  });
  if (result.modelUsed !== 'claude-opus-4-7') {
    console.warn(
      `Newsletter drafted with fallback model ${result.modelUsed}; Opus 4.7 was unavailable.`,
      result.attempts
    );
  }
  const raw = result.text;

  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  let parsed: {
    subject: string;
    preheader?: string;
    sections: Array<{ type: string; title: string; content_html: string }>;
  };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Generated newsletter was not valid JSON. Try again.');
  }

  if (!parsed.subject || !Array.isArray(parsed.sections)) {
    throw new Error('Generated newsletter is missing subject or sections.');
  }

  const sections: NewsletterSection[] = parsed.sections.map((s, i) => ({
    id: generateSectionId(),
    type: (s.type as NewsletterSection['type']) ?? 'custom',
    title: s.title || `Section ${i + 1}`,
    content_html: s.content_html || '<p></p>',
    order: i,
  }));

  return {
    subject: parsed.subject,
    preheader: parsed.preheader,
    sections,
    groundingSummary: snapshot.asPromptText,
  };
}

// Type-only re-exports for convenience.
export type { Newsletter };
