export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { BACKUP_TABLES } from '@/lib/backup/tables';
import { buildTimestampFilename, type SnapshotEnvelopeV2 } from '@/lib/backup/envelope';

interface CreateBody {
  /** Map of localStorage keys to their stringified values, captured client-side. */
  localStorage?: Record<string, string>;
  /** Optional admin email for audit trail. */
  createdBy?: string | null;
  /** Optional notes (for scheduled vs manual). */
  notes?: string;
  /** Where the snapshot was triggered from. */
  source?: 'admin_button' | 'scheduled' | 'api';
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}

function badConfig(reason: string) {
  return NextResponse.json(
    { ok: false, error: `Backup is not available: ${reason}` },
    { status: 503 }
  );
}

// ─── POST /api/backup/snapshot ────────────────────────────────────────────
// Dump configured tables, combine with the localStorage payload from the
// client, upload as JSON to Storage, write a metadata row.

export async function POST(req: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return unauthorized();

  const supabase = getServerSupabase();
  if (!supabase) {
    return badConfig(
      'SUPABASE_SERVICE_ROLE_KEY is not set on the server. Add it in Vercel env and redeploy.'
    );
  }

  let body: CreateBody = {};
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    body = {};
  }

  const localStorageData = body.localStorage ?? {};
  const createdBy = body.createdBy ?? null;
  const source = body.source ?? 'admin_button';

  // Pull every backup-eligible table in parallel. PostgREST silently drops
  // rows past its default limit, so we cap explicitly at 10k. If a center
  // ever exceeds that we'll add chunked pagination, but ~no Supabase table in
  // this project is anywhere near that yet.
  const tableDumps: Record<string, Record<string, unknown>[]> = {};
  const tableErrors: { table: string; error: string }[] = [];
  let totalRows = 0;

  await Promise.all(
    BACKUP_TABLES.map(async (spec) => {
      const { data, error } = await supabase
        .from(spec.name)
        .select('*')
        .limit(10000);
      if (error) {
        tableErrors.push({ table: spec.name, error: error.message });
        return;
      }
      tableDumps[spec.name] = data ?? [];
      totalRows += (data ?? []).length;
    })
  );

  const envelope: SnapshotEnvelopeV2 = {
    envelope_version: 2,
    meta: {
      created_at: new Date().toISOString(),
      byte_size: 0, // filled after serialization
      local_key_count: Object.keys(localStorageData).length,
      table_count: Object.keys(tableDumps).length,
      table_row_count: totalRows,
      tables_included: Object.keys(tableDumps).sort(),
      created_by: createdBy,
      source,
    },
    localStorage: localStorageData,
    supabase: tableDumps,
  };

  const json = JSON.stringify(envelope);
  envelope.meta.byte_size = new TextEncoder().encode(json).length;
  const finalJson = JSON.stringify(envelope);
  const byteSize = new TextEncoder().encode(finalJson).length;

  const storagePath = buildTimestampFilename();

  const { error: uploadError } = await supabase.storage
    .from('data-snapshots')
    .upload(storagePath, finalJson, {
      contentType: 'application/json',
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      {
        ok: false,
        error: `Storage upload failed: ${uploadError.message}`,
        partialDumpErrors: tableErrors,
      },
      { status: 500 }
    );
  }

  const { data: metaRow, error: metaError } = await supabase
    .from('backup_snapshots')
    .insert({
      storage_path: storagePath,
      envelope_version: 2,
      byte_size: byteSize,
      local_key_count: envelope.meta.local_key_count,
      table_count: envelope.meta.table_count,
      table_row_count: envelope.meta.table_row_count,
      tables_included: envelope.meta.tables_included,
      created_by: createdBy,
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (metaError) {
    // Upload succeeded but metadata write failed. Don't fail the whole
    // request; the file is recoverable from Storage. Log so we know.
    console.error('backup_snapshots metadata write failed:', metaError.message);
  }

  return NextResponse.json({
    ok: true,
    snapshot: {
      id: metaRow?.id ?? storagePath,
      storage_path: storagePath,
      created_at: envelope.meta.created_at,
      byte_size: byteSize,
      local_key_count: envelope.meta.local_key_count,
      table_count: envelope.meta.table_count,
      table_row_count: envelope.meta.table_row_count,
      tables_included: envelope.meta.tables_included,
    },
    partialDumpErrors: tableErrors.length > 0 ? tableErrors : undefined,
  });
}

// ─── GET /api/backup/snapshot ─────────────────────────────────────────────
// List all snapshots, newest first, joined with their metadata rows.

export async function GET() {
  const session = await requireSession('admin');
  if (!session) return unauthorized();

  const supabase = getServerSupabase();
  if (!supabase) {
    return badConfig('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }

  const { data, error } = await supabase
    .from('backup_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Failed to list snapshots: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, snapshots: data ?? [] });
}
