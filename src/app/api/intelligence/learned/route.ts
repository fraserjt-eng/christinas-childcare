export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';
import { RecommendationDecision } from '@/lib/intelligence/types';

const SYSTEM_PROMPT = `You are analyzing a childcare center owner's decision patterns from an AI recommendation system.

Given their history of approved and denied recommendations (with reasons), generate a concise summary of what you've learned about their preferences and priorities.

Return a JSON object with these exact fields:
- "preferences": array of 3-5 short strings describing what the owner prioritizes (e.g. "Prioritizes revenue recovery over documentation tasks")
- "avoids": array of 1-3 short strings describing what the owner consistently rejects (e.g. "Rejects scheduling changes during busy season")
- "summary": 1-2 sentences capturing the owner's management style based on their decisions

Return ONLY the JSON object. No markdown. No commentary.
If there are fewer than 3 decisions, return: {"preferences": [], "avoids": [], "summary": "Not enough decisions yet to identify patterns. Keep approving and denying recommendations to teach the system."}`;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await loadAIConfig();
  if (!config.apiKey || !config.enabled || !config.features.learning) {
    return NextResponse.json(
      { error: 'AI learning is not configured. Set it up in Admin → Settings → AI.' },
      { status: 503 }
    );
  }
  const apiKey = config.apiKey.trim();

  try {
    const body: { decisions: RecommendationDecision[] } = await request.json();
    const decisions = body.decisions || [];

    if (decisions.length < 3) {
      return NextResponse.json({
        learned: {
          preferences: [],
          avoids: [],
          summary: 'Not enough decisions yet to identify patterns. Keep approving and denying recommendations to teach the system.',
        },
      });
    }

    const decisionLines = decisions.slice(0, 30).map((d) => {
      const action = d.decision === 'approved' ? 'APPROVED' : 'DENIED';
      const reason = d.reason ? ` Reason: "${d.reason}"` : '';
      return `- ${action}: "${d.recommendationTitle}" (${new Date(d.decidedAt).toLocaleDateString()})${reason}`;
    });

    const userPrompt = `Here are the owner's decisions from the recommendation system:\n\n${decisionLines.join('\n')}\n\nTotal decisions: ${decisions.length} (${decisions.filter((d) => d.decision === 'approved').length} approved, ${decisions.filter((d) => d.decision === 'denied').length} denied)\n\nAnalyze their patterns.`;

    const response = await callClaudeHaiku(SYSTEM_PROMPT, userPrompt, apiKey);

    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const learned = JSON.parse(cleaned);

    return NextResponse.json({ learned });
  } catch (error) {
    console.error('Learning summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning summary' },
      { status: 500 }
    );
  }
}
