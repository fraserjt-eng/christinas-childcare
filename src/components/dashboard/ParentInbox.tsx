'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Inbox,
  Megaphone,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { getCommunications, markAsRead, getReadCounts } from '@/lib/comms-storage';
import type { Communication, CommunicationType } from '@/lib/comms-storage';

const DEMO_PARENT_ID = 'demo-parent-1';

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_ICON: Record<CommunicationType, React.ReactNode> = {
  announcement: <Megaphone className="h-4 w-4 text-christina-blue" />,
  individual: <MessageSquare className="h-4 w-4 text-christina-green" />,
  daily_update: <MessageSquare className="h-4 w-4 text-christina-coral" />,
  template: <MessageSquare className="h-4 w-4 text-muted-foreground" />,
};

const TYPE_LABEL: Record<CommunicationType, string> = {
  announcement: 'Announcement',
  individual: 'Message',
  daily_update: 'Daily Update',
  template: 'Message',
};

interface InboxItem {
  comm: Communication;
  isRead: boolean;
}

export function ParentInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const comms = await getCommunications({ status: 'sent', search: search || undefined });
      const visible = comms.filter(
        (c) => c.type === 'announcement' || c.type === 'individual' || c.type === 'daily_update'
      );

      const ids = visible.map((c) => c.id);
      await getReadCounts(ids);

      const readSet = new Set<string>(
        ids.filter((id) => {
          if (typeof window === 'undefined') return false;
          try {
            const raw = localStorage.getItem('christinas_comm_reads');
            if (!raw) return false;
            const reads: Array<{ communication_id: string; parent_id: string }> = JSON.parse(raw);
            return reads.some(
              (r) => r.communication_id === id && r.parent_id === DEMO_PARENT_ID
            );
          } catch {
            return false;
          }
        })
      );

      setItems(
        visible.map((c) => ({
          comm: c,
          isRead: readSet.has(c.id),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleExpand(id: string, isRead: boolean) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!isRead) {
      await markAsRead(id, DEMO_PARENT_ID);
      setItems((prev) =>
        prev.map((item) =>
          item.comm.id === id ? { ...item, isRead: true } : item
        )
      );
    }
  }

  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-christina-red text-white text-xs px-2">
            {unreadCount} new
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Inbox className="h-4 w-4 text-christina-red" />
            Inbox
            <Badge variant="outline" className="text-xs ml-1">{items.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Inbox className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Your inbox is empty.</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map(({ comm, isRead }) => (
                <div key={comm.id}>
                  <button
                    className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors ${
                      !isRead ? 'bg-christina-blue/5' : ''
                    }`}
                    onClick={() => handleExpand(comm.id, isRead)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {TYPE_ICON[comm.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm ${!isRead ? 'font-semibold' : 'font-medium'}`}>
                            {comm.subject}
                          </span>
                          {!isRead && (
                            <Badge className="bg-christina-red text-white text-xs px-1.5 py-0">NEW</Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-xs hidden sm:inline-flex"
                          >
                            {TYPE_LABEL[comm.type]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {comm.sent_at ? formatDate(comm.sent_at) : 'Just now'}
                        </div>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        {expandedId === comm.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                  {expandedId === comm.id && (
                    <div className="px-4 pb-4 pt-2 bg-muted/20 border-t">
                      <div
                        className="text-sm prose-sm max-w-none bg-white rounded border p-3"
                        dangerouslySetInnerHTML={{ __html: comm.body_html }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
