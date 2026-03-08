import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
// Use this in API routes where you need full access (bypasses RLS)
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
