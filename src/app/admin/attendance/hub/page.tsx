'use client';

// Attendance Hub: one place for daily / weekly / monthly / yearly attendance and
// for submitting attendance to the state (CCAP Import Attendance).
//
// All numbers come from the admin-gated, service-role routes
// /api/admin/attendance/summary (aggregation) and /api/admin/attendance/submissions
// (submission history + cycle status). The export reuses /api/admin/ccap-export
// (the approved accuracy attestation gate). Nothing reads the RLS-locked
// attendance/roster via the anon client. admin/layout.tsx wraps this in the
// DashboardLayout.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { buildDcyfCsv } from '@/lib/dcyf-export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Send,
  ShieldCheck,
  AlertTriangle,
  Baby,
  Clock,
  ClipboardCheck,
  Sun,
} from 'lucide-react';
import { centerDate, shiftCenterDate } from '@/lib/center-time';
import { recentCycles } from '@/lib/attendance-cycles';

type View = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'submit';

interface Bucket {
  label: string;
  start: string;
  end: string;
  childrenPresent: number;
  childDays: number;
  hours: number;
}
interface ChildSummary {
  name: string;
  daysPresent: number;
  hours: number;
  lastDate: string;
}
interface CenterRow {
  center: string;
  childrenPresent: number;
  childDays: number;
  hours: number;
}
interface RoomRow {
  center: string;
  room: string;
  childrenPresent: number;
  childDays: number;
  hours: number;
}
interface Summary {
  centerName: string;
  combined?: boolean;
  from: string;
  to: string;
  bucket: string;
  buckets: Bucket[];
  children: ChildSummary[];
  byCenter?: CenterRow[];
  byRoom?: RoomRow[];
  totals: { uniqueChildren: number; childDays: number; hours: number; daysOpen: number };
}
interface CycleStatus {
  index: number;
  start: string;
  end: string;
  deadline: string;
  label: string;
  submitted: boolean;
  submissionCount: number;
  daysUntilDeadline: number;
  isCurrent: boolean;
}
interface SubmissionRow {
  submittedAt: string;
  by: string;
  periodStart: string;
  periodEnd: string;
  rowCount: number | null;
}

// Verbatim DCYF accuracy attestation (same text as the standalone CCAP export).
const ATTESTATION_TEXT = `I acknowledge, agree, and attest to the following:
- As a condition of Child Care Assistance Program (CCAP) payment, I agree to maintain complete daily attendance records for all children receiving child care assistance (CCAP).
- I agree to provide attendance data for all children in my program so that DCYF could determine that I am complying with program requirements including licensing rules and standards.
- The attendance records must: be accurate, legible, and completed daily; be kept at the site where services are delivered for six years after the date of service; be immediately available upon request to the county, Tribe and/or staff of the Department of Children, Youth, and Families (DCYF); include the date, each child's first and last name, and each child's drop-off and pick-up times.
- To the extent possible, drop-off and pick-up times must be entered by the person dropping off or picking up the child.
- The attendance records as submitted are true and accurate.`;

function csvCell(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
function download(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function monthBounds(ref: string): { from: string; to: string } {
  const [y, m] = ref.split('-').map(Number);
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const last = new Date(y, m, 0).getDate(); // day 0 of next month = last day
  const to = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
  return { from, to };
}
function weekBounds(ref: string): { from: string; to: string } {
  const d = new Date(`${ref}T12:00:00`);
  const dow = d.getDay();
  const from = shiftCenterDate(ref, dow === 0 ? -6 : 1 - dow);
  return { from, to: shiftCenterDate(from, 6) };
}

// The query range + bucket + a readable label for a view at a reference date.
function rangeFor(view: View, ref: string): { from: string; to: string; bucket: string; label: string } {
  if (view === 'daily') return { from: ref, to: ref, bucket: 'day', label: ref };
  if (view === 'weekly') {
    const { from, to } = weekBounds(ref);
    return { from, to, bucket: 'day', label: `Week of ${from}` };
  }
  if (view === 'monthly') {
    const { from, to } = monthBounds(ref);
    return { from, to, bucket: 'day', label: ref.slice(0, 7) };
  }
  const y = ref.slice(0, 4);
  return { from: `${y}-01-01`, to: `${y}-12-31`, bucket: 'month', label: y };
}
function step(view: View, ref: string, dir: number): string {
  if (view === 'daily') return shiftCenterDate(ref, dir);
  if (view === 'weekly') return shiftCenterDate(ref, dir * 7);
  if (view === 'monthly') {
    const [y, m] = ref.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }
  const [y] = ref.split('-').map(Number);
  return `${y + dir}-01-01`;
}

export default function AttendanceHubPage() {
  const [view, setView] = useState<View>('daily');
  const today = useMemo(() => centerDate(), []);
  const [ref, setRef] = useState<string>(today);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [prevTotals, setPrevTotals] = useState<Summary['totals'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // submit-to-state state
  const [cycles, setCycles] = useState<CycleStatus[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [exFrom, setExFrom] = useState<string>('');
  const [exTo, setExTo] = useState<string>('');
  const [attested, setAttested] = useState(false);
  const [exBusy, setExBusy] = useState(false);
  const [exMsg, setExMsg] = useState('');

  const loadSummary = useCallback(async (v: View, r: string) => {
    if (v === 'submit') return;
    setLoading(true);
    setError('');
    const { from, to, bucket } = rangeFor(v, r);
    try {
      const res = await fetch(`/api/admin/attendance/summary?from=${from}&to=${to}&bucket=${bucket}`, { cache: 'no-store' });
      if (!res.ok) {
        setError(res.status === 401 ? 'Sign in as an admin to view attendance.' : 'Could not load attendance.');
        setSummary(null);
        setPrevTotals(null);
        return;
      }
      setSummary((await res.json()) as Summary);
      // Prior equal-length period, for the trend arrows. Best effort: a failure
      // here just hides the arrows, it never blocks the view.
      const pr = rangeFor(v, step(v, r, -1));
      fetch(`/api/admin/attendance/summary?from=${pr.from}&to=${pr.to}&bucket=${pr.bucket}`, { cache: 'no-store' })
        .then((rp) => (rp.ok ? rp.json() : null))
        .then((d) => setPrevTotals(d?.totals ?? null))
        .catch(() => setPrevTotals(null));
    } catch {
      setError('Could not load attendance.');
      setSummary(null);
      setPrevTotals(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/attendance/submissions', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setCycles(Array.isArray(data.cycles) ? data.cycles : []);
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch {
      /* best effort */
    }
  }, []);

  useEffect(() => {
    loadSummary(view, ref);
  }, [view, ref, loadSummary]);
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Reminder: the most urgent unsubmitted cycle whose deadline is near/overdue.
  const reminder = useMemo(() => {
    const due = cycles
      .filter((c) => !c.submitted && !c.isCurrent && c.daysUntilDeadline <= 14)
      .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)[0];
    return due || null;
  }, [cycles]);

  function downloadBuckets() {
    if (!summary) return;
    const header = ['Period', 'Children present', 'Child-days', 'Hours'];
    const lines = [header.map(csvCell).join(',')];
    for (const b of summary.buckets) {
      lines.push([csvCell(b.label), String(b.childrenPresent), String(b.childDays), String(b.hours)].join(','));
    }
    download(`attendance-${view}-${summary.from}-to-${summary.to}.csv`, lines.join('\r\n'));
  }
  function downloadChildren() {
    if (!summary) return;
    const header = ['Child', 'Days present', 'Hours', 'Last seen'];
    const lines = [header.map(csvCell).join(',')];
    for (const c of summary.children) {
      lines.push([csvCell(c.name), String(c.daysPresent), String(c.hours), csvCell(c.lastDate)].join(','));
    }
    download(`attendance-by-child-${view}-${summary.from}-to-${summary.to}.csv`, lines.join('\r\n'));
  }
  function downloadRooms() {
    if (!summary?.byRoom) return;
    const header = ['Center', 'Room', 'Children present', 'Child-days', 'Hours'];
    const lines = [header.map(csvCell).join(',')];
    for (const r of summary.byRoom) {
      lines.push([csvCell(r.center), csvCell(r.room), String(r.childrenPresent), String(r.childDays), String(r.hours)].join(','));
    }
    download(`attendance-by-room-${view}-${summary.from}-to-${summary.to}.csv`, lines.join('\r\n'));
  }

  function pickPeriod(from: string, to: string) {
    setExFrom(from);
    setExTo(to);
    setExMsg('');
  }

  async function handleExport() {
    if (!attested || !exFrom || !exTo || exFrom > exTo || exBusy) return;
    setExBusy(true);
    setExMsg('');
    try {
      const res = await fetch('/api/admin/ccap-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_start: exFrom, period_end: exTo, attested: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExMsg(data.error || 'The export could not be completed.');
        return;
      }
      const rows = Array.isArray(data.rows) ? data.rows : [];
      // The DCYF Import Attendance CSV (exact template, chunked at 250 rows). The
      // helper already prepends the BOM, so download the blob directly rather than
      // via download() (which would add a second BOM).
      const files = buildDcyfCsv(rows);
      files.forEach((f, i) => {
        const part = files.length > 1 ? `-part-${i + 1}-of-${files.length}` : '';
        const blob = new Blob([f.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DCYF-attendance-${exFrom}-to-${exTo}${part}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
      setExMsg(`Exported ${rows.length} record${rows.length === 1 ? '' : 's'} for ${exFrom} to ${exTo}${files.length > 1 ? ` in ${files.length} files (250 rows each)` : ''}. Upload to the state Provider Hub. Your attestation was recorded.`);
      setAttested(false);
      loadSubmissions();
    } catch {
      setExMsg('The export could not be completed.');
    } finally {
      setExBusy(false);
    }
  }

  const tabs: { id: View; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
    { id: 'submit', label: 'Submit to state' },
  ];

  const maxBucket = summary ? Math.max(1, ...summary.buckets.map((b) => b.childrenPresent)) : 1;
  const periodWord = view === 'daily' ? 'day' : view === 'weekly' ? 'week' : view === 'monthly' ? 'month' : 'year';

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Attendance Hub</h1>
            <p className="text-muted-foreground">
              Daily, weekly, monthly, and yearly attendance{summary ? ` for ${summary.centerName}` : ''}, and submitting to the state.
            </p>
          </div>
        </div>
        <Link
          href="/admin/attendance/entry"
          className="inline-flex items-center gap-1.5 rounded-md border border-christina-red/40 px-3 py-2 text-sm font-medium text-christina-red hover:bg-christina-red/5"
        >
          <CalendarDays className="h-4 w-4" /> Enter a day
        </Link>
      </div>

      {/* Deadline reminder (computed; no email needed) */}
      {reminder && (
        <div className="flex items-start gap-3 rounded-lg border border-christina-red/40 bg-christina-red/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-christina-red" />
          <div className="text-sm">
            <p className="font-semibold text-christina-red">
              {reminder.daysUntilDeadline < 0
                ? `Attendance for ${reminder.label} is overdue (was due ${reminder.deadline}).`
                : `Attendance for ${reminder.label} is due ${reminder.deadline} (${reminder.daysUntilDeadline} day${reminder.daysUntilDeadline === 1 ? '' : 's'} left).`}
            </p>
            <button
              type="button"
              className="mt-1 font-medium text-christina-red underline"
              onClick={() => {
                setView('submit');
                pickPeriod(reminder.start, reminder.end);
              }}
            >
              Submit this cycle now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setView(t.id)}
            className={
              'px-4 py-2 text-sm font-medium transition-colors ' +
              (view === t.id ? 'border-b-2 border-christina-red text-christina-red' : 'text-muted-foreground hover:text-christina-red')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {view !== 'submit' ? (
        <div className="space-y-4">
          {/* period nav */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setRef((r) => step(view, r, -1))}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm font-medium">{rangeFor(view, ref).label}</span>
            <Button variant="outline" size="sm" onClick={() => setRef((r) => step(view, r, 1))} disabled={rangeFor(view, ref).to >= today}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {error && <p className="text-sm text-christina-red">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : summary ? (
            <>
              {/* totals — colored stat hubs (matches the back-office dashboard) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([
                  { label: 'Children', field: 'uniqueChildren', value: summary.totals.uniqueChildren, Icon: Baby, badge: 'bg-blue-100 text-blue-600', num: 'text-blue-600' },
                  { label: 'Child-days', field: 'childDays', value: summary.totals.childDays, Icon: ClipboardCheck, badge: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
                  { label: 'Hours', field: 'hours', value: summary.totals.hours, Icon: Clock, badge: 'bg-amber-100 text-amber-600', num: 'text-amber-600' },
                  { label: 'Days open', field: 'daysOpen', value: summary.totals.daysOpen, Icon: Sun, badge: 'bg-purple-100 text-purple-600', num: 'text-purple-600' },
                ] as const).map(({ label, field, value, Icon, badge, num }) => {
                  const prev = prevTotals ? prevTotals[field] : null;
                  const delta = prev === null ? null : Math.round((value - prev) * 10) / 10;
                  return (
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl border bg-white p-4 text-center">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full ${badge}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className={`text-2xl font-bold ${num}`}>{value}</p>
                    <p className="text-xs font-medium text-gray-600">{label}</p>
                    {delta !== null && (
                      <p className={`text-[10px] font-medium ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-christina-red' : 'text-gray-400'}`}>
                        {delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${Math.abs(delta)}` : '— no change'} vs last {periodWord}
                      </p>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* per-center (Combined view only) */}
              {summary.combined && summary.byCenter && summary.byCenter.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">By center</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="py-2">Center</th>
                          <th className="py-2">Children present</th>
                          <th className="py-2">Child-days</th>
                          <th className="py-2">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.byCenter.map((c) => (
                          <tr key={c.center} className="border-b last:border-0">
                            <td className="py-2 font-medium">{c.center}</td>
                            <td className="py-2">{c.childrenPresent}</td>
                            <td className="py-2">{c.childDays}</td>
                            <td className="py-2">{c.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {/* per-room (every view; how the day/period split across rooms) */}
              {summary.byRoom && summary.byRoom.length > 0 && (() => {
                const rooms = summary.byRoom!;
                const maxRoom = Math.max(1, ...rooms.map((r) => r.childrenPresent));
                const groups = summary.combined ? Array.from(new Set(rooms.map((r) => r.center))) : [null as string | null];
                return (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">By room</CardTitle>
                      <Button variant="outline" size="sm" onClick={downloadRooms} disabled={rooms.length === 0}>
                        <Download className="mr-1.5 h-4 w-4" /> Dataset
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {groups.map((g) => (
                          <div key={g ?? 'one'} className="space-y-1.5">
                            {g && <p className="text-sm font-semibold text-gray-700">{g}</p>}
                            {rooms
                              .filter((r) => g === null || r.center === g)
                              .map((r) => (
                                <div key={`${r.center}-${r.room}`} className="flex items-center gap-3 text-sm">
                                  <span className="w-36 shrink-0 text-muted-foreground">{r.room}</span>
                                  <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
                                    <div className="h-full bg-christina-blue/70" style={{ width: `${(r.childrenPresent / maxRoom) * 100}%` }} />
                                  </div>
                                  <span className="w-8 shrink-0 text-right font-medium">{r.childrenPresent}</span>
                                  <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground sm:inline">{r.childDays} child-days</span>
                                  <span className="hidden w-14 shrink-0 text-right text-xs text-muted-foreground sm:inline">{r.hours}h</span>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* buckets */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">By {summary.bucket}</CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadBuckets} disabled={summary.buckets.length === 0}>
                    <Download className="mr-1.5 h-4 w-4" /> Dataset
                  </Button>
                </CardHeader>
                <CardContent>
                  {summary.buckets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attendance recorded in this period.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {summary.buckets.map((b) => (
                        <div key={b.start} className="flex items-center gap-3 text-sm">
                          <span className="w-28 shrink-0 text-muted-foreground">{b.label}</span>
                          <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
                            <div className="h-full bg-christina-red/70" style={{ width: `${(b.childrenPresent / maxBucket) * 100}%` }} />
                          </div>
                          <span className="w-10 shrink-0 text-right font-medium">{b.childrenPresent}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* per-child */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">By child</CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadChildren} disabled={summary.children.length === 0}>
                    <Download className="mr-1.5 h-4 w-4" /> Dataset
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {summary.children.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No children attended in this period.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="py-2">Child</th>
                          <th className="py-2">Days present</th>
                          <th className="py-2">Hours</th>
                          <th className="py-2">Last seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.children.map((c) => (
                          <tr key={c.name} className="border-b last:border-0">
                            <td className="py-2 font-medium">{c.name}</td>
                            <td className="py-2">{c.daysPresent}</td>
                            <td className="py-2">{c.hours}</td>
                            <td className="py-2 text-muted-foreground">{c.lastDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      ) : (
        // ---- Submit to state ----
        <div className="space-y-4">
          {/* cycle status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing cycles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cycles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading cycle status...</p>
              ) : (
                cycles.map((c) => (
                  <div
                    key={c.index}
                    className={
                      'flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ' +
                      (c.submitted ? 'border-christina-green/40 bg-christina-green/5' : c.daysUntilDeadline < 0 ? 'border-christina-red/50 bg-christina-red/5' : 'border-muted bg-muted/30')
                    }
                  >
                    <div className="text-sm">
                      <span className="font-semibold">{c.label}</span>
                      {c.isCurrent && <span className="ml-2 rounded bg-christina-yellow px-1.5 py-0.5 text-[10px] font-bold text-[#5a4500]">CURRENT</span>}
                      <span className="ml-2 text-muted-foreground">deadline {c.deadline}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {c.submitted ? (
                        <span className="font-medium text-christina-green">Submitted ({c.submissionCount})</span>
                      ) : c.isCurrent ? (
                        <span className="text-muted-foreground">In progress</span>
                      ) : (
                        <span className={c.daysUntilDeadline < 0 ? 'font-semibold text-christina-red' : 'text-muted-foreground'}>
                          {c.daysUntilDeadline < 0 ? 'Overdue' : `Due in ${c.daysUntilDeadline}d`}
                        </span>
                      )}
                      <Button variant="outline" size="sm" onClick={() => pickPeriod(c.start, c.end)}>
                        Select
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* period presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export a period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => pickPeriod(today, today)}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => { const { from, to } = weekBounds(today); pickPeriod(from, to); }}>This week</Button>
                <Button variant="outline" size="sm" onClick={() => { const { from, to } = monthBounds(today); pickPeriod(from, to); }}>This month</Button>
                {recentCycles(today, 1).map((c) => (
                  <Button key={c.index} variant="outline" size="sm" onClick={() => pickPeriod(c.start, c.end)}>Current cycle</Button>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">From</label>
                  <input type="date" value={exFrom} max={exTo || undefined} onChange={(e) => setExFrom(e.target.value)} className="rounded-md border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">To</label>
                  <input type="date" value={exTo} min={exFrom || undefined} onChange={(e) => setExTo(e.target.value)} className="rounded-md border px-2 py-1.5 text-sm" />
                </div>
              </div>

              {/* attestation gate */}
              <div className="rounded-md border bg-[#faf6f0] p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-christina-red">
                  <ShieldCheck className="h-4 w-4" /> Accuracy attestation (required)
                </p>
                <p className="whitespace-pre-line text-xs leading-relaxed text-[#1f2937]">{ATTESTATION_TEXT}</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-christina-red/40 bg-white p-3">
                <Checkbox checked={attested} onCheckedChange={(v) => setAttested(v === true)} className="mt-0.5" />
                <span className="text-sm font-medium">I have read the statement above and I attest that the attendance records as submitted are true and accurate.</span>
              </label>

              {exMsg && <p className="text-sm font-medium text-christina-green">{exMsg}</p>}

              <Button
                onClick={handleExport}
                disabled={!attested || !exFrom || !exTo || exFrom > exTo || exBusy}
                className="bg-christina-red text-white hover:bg-christina-red/90"
              >
                {exBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Export {exFrom && exTo ? `${exFrom} to ${exTo}` : 'a period'} for the state
              </Button>
            </CardContent>
          </Card>

          {/* history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission history</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions recorded yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="py-2">Submitted</th>
                      <th className="py-2">Period</th>
                      <th className="py-2">Records</th>
                      <th className="py-2">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</td>
                        <td className="py-2">{s.periodStart} to {s.periodEnd}</td>
                        <td className="py-2">{s.rowCount ?? ''}</td>
                        <td className="py-2 text-muted-foreground">{s.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
