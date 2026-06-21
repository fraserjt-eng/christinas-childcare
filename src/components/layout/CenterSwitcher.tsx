'use client';

// Admin center funnel: the "starting menu" at the top of the admin sidebar.
// Brooklyn Park | Crystal | Combined. Crystal/BP scope every center-aware page
// to that site (via the cc_center cookie the rest of the app already reads).
// Combined sets cc_view=combined for the pages that aggregate across centers
// (attendance hub, dashboard); other pages safely show the last single center.
//
// Only a cross-center director (owner/superadmin, or an admin with no home
// center) gets the switcher. A center-bound admin sees their center, fixed.

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useSessionUser } from '@/lib/use-session-user';

const CENTERS = [
  { id: '3104ae69-4f26-4c1e-a767-3ff45b534860', name: 'Brooklyn Park' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Crystal' },
];

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}

export function CenterSwitcher() {
  const { user } = useSessionUser();
  const [selection, setSelection] = useState<string>('');

  useEffect(() => {
    const view = readCookie('cc_view');
    const center = readCookie('cc_center');
    setSelection(view === 'combined' ? 'all' : center || CENTERS[0].id);
  }, []);

  if (!user) return null;

  const role = (user.role || '').toLowerCase();
  const isCrossCenter = role === 'owner' || role === 'superadmin' || !user.center_id;

  // A center-bound admin only ever sees their own center: show it, no switcher.
  if (!isCrossCenter) {
    const name = CENTERS.find((c) => c.id === user.center_id)?.name || 'Your center';
    return (
      <div className="mb-5 rounded-xl border bg-muted/40 px-3 py-2 text-xs">
        <span className="text-muted-foreground">Center: </span>
        <span className="font-semibold text-foreground">{name}</span>
      </div>
    );
  }

  function pick(value: string) {
    if (value === 'all') {
      document.cookie = 'cc_view=combined; path=/; max-age=86400; samesite=lax';
    } else {
      document.cookie = `cc_center=${value}; path=/; max-age=86400; samesite=lax`;
      document.cookie = 'cc_view=single; path=/; max-age=86400; samesite=lax';
    }
    setSelection(value);
    // Reload so every center-aware page re-reads the new scope.
    window.location.reload();
  }

  const options = [
    { value: CENTERS[0].id, label: 'Brooklyn Park' },
    { value: CENTERS[1].id, label: 'Crystal' },
    { value: 'all', label: 'Combined' },
  ];

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" /> Center
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-xl border bg-muted/40 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => pick(o.value)}
            className={
              'rounded-lg px-2 py-2 text-xs font-semibold transition-colors ' +
              (selection === o.value
                ? 'bg-christina-red text-white shadow-sm'
                : 'text-muted-foreground hover:bg-white hover:text-foreground')
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
