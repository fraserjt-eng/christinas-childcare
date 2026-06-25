export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { loadAIConfig } from '@/lib/ai-config';
import { callClaudeChat, type ChatMessage } from '@/lib/ai/claude-client';
import { COACH_KNOWLEDGE } from '@/lib/coach/knowledge';

// The leadership Coach: answers how-to questions about THIS app, grounded on a
// curated knowledge digest. Owner/superadmin ONLY (J + the owners; everyone
// else gets 403 and never sees the widget). Sonnet; the model is overridable
// via COACH_MODEL in case the key's access changes.
const COACH_MODEL = process.env.COACH_MODEL || 'claude-sonnet-4-6';

const COACH_SYSTEM = `You are the FlowState Coach, a friendly in-app assistant for the LEADERSHIP team of Christina's Child Care (J, Christina, Ophelia, Stephen). You help them learn how to use THIS app.

Rules:
- Answer ONLY about this app, using the reference below. Be concrete and short: name the exact screen, tile, or button. Plain language, warm and direct. No em dashes.
- If the reference does not cover something, say so plainly. Never invent features or screens.
- If the app genuinely cannot do what they are asking, briefly say so, suggest the closest thing it CAN do, then ask if they would like you to send a ticket to J. When you offer a ticket, end your reply with the exact token [SUGGEST_TICKET] on its own line.
- Never discuss other users' data; you only explain how to use the app.

Reference:
${COACH_KNOWLEDGE}`;

const TICKET_TOKEN = '[SUGGEST_TICKET]';

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if ((session.user.role || '').toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'The Coach is for the leadership team.' }, { status: 403 });
  }

  const limit = checkRateLimit(`coach:${getClientIdentifier(request)}`, {
    maxRequests: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.success) {
    return NextResponse.json(
      { error: 'You have asked a lot in a short window. Give it a minute.' },
      { status: 429 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const messages = (body.messages || [])
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .slice(-12) // keep the last few turns; bound the prompt
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Ask a question.' }, { status: 400 });
  }

  const config = await loadAIConfig();
  if (!config.apiKey) {
    return NextResponse.json(
      { error: 'The Coach is not configured yet (no AI key).' },
      { status: 503 }
    );
  }

  try {
    const raw = await callClaudeChat({
      model: COACH_MODEL,
      system: COACH_SYSTEM,
      messages,
      apiKey: config.apiKey,
      maxTokens: 700,
    });
    const suggestTicket = raw.includes(TICKET_TOKEN);
    const reply = raw.replace(TICKET_TOKEN, '').trim();
    return NextResponse.json({ reply, suggestTicket });
  } catch {
    return NextResponse.json(
      { error: 'The Coach could not answer right now. Try again in a moment.' },
      { status: 502 }
    );
  }
}
