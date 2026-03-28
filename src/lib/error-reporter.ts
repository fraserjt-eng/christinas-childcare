/**
 * Lightweight error reporter.
 *
 * Logs errors to the Supabase `error_logs` table when the database is
 * configured. Falls back to console.error when Supabase is not available.
 *
 * Usage:
 *   import { reportError } from '@/lib/error-reporter';
 *   reportError(err, { url: '/admin/food-counts', user_id: userId });
 */

import { getSupabase } from '@/lib/supabase/client';

export interface ErrorContext {
  url?: string;
  user_id?: string;
  [key: string]: string | undefined;
}

/**
 * Report an error. Non-blocking: failures are swallowed after logging to
 * console so this never causes a secondary error in the calling code.
 */
export function reportError(error: Error, context?: ErrorContext): void {
  const supabase = getSupabase();

  if (!supabase) {
    console.error('[error-reporter] Supabase not configured. Error details below.');
    console.error(error);
    if (context) console.error('Context:', context);
    return;
  }

  const payload = {
    error_message: error.message,
    error_stack: error.stack ?? null,
    url: context?.url ?? (typeof window !== 'undefined' ? window.location.pathname : null),
    user_id: context?.user_id ?? null,
  };

  // Fire and forget. We intentionally do not await this so the caller is never
  // blocked.
  Promise.resolve(supabase.from('error_logs').insert(payload)).then((result) => {
    if (result && 'error' in result && result.error) {
      console.error('[error-reporter] Failed to write to error_logs:', result.error);
      console.error('Original error:', error);
    }
  }).catch((unexpected: unknown) => {
    console.error('[error-reporter] Unexpected failure:', unexpected);
    console.error('Original error:', error);
  });
}

/**
 * Async version of reportError for use in server-side contexts where you want
 * to confirm the write before continuing.
 */
export async function reportErrorAsync(
  error: Error,
  context?: ErrorContext
): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) {
    console.error('[error-reporter] Supabase not configured. Error details below.');
    console.error(error);
    if (context) console.error('Context:', context);
    return;
  }

  const payload = {
    error_message: error.message,
    error_stack: error.stack ?? null,
    url: context?.url ?? null,
    user_id: context?.user_id ?? null,
  };

  try {
    const { error: dbError } = await supabase.from('error_logs').insert(payload);
    if (dbError) {
      console.error('[error-reporter] Failed to write to error_logs:', dbError.message);
    }
  } catch (unexpected) {
    console.error('[error-reporter] Unexpected failure:', unexpected);
  }
}
