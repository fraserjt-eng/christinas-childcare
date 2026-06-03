'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Users, ListChecks } from 'lucide-react';

// Batch daily entry: log the same note/activity for a whole classroom at once,
// then adjust or exclude per child. Writes through the service-role batch API.

type BatchType = 'note' | 'activity' | 'nap' | 'meal' | 'bathroom' | 'diaper';

const TYPE_LABELS: Record<BatchType, string> = {
  note: 'Note',
  activity: 'Activity',
  nap: 'Nap',
  meal: 'Meal',
  bathroom: 'Bathroom',
  diaper: 'Diaper',
};

interface Child {
  id: string;
  name: string;
  classroom: string | null;
}

interface RowState {
  included: boolean;
  note: string;
}

export default function BatchEntryPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<string>('');
  const [type, setType] = useState<BatchType>('activity');
  const [sharedNote, setSharedNote] = useState('');
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [noClassroom, setNoClassroom] = useState(false);

  // Load the roster once (service-role route returns child + classroom name,
  // scoped to the teacher's room for non-admins).
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/staff/children', { cache: 'no-store' });
        const json = await res.json().catch(() => ({ children: [] }));
        const kids: Child[] = json.children ?? [];
        setChildren(kids);
        if (json.scoped && !json.classroom_id) setNoClassroom(true);
        const firstRoom = kids.find((c) => c.classroom)?.classroom || '';
        setClassroom(firstRoom);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const classrooms = useMemo(
    () =>
      Array.from(
        new Set(children.map((c) => c.classroom).filter((r): r is string => !!r))
      ).sort((a, b) => a.localeCompare(b)),
    [children]
  );

  const classroomChildren = useMemo(
    () => children.filter((c) => (c.classroom || '') === classroom),
    [children, classroom]
  );

  // When the classroom changes, default every child to included with no override.
  useEffect(() => {
    const next: Record<string, RowState> = {};
    for (const c of classroomChildren) {
      next[c.id] = { included: true, note: '' };
    }
    setRows(next);
    setSubmitted(false);
    setErrorMsg('');
  }, [classroom]); // eslint-disable-line react-hooks/exhaustive-deps

  const includedCount = classroomChildren.filter((c) => rows[c.id]?.included).length;
  const allIncluded = classroomChildren.length > 0 && includedCount === classroomChildren.length;

  function toggleAll() {
    setRows((prev) => {
      const next = { ...prev };
      for (const c of classroomChildren) {
        next[c.id] = { ...(next[c.id] || { note: '' }), included: !allIncluded };
      }
      return next;
    });
  }

  function setRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...(prev[id] || { included: true, note: '' }), ...patch } }));
  }

  async function handleSubmit() {
    setErrorMsg('');
    const entries = classroomChildren
      .filter((c) => rows[c.id]?.included)
      .map((c) => ({ child_id: c.id, note: rows[c.id]?.note?.trim() || undefined }));

    if (entries.length === 0) {
      setErrorMsg('Select at least one child.');
      return;
    }
    if (!sharedNote.trim() && entries.every((e) => !e.note)) {
      setErrorMsg('Write a note for the class, or a note for each child.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/employee/batch-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroom_name: classroom,
          type,
          note: sharedNote.trim() || undefined,
          entries,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not save.');
      setSavedCount(json.count ?? entries.length);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubmitted(false);
    setSharedNote('');
    const next: Record<string, RowState> = {};
    for (const c of classroomChildren) next[c.id] = { included: true, note: '' };
    setRows(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-4">
        <div className="rounded-full bg-christina-green/10 p-5">
          <CheckCircle2 className="h-12 w-12 text-christina-green" />
        </div>
        <h2 className="text-2xl font-bold text-center">Logged for the class</h2>
        <p className="text-muted-foreground text-center">
          {savedCount} {savedCount === 1 ? 'entry' : 'entries'} saved to {classroom || 'the classroom'}.
        </p>
        <Button onClick={reset} className="bg-christina-red hover:bg-christina-red/90 text-white mt-2">
          <ListChecks className="h-4 w-4 mr-2" />
          Log Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Batch Daily Entry</h1>
        <p className="text-muted-foreground mt-1">
          Log the same thing for the whole class, then adjust or remove anyone.
        </p>
      </div>

      {/* Classroom + type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What and where</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {noClassroom && (
            <div className="rounded-md border border-christina-yellow/60 bg-christina-yellow/10 p-3 text-sm">
              You are not assigned to a classroom yet, so no children show here.
              Ask your director to assign your classroom in Staff settings.
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Classroom</Label>
            <select
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {classrooms.length === 0 && <option value="">No classrooms found</option>}
              {classrooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Entry type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BatchType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(Object.keys(TYPE_LABELS) as BatchType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Note for the whole class
            </Label>
            <Input
              value={sharedNote}
              onChange={(e) => setSharedNote(e.target.value)}
              placeholder="e.g. Circle time, then outdoor play"
              maxLength={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Children
            </CardTitle>
            <Badge variant="secondary">{includedCount} of {classroomChildren.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {classroomChildren.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No children in this classroom.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                <Checkbox id="all" checked={allIncluded} onCheckedChange={toggleAll} />
                <label htmlFor="all" className="text-sm text-muted-foreground cursor-pointer">
                  {allIncluded ? 'Unselect all' : 'Select all'}
                </label>
              </div>
              {classroomChildren.map((c) => {
                const row = rows[c.id] || { included: true, note: '' };
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg border p-2">
                    <Checkbox
                      checked={row.included}
                      onCheckedChange={(v) => setRow(c.id, { included: !!v })}
                    />
                    <span className="text-sm font-medium w-32 shrink-0 truncate">{c.name}</span>
                    <Input
                      value={row.note}
                      onChange={(e) => setRow(c.id, { note: e.target.value })}
                      placeholder="Override note (optional)"
                      className="h-8 text-sm"
                      maxLength={300}
                      disabled={!row.included}
                    />
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={submitting || includedCount === 0}
        className="w-full bg-christina-red hover:bg-christina-red/90 text-white h-12 text-base"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
        ) : (
          <>Log {TYPE_LABELS[type]} for {includedCount} {includedCount === 1 ? 'Child' : 'Children'}</>
        )}
      </Button>

      {errorMsg && (
        <p className="text-sm text-christina-coral text-center" role="alert">{errorMsg}</p>
      )}
    </div>
  );
}
