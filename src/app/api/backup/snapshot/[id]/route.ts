export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import {
  isV2,
  type SnapshotEnvelope,
  type SnapshotEnvelopeV2,
} from '@/lib/backup/envelope';
import { RESTORE_BLOCKLIST } from '@/lib/backup/tables';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}

async function loadSnapshotByIdOrPath(id: string) {
  const supabase = getServerSupabase();
  if (!supabase) return { error: 'Supabase service role not configured.' as const };

  // Look up metadata first; the id might be a uuid OR a legacy filename.
  let storagePath = id;
  const isUuidish = /^[0-9a-f]{8}-/.test(id);
  if (isUuidish) {
    const { data, error } = await supabase
      .from('backup_snapshots')
      .select('storage_path')
      .eq('id', id)
      .single();
    if (error || !data) {
      return { error: `Snapshot not found: ${error?.message ?? 'no row'}` };
    }
    storagePath = data.storage_path;
  }

  const { data: blob, error: dlError } = await supabase.storage
    .from('data-snapshots')
    .download(storagePath);

  if (dlError || !blob) {
    return { error: `Download failed: ${dlError?.message ?? 'no data'}` };
  }

  const text = await blob.text();
  let envelope: SnapshotEnvelope;
  try {
    envelope = JSON.parse(text) as SnapshotEnvelope;
  } catch (e) {
    return { error: `Snapshot JSON is malformed: ${(e as Error).message}` };
  }

  return { envelope, storagePath, supabase };
}

// ─── GET /api/backup/snapshot/[id] ────────────────────────────────────────
// Returns the parsed envelope so the client can preview before restoring.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession('admin');
  if (!session) return unauthorized();

  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const result = await loadSnapshotByIdOrPath(decodedId);
  if ('error' in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, envelope: result.envelope });
}

// ─── DELETE /api/backup/snapshot/[id] ─────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession('admin');
  if (!session) return unauthorized();

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Supabase service role not configured.' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // Resolve the storage path so we can remove both the file and the metadata row.
  const isUuidish = /^[0-9a-f]{8}-/.test(decodedId);
  let storagePath = decodedId;
  let metaId: string | null = null;
  if (isUuidish) {
    const { data, error } = await supabase
      .from('backup_snapshots')
      .select('id, storage_path')
      .eq('id', decodedId)
      .single();
    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: `Snapshot not found: ${error?.message ?? 'no row'}` },
        { status: 404 }
      );
    }
    storagePath = data.storage_path;
    metaId = data.id;
  }

  const { error: rmError } = await supabase.storage
    .from('data-snapshots')
    .remove([storagePath]);

  if (rmError) {
    return NextResponse.json(
      { ok: false, error: `Storage delete failed: ${rmError.message}` },
      { status: 500 }
    );
  }

  if (metaId) {
    await supabase.from('backup_snapshots').delete().eq('id', metaId);
  } else {
    // Legacy filename — try cleaning a metadata row by storage_path.
    await supabase.from('backup_snapshots').delete().eq('storage_path', storagePath);
  }

  return NextResponse.json({ ok: true });
}

// ─── POST /api/backup/snapshot/[id] ───────────────────────────────────────
// Restore: returns the localStorage payload to the client (so it can write to
// the actual browser storage) AND upserts every table in the supabase block
// back into Postgres. Restore is destructive on rows with matching ids.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession('admin');
  if (!session) return unauthorized();

  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const result = await loadSnapshotByIdOrPath(decodedId);
  if ('error' in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }

  const { envelope, supabase } = result;

  // Parse confirmation flags
  let body: { restoreSupabase?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const restoreSupabase = body.restoreSupabase !== false; // default true

  // For v1 envelopes: only localStorage exists.
  if (!isV2(envelope)) {
    return NextResponse.json({
      ok: true,
      envelope_version: 1,
      localStorage: envelope.data ?? {},
      supabase_restored: { tables: 0, rows: 0 },
      warnings: ['Snapshot was v1 (browser-only). Supabase tables not restored.'],
    });
  }

  const v2 = envelope as SnapshotEnvelopeV2;
  const warnings: string[] = [];
  let tablesRestored = 0;
  let rowsRestored = 0;

  if (restoreSupabase) {
    for (const tableName of v2.meta.tables_included) {
      if (RESTORE_BLOCKLIST.has(tableName)) {
        warnings.push(`Skipped ${tableName} (in restore blocklist).`);
        continue;
      }
      const rows = v2.supabase[tableName] ?? [];
      if (rows.length === 0) continue;

      // Upsert in chunks of 500 to stay well under any payload limits.
      const CHUNK = 500;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const { error } = await supabase
          .from(tableName)
          .upsert(chunk, { onConflict: 'id' });
        if (error) {
          console.error(
            `${tableName}: upsert error on rows ${i}-${i + chunk.length}:`,
            error.message
          );
          warnings.push('Restore operation failed. Check logs.');
          break;
        }
        rowsRestored += chunk.length;
      }
      tablesRestored += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    envelope_version: 2,
    localStorage: v2.localStorage,
    supabase_restored: { tables: tablesRestored, rows: rowsRestored },
    warnings,
  });
}
