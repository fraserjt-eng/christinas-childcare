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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  last_sent_at: string | null;
}

const STATUS_BADGE: Record<Subscriber['status'], string> = {
  subscribed: 'bg-green-100 text-green-800 border-green-200',
  unsubscribed: 'bg-gray-100 text-gray-700 border-gray-200',
  bounced: 'bg-red-100 text-red-700 border-red-200',
  complained: 'bg-orange-100 text-orange-700 border-orange-200',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/subscribers');
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error ?? `Failed (HTTP ${res.status})`);
        setSubscribers([]);
      } else {
        setSubscribers(body.subscribers as Subscriber[]);
      }
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim() || undefined,
          source: 'admin_add',
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        showToast('error', body.error ?? `Add failed (HTTP ${res.status})`);
      } else if (body.alreadySubscribed) {
        showToast('info', 'Already subscribed.');
      } else if (body.resubscribed) {
        showToast('success', 'Re-subscribed (was previously unsubscribed).');
      } else {
        showToast('success', 'Subscriber added.');
      }
      setNewEmail('');
      setNewName('');
      await load();
    } catch (e) {
      showToast('error', `Network error: ${(e as Error).message}`);
    } finally {
      setAdding(false);
    }
  };

  const counts = {
    subscribed: subscribers.filter((s) => s.status === 'subscribed').length,
    unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
    bounced: subscribers.filter((s) => s.status === 'bounced').length,
    complained: subscribers.filter((s) => s.status === 'complained').length,
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">
            Manage who receives Christina&apos;s newsletter.
          </p>
        </div>
      </div>

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
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{counts.subscribed}</p>
            <p className="text-xs text-muted-foreground">Subscribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-500">{counts.unsubscribed}</p>
            <p className="text-xs text-muted-foreground">Unsubscribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{counts.bounced}</p>
            <p className="text-xs text-muted-foreground">Bounced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{counts.complained}</p>
            <p className="text-xs text-muted-foreground">Complained</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-christina-red" />
            Add Subscriber
          </CardTitle>
          <CardDescription>
            Manually add a subscriber. The public sign-up form posts to the same endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Input
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={adding || !newEmail.trim()}
              className="bg-christina-red hover:bg-christina-red/90 text-white"
            >
              {adding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Subscribers</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${subscribers.length} total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 text-red-700 text-sm p-3 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!loading && subscribers.length === 0 && !error ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-muted" />
              <p className="text-sm">No subscribers yet. Add one above to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Source</TableHead>
                    <TableHead className="hidden lg:table-cell">Subscribed</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-sm">{sub.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {sub.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[sub.status]}`}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {sub.source ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(sub.subscribed_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(sub.last_sent_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
