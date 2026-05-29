'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';

// Admin-only at-a-glance count of unhandled tickets. Stands in for the email
// ping (cut from v1) so new reports are not invisible. Links to the Helpdesk.
export function HelpdeskNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/support/tickets?status=new')
      .then((r) => (r.ok ? r.json() : { newCount: 0 }))
      .then((d) => {
        if (!cancelled) setCount(d.newCount ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/admin/helpdesk"
      title="Helpdesk"
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Inbox className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-christina-coral text-white text-[11px] font-semibold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
