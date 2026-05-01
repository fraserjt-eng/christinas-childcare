// Model fallback wrapper for direct Anthropic API calls.
//
// Why: Christina's API key may not have access to Opus 4.7 (Haiku-only tier
// or workspace-scoped key). Hardcoding model: 'claude-opus-4-7' meant every
// AI feature failed silently for her. This wrapper tries a chain of models
// and returns the first one that works, surfacing the real error if every
// attempt fails.
//
// Default chain: Opus 4.7 → Sonnet 4.6 → Haiku 4.5 → Haiku 3.5 → legacy Haiku.
// Override with NEWSLETTER_AI_MODEL or LESSON_AI_MODEL env vars to pin a
// specific model.

const DEFAULT_CHAIN = [
  'claude-opus-4-7',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307',
];

export interface CallResult {
  text: string;
  modelUsed: string;
  attempts: Array<{ model: string; error: string }>;
}

interface CallOptions {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  modelChain?: string[];
}

export async function callClaudeWithFallback(opts: CallOptions): Promise<CallResult> {
  const chain = opts.modelChain && opts.modelChain.length > 0 ? opts.modelChain : DEFAULT_CHAIN;
  const attempts: Array<{ model: string; error: string }> = [];

  for (const model of chain) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': opts.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxTokens,
          system: opts.systemPrompt,
          messages: [{ role: 'user', content: opts.userPrompt }],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        // 401 / 403 / 404 / 400 with model_not_found → try next model.
        // 429 (rate limit) and 5xx → also try next, the next model may be free.
        attempts.push({
          model,
          error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
        });
        continue;
      }

      const body = (await response.json()) as {
        content?: Array<{ text?: string }>;
      };
      const text = body.content?.[0]?.text;
      if (!text) {
        attempts.push({ model, error: 'Empty response body' });
        continue;
      }

      return { text, modelUsed: model, attempts };
    } catch (e) {
      attempts.push({ model, error: (e as Error).message });
      continue;
    }
  }

  // Every model failed. Surface the chain so the caller can show J what went wrong.
  const summary = attempts
    .map((a) => `${a.model}: ${a.error.slice(0, 120)}`)
    .join(' | ');
  throw new Error(`All Claude models failed. Tried: ${summary}`);
}
