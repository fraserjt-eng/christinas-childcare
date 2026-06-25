'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

interface ReviewItem {
  id: string;
  type: 'parent_message';
  family_id: string;
  to: string;
  subject: string;
  body: string;
  from_name: string;
  created_at: string;
  status: string;
  review_note: string | null;
}

export default function CommsReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/comms-review');
      if (r.status === 401) {
        setDenied(true);
        setLoading(false);
        return;
      }
      const d = await r.json();
      setItems(d.items || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: 'approve' | 'reject', noteText?: string) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/comms-review/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: noteText }),
      });
      const d = await r.json();
      if (r.ok) {
        setFlash(
          action === 'approve'
            ? d.emailed
              ? 'Approved and sent — emailed and posted to the family portal.'
              : 'Approved and posted to the family portal. The email queues for when the email service is switched on.'
            : 'Sent back to the composer as a draft.'
        );
        setRejectId(null);
        setNote('');
        await load();
      } else {
        setFlash(d.error || 'Could not complete that.');
      }
    } catch {
      setFlash('Connection error. Please try again.');
    }
    setBusyId(null);
  }

  if (denied) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            This review queue is for owners. Ask J or Christina to review and send
            pending family messages.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <MailCheck className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Review &amp; send</h1>
          <p className="text-muted-foreground">
            {items.length === 0
              ? 'Nothing waiting for review'
              : `${items.length} message${items.length === 1 ? '' : 's'} waiting for your approval`}
          </p>
        </div>
      </div>

      {flash && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center justify-between">
          <span>{flash}</span>
          <button
            onClick={() => setFlash(null)}
            className="text-green-700 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MailCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>All clear. Nothing is waiting to be sent to families.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-base">
                      {it.subject || '(no subject)'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      To {it.to} · from {it.from_name || 'staff'}
                      {it.status === 'draft' ? ' · sent back' : ''}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {it.created_at ? new Date(it.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                  {it.body}
                </div>
                {it.review_note && (
                  <p className="text-xs text-amber-700">
                    Your earlier note: {it.review_note}
                  </p>
                )}
                {rejectId === it.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Optional note back to the composer…"
                      className="w-full rounded-md border border-input bg-background p-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRejectId(null);
                          setNote('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => act(it.id, 'reject', note)}
                        disabled={busyId === it.id}
                      >
                        Send back
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-christina-red hover:bg-christina-red/90"
                      onClick={() => act(it.id, 'approve')}
                      disabled={busyId === it.id}
                    >
                      {busyId === it.id ? 'Sending…' : 'Approve & send'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectId(it.id)}
                      disabled={busyId === it.id}
                    >
                      Send back
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
