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
import { supabase } from '@/lib/supabase';

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

interface AttendanceRecord {
  id: string;
  child_name: string;
  child_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  center_id: string;
  notes: string | null;
}

interface ChildWithAttendance {
  child_id: string;
  child_name: string;
  classroom: string;
  check_in: string | null;
  check_out: string | null;
  attendance_id: string | null;
}

const CRYSTAL_CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function AttendancePage() {
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
    const today = new Date().toISOString().split('T')[0];

    // Get all children from Supabase
    const { data: children, error: childErr } = await supabase
      .from('family_children')
      .select('id, name, classroom, family_id');
    if (childErr) console.error('Children fetch error:', childErr.message);

    // Get today's attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('id, child_id, child_name, check_in, check_out, notes')
      .eq('date', today);

    const attendanceMap = new Map<string, AttendanceRecord>();
    if (attendance) {
      for (const a of attendance) {
        attendanceMap.set(a.child_id, a as AttendanceRecord);
      }
    }

    // Merge children with attendance
    const merged: ChildWithAttendance[] = (children || []).map((c: { id: string; name: string; classroom: string | null }) => {
      const att = attendanceMap.get(c.id);
      return {
        child_id: c.id,
        child_name: c.name,
        classroom: c.classroom || 'Unassigned',
        check_in: att?.check_in || null,
        check_out: att?.check_out || null,
        attendance_id: att?.id || null,
      };
    });

    // Also include any attendance records for children not in family_children (legacy data)
    if (attendance) {
      for (const a of attendance) {
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
    }

    // Sort: checked-in first, then by name
    merged.sort((a, b) => {
      if (a.check_in && !a.check_out && !(b.check_in && !b.check_out)) return -1;
      if (b.check_in && !b.check_out && !(a.check_in && !a.check_out)) return 1;
      return a.child_name.localeCompare(b.child_name);
    });

    setRecords(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    // Keep the page live so a kiosk check-in shows up without a manual reload.
    // Three layers, because a phone left open is the real-world case:
    //  1. realtime — instant update when the attendance table changes
    //  2. refetch on focus/visibility — phones drop the socket when the screen
    //     sleeps, so re-pull the moment the tab comes back to the foreground
    //  3. slow interval poll — backstop if realtime never connects on mobile
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { subscribeToTable } = await import('@/lib/supabase/realtime');
        unsubscribe = subscribeToTable('attendance', () => {
          loadData();
        });
      } catch {
        /* realtime optional; focus + poll still keep it fresh */
      }
    })();

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadData();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    const poll = setInterval(loadData, 60000);

    return () => {
      if (unsubscribe) unsubscribe();
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
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('attendance').insert({
      child_id: child.child_id,
      child_name: child.child_name,
      date: today,
      check_in: new Date().toISOString(),
      center_id: CRYSTAL_CENTER_ID,
    });
    await loadData();
  }

  async function handleCheckOut(child: ChildWithAttendance) {
    if (!child.attendance_id) return;
    await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', child.attendance_id);
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
