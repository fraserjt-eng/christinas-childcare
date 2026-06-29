'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useSessionUser } from '@/lib/use-session-user';

// Live kiosk attendance vs enrollment, by center + room, combined rooms, and a
// grand total. Reads the session-gated service-role route /api/admin/kiosk-report
// (the same engine the every-2-hours email uses) and refetches on a slow poll +
// on focus/visibility, mirroring /admin/attendance.

interface RoomStat {
  room: string; enrolled: number; inNow: number; out: number; notArrived: number; attendancePct: number;
}
interface CenterStat { centerId: string; centerName: string; rooms: RoomStat[]; total: RoomStat; }
interface KioskReport {
  date: string; asOfCentral: string; generatedAtUtc: string;
  centers: CenterStat[]; combinedRooms: RoomStat[]; grandTotal: RoomStat;
}

function pctColor(p: number): string {
  if (p >= 80) return 'text-christina-green';
  if (p >= 50) return 'text-christina-yellow';
  return 'text-gray-400';
}

function StatTable({ rows, totalLabel, total }: { rows: RoomStat[]; totalLabel: string; total?: RoomStat }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b">
            <th className="py-2 pr-3 font-semibold">Room</th>
            <th className="py-2 px-2 text-right font-semibold">Enrolled</th>
            <th className="py-2 px-2 text-right font-semibold">In now</th>
            <th className="py-2 px-2 text-right font-semibold">Out</th>
            <th className="py-2 px-2 text-right font-semibold">Not arrived</th>
            <th className="py-2 pl-2 text-right font-semibold">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.room} className="border-b last:border-0">
              <td className="py-2 pr-3 font-medium">{r.room}</td>
              <td className="py-2 px-2 text-right tabular-nums">{r.enrolled}</td>
              <td className="py-2 px-2 text-right tabular-nums font-semibold text-christina-blue">{r.inNow}</td>
              <td className="py-2 px-2 text-right tabular-nums text-gray-500">{r.out}</td>
              <td className="py-2 px-2 text-right tabular-nums text-gray-500">{r.notArrived}</td>
              <td className={`py-2 pl-2 text-right tabular-nums font-semibold ${pctColor(r.attendancePct)}`}>{r.attendancePct}%</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="py-3 text-center text-gray-400">No enrolled children in scope.</td></tr>
          )}
          {total && (
            <tr className="border-t-2 border-gray-200 font-semibold bg-gray-50/60">
              <td className="py-2 pr-3">{totalLabel}</td>
              <td className="py-2 px-2 text-right tabular-nums">{total.enrolled}</td>
              <td className="py-2 px-2 text-right tabular-nums text-christina-blue">{total.inNow}</td>
              <td className="py-2 px-2 text-right tabular-nums text-gray-500">{total.out}</td>
              <td className="py-2 px-2 text-right tabular-nums text-gray-500">{total.notArrived}</td>
              <td className={`py-2 pl-2 text-right tabular-nums ${pctColor(total.attendancePct)}`}>{total.attendancePct}%</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function KioskLivePage() {
  const { user, loading: authLoading } = useSessionUser();
  const [report, setReport] = useState<KioskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/kiosk-report');
      if (!res.ok) { setError(res.status === 401 ? 'Please sign in.' : 'Could not load the report.'); return; }
      setError(null);
      setReport(await res.json());
    } catch {
      setError('Could not load the report.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const poll = setInterval(load, 60000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      clearInterval(poll);
    };
  }, [load]);

  if (authLoading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-christina-red" /></div>;
  if (!user) return <div className="p-8 text-center text-gray-500">Please sign in to view this page.</div>;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-christina-red">Kiosk Attendance (Live)</h1>
          <p className="text-sm text-gray-500">
            {report ? `As of ${report.asOfCentral} Central, ${report.date}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 text-sm text-christina-blue hover:underline"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-christina-red px-4 py-3 text-sm">{error}</div>}

      {report && (
        <>
          {/* Grand total banner */}
          <Card className="border-christina-red/30">
            <CardContent className="py-5 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div><div className="text-3xl font-bold tabular-nums">{report.grandTotal.enrolled}</div><div className="text-xs uppercase tracking-wide text-gray-500">Enrolled</div></div>
              <div><div className="text-3xl font-bold tabular-nums text-christina-blue">{report.grandTotal.inNow}</div><div className="text-xs uppercase tracking-wide text-gray-500">In now</div></div>
              <div><div className="text-3xl font-bold tabular-nums text-gray-500">{report.grandTotal.out}</div><div className="text-xs uppercase tracking-wide text-gray-500">Out</div></div>
              <div><div className="text-3xl font-bold tabular-nums text-gray-500">{report.grandTotal.notArrived}</div><div className="text-xs uppercase tracking-wide text-gray-500">Not arrived</div></div>
              <div><div className={`text-3xl font-bold tabular-nums ${pctColor(report.grandTotal.attendancePct)}`}>{report.grandTotal.attendancePct}%</div><div className="text-xs uppercase tracking-wide text-gray-500">Attendance</div></div>
            </CardContent>
          </Card>

          {/* Per center */}
          {report.centers.map((c) => (
            <Card key={c.centerId}>
              <CardHeader><CardTitle className="text-lg font-heading">{c.centerName}</CardTitle></CardHeader>
              <CardContent><StatTable rows={c.rooms} totalLabel="All rooms" total={c.total} /></CardContent>
            </Card>
          ))}

          {/* Combined rooms across centers */}
          {report.centers.length > 1 && (
            <Card className="border-christina-blue/30">
              <CardHeader><CardTitle className="text-lg font-heading">Combined rooms (all centers)</CardTitle></CardHeader>
              <CardContent><StatTable rows={report.combinedRooms} totalLabel="Everything" total={report.grandTotal} /></CardContent>
            </Card>
          )}

          <p className="text-xs text-gray-400 text-center">Updates automatically every minute. Enrolled counts active families only.</p>
        </>
      )}
    </div>
  );
}
