'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, LogOut, RefreshCw, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSessionUser } from '@/lib/use-session-user';
import { centerTime } from '@/lib/center-time';

// All reads + writes go through session-gated service-role routes: reads via
// /api/portal/center-data, writes via /api/admin/attendance/checkin and
// /api/admin/time-correction. The anon client can't reach the RLS-locked
// attendance table, so nothing here touches it directly.

// ISO <-> <input type="datetime-local"> (browser local time).
function isoToLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function localToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

interface ChildWithAttendance {
  child_id: string;
  child_name: string;
  classroom: string;
  check_in: string | null;
  check_out: string | null;
  attendance_id: string | null;
}

function formatTime(iso: string): string {
  return centerTime(new Date(iso));
}

export default function AttendancePage() {
  // Center scoping is enforced server-side by /api/portal/center-data + the
  // check-in route, based on the session.
  const { loading: sessionLoading } = useSessionUser();
  const [records, setRecords] = useState<ChildWithAttendance[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<ChildWithAttendance | null>(null);
  const [editIn, setEditIn] = useState('');
  const [editOut, setEditOut] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const loadData = useCallback(async () => {
    // Wait for the session so we have one before calling the route.
    if (sessionLoading) return;

    // Read the PII-locked family_children + today's attendance through the
    // session-gated service-role route (the anon client cannot read them). The
    // route center-scopes server-side from the session, so a center-bound admin
    // only ever sees their own center; never fall back to the anon client here.
    type RouteKid = { id: string; firstName: string; lastName: string; roomId: string };
    type RouteRoom = { id: string; name: string };
    type RouteAtt = {
      id: string;
      child_id: string | null;
      child_name: string | null;
      check_in: string | null;
      check_out: string | null;
    };
    let kids: RouteKid[] = [];
    let rooms: RouteRoom[] = [];
    let attendance: RouteAtt[] = [];
    try {
      const r = await fetch('/api/portal/center-data', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        kids = (d.kids ?? []) as RouteKid[];
        rooms = (d.rooms ?? []) as RouteRoom[];
        attendance = (d.todayAttendance ?? []) as RouteAtt[];
      } else {
        console.error('center-data read failed:', r.status);
      }
    } catch {
      // Route unavailable: fall through with empty data (no anon fallback).
    }

    // roomId (classroom_id) -> display name for the classroom column.
    const roomName = new Map<string, string>();
    for (const room of rooms) roomName.set(room.id, room.name);

    const attendanceMap = new Map<string, RouteAtt>();
    for (const a of attendance) {
      if (a.child_id) attendanceMap.set(a.child_id, a);
    }

    // Merge children with attendance.
    const merged: ChildWithAttendance[] = kids.map((c) => {
      const att = c.id ? attendanceMap.get(c.id) : undefined;
      const fullName = `${c.firstName} ${c.lastName}`.trim();
      return {
        child_id: c.id,
        child_name: fullName,
        classroom: (c.roomId && roomName.get(c.roomId)) || 'Unassigned',
        check_in: att?.check_in || null,
        check_out: att?.check_out || null,
        attendance_id: att?.id || null,
      };
    });

    // Also include any attendance records for children not in family_children (legacy data)
    for (const a of attendance) {
      if (!a.child_id) continue;
      if (!merged.find((m) => m.child_id === a.child_id)) {
        merged.push({
          child_id: a.child_id,
          child_name: a.child_name || 'Unknown',
          classroom: '',
          check_in: a.check_in,
          check_out: a.check_out,
          attendance_id: a.id,
        });
      }
    }

    // Sort: checked-in first, then by name
    merged.sort((a, b) => {
      if (a.check_in && !a.check_out && !(b.check_in && !b.check_out)) return -1;
      if (b.check_in && !b.check_out && !(a.check_in && !a.check_out)) return 1;
      return a.child_name.localeCompare(b.child_name);
    });

    setRecords(merged);
    setLoading(false);
  }, [sessionLoading]);

  useEffect(() => {
    loadData();

    // Keep the page live without a manual reload. The anon client can't subscribe
    // to the RLS-locked attendance table, so we refetch on focus/visibility (phones
    // drop the socket when the screen sleeps) plus a slow interval poll — both pull
    // through the service-role route.
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadData();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    const poll = setInterval(loadData, 60000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      clearInterval(poll);
    };
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleCheckIn(child: ChildWithAttendance) {
    // attendance is RLS-locked to anon; write through the service-role route
    let data: { id?: string } = {};
    try {
      const r = await fetch('/api/admin/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkin', childId: child.child_id }),
      });
      data = await r.json().catch(() => ({}));
      if (!r.ok) {
        window.alert((data as { error?: string }).error || 'Could not check this child in. Please try again.');
        return;
      }
    } catch {
      window.alert('Could not check this child in. Please try again.');
      return;
    }
    // Reflect the check-in immediately (the re-read below confirms it), so the
    // row never looks like "nothing happened" even if the refresh is slow.
    const now = new Date().toISOString();
    setRecords((prev) =>
      prev.map((rec) =>
        rec.child_id === child.child_id
          ? { ...rec, check_in: now, check_out: null, attendance_id: data.id ?? rec.attendance_id }
          : rec
      )
    );
    await loadData();
  }

  async function handleCheckOut(child: ChildWithAttendance) {
    if (!child.attendance_id) return;
    try {
      const r = await fetch('/api/admin/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout', attendanceId: child.attendance_id }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        window.alert(d.error || 'Could not check this child out. Please try again.');
        return;
      }
    } catch {
      window.alert('Could not check this child out. Please try again.');
      return;
    }
    const now = new Date().toISOString();
    setRecords((prev) =>
      prev.map((rec) =>
        rec.attendance_id === child.attendance_id ? { ...rec, check_out: now } : rec
      )
    );
    await loadData();
  }

  function openEdit(record: ChildWithAttendance) {
    setEditing(record);
    setEditIn(isoToLocal(record.check_in));
    setEditOut(isoToLocal(record.check_out));
    setEditError('');
  }

  async function saveEdit() {
    if (!editing?.attendance_id || savingEdit) return;
    setSavingEdit(true);
    setEditError('');
    try {
      const r = await fetch('/api/admin/time-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'attendance',
          id: editing.attendance_id,
          check_in: localToIso(editIn),
          check_out: localToIso(editOut),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setEditError(d.error || 'Could not save the correction.');
        return;
      }
      setEditing(null);
      await loadData();
    } catch {
      setEditError('Could not save the correction.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteAttendance(record: ChildWithAttendance) {
    if (!record.attendance_id) return;
    const ok = window.confirm(
      `Delete today's attendance for ${record.child_name}? This removes it from ratios, the dashboard, and reports. This cannot be undone.`
    );
    if (!ok) return;
    try {
      const r = await fetch(
        `/api/admin/time-correction?kind=attendance&id=${encodeURIComponent(record.attendance_id)}`,
        { method: 'DELETE' }
      );
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        window.alert(d.error || 'Could not delete the record.');
        return;
      }
      await loadData();
    } catch {
      window.alert('Could not delete the record.');
    }
  }

  const present = records.filter((r) => r.check_in && !r.check_out).length;
  const absent = records.filter((r) => !r.check_in).length;
  const departed = records.filter((r) => r.check_in && r.check_out).length;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const classrooms = Array.from(new Set(records.map((r) => r.classroom).filter(Boolean))).sort();

  const filtered =
    filter === 'all'
      ? records
      : records.filter((r) => {
          if (filter === 'present') return r.check_in && !r.check_out;
          if (filter === 'absent') return !r.check_in;
          if (filter === 'departed') return r.check_in && r.check_out;
          return r.classroom === filter;
        });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground animate-pulse">Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">{todayFormatted}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-christina-green">{present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-christina-coral">{absent}</p>
            <p className="text-xs text-muted-foreground">Not Checked In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-christina-blue">{departed}</p>
            <p className="text-xs text-muted-foreground">Departed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Daily Attendance ({records.length} children)</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Not Checked In</SelectItem>
              <SelectItem value="departed">Departed</SelectItem>
              {classrooms.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No records found. Children will appear here when families are added and check in via the kiosk.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((record) => (
                <div key={record.child_id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      record.check_in && record.check_out
                        ? 'bg-gray-400'
                        : record.check_in
                          ? 'bg-christina-green'
                          : 'bg-christina-coral'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{record.child_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{record.classroom}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {record.check_in && (
                      <span className="flex items-center gap-1">
                        <LogIn className="h-3 w-3 text-christina-green" /> {formatTime(record.check_in)}
                      </span>
                    )}
                    {record.check_out && (
                      <span className="flex items-center gap-1">
                        <LogOut className="h-3 w-3 text-christina-blue" /> {formatTime(record.check_out)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!record.check_in ? (
                      <Button size="sm" variant="outline" onClick={() => handleCheckIn(record)} className="text-xs">
                        Check In
                      </Button>
                    ) : !record.check_out ? (
                      <Button size="sm" variant="outline" onClick={() => handleCheckOut(record)} className="text-xs">
                        Check Out
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Complete
                      </Badge>
                    )}
                    {record.attendance_id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(record)}
                          className="text-xs gap-1"
                          title="Fix the check-in or check-out time"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit times
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAttendance(record)}
                          className="text-xs gap-1 text-christina-coral hover:text-christina-coral"
                          title="Delete this attendance record (removes it from ratios, dashboard, reports)"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Correct times — {editing?.child_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground">
              Use this to fix a missed or wrong check-in/out. The change is
              authoritative and updates ratios and reports.
            </p>
            <div className="space-y-2">
              <Label htmlFor="att-in">Check-in</Label>
              <Input
                id="att-in"
                type="datetime-local"
                value={editIn}
                onChange={(e) => setEditIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="att-out">Check-out</Label>
              <Input
                id="att-out"
                type="datetime-local"
                value={editOut}
                onChange={(e) => setEditOut(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave check-out blank if the child is still present.
              </p>
            </div>
            {editError && (
              <p className="text-sm text-christina-coral">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={savingEdit}
              className="bg-christina-red gap-2"
            >
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
              Save correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
