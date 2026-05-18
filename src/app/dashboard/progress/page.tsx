'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, ClipboardList } from 'lucide-react';

interface Child {
  id: string;
  name: string;
}

interface Entry {
  id: string;
  type: string;
  detail: Record<string, unknown>;
  occurred_at: string;
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

export default function ProgressPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [byChild, setByChild] = useState<Record<string, Entry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cr = await fetch('/api/parent/children', { cache: 'no-store' });
        if (!cr.ok) return;
        const cd = await cr.json();
        const kids: Child[] = cd.children || [];
        setChildren(kids);
        const today = new Date().toISOString().split('T')[0];
        const map: Record<string, Entry[]> = {};
        await Promise.all(
          kids.map(async (c) => {
            try {
              const r = await fetch(
                `/api/child-entries?child_id=${encodeURIComponent(c.id)}&date=${today}`,
                { cache: 'no-store' }
              );
              if (r.ok) {
                const d = await r.json();
                map[c.id] = d.entries || [];
              } else {
                map[c.id] = [];
              }
            } catch {
              map[c.id] = [];
            }
          })
        );
        setByChild(map);
      } catch {
        /* leave empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-christina-red" />
          Progress
        </h1>
        <p className="text-muted-foreground text-sm">
          Today&apos;s activity for your{' '}
          {children.length === 1 ? 'child' : 'children'}. For the full
          timeline, open the Daily Report.
        </p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No child is linked to your account yet.
          </CardContent>
        </Card>
      ) : (
        children.map((c) => {
          const entries = byChild[c.id] || [];
          const counts = entries.reduce<Record<string, number>>((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
          }, {});
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{c.name}</span>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/dashboard/daily">
                      <ClipboardList className="h-4 w-4" />
                      Daily Report
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nothing logged yet today. Teachers add to the report
                    through the day.
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
                      {entries.slice(0, 4).map((e) => (
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
