'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SupportTicket, TicketStatus } from '@/lib/support/types';

type Filter = TicketStatus | 'all';
const FILTERS: Filter[] = ['new', 'in_progress', 'resolved', 'all'];
const FILTER_LABEL: Record<Filter, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  all: 'All',
};
const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  staff: 'Staff',
  parent: 'Parent',
};

interface Media {
  audioUrl: string | null;
  imageUrl: string | null;
}

export function HelpdeskInbox() {
  const [filter, setFilter] = useState<Filter>('new');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [media, setMedia] = useState<Record<string, Media>>({});

  const load = useCallback(() => {
    setLoading(true);
    const qs = filter === 'all' ? '' : `?status=${filter}`;
    fetch(`/api/admin/support/tickets${qs}`)
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((d) => setTickets(d.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(id: string) {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next && !media[id]) {
      try {
        const r = await fetch(`/api/admin/support/tickets/${id}/media`);
        if (r.ok) {
          const m = (await r.json()) as Media;
          setMedia((prev) => ({ ...prev, [id]: m }));
        }
      } catch {
        /* leave media absent; text still shows */
      }
    }
  }

  async function setStatus(id: string, status: TicketStatus) {
    try {
      await fetch(`/api/admin/support/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } finally {
      load();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className={filter === f ? 'bg-christina-red hover:bg-christina-red/90 text-white' : ''}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABEL[f]}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tickets here.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {tickets.map((t) => {
            const isOpen = openId === t.id;
            return (
              <li key={t.id} className="px-4 py-3">
                <button
                  type="button"
                  className="w-full text-left flex items-start gap-2"
                  onClick={() => toggle(t.id)}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium text-sm text-foreground truncate">{t.subject}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {ROLE_LABEL[t.submitter_role] ?? t.submitter_role} ·{' '}
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {t.submitter_name ?? 'Unknown'}
                    </span>
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 ml-6 rounded-md bg-muted/40 p-3 flex flex-col gap-3 text-sm">
                    {t.description ? (
                      <p className="text-foreground whitespace-pre-wrap">{t.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No written description.</p>
                    )}

                    {media[t.id]?.audioUrl && (
                      <audio src={media[t.id]!.audioUrl!} controls className="w-full max-w-sm" />
                    )}
                    {media[t.id]?.imageUrl && (
                      <a href={media[t.id]!.imageUrl!} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media[t.id]!.imageUrl!}
                          alt="Attachment"
                          className="max-h-64 rounded border"
                        />
                      </a>
                    )}

                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {t.page_url && <p className="break-all">Page: {t.page_url}</p>}
                      {t.viewport && <p>Screen: {t.viewport}</p>}
                      {t.user_agent && <p className="break-all">{t.user_agent}</p>}
                      {t.submitter_email && <p>Contact: {t.submitter_email}</p>}
                    </div>

                    <div className="flex gap-2 pt-1 flex-wrap">
                      <Button
                        size="sm"
                        variant={t.status === 'new' ? 'default' : 'outline'}
                        onClick={() => setStatus(t.id, 'new')}
                      >
                        New
                      </Button>
                      <Button
                        size="sm"
                        variant={t.status === 'in_progress' ? 'default' : 'outline'}
                        onClick={() => setStatus(t.id, 'in_progress')}
                      >
                        In progress
                      </Button>
                      <Button
                        size="sm"
                        variant={t.status === 'resolved' ? 'default' : 'outline'}
                        className={
                          t.status === 'resolved'
                            ? 'bg-christina-green hover:bg-christina-green/90 text-white'
                            : ''
                        }
                        onClick={() => setStatus(t.id, 'resolved')}
                      >
                        Resolved
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
