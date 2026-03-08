import { getSupabase, isSupabaseConfigured } from './client';

// Generic Supabase CRUD helpers
// When Supabase is not configured, returns null so callers can fall back to localStorage

export async function supabaseSelect<T>(
  table: string,
  options?: {
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<T[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase.from(table).select('*');

  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Supabase select error on ${table}:`, error.message);
    return null;
  }
  return data as T[];
}

export async function supabaseSelectRange<T>(
  table: string,
  column: string,
  gte?: string,
  lte?: string,
  extraFilters?: Record<string, unknown>
): Promise<T[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase.from(table).select('*');

  if (gte) query = query.gte(column, gte);
  if (lte) query = query.lte(column, lte);

  if (extraFilters) {
    for (const [key, value] of Object.entries(extraFilters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Supabase range select error on ${table}:`, error.message);
    return null;
  }
  return data as T[];
}

export async function supabaseInsert<T>(
  table: string,
  record: Record<string, unknown>
): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error(`Supabase insert error on ${table}:`, error.message);
    return null;
  }
  return data as T;
}

export async function supabaseUpdate<T>(
  table: string,
  id: string,
  updates: Record<string, unknown>
): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Supabase update error on ${table}:`, error.message);
    return null;
  }
  return data as T;
}

export async function supabaseUpsert<T>(
  table: string,
  record: Record<string, unknown>,
  onConflict: string
): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .upsert(record, { onConflict })
    .select()
    .single();

  if (error) {
    console.error(`Supabase upsert error on ${table}:`, error.message);
    return null;
  }
  return data as T;
}

export async function supabaseDelete(
  table: string,
  id: string
): Promise<boolean | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(`Supabase delete error on ${table}:`, error.message);
    return null;
  }
  return true;
}

export { isSupabaseConfigured };
