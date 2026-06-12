export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { loadAIConfig, saveAIConfig, AIConfig } from '@/lib/ai-config';
import { requireSession } from '@/lib/require-auth';

// Owner/admin only. This endpoint reads and writes the Anthropic API key, so
// every method fails closed for anyone who is not a verified admin session.
const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// GET: Return current config with API key masked
export async function GET(): Promise<NextResponse> {
  if (!(await requireSession('admin'))) return unauthorized();
  try {
    const config = await loadAIConfig();
    const hasKey = !!config.apiKey;
    const masked = hasKey
      ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
      : '';

    return NextResponse.json(
      {
        enabled: config.enabled,
        model: config.model,
        features: config.features,
        hasKey,
        maskedKey: masked,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('AI config GET error:', e);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

// POST: Save config (full or partial)
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await requireSession('admin'))) return unauthorized();
  try {
    const body = (await request.json()) as Partial<AIConfig>;

    // Basic validation
    if (body.apiKey !== undefined && typeof body.apiKey !== 'string') {
      return NextResponse.json({ error: 'Invalid apiKey' }, { status: 400 });
    }
    if (body.apiKey && !body.apiKey.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'API key should start with sk-ant-' },
        { status: 400 }
      );
    }

    // Load current config so we can merge
    const current = await loadAIConfig();
    const merged: Partial<AIConfig> = {
      ...current,
      ...body,
      features: {
        ...current.features,
        ...(body.features || {}),
      },
    };

    const saved = await saveAIConfig(merged);
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save config. Check Supabase connection.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('AI config POST error:', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// PUT: Test a candidate API key against the Anthropic API
export async function PUT(request: Request): Promise<NextResponse> {
  if (!(await requireSession('admin'))) return unauthorized();
  try {
    const body = await request.json();
    const candidateKey = body.apiKey || (await loadAIConfig()).apiKey;

    if (!candidateKey) {
      return NextResponse.json({ ok: false, error: 'No API key provided' }, { status: 400 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': candidateKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    const errBody = await res.text().catch(() => '');
    return NextResponse.json(
      { ok: false, error: `API returned ${res.status}: ${errBody.slice(0, 200)}` },
      { status: 200 }
    );
  } catch (e) {
    console.error('AI config PUT error:', e);
    return NextResponse.json({ ok: false, error: 'Test failed' }, { status: 200 });
  }
}
