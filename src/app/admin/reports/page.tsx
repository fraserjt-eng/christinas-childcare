'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  CircleDashed,
} from 'lucide-react';

interface Entry {
  id: string;
  type: string;
  detail: Record<string, unknown>;
  occurred_at: string;
}
interface ReportChild {
  id: string;
  name: string;
  classroom: string;
  entries: Entry[];
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

export default function DailyReportsPage() {
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [children, setChildren] = useState<ReportChild[]>([]);
  const [room, setRoom] = useState('All');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/daily-report?date=${date}`, {
        cache: 'no-store',
      });
      if (r.ok) {
        const d = await r.json();
        setClassrooms(['All', ...(d.classrooms || [])]);
        setChildren(d.children || []);
      } else {
        setChildren([]);
        setClassrooms(['All']);
      }
    } catch {
      setChildren([]);
      setClassrooms(['All']);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  function shiftDay(delta: number) {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  }

  const isToday = date === new Date().toISOString().split('T')[0];
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const filtered =
    room === 'All' ? children : children.filter((c) => c.classroom === room);
  const withEntries = filtered.filter((c) => c.entries.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-christina-red" />
            Daily Reports
          </h1>
          <p className="text-muted-foreground text-sm">
            Real per-child activity logged by staff. {withEntries} of{' '}
            {filtered.length} have entries {isToday ? 'today' : 'that day'}.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/employee/daily-report">
            <ClipboardList className="h-4 w-4" />
            Log an entry
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </Button>
        )}
        <Select value={room} onValueChange={setRoom}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by classroom" />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[260px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No children {room === 'All' ? '' : `in ${room} `}on file yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((child) => {
            const counts = child.entries.reduce<Record<string, number>>(
              (acc, e) => {
                acc[e.type] = (acc[e.type] || 0) + 1;
                return acc;
              },
              {}
            );
            const done = child.entries.length > 0;
            return (
              <Card key={child.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-christina-green" />
                      ) : (
                        <CircleDashed className="h-4 w-4 text-muted-foreground" />
                      )}
                      {child.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {child.classroom}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!done ? (
                    <p className="text-sm text-muted-foreground py-3 text-center">
                      No entries logged {isToday ? 'yet today' : 'this day'}.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(counts).map(([type, n]) => (
                          <Badge
                            key={type}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {type}: {n}
                          </Badge>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {child.entries.slice(0, 5).map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center gap-2 text-sm border-b last:border-b-0 py-1.5"
                          >
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {e.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {timeOf(e.occurred_at)}
                            </span>
                            <span className="flex-1 truncate text-gray-800">
                              {typeof e.detail?.note === 'string'
                                ? e.detail.note
                                : ''}
                            </span>
                          </div>
                        ))}
                        {child.entries.length > 5 && (
                          <p className="text-xs text-muted-foreground pt-1">
                            + {child.entries.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
