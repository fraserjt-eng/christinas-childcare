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

// Backups are whole-organization dumps (every center's children, staff, and
// financial rows). Only a cross-center director (owner/superadmin, or a session
// with no home center) may create, read, restore, or delete them; a center-bound
// admin must not reach another center's data through a backup. (OWASP: broken
// access control / IDOR — center-scope bypass.)
function isCrossCenter(session: { user: { role?: string; center_id?: string | null } }): boolean {
  const role = (session.user.role || '').toLowerCase();
  return role === 'owner' || role === 'superadmin' || !session.user.center_id;
}
function forbidden() {
  return NextResponse.json(
    { ok: false, error: 'Backups are restricted to the owner.' },
    { status: 403 }
  );
}

async function loadSnapshotByIdOrPath(id: string) {
  const supabase = getServerSupabase();
  if (!supabase) return { error: 'Backup is not available.' as const };

  // ALWAYS resolve through the metadata row by id; never accept a raw object
  // path (which would let an attacker download arbitrary objects in the
  // data-snapshots bucket by guessing filenames).
  const { data, error } = await supabase
    .from('backup_snapshots')
    .select('storage_path')
    .eq('id', id)
    .single();
  if (error || !data) {
    if (error) console.error('snapshot metadata lookup failed:', error.message);
    return { error: 'Snapshot not found.' };
  }
  const storagePath = data.storage_path;

  const { data: blob, error: dlError } = await supabase.storage
    .from('data-snapshots')
    .download(storagePath);

  if (dlError || !blob) {
    if (dlError) console.error('snapshot download failed:', dlError.message);
    return { error: 'Backup operation failed. Check logs.' };
  }

  const text = await blob.text();
  let envelope: SnapshotEnvelope;
  try {
    envelope = JSON.parse(text) as SnapshotEnvelope;
  } catch (e) {
    console.error('snapshot JSON parse failed:', (e as Error).message);
    return { error: 'Backup operation failed. Check logs.' };
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
  if (!isCrossCenter(session)) return forbidden();

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
  if (!isCrossCenter(session)) return forbidden();

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Backup is not available.' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // Resolve through the metadata row by id (never accept a raw object path).
  const { data: meta, error: metaErr } = await supabase
    .from('backup_snapshots')
    .select('id, storage_path')
    .eq('id', decodedId)
    .single();
  if (metaErr || !meta) {
    if (metaErr) console.error('snapshot delete lookup failed:', metaErr.message);
    return NextResponse.json(
      { ok: false, error: 'Snapshot not found.' },
      { status: 404 }
    );
  }
  const storagePath = meta.storage_path as string;
  const metaId: string | null = meta.id as string;

  const { error: rmError } = await supabase.storage
    .from('data-snapshots')
    .remove([storagePath]);

  if (rmError) {
    console.error('snapshot storage delete failed:', rmError.message);
    return NextResponse.json(
      { ok: false, error: 'Backup operation failed. Check logs.' },
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
  if (!isCrossCenter(session)) return forbidden();

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
