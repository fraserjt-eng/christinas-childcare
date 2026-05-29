'use client';

import { useEffect, useState } from 'react';
import type { MyTicket, TicketStatus } from '@/lib/support/types';

const STATUS_LABEL: Record<TicketStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

const STATUS_CLASS: Record<TicketStatus, string> = {
  new: 'bg-christina-yellow/30 text-foreground',
  in_progress: 'bg-christina-blue/15 text-christina-blue',
  resolved: 'bg-christina-green/15 text-christina-green',
};

export function MyTicketsList() {
  const [tickets, setTickets] = useState<MyTicket[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/support/tickets/mine')
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((d) => {
        if (!cancelled) setTickets(d.tickets ?? []);
      })
      .catch(() => {
        if (!cancelled) setTickets([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (tickets === null) {
    return <p className="text-sm text-muted-foreground">Loading your reports…</p>;
  }
  if (tickets.length === 0) {
    return <p className="text-sm text-muted-foreground">You have not reported anything yet.</p>;
  }
  return (
    <ul className="divide-y rounded-lg border bg-white">
      {tickets.map((t) => (
        <li key={t.id} className="py-3 px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{t.subject}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(t.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${STATUS_CLASS[t.status]}`}>
            {STATUS_LABEL[t.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
