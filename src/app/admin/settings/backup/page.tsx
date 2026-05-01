'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Upload,
  RefreshCw,
  Shield,
  Trash2,
  AlertTriangle,
  Database,
  HardDrive,
} from 'lucide-react';
import { exportToCSV, exportAllData } from '@/lib/export-csv';
import {
  createSnapshot,
  listSnapshots,
  restoreFromSnapshot,
  getSnapshotData,
  deleteSnapshot,
  isV2,
  type SnapshotMeta,
} from '@/lib/data-snapshot';
import { isSupabaseConfigured } from '@/lib/supabase/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  detail?: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BackupPage() {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [restoreTarget, setRestoreTarget] = useState<SnapshotMeta | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreSupabase, setRestoreSupabase] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<SnapshotMeta | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function showToast(
    message: string,
    type: ToastState['type'] = 'info',
    detail?: string
  ) {
    setToast({ message, type, detail });
    setTimeout(() => setToast(null), type === 'error' ? 8000 : 4000);
  }

  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const result = await listSnapshots();
    if (result.ok) {
      setSnapshots(result.data);
    } else {
      setSnapshots([]);
      setLoadError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  // ─── Status indicator ─────────────────────────────────────────────────

  function renderStatusIndicator() {
    if (!isSupabaseConfigured) {
      return (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400 shrink-0" />
          <span className="text-sm text-muted-foreground">
            Supabase is not configured. Backups are unavailable until the
            database is connected.
          </span>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-300 shrink-0 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Checking backup status...
          </span>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex items-start gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 shrink-0 mt-1.5" />
          <div className="text-sm">
            <p className="text-red-700 font-medium">Could not load backup history.</p>
            <p className="text-xs text-red-600 mt-0.5 font-mono break-all">
              {loadError}
            </p>
          </div>
        </div>
      );
    }

    if (snapshots.length === 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400 shrink-0" />
          <span className="text-sm text-yellow-700 font-medium">
            No backups yet. Create your first snapshot now.
          </span>
        </div>
      );
    }

    const last = snapshots[0];
    const days = daysSince(last.created_at);
    const isRecent = days <= 7;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full shrink-0 ${
              isRecent ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm">
            Last backup:{' '}
            <span className="font-medium">{formatDate(last.created_at)}</span>
            {!isRecent && (
              <span className="ml-2 text-red-600 font-medium">
                ({days} days ago — consider creating a new one)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pl-5">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {last.table_count} tables, {last.table_row_count.toLocaleString()} rows
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {last.local_key_count} browser keys
          </span>
          <span>{formatBytes(last.byte_size)}</span>
        </div>
      </div>
    );
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  async function handleCreate() {
    setCreating(true);
    const result = await createSnapshot();
    setCreating(false);

    if (result.ok) {
      const meta = result.data;
      showToast(
        'Snapshot created successfully.',
        'success',
        `${meta.table_count} tables · ${meta.table_row_count.toLocaleString()} rows · ${meta.local_key_count} browser keys · ${formatBytes(meta.byte_size)}`
      );
      await loadSnapshots();
    } else {
      showToast('Snapshot failed.', 'error', result.error);
    }
  }

  async function handleRestore() {
    if (!restoreTarget) return;
    setRestoring(true);
    const result = await restoreFromSnapshot(restoreTarget.id, {
      restoreSupabase,
    });
    setRestoring(false);
    setRestoreTarget(null);

    if (!result.ok) {
      showToast('Restore failed.', 'error', result.error);
      return;
    }

    const { local_keys_restored, supabase_restored, warnings } = result.data;
    const msg = `Restored ${local_keys_restored} browser keys${
      restoreSupabase
        ? ` + ${supabase_restored.rows.toLocaleString()} rows across ${supabase_restored.tables} Supabase tables`
        : ' (Supabase tables skipped)'
    }.`;
    showToast(
      msg,
      warnings.length > 0 ? 'info' : 'success',
      warnings.length > 0 ? `${warnings.length} warning(s): ${warnings[0]}` : undefined
    );
  }

  async function handleDownloadCSV(snapshot: SnapshotMeta) {
    setDownloadingId(snapshot.id);
    const result = await getSnapshotData(snapshot.id);
    setDownloadingId(null);

    if (!result.ok) {
      showToast('Could not download snapshot.', 'error', result.error);
      return;
    }

    const envelope = result.data;
    const rows: Record<string, unknown>[] = [];

    if (isV2(envelope)) {
      // Flatten Supabase tables: one row per record, prefixed with table name.
      for (const [table, tableRows] of Object.entries(envelope.supabase)) {
        for (const row of tableRows) {
          rows.push({ _source: `supabase:${table}`, ...(row as Record<string, unknown>) });
        }
      }
      // Flatten localStorage: each key gets one or many rows depending on shape.
      for (const [key, rawValue] of Object.entries(envelope.localStorage)) {
        try {
          const parsed: unknown = JSON.parse(rawValue);
          if (Array.isArray(parsed)) {
            (parsed as Record<string, unknown>[]).forEach((item) => {
              rows.push({ _source: `local:${key}`, ...item });
            });
          } else if (typeof parsed === 'object' && parsed !== null) {
            rows.push({ _source: `local:${key}`, ...(parsed as Record<string, unknown>) });
          } else {
            rows.push({ _source: `local:${key}`, value: parsed });
          }
        } catch {
          rows.push({ _source: `local:${key}`, value: rawValue });
        }
      }
    } else {
      // v1 fallback (localStorage only)
      for (const [key, rawValue] of Object.entries(envelope.data ?? {})) {
        try {
          const parsed: unknown = JSON.parse(rawValue);
          if (Array.isArray(parsed)) {
            (parsed as Record<string, unknown>[]).forEach((item) => {
              rows.push({ _source: `local:${key}`, ...item });
            });
          } else if (typeof parsed === 'object' && parsed !== null) {
            rows.push({ _source: `local:${key}`, ...(parsed as Record<string, unknown>) });
          } else {
            rows.push({ _source: `local:${key}`, value: parsed });
          }
        } catch {
          rows.push({ _source: `local:${key}`, value: rawValue });
        }
      }
    }

    if (rows.length === 0) {
      showToast('Snapshot is empty, nothing to export.', 'info');
      return;
    }

    const dateLabel = new Date(snapshot.created_at).toISOString().split('T')[0];
    exportToCSV(rows, `christinas-snapshot-${dateLabel}.csv`);
    showToast('CSV downloaded.', 'success');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteSnapshot(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (result.ok) {
      showToast('Snapshot deleted.', 'info');
      await loadSnapshots();
    } else {
      showToast('Delete failed.', 'error', result.error);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Data Backup</h1>
          <p className="text-muted-foreground">
            Snapshot the cloud database AND browser data, restore on any device.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm font-medium space-y-1 ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <p>{toast.message}</p>
          {toast.detail && (
            <p className="text-xs font-mono break-all opacity-80">{toast.detail}</p>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Backup Status</CardTitle>
          <CardDescription>
            Each snapshot saves all configured Supabase tables plus this
            browser&apos;s admin cache.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderStatusIndicator()}

          <Button
            onClick={handleCreate}
            disabled={creating || !isSupabaseConfigured}
            className="bg-christina-red hover:bg-christina-red/90 text-white"
          >
            {creating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating snapshot...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Create Snapshot Now
              </>
            )}
          </Button>

          {!isSupabaseConfigured && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-yellow-500" />
              Connect Supabase to enable cloud snapshots. Until then, use the
              full CSV backup below to save data locally.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved Snapshots</CardTitle>
          <CardDescription>
            Newest first. Restore replaces matching rows in Supabase and
            overwrites the local browser cache.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4">
              Loading snapshots...
            </p>
          ) : snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No snapshots found. Create one above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Tables / Rows
                    </TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      Browser Keys
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots.map((snap) => (
                    <TableRow key={snap.id}>
                      <TableCell className="font-medium text-sm">
                        {formatDate(snap.created_at)}
                        {snap.envelope_version === 1 && (
                          <span className="ml-2 text-xs text-yellow-600">
                            (v1, browser-only)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {snap.byte_size > 0 ? formatBytes(snap.byte_size) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
                        {snap.table_count > 0
                          ? `${snap.table_count} / ${snap.table_row_count.toLocaleString()}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">
                        {snap.local_key_count > 0 ? snap.local_key_count : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRestoreTarget(snap);
                              setRestoreSupabase(snap.envelope_version === 2);
                            }}
                            title="Restore this snapshot"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Restore</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadCSV(snap)}
                            disabled={downloadingId === snap.id}
                            title="Download as CSV"
                          >
                            {downloadingId === snap.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="sr-only">Download CSV</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(snap)}
                            title="Delete snapshot"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Data Export</CardTitle>
          <CardDescription>
            Download the local browser cache as a single CSV file. Useful as a
            secondary local backup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={exportAllData}>
            <Download className="h-4 w-4 mr-2" />
            Download Full Backup (CSV)
          </Button>
        </CardContent>
      </Card>

      {/* Restore confirmation */}
      <Dialog
        open={restoreTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Restore from backup?
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-3">
              <span className="block">
                This will overwrite current browser data with the backup from{' '}
                <span className="font-medium text-foreground">
                  {restoreTarget ? formatDate(restoreTarget.created_at) : ''}
                </span>
                .
              </span>
              {restoreTarget?.envelope_version === 2 && (
                <span className="block">
                  The snapshot also contains{' '}
                  <span className="font-medium text-foreground">
                    {restoreTarget.table_count} Supabase tables
                  </span>{' '}
                  ({restoreTarget.table_row_count.toLocaleString()} rows). Rows
                  with matching ids will be overwritten in the cloud.
                </span>
              )}
              <span className="block font-medium text-foreground">
                Any changes made after this snapshot was created will be lost.
              </span>
            </DialogDescription>
          </DialogHeader>

          {restoreTarget?.envelope_version === 2 && (
            <label className="flex items-start gap-2 text-sm rounded-md border border-yellow-200 bg-yellow-50 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={restoreSupabase}
                onChange={(e) => setRestoreSupabase(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium block">
                  Also restore Supabase tables
                </span>
                <span className="text-xs text-yellow-700">
                  Uncheck to restore only the browser cache and leave the cloud
                  database untouched.
                </span>
              </span>
            </label>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRestoreTarget(null)}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoring}
              className="bg-christina-red hover:bg-christina-red/90 text-white"
            >
              {restoring ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                'Yes, restore this backup'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete snapshot?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently delete the snapshot from{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? formatDate(deleteTarget.created_at) : ''}
              </span>
              . This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
