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
} from 'lucide-react';
import { exportToCSV, exportAllData } from '@/lib/export-csv';
import {
  createSnapshot,
  listSnapshots,
  restoreFromSnapshot,
  getSnapshotData,
  deleteSnapshot,
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
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BackupPage() {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Restore dialog
  const [restoreTarget, setRestoreTarget] = useState<SnapshotMeta | null>(null);
  const [restoring, setRestoring] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<SnapshotMeta | null>(null);
  const [deleting, setDeleting] = useState(false);

  // CSV download
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function showToast(message: string, type: ToastState['type'] = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    const list = await listSnapshots();
    setSnapshots(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  // ─── Status card content ──────────────────────────────────────────────

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
          <span className="text-sm text-muted-foreground">Checking backup status...</span>
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
              ({days} days ago, consider creating a new one)
            </span>
          )}
        </span>
      </div>
    );
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  async function handleCreate() {
    setCreating(true);
    const meta = await createSnapshot();
    if (meta) {
      showToast('Snapshot created successfully.', 'success');
      await loadSnapshots();
    } else {
      showToast('Snapshot failed. Check that Supabase storage is configured.', 'error');
    }
    setCreating(false);
  }

  async function handleRestore() {
    if (!restoreTarget) return;
    setRestoring(true);
    const count = await restoreFromSnapshot(restoreTarget.id);
    setRestoring(false);
    setRestoreTarget(null);
    if (count > 0) {
      showToast(`Restored ${count} data keys from backup.`, 'success');
    } else {
      showToast('Restore failed or the snapshot was empty.', 'error');
    }
  }

  async function handleDownloadCSV(snapshot: SnapshotMeta) {
    setDownloadingId(snapshot.id);
    const data = await getSnapshotData(snapshot.id);
    setDownloadingId(null);

    if (!data) {
      showToast('Could not download snapshot data.', 'error');
      return;
    }

    // Flatten each stored JSON value into rows for CSV export.
    // Each key becomes a section: key name + all flattened rows.
    const rows: Record<string, unknown>[] = [];

    for (const [key, rawValue] of Object.entries(data)) {
      try {
        const parsed: unknown = JSON.parse(rawValue);

        if (Array.isArray(parsed)) {
          (parsed as Record<string, unknown>[]).forEach((item) => {
            rows.push({ _source_key: key, ...item });
          });
        } else if (typeof parsed === 'object' && parsed !== null) {
          rows.push({ _source_key: key, ...(parsed as Record<string, unknown>) });
        } else {
          rows.push({ _source_key: key, value: parsed });
        }
      } catch {
        rows.push({ _source_key: key, value: rawValue });
      }
    }

    if (rows.length === 0) {
      showToast('Snapshot is empty, nothing to export.', 'info');
      return;
    }

    const dateLabel = new Date(snapshot.created_at)
      .toISOString()
      .split('T')[0];
    exportToCSV(rows, `christinas-snapshot-${dateLabel}.csv`);
    showToast('CSV downloaded.', 'success');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteSnapshot(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) {
      showToast('Snapshot deleted.', 'info');
      await loadSnapshots();
    } else {
      showToast('Delete failed.', 'error');
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Data Backup</h1>
          <p className="text-muted-foreground">
            Snapshot your browser data to the cloud and restore it on any device.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Status card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Backup Status</CardTitle>
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
              full CSV backup below to save your data locally.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Snapshot list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved Snapshots</CardTitle>
          <CardDescription>
            Up to 8 snapshots are kept. Older ones are removed automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading snapshots...</p>
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
                    <TableHead className="text-right hidden sm:table-cell">Keys</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots.map((snap) => (
                    <TableRow key={snap.id}>
                      <TableCell className="font-medium text-sm">
                        {formatDate(snap.created_at)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {snap.byte_size > 0 ? formatBytes(snap.byte_size) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
                        {snap.key_count > 0 ? snap.key_count : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRestoreTarget(snap)}
                            title="Restore this snapshot to your browser"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Restore</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadCSV(snap)}
                            disabled={downloadingId === snap.id}
                            title="Download this snapshot as CSV"
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
                            title="Delete this snapshot"
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

      {/* Full CSV backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Data Export</CardTitle>
          <CardDescription>
            Download everything in your browser as a single CSV file. Use this
            as a local backup or to share data with your accountant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={exportAllData}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Full Backup (CSV)
          </Button>
        </CardContent>
      </Card>

      {/* Restore confirmation dialog */}
      <Dialog
        open={restoreTarget !== null}
        onOpenChange={(open) => { if (!open) setRestoreTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Restore from backup?
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                This will overwrite your current browser data with the backup
                from{' '}
                <span className="font-medium text-foreground">
                  {restoreTarget ? formatDate(restoreTarget.created_at) : ''}
                </span>.
              </p>
              <p>
                Your cloud data in Supabase is not affected. Only the local
                browser storage on this device will be updated.
              </p>
              <p className="font-medium text-foreground">
                Any changes made after this snapshot was created will be lost.
                Continue?
              </p>
            </DialogDescription>
          </DialogHeader>
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
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
