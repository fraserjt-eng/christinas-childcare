'use client';

import { useState, useEffect, useCallback } from 'react';
import { centerDate, shiftCenterDate } from '@/lib/center-time';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Moon,
  UtensilsCrossed,
  Baby,
  Milk,
  Pill,
  Sparkles,
  Camera,
  AlertTriangle,
  CheckCircle2,
  StickyNote,
  Loader2,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  classroom: string | null;
  date_of_birth: string | null;
}

interface Entry {
  id: string;
  child_id: string;
  date: string;
  type: string;
  detail: Record<string, unknown>;
  occurred_at: string;
}

const TYPE_META: Record<
  string,
  { label: string; icon: typeof StickyNote; color: string }
> = {
  note: { label: 'Note', icon: StickyNote, color: 'text-gray-600' },
  nap: { label: 'Nap', icon: Moon, color: 'text-indigo-600' },
  meal: { label: 'Meal', icon: UtensilsCrossed, color: 'text-amber-600' },
  bottle: { label: 'Bottle', icon: Milk, color: 'text-sky-600' },
  bathroom: { label: 'Bathroom', icon: Baby, color: 'text-cyan-600' },
  diaper: { label: 'Diaper', icon: Baby, color: 'text-cyan-600' },
  toileting: { label: 'Potty', icon: CheckCircle2, color: 'text-teal-600' },
  accident: { label: 'Accident', icon: AlertTriangle, color: 'text-orange-600' },
  medication: { label: 'Medication', icon: Pill, color: 'text-red-600' },
  activity: { label: 'Activity', icon: Sparkles, color: 'text-emerald-600' },
  photo: { label: 'Photo', icon: Camera, color: 'text-purple-600' },
  incident: { label: 'Incident', icon: AlertTriangle, color: 'text-red-700' },
};

function detailText(detail: Record<string, unknown>): string {
  if (!detail) return '';
  const parts: string[] = [];
  const note = detail.note ?? detail.text ?? detail.description;
  if (typeof note === 'string' && note.trim()) parts.push(note.trim());
  if (typeof detail.amount === 'string' && detail.amount) parts.push(`Ate: ${detail.amount}`);
  if (typeof detail.contents === 'string' || typeof detail.oz === 'string') {
    const bottle = [
      typeof detail.contents === 'string' ? detail.contents : '',
      typeof detail.oz === 'string' && detail.oz ? `${detail.oz} oz` : '',
    ]
      .filter(Boolean)
      .join(', ');
    if (bottle) parts.push(bottle);
  }
  if (typeof detail.condition === 'string' && detail.condition) parts.push(detail.condition);
  if (typeof detail.start === 'string' && detail.start) {
    const end = typeof detail.end === 'string' && detail.end ? ` – ${detail.end}` : '';
    parts.push(`Slept ${detail.start}${end}`);
  }
  return parts.join(' · ');
}

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

export default function ParentDailyReportPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => centerDate());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/parent/children', { cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          const kids: Child[] = d.children || [];
          setChildren(kids);
          if (kids.length > 0) setActiveChild(kids[0].id);
        }
      } catch {
        /* leave empty */
      } finally {
        setLoadingChildren(false);
      }
    })();
  }, []);

  const loadEntries = useCallback(async () => {
    if (!activeChild) return;
    setLoadingEntries(true);
    try {
      const r = await fetch(
        `/api/child-entries?child_id=${encodeURIComponent(activeChild)}&date=${date}`,
        { cache: 'no-store' }
      );
      if (r.ok) {
        const d = await r.json();
        setEntries(d.entries || []);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }, [activeChild, date]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function shiftDay(delta: number) {
    setDate(shiftCenterDate(date, delta));
  }

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const isToday = date === centerDate();

  if (loadingChildren) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-christina-red" />
          Daily Report
        </h1>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No child is linked to your account yet. Once your enrollment is
            approved, your child&apos;s daily report appears here.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-christina-red" />
          Daily Report
        </h1>
        <p className="text-muted-foreground text-sm">
          Everything your child&apos;s teachers logged, as it happens.
        </p>
      </div>

      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c) => (
            <Button
              key={c.id}
              variant={activeChild === c.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChild(c.id)}
              className={activeChild === c.id ? 'bg-christina-red' : ''}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => shiftDay(-1)}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold min-w-52 text-center">
          {dateLabel}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => shiftDay(1)}
          disabled={isToday}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() =>
              setDate(centerDate())
            }
          >
            Today
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {children.find((c) => c.id === activeChild)?.name}&apos;s day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEntries ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nothing logged {isToday ? 'yet today' : 'on this day'}. Check back
              soon.
            </p>
          ) : (
            // Chronological timeline: earliest at the top, each entry on a rail
            // with its clock time, so the day reads top-to-bottom instead of as
            // one undifferentiated list.
            <ol className="space-y-0">
              {[...entries]
                .sort((a, b) =>
                  (a.occurred_at || '').localeCompare(b.occurred_at || '')
                )
                .map((e, i, arr) => {
                  const meta = TYPE_META[e.type] || TYPE_META.note;
                  const Icon = meta.icon;
                  const text = detailText(e.detail);
                  const isLast = i === arr.length - 1;
                  return (
                    <li key={e.id} className="flex gap-3">
                      <div className="w-14 flex-shrink-0 pt-2.5 text-right text-xs font-semibold text-gray-600">
                        {timeOf(e.occurred_at)}
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-center">
                        <span className="mt-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-white">
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </span>
                        {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 flex-1 py-2.5">
                        <Badge variant="outline" className="text-xs">
                          {meta.label}
                        </Badge>
                        {text && (
                          <p className="mt-1 break-words text-sm text-gray-800">
                            {text}
                          </p>
                        )}
                        {e.type === 'photo' &&
                          typeof e.detail?.photo_url === 'string' && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={e.detail.photo_url as string}
                              alt="From your child's day"
                              className="mt-2 max-h-64 w-auto rounded-lg border"
                            />
                          )}
                      </div>
                    </li>
                  );
                })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
