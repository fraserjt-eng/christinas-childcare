// Supabase Realtime helper
// Subscribes to postgres_changes for a table and fires a callback on any change.
// Returns an unsubscribe function.

import { getSupabase } from './client';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface SubscribeOptions {
  event?: RealtimeEvent;
  schema?: string;
}

/**
 * Subscribe to changes on a Supabase table.
 * Returns an unsubscribe function. Safe to call from client components.
 */
export function subscribeToTable(
  table: string,
  callback: () => void,
  options: SubscribeOptions = {}
): () => void {
  const supabase = getSupabase();
  if (!supabase) {
    // No supabase configured — return a no-op unsubscribe
    return () => {};
  }

  const channelName = `realtime:${table}:${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      // Using any because Supabase's strict event literal typing doesn't
      // compose cleanly with our string union input.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event: options.event || '*',
        schema: options.schema || 'public',
        table,
      },
      () => {
        try {
          callback();
        } catch (e) {
          console.error(`Realtime callback error on ${table}:`, e);
        }
      }
    )
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (e) {
      console.error(`Realtime unsubscribe error on ${table}:`, e);
    }
  };
}
