'use client';

import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/staff/children', { cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          setChildren(d.children || []);
        }
      } catch {
        /* leave empty */
      } finally {
        setLoadingRoster(false);
      }
    })();
  }, []);

  const loadToday = useCallback(async () => {
    if (!childId) {
      setTodayEntries([]);
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const r = await fetch(
        `/api/child-entries?child_id=${encodeURIComponent(childId)}&date=${today}`,
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
  }, [childId]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  async function submit() {
    if (!childId || saving) return;
    setSaving(true);
    setSaved(false);
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
        await loadToday();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      /* surfaced by the unchanged form (staff can retry) */
    } finally {
      setSaving(false);
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
            ) : (
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
        </CardContent>
      </Card>

      {childId && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Logged today for{' '}
              {children.find((c) => c.id === childId)?.name || 'this child'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nothing logged yet today.
              </p>
            ) : (
              <div className="space-y-1">
                {todayEntries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 py-2 border-b last:border-b-0 text-sm"
                  >
                    <Badge variant="outline" className="text-xs capitalize">
                      {e.type}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {timeOf(e.occurred_at)}
                    </span>
                    <span className="flex-1 truncate text-gray-800">
                      {typeof e.detail?.note === 'string'
                        ? e.detail.note
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
