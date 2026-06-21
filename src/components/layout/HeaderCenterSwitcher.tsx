'use client';

// The prominent center indicator + switcher at the TOP-LEFT of every admin
// screen header. This is the "where it says the center" control: it always names
// the center you are currently viewing, and a cross-center director (owner /
// superadmin, or an admin with no home center) can switch Brooklyn Park /
// Crystal / Combined right here. A center-bound admin sees their center named,
// fixed, with no dropdown.
//
// It writes the same cc_center / cc_view cookies the rest of the app already
// reads, and reloads so every center-aware page re-scopes. Kept in sync with the
// sidebar CenterSwitcher because both read/write the identical cookies.

import { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
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

export function HeaderCenterSwitcher() {
  const { user } = useSessionUser();
  const [selection, setSelection] = useState<string>('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view = readCookie('cc_view');
    const center = readCookie('cc_center');
    setSelection(view === 'combined' ? 'all' : center || CENTERS[0].id);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!user) return null;

  const role = (user.role || '').toLowerCase();
  const isCrossCenter = role === 'owner' || role === 'superadmin' || !user.center_id;

  // A center-bound admin: name the center, no switching.
  if (!isCrossCenter) {
    const name = CENTERS.find((c) => c.id === user.center_id)?.name || 'Your center';
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm">
        <Building2 className="h-4 w-4 text-christina-red" />
        <span className="font-semibold text-foreground">{name}</span>
      </div>
    );
  }

  const currentLabel =
    selection === 'all'
      ? 'All Centers (Combined)'
      : CENTERS.find((c) => c.id === selection)?.name || 'Brooklyn Park';

  function pick(value: string) {
    if (value === 'all') {
      document.cookie = 'cc_view=combined; path=/; max-age=86400; samesite=lax';
    } else {
      document.cookie = `cc_center=${value}; path=/; max-age=86400; samesite=lax`;
      document.cookie = 'cc_view=single; path=/; max-age=86400; samesite=lax';
    }
    setSelection(value);
    setOpen(false);
    window.location.reload();
  }

  const options = [
    { value: CENTERS[0].id, label: 'Brooklyn Park' },
    { value: CENTERS[1].id, label: 'Crystal' },
    { value: 'all', label: 'All Centers (Combined)' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Building2 className="h-4 w-4 text-christina-red" />
        <span>{currentLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-60 rounded-lg border bg-white p-1 shadow-lg">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Viewing center</p>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              className={
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ' +
                (selection === o.value ? 'font-semibold text-christina-red' : 'text-foreground')
              }
            >
              {o.label}
              {selection === o.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
