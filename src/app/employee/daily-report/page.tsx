'use client';

import { useState, useEffect, useCallback } from 'react';
import { centerDate, shiftCenterDate } from '@/lib/center-time';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  Moon,
  UtensilsCrossed,
  Baby,
  Pill,
  Sparkles,
  Camera,
  AlertTriangle,
  StickyNote,
  Pencil,
  Trash2,
  Lock,
  X,
} from 'lucide-react';
import { useCurrentEmployee } from '@/lib/use-current-employee';

interface Child {
  id: string;
  name: string;
  classroom: string | null;
}

interface Entry {
  id: string;
  type: string;
  detail: Record<string, unknown>;
  occurred_at: string;
  updated_at?: string | null;
}

// Staff may correct these everyday types within 48h. Medication + incident are
// admin-only (the server enforces this too; here it just shows the lock).
const STAFF_EDITABLE = ['note', 'nap', 'meal', 'bathroom', 'diaper', 'activity', 'photo'];
const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;
function canStaffEdit(e: Entry): boolean {
  if (!STAFF_EDITABLE.includes(e.type)) return false;
  const occurred = new Date(e.occurred_at).getTime();
  return !!occurred && Date.now() - occurred <= EDIT_WINDOW_MS;
}

const TYPES = [
  { value: 'note', label: 'Note', icon: StickyNote },
  { value: 'meal', label: 'Meal', icon: UtensilsCrossed },
  { value: 'nap', label: 'Nap', icon: Moon },
  { value: 'diaper', label: 'Diaper', icon: Baby },
  { value: 'bathroom', label: 'Bathroom', icon: Baby },
  { value: 'activity', label: 'Activity', icon: Sparkles },
  { value: 'medication', label: 'Medication', icon: Pill },
  { value: 'photo', label: 'Photo', icon: Camera },
  { value: 'incident', label: 'Incident', icon: AlertTriangle },
] as const;

function timeOf(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function StaffDailyReportPage() {
  const { employee } = useCurrentEmployee();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string>('');
  const [type, setType] = useState<string>('note');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [napStart, setNapStart] = useState('');
  const [napEnd, setNapEnd] = useState('');
  const [photoData, setPhotoData] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [todayEntries, setTodayEntries] = useState<Entry[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [error, setError] = useState('');
  const [rosterError, setRosterError] = useState(false);
  const [noClassroom, setNoClassroom] = useState(false);
  const [viewDate, setViewDate] = useState<'today' | 'yesterday'>('today');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNapStart, setEditNapStart] = useState('');
  const [editNapEnd, setEditNapEnd] = useState('');
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState('');

  const loadRoster = useCallback(async () => {
    setLoadingRoster(true);
    setRosterError(false);
    setNoClassroom(false);
    try {
      const r = await fetch('/api/staff/children', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        setChildren(d.children || []);
        // A scoped teacher with no assigned room sees an empty roster on
        // purpose. Show the "ask your admin" note, not a load error.
        if (d.scoped && !d.classroom_id) {
          setNoClassroom(true);
        } else if (!d.children || d.children.length === 0) {
          setRosterError(true);
        }
      } else {
        setRosterError(true);
      }
    } catch {
      setRosterError(true);
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const loadToday = useCallback(async () => {
    if (!childId) {
      setTodayEntries([]);
      return;
    }
    setEditingId(null);
    const date = viewDate === 'today' ? centerDate() : shiftCenterDate(centerDate(), -1);
    try {
      const r = await fetch(
        `/api/child-entries?child_id=${encodeURIComponent(childId)}&date=${date}`,
        { cache: 'no-store' }
      );
      if (r.ok) {
        const d = await r.json();
        setTodayEntries(d.entries || []);
      } else {
        setTodayEntries([]);
      }
    } catch {
      setTodayEntries([]);
    }
  }, [childId, viewDate]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  async function submit() {
    if (!childId || saving) return;
    setSaving(true);
    setSaved(false);
    setError('');
    const detail: Record<string, string> = {};
    if (note.trim()) detail.note = note.trim();
    if (type === 'meal' && amount.trim()) detail.amount = amount.trim();
    if (type === 'nap') {
      if (napStart.trim()) detail.start = napStart.trim();
      if (napEnd.trim()) detail.end = napEnd.trim();
    }
    try {
      const r = await fetch('/api/child-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          type,
          detail,
          occurred_at: new Date().toISOString(),
          ...(type === 'photo' && photoData ? { photo_data: photoData } : {}),
        }),
      });
      if (r.ok) {
        setSaved(true);
        setNote('');
        setAmount('');
        setNapStart('');
        setNapEnd('');
        setPhotoData('');
        setViewDate('today');
        await loadToday();
        setTimeout(() => setSaved(false), 2500);
      } else {
        const d = await r.json().catch(() => ({}));
        if (r.status === 401) {
          setError('Your session ended. Enter your PIN again, then log it.');
        } else {
          setError(d.error || 'Could not save. Try again.');
        }
      }
    } catch {
      setError('Network problem. It did not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function beginEdit(e: Entry) {
    setEditingId(e.id);
    setRowError('');
    setEditNote(typeof e.detail?.note === 'string' ? e.detail.note : '');
    setEditAmount(typeof e.detail?.amount === 'string' ? e.detail.amount : '');
    setEditNapStart(typeof e.detail?.start === 'string' ? e.detail.start : '');
    setEditNapEnd(typeof e.detail?.end === 'string' ? e.detail.end : '');
  }

  async function saveEdit(e: Entry) {
    setRowBusy(e.id);
    setRowError('');
    const detail: Record<string, unknown> = { ...e.detail };
    const n = editNote.trim();
    if (n) detail.note = n;
    else delete detail.note;
    if (e.type === 'meal') {
      const a = editAmount.trim();
      if (a) detail.amount = a;
      else delete detail.amount;
    }
    if (e.type === 'nap') {
      const s = editNapStart.trim();
      const en = editNapEnd.trim();
      if (s) detail.start = s;
      else delete detail.start;
      if (en) detail.end = en;
      else delete detail.end;
    }
    try {
      const r = await fetch(`/api/child-entries/${e.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail }),
      });
      if (r.ok) {
        setEditingId(null);
        await loadToday();
      } else {
        const d = await r.json().catch(() => ({}));
        setRowError(d.error || 'Could not save the change.');
      }
    } catch {
      setRowError('Network problem. Try again.');
    } finally {
      setRowBusy(null);
    }
  }

  async function deleteEntry(e: Entry) {
    if (!window.confirm('Remove this entry? Parents will no longer see it.')) return;
    setRowBusy(e.id);
    setRowError('');
    try {
      const r = await fetch(`/api/child-entries/${e.id}`, { method: 'DELETE' });
      if (r.ok) {
        await loadToday();
      } else {
        const d = await r.json().catch(() => ({}));
        setRowError(d.error || 'Could not remove it.');
      }
    } catch {
      setRowError('Network problem. Try again.');
    } finally {
      setRowBusy(null);
    }
  }

  const grouped = children.reduce<Record<string, Child[]>>((acc, c) => {
    const key = c.classroom || 'Unassigned';
    (acc[key] = acc[key] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-christina-red" />
          Daily Report
        </h1>
        <p className="text-muted-foreground text-sm">
          Log a moment for a child. Parents see it on their child&apos;s report.
          {employee ? ` Recorded as ${employee.first_name} ${employee.last_name}.` : ''}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="child" className="text-sm">
              Child
            </Label>
            {loadingRoster ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading roster…
              </div>
            ) : noClassroom ? (
              <div className="mt-1 rounded-md border border-christina-yellow/60 bg-christina-yellow/10 p-3 text-sm">
                You are not assigned to a classroom yet, so no children show
                here. Ask your director to assign your classroom in Staff
                settings, then reload.
                <div className="mt-2">
                  <Button type="button" size="sm" variant="outline" onClick={loadRoster} className="text-xs">
                    Reload
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <select
                  id="child"
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a child…</option>
                  {Object.keys(grouped)
                    .sort()
                    .map((room) => (
                      <optgroup key={room} label={room}>
                        {grouped[room].map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
                {rosterError && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs text-christina-coral">
                      The roster did not load.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={loadRoster}
                      className="text-xs"
                    >
                      Reload
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <Label className="text-sm">Type</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <Button
                    key={t.value}
                    type="button"
                    variant={type === t.value ? 'default' : 'outline'}
                    size="sm"
                    className={`gap-1 ${type === t.value ? 'bg-christina-red' : ''}`}
                    onClick={() => setType(t.value)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {type === 'meal' && (
            <div>
              <Label htmlFor="amount" className="text-sm">
                How much did they eat?
              </Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="All of it / Half / A few bites"
                className="mt-1"
              />
            </div>
          )}

          {type === 'nap' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ns" className="text-sm">
                  Fell asleep
                </Label>
                <Input
                  id="ns"
                  value={napStart}
                  onChange={(e) => setNapStart(e.target.value)}
                  placeholder="12:30 PM"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ne" className="text-sm">
                  Woke up
                </Label>
                <Input
                  id="ne"
                  value={napEnd}
                  onChange={(e) => setNapEnd(e.target.value)}
                  placeholder="2:00 PM"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {type === 'photo' && (
            <div>
              <Label htmlFor="photo" className="text-sm">
                Photo
              </Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setPhotoData('');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () =>
                    setPhotoData(
                      typeof reader.result === 'string' ? reader.result : ''
                    );
                  reader.readAsDataURL(file);
                }}
              />
              {photoData && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoData}
                  alt="Selected"
                  className="mt-2 h-32 rounded-md object-cover border"
                />
              )}
            </div>
          )}

          <div>
            <Label htmlFor="note" className="text-sm">
              Note {type === 'incident' ? '(what happened, what you did)' : ''}
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short note for the family…"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={submit}
              disabled={
                !childId || saving || (type === 'photo' && !photoData)
              }
              className="bg-christina-red gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              Log it
            </Button>
            {saved && (
              <span className="text-sm text-christina-green flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Logged. The family can see it.
              </span>
            )}
          </div>
          {error && (
            <p className="text-sm text-christina-coral mt-1">{error}</p>
          )}
        </CardContent>
      </Card>

      {childId && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Logged for{' '}
                {children.find((c) => c.id === childId)?.name || 'this child'}
              </CardTitle>
              <div className="flex rounded-md border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setViewDate('today')}
                  className={`px-3 py-1 ${viewDate === 'today' ? 'bg-christina-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate('yesterday')}
                  className={`px-3 py-1 border-l ${viewDate === 'yesterday' ? 'bg-christina-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Yesterday
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You can fix or remove your entries from the last 48 hours. Medication and incidents are changed by the director.
            </p>
          </CardHeader>
          <CardContent>
            {rowError && (
              <p className="text-sm text-christina-coral mb-2">{rowError}</p>
            )}
            {todayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nothing logged {viewDate === 'today' ? 'yet today' : 'yesterday'}.
              </p>
            ) : (
              <div className="space-y-1">
                {todayEntries.map((e) => {
                  const noteText =
                    typeof e.detail?.note === 'string' ? e.detail.note : '';
                  const amount =
                    typeof e.detail?.amount === 'string' ? e.detail.amount : '';
                  const napStart =
                    typeof e.detail?.start === 'string' ? e.detail.start : '';
                  const napEnd =
                    typeof e.detail?.end === 'string' ? e.detail.end : '';
                  const extras =
                    e.type === 'meal' && amount
                      ? `Ate: ${amount}`
                      : e.type === 'nap' && (napStart || napEnd)
                        ? `${napStart || '?'} - ${napEnd || '?'}`
                        : '';
                  const editable = canStaffEdit(e);
                  const adminOnly = e.type === 'medication' || e.type === 'incident';
                  const busy = rowBusy === e.id;

                  if (editingId === e.id) {
                    return (
                      <div key={e.id} className="py-3 border-b last:border-b-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{e.type}</Badge>
                          <span className="text-muted-foreground text-xs">{timeOf(e.occurred_at)}</span>
                        </div>
                        {e.type === 'meal' && (
                          <Input
                            value={editAmount}
                            onChange={(ev) => setEditAmount(ev.target.value)}
                            placeholder="All of it / Half / A few bites"
                          />
                        )}
                        {e.type === 'nap' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={editNapStart} onChange={(ev) => setEditNapStart(ev.target.value)} placeholder="Fell asleep" />
                            <Input value={editNapEnd} onChange={(ev) => setEditNapEnd(ev.target.value)} placeholder="Woke up" />
                          </div>
                        )}
                        <Textarea
                          value={editNote}
                          onChange={(ev) => setEditNote(ev.target.value)}
                          rows={2}
                          placeholder="Note for the family…"
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="bg-christina-red gap-1" disabled={busy} onClick={() => saveEdit(e)}>
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-1" disabled={busy} onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={e.id} className="flex items-center gap-3 py-2 border-b last:border-b-0 text-sm">
                      <Badge variant="outline" className="text-xs capitalize">{e.type}</Badge>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">{timeOf(e.occurred_at)}</span>
                      <span className="flex-1 truncate text-gray-800">
                        {noteText}
                        {extras && (
                          <span className="text-muted-foreground">{noteText ? ' · ' : ''}{extras}</span>
                        )}
                        {e.updated_at && <span className="text-muted-foreground text-xs italic"> (edited)</span>}
                      </span>
                      {editable ? (
                        <span className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" disabled={busy} onClick={() => beginEdit(e)} aria-label="Edit entry">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-christina-coral hover:text-christina-coral" disabled={busy} onClick={() => deleteEntry(e)} aria-label="Delete entry">
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <Lock className="h-3 w-3" />
                          {adminOnly ? 'Director only' : 'Locked'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
