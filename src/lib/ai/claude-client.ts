/**
 * Shared Claude API client for Christina's Child Care Center.
 * Used by the intelligence recommendation system.
 */

import { WRITING_STANDARDS_SYSTEM_PROMPT } from './writing-standards';

export async function callClaudeHaiku(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxTokens: number = 1024
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      system: WRITING_STANDARDS_SYSTEM_PROMPT + '\n\n' + systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'no body');
    console.error('Claude Haiku API error:', response.status, errorBody);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.content || data.content.length === 0) {
    throw new Error('Empty response from Claude');
  }

  return data.content[0].text;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Multi-turn chat completion with an explicit model. Used by the leadership
 * Coach (Sonnet). Unlike callClaudeHaiku it does NOT prepend the writing
 * standards — the Coach is a plain internal helper, not J-branded content.
 */
export async function callClaudeChat(opts: {
  model: string;
  system: string;
  messages: ChatMessage[];
  apiKey: string;
  maxTokens?: number;
}): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: opts.messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'no body');
    console.error('Claude chat API error:', response.status, errorBody);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.content || data.content.length === 0) {
    throw new Error('Empty response from Claude');
  }
  return data.content[0].text as string;
}
