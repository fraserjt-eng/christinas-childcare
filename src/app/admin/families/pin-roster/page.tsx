'use client';

// Branded, print-optimized family PIN roster for staff to use on Monday.
//
// PINs are SENSITIVE. They are read ONLY through the admin-gated, service-role
// route GET /api/admin/pin-roster (never the anon client, never a parent).
// This page just renders what that route returns.
//
// Two print layouts:
//  - Roster: a clean table per center (Family, PIN, Email).
//  - Slips: one small card per family (family name + big PIN + a one-line
//    "Your kiosk PIN"), for handing to families or posting at the kiosk.
//
// Print CSS hides the app chrome (sidebar/header) and the on-page controls, so
// what prints is just the branded sheet. The C logo + center + date print in
// the header of each layout.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, RefreshCw, LayoutList, IdCard, Download } from 'lucide-react';

interface PinRosterRow {
  center: string;
  familyName: string;
  children: string;
  pin: string;
  email: string;
}

type PrintMode = 'roster' | 'slips';

// Static print stylesheet. Hides the DashboardLayout chrome + on-page controls
// so only the branded sheet prints, and controls page breaks between centers.
const PRINT_CSS = `
@media print {
  aside, header { display: none !important; }
  main { overflow: visible !important; padding: 0 !important; }
  body { background: #ffffff !important; }
  .pin-roster-noprint { display: none !important; }
  .pin-roster-root { background: #ffffff !important; }
  .pin-roster-group { break-inside: avoid; }
  .pin-roster-group + .pin-roster-group { break-before: page; }
  .pin-slip { break-inside: avoid; }
  @page { margin: 0.5in; }
}
`;

// The brand "C" mark: white rounded square on christina-red, red "C".
function CLogo({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.22);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Christina's Child Care"
      style={{ flexShrink: 0 }}
    >
      <rect x="2" y="2" width="36" height="36" rx={r} fill="#ffffff" />
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx={r}
        fill="none"
        stroke="#C62828"
        strokeWidth="2"
      />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="26"
        fill="#C62828"
      >
        C
      </text>
    </svg>
  );
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PinRosterPage() {
  const [rows, setRows] = useState<PinRosterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<PrintMode>('roster');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pin-roster', { cache: 'no-store' });
      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Your admin sign-in is not active. Sign in as an admin and try again.'
            : 'Could not load the roster. Try again.'
        );
        setRows([]);
        return;
      }
      const data = (await res.json()) as { rows?: PinRosterRow[] };
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      setError('Could not load the roster. Try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Group rows by center, preserving the route's alphabetical sort.
  const byCenter = useMemo(() => {
    const map = new Map<string, PinRosterRow[]>();
    for (const r of rows) {
      if (!map.has(r.center)) map.set(r.center, []);
      map.get(r.center)!.push(r);
    }
    return Array.from(map.entries());
  }, [rows]);

  const dateStr = todayLabel();

  return (
    <div className="pin-roster-root" style={{ color: '#1f2937' }}>
      {/* Print rules: hide app chrome + controls, show only the branded sheet.
          A plain <style> with a static CSS string child (no styled-jsx, no
          dangerouslySetInnerHTML, no user input) so it needs no extra compiler
          config and trips no sanitization rule, and behaves identically for
          @media print. */}
      <style>{PRINT_CSS}</style>

      {/* On-screen controls (never printed) */}
      <div className="pin-roster-noprint mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-christina-red">
            Family PIN Roster
          </h1>
          <p className="text-sm text-muted-foreground">
            Kiosk PINs for staff use. Keep this sheet secure: a PIN signs a
            family in at the kiosk.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-christina-red/30">
            <button
              type="button"
              onClick={() => setMode('roster')}
              className={
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ' +
                (mode === 'roster'
                  ? 'bg-christina-red text-white'
                  : 'bg-white text-christina-red hover:bg-christina-red/10')
              }
            >
              <LayoutList className="h-4 w-4" /> Roster table
            </button>
            <button
              type="button"
              onClick={() => setMode('slips')}
              className={
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ' +
                (mode === 'slips'
                  ? 'bg-christina-red text-white'
                  : 'bg-white text-christina-red hover:bg-christina-red/10')
              }
            >
              <IdCard className="h-4 w-4" /> Per-family slips
            </button>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/api/admin/family-directory/export', '_blank')}
            title="Download a branded spreadsheet (current center, or all centers in Combined view)"
          >
            <Download className="mr-1.5 h-4 w-4" /> Spreadsheet
          </Button>
          <Button
            onClick={() => window.print()}
            disabled={loading || rows.length === 0}
            className="bg-christina-red text-white hover:bg-christina-red/90"
          >
            <Printer className="mr-1.5 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {error && (
        <div className="pin-roster-noprint mb-4 rounded-lg border border-christina-red/30 bg-christina-red/5 px-4 py-3 text-sm text-christina-red">
          {error}
        </div>
      )}

      {loading ? (
        <p className="pin-roster-noprint text-sm text-muted-foreground">
          Loading roster...
        </p>
      ) : rows.length === 0 && !error ? (
        <p className="pin-roster-noprint text-sm text-muted-foreground">
          No families with a kiosk PIN yet.
        </p>
      ) : (
        // The printable sheet: cream body, christina-red header per center.
        <div
          className="pin-roster-sheet rounded-xl"
          style={{ backgroundColor: '#faf6f0', padding: '1.5rem' }}
        >
          {byCenter.map(([center, centerRows]) => (
            <section
              key={center}
              className="pin-roster-group mb-8 last:mb-0"
            >
              {/* Branded header: C logo + tagline + center + date */}
              <header
                className="mb-4 flex items-center gap-3 rounded-lg px-4 py-3"
                style={{ backgroundColor: '#C62828', color: '#ffffff' }}
              >
                <CLogo size={44} />
                <div className="flex-1">
                  <p className="font-heading text-lg font-bold leading-tight">
                    Christina&apos;s Child Care
                  </p>
                  <p
                    className="text-xs leading-tight"
                    style={{ color: '#FFD54F' }}
                  >
                    Where Learning and Growth Become One
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-base font-bold leading-tight">
                    {center}
                  </p>
                  <p className="text-xs leading-tight" style={{ color: '#FFD54F' }}>
                    {dateStr}
                  </p>
                </div>
              </header>

              {mode === 'roster' ? (
                <RosterTable rows={centerRows} />
              ) : (
                <SlipGrid rows={centerRows} />
              )}
            </section>
          ))}
          <p
            className="mt-6 text-center text-xs"
            style={{ color: '#6b7280' }}
          >
            (763) 390-5870 &middot; c.fraser@chriskids2.org &middot; Confidential.
            Do not post family PINs where parents can see them.
          </p>
        </div>
      )}
    </div>
  );
}

function RosterTable({ rows }: { rows: PinRosterRow[] }) {
  return (
    <table
      className="w-full border-collapse text-left text-sm"
      style={{ backgroundColor: '#ffffff' }}
    >
      <thead>
        <tr style={{ backgroundColor: '#FFD54F', color: '#1f2937' }}>
          <th className="border-b-2 px-3 py-2 font-heading font-bold" style={{ borderColor: '#C62828' }}>
            Family
          </th>
          <th className="border-b-2 px-3 py-2 font-heading font-bold" style={{ borderColor: '#C62828' }}>
            Children
          </th>
          <th className="border-b-2 px-3 py-2 font-heading font-bold" style={{ borderColor: '#C62828' }}>
            PIN
          </th>
          <th className="border-b-2 px-3 py-2 font-heading font-bold" style={{ borderColor: '#C62828' }}>
            Email
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={`${r.email}-${r.pin}-${i}`}
            style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#faf6f0' }}
          >
            <td
              className="px-3 py-2 font-medium"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              {r.familyName}
            </td>
            <td
              className="px-3 py-2"
              style={{ borderBottom: '1px solid #e5e7eb', color: '#374151' }}
            >
              {r.children}
            </td>
            <td
              className="px-3 py-2 font-mono text-base font-bold"
              style={{ borderBottom: '1px solid #e5e7eb', color: '#C62828', letterSpacing: '0.15em' }}
            >
              {r.pin}
            </td>
            <td
              className="px-3 py-2"
              style={{ borderBottom: '1px solid #e5e7eb', color: '#374151' }}
            >
              {r.email}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SlipGrid({ rows }: { rows: PinRosterRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map((r, i) => (
        <div
          key={`${r.email}-${r.pin}-${i}`}
          className="pin-slip flex flex-col items-center rounded-lg px-3 py-4 text-center"
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #C62828',
          }}
        >
          <div className="mb-1 flex items-center gap-1.5">
            <CLogo size={22} />
            <span
              className="font-heading text-sm font-bold"
              style={{ color: '#C62828' }}
            >
              {r.familyName}
            </span>
          </div>
          {r.children && r.children !== r.familyName && (
            <p className="mb-0.5 text-[11px]" style={{ color: '#6b7280' }}>
              {r.children}
            </p>
          )}
          <p className="text-[11px] uppercase tracking-wide" style={{ color: '#6b7280' }}>
            Your kiosk PIN
          </p>
          <p
            className="font-mono text-3xl font-bold"
            style={{ color: '#C62828', letterSpacing: '0.2em' }}
          >
            {r.pin}
          </p>
          <div
            className="mt-1 h-1 w-10 rounded-full"
            style={{ backgroundColor: '#FFD54F' }}
          />
        </div>
      ))}
    </div>
  );
}
