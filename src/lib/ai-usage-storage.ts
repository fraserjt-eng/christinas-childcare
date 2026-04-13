// AI Usage Storage — daily token quota tracking
// Stores per-day token counts in Supabase app_settings table (key=ai_usage_YYYY-MM-DD)
// Checked by all AI routes before calling Claude.

import { getSupabase } from './supabase/client';

const DEFAULT_DAILY_CAP = 500_000;
const CAP_SETTING_KEY = 'ai_daily_token_cap';

function usageKeyForToday(): string {
  return `ai_usage_${new Date().toISOString().split('T')[0]}`;
}

interface UsageRecord {
  tokens: number;
  calls: number;
  byFeature?: Record<string, number>;
}

async function readUsage(key: string): Promise<UsageRecord> {
  const supabase = getSupabase();
  if (!supabase) return { tokens: 0, calls: 0 };

  try {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (data?.value) {
      const v = data.value as Partial<UsageRecord>;
      return {
        tokens: v.tokens || 0,
        calls: v.calls || 0,
        byFeature: v.byFeature || {},
      };
    }
  } catch (e) {
    console.error('ai-usage-storage read failed:', e);
  }
  return { tokens: 0, calls: 0, byFeature: {} };
}

async function writeUsage(key: string, record: UsageRecord): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('app_settings').upsert(
      {
        key,
        value: record,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch (e) {
    console.error('ai-usage-storage write failed:', e);
  }
}

/**
 * Load the configured daily cap. Falls back to DEFAULT_DAILY_CAP.
 */
export async function getDailyCap(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return DEFAULT_DAILY_CAP;

  try {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', CAP_SETTING_KEY)
      .maybeSingle();

    if (data?.value) {
      const v = data.value as { cap?: number };
      if (typeof v.cap === 'number' && v.cap > 0) return v.cap;
    }
  } catch (e) {
    console.error('getDailyCap read failed:', e);
  }
  return DEFAULT_DAILY_CAP;
}

export async function setDailyCap(cap: number): Promise<boolean> {
  if (!cap || cap < 1000) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('app_settings').upsert(
      {
        key: CAP_SETTING_KEY,
        value: { cap },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    return !error;
  } catch (e) {
    console.error('setDailyCap write failed:', e);
    return false;
  }
}

/**
 * Check if today's usage is under the cap.
 * Returns { ok, used, cap, remaining }
 */
export async function checkDailyQuota(): Promise<{
  ok: boolean;
  used: number;
  cap: number;
  remaining: number;
}> {
  const [cap, usage] = await Promise.all([getDailyCap(), readUsage(usageKeyForToday())]);
  const remaining = Math.max(0, cap - usage.tokens);
  return {
    ok: usage.tokens < cap,
    used: usage.tokens,
    cap,
    remaining,
  };
}

/**
 * Record token usage after a Claude call.
 */
export async function recordTokenUsage(
  feature: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const key = usageKeyForToday();
  const total = (inputTokens || 0) + (outputTokens || 0);

  const current = await readUsage(key);
  const byFeature = { ...(current.byFeature || {}) };
  byFeature[feature] = (byFeature[feature] || 0) + total;

  await writeUsage(key, {
    tokens: current.tokens + total,
    calls: current.calls + 1,
    byFeature,
  });
}

/**
 * Helper: a simple estimator when the API response doesn't include usage metadata.
 */
export function estimateTokens(inputText: string, outputText: string): number {
  // Rough 4 chars per token
  return Math.ceil((inputText.length + outputText.length) / 4);
}
