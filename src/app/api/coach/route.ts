export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { loadAIConfig } from '@/lib/ai-config';
import { callClaudeChat, type ChatMessage } from '@/lib/ai/claude-client';
import { buildCoachReference } from '@/lib/coach/knowledge';
import { TILE_CATALOG } from '@/lib/tile-catalog';
import { trainingModules } from '@/lib/training/modules';

// The leadership Coach: answers how-to questions about THIS app, grounded on a
// reference DERIVED from the live app registries (tile catalog + training
// modules + role config), so it can never go stale behind a shipped feature.
// Owner/superadmin ONLY (J + the owners; everyone else gets 403 and never sees
// the widget). Sonnet; the model is overridable via COACH_MODEL.
const COACH_MODEL = process.env.COACH_MODEL || 'claude-sonnet-4-6';

const COACH_RULES = `You are the FlowState Coach, a friendly in-app assistant for the LEADERSHIP team of Christina's Child Care (Dr. J Fraser, Christina, Ophelia, Stephen). You help them learn how to use THIS app. Always refer to the builder/owner as "Dr. J Fraser", never just "J".

Rules:
- Answer ONLY about this app, using the reference below. Be concrete and short: name the exact screen, tile, or button. Plain language, warm and direct. No em dashes.
- If the reference does not cover something, say so plainly. Never invent features or screens.
- If the app genuinely cannot do what they are asking, briefly say so, suggest the closest thing it CAN do, then ask if they would like you to send a ticket to Dr. J Fraser. When you offer a ticket, end your reply with the exact token [SUGGEST_TICKET] on its own line.
- Never discuss other users' data; you only explain how to use the app.`;

// Build the system prompt per request so the Coach can name the screen the user
// is actually on. Page context comes ONLY from the static route -> catalog map,
// never from rendered page content (which could contain a child/family name).
function coachSystem(page?: string): string {
  let pageNote = '';
  if (page) {
    const tile =
      TILE_CATALOG.find((t) => t.href === page) ||
      TILE_CATALOG.find((t) => t.href !== '/' && page.startsWith(t.href));
    const topics = trainingModules
      .filter((m) => (m.portalPages || []).includes(page))
      .map((m) => m.title);
    pageNote = `\n\nCURRENT PAGE: the user is on "${page}".`;
    if (tile) pageNote += ` That is the "${tile.label}" screen (${tile.description}).`;
    if (topics.length) pageNote += ` Related topics: ${topics.join('; ')}.`;
    pageNote += ` If the question is about this screen, answer for where they already are.`;
  }
  return `${COACH_RULES}\n\nReference:\n${buildCoachReference()}${pageNote}`;
}

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

  let body: { messages?: ChatMessage[]; page?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Current page = a bare pathname only (e.g. "/admin/families"); never page content.
  const page =
    typeof body.page === 'string' && body.page.startsWith('/') && body.page.length < 200
      ? body.page
      : undefined;

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
      system: coachSystem(page),
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
