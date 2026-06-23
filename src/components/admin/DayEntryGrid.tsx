'use client';

// Bulk "enter a day" grid, embedded in the Attendance page (the "Enter a day"
// mode). Staff pick a date (and center, if a cross-center director) and key a
// whole paper sign-in sheet: each child's in/out time and who dropped off /
// picked up. Saves the same attendance rows a kiosk tap writes, through the
// session-gated, service-role /api/admin/attendance/day route, so the day flows
// into the dashboard and the DCYF export with no transcription.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Save, Loader2, Users } from 'lucide-react';
import { centerDate, shiftCenterDate } from '@/lib/center-time';

interface ChildEntry {
  id: string;
  name: string;
  parents: string[];
  arrival: string;
  departure: string;
  signedInBy: string;
  signedOutBy: string;
  attendanceId: string | null;
  absent: boolean;
}
interface Room { room: string; children: ChildEntry[] }
interface DayData {
  date: string;
  centerId?: string;
  centerName?: string;
  crossCenter?: boolean;
  centers?: { id: string; name: string }[];
  rooms?: Room[];
  needCenter?: boolean;
}
interface Edit { arrival: string; departure: string; signedInBy: string; signedOutBy: string; absent: boolean }

export default function DayEntryGrid() {
  const today = useMemo(() => centerDate(), []);
  const [date, setDate] = useState<string>(today);
  const [center, setCenter] = useState<string>('');
  const [data, setData] = useState<DayData | null>(null);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async (d: string, c: string) => {
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const url = `/api/admin/attendance/day?date=${d}${c ? `&center=${c}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        setError(res.status === 401 ? 'Sign in as an admin to enter attendance.' : 'Could not load the roster.');
        setData(null);
        return;
      }
      const payload = (await res.json()) as DayData;
      setData(payload);
      const next: Record<string, Edit> = {};
      for (const room of payload.rooms ?? []) {
        for (const ch of room.children) {
          next[ch.id] = { arrival: ch.arrival, departure: ch.departure, signedInBy: ch.signedInBy, signedOutBy: ch.signedOutBy, absent: false };
        }
      }
      setEdits(next);
    } catch {
      setError('Could not load the roster.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(date, center); }, [date, center, load]);

  function setField(childId: string, field: keyof Edit, value: string | boolean) {
    setEdits((prev) => ({ ...prev, [childId]: { ...prev[childId], [field]: value } }));
  }

  const presentCount = useMemo(
    () => Object.values(edits).filter((e) => !e.absent && (e.arrival || e.departure)).length,
    [edits]
  );

  async function save() {
    if (!data?.rooms || saving) return;
    setSaving(true);
    setError('');
    setMsg('');
    const entries = (data.rooms ?? []).flatMap((room) =>
      room.children.map((ch) => {
        const e = edits[ch.id];
        return {
          childId: ch.id,
          arrival: e?.arrival || '',
          departure: e?.departure || '',
          signedInBy: e?.signedInBy || '',
          signedOutBy: e?.signedOutBy || '',
          absent: !!e?.absent,
        };
      })
    );
    try {
      const res = await fetch('/api/admin/attendance/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, centerId: data.centerId, entries }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(out.error || 'Could not save the day.');
        return;
      }
      const saved = (out.inserted || 0) + (out.updated || 0);
      let line = `Saved ${saved} record${saved === 1 ? '' : 's'} for ${date}`;
      if (out.deleted) line += `, cleared ${out.deleted} absent`;
      line += '.';
      if (Array.isArray(out.problems) && out.problems.length) line += ` Needs a look: ${out.problems.join('; ')}`;
      setMsg(line);
      load(date, center);
    } catch {
      setError('Could not save the day.');
    } finally {
      setSaving(false);
    }
  }

  const needCenter = data?.needCenter;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setDate((d) => shiftCenterDate(d, -1))}>
          <ChevronLeft className="h-4 w-4" /> Prev day
        </Button>
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="rounded-md border px-2 py-1.5 text-sm" />
        <Button variant="outline" size="sm" onClick={() => setDate((d) => (d >= today ? d : shiftCenterDate(d, 1)))} disabled={date >= today}>
          Next day <ChevronRight className="h-4 w-4" />
        </Button>
        {(data?.crossCenter || needCenter) && (data?.centers?.length ?? 0) > 0 && (
          <select value={center} onChange={(e) => setCenter(e.target.value)} className="rounded-md border px-2 py-1.5 text-sm">
            <option value="">Choose a center…</option>
            {data!.centers!.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {!needCenter && data?.rooms && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {presentCount} marked present
          </span>
        )}
      </div>

      {error && <p className="text-sm font-medium text-christina-coral">{error}</p>}
      {msg && <p className="text-sm font-medium text-christina-green">{msg}</p>}

      {needCenter ? (
        <p className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">Choose a center above to load its roster.</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading roster…</p>
      ) : data?.rooms && data.rooms.length > 0 ? (
        <>
          {data.rooms.map((room) => (
            <Card key={room.room}>
              <CardHeader>
                <CardTitle className="text-base">
                  {room.room} <span className="text-sm font-normal text-muted-foreground">({room.children.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-2">Child</th>
                      <th className="py-2 px-2">In</th>
                      <th className="py-2 px-2">Out</th>
                      <th className="py-2 px-2">Dropped off by</th>
                      <th className="py-2 px-2">Picked up by</th>
                      <th className="py-2 pl-2 text-center">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.children.map((ch) => {
                      const e = edits[ch.id] || { arrival: '', departure: '', signedInBy: '', signedOutBy: '', absent: false };
                      const listId = `dg-parents-${ch.id}`;
                      return (
                        <tr key={ch.id} className={'border-b last:border-0 ' + (e.absent ? 'opacity-50' : '')}>
                          <td className="py-2 pr-2 font-medium">{ch.name}</td>
                          <td className="py-2 px-2">
                            <input type="time" value={e.arrival} disabled={e.absent} onChange={(ev) => setField(ch.id, 'arrival', ev.target.value)} className="rounded border px-1.5 py-1 text-sm" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="time" value={e.departure} disabled={e.absent} onChange={(ev) => setField(ch.id, 'departure', ev.target.value)} className="rounded border px-1.5 py-1 text-sm" />
                          </td>
                          <td className="py-2 px-2">
                            <input list={listId} value={e.signedInBy} disabled={e.absent} onChange={(ev) => setField(ch.id, 'signedInBy', ev.target.value)} placeholder="name" className="w-32 rounded border px-1.5 py-1 text-sm" />
                          </td>
                          <td className="py-2 px-2">
                            <input list={listId} value={e.signedOutBy} disabled={e.absent} onChange={(ev) => setField(ch.id, 'signedOutBy', ev.target.value)} placeholder="name" className="w-32 rounded border px-1.5 py-1 text-sm" />
                          </td>
                          <td className="py-2 pl-2 text-center">
                            <Checkbox checked={e.absent} onCheckedChange={(v) => setField(ch.id, 'absent', v === true)} />
                          </td>
                          {ch.parents.length > 0 && (
                            <datalist id={listId}>
                              {ch.parents.map((p) => <option key={p} value={p} />)}
                            </datalist>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}

          <div className="sticky bottom-3 flex items-center justify-end gap-3 rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur">
            <span className="text-sm text-muted-foreground">{presentCount} present · {date}</span>
            <Button onClick={save} disabled={saving} className="bg-christina-red text-white hover:bg-christina-red/90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save the day
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No children on this roster yet.</p>
      )}
    </div>
  );
}
