'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Mail, RefreshCw } from 'lucide-react';

interface DeletionRequest {
  id: string;
  created_at: string;
  requester_name: string;
  requester_email: string;
  relationship: string | null;
  child_name: string | null;
  reason: string | null;
  status: 'new' | 'in_review' | 'completed' | 'denied';
  admin_notes: string | null;
  handled_at: string | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-christina-coral text-white',
  in_review: 'bg-christina-blue text-white',
  completed: 'bg-christina-green text-white',
  denied: 'bg-gray-400 text-white',
};
const NEXT: Record<string, { label: string; status: DeletionRequest['status'] }[]> = {
  new: [
    { label: 'Start review', status: 'in_review' },
    { label: 'Mark done', status: 'completed' },
  ],
  in_review: [
    { label: 'Mark done', status: 'completed' },
    { label: 'Deny', status: 'denied' },
  ],
  completed: [{ label: 'Reopen', status: 'in_review' }],
  denied: [{ label: 'Reopen', status: 'in_review' }],
};

export default function DataRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/data-requests', { cache: 'no-store' });
      if (res.status === 401) {
        setError('Please sign in as an administrator to view this page.');
        setRequests([]);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not load requests.');
        return;
      }
      setRequests(data.requests || []);
    } catch {
      setError('Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: DeletionRequest['status']) {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch('/api/admin/data-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
    load();
  }

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };
  const open = requests.filter((r) => r.status === 'new' || r.status === 'in_review').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-christina-red" /> Data Deletion Requests
          </h1>
          <p className="text-muted-foreground">
            {open} open &middot; {requests.length} total. Delete what licensing permits; keep
            required records until their retention period ends.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={load}>
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>

      {error && (
        <p className="text-sm text-christina-red bg-christina-red/5 border border-christina-red/20 rounded-lg p-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : requests.length === 0 && !error ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No deletion requests yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{r.requester_name}</h3>
                      <Badge className={statusColors[r.status]}>{r.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {r.relationship ? `${r.relationship} · ` : ''}
                      {r.child_name ? `Child: ${r.child_name} · ` : ''}
                      Submitted {fmt(r.created_at)}
                      {r.handled_at ? ` · Updated ${fmt(r.handled_at)}` : ''}
                    </p>
                    <a
                      href={`mailto:${r.requester_email}`}
                      className="text-sm text-christina-blue hover:underline inline-flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" /> {r.requester_email}
                    </a>
                    {r.reason && (
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">&ldquo;{r.reason}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {(NEXT[r.status] || []).map((action) => (
                      <Button
                        key={action.status}
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(r.id, action.status)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
