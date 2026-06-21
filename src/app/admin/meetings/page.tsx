'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Play,
  Square,
  CheckCircle2,
  Circle,
  Clock,
  CalendarDays,
  Users,
  ListChecks,
  Presentation,
  Trash2,
  ArrowRightFromLine,
} from 'lucide-react';
import type {
  Meeting,
  MeetingAgendaItem,
  MeetingAttendance,
  MeetingActionItem,
} from '@/types/meetings';
import {
  DEFAULT_TEMPLATES,
  generateMeetingId,
  generateAgendaItemId,
  generateActionItemId,
  generateAttendanceId,
} from '@/types/meetings';
import { isDemoSeedEnabled } from '@/lib/demo-mode';

// --- Constants ---
const STORAGE_KEYS = {
  meetings: 'christinas_meetings',
  agenda: 'christinas_agenda_items',
  actions: 'christinas_action_items',
  attendance: 'christinas_attendance',
} as const;

// Demo attendee roster only; real-data-only mode shows an empty attendee list
// (the page renders 0-of-0 / no rows when empty) until real staff are wired in.
const STAFF_LIST = isDemoSeedEnabled()
  ? [
      'Christina Fraser',
      'Sarah Johnson',
      'Maria Garcia',
      'James Wilson',
      'Emily Chen',
      'David Kim',
      'Ashley Brown',
      'Michael Davis',
    ]
  : [];

// --- Storage helpers ---
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Status badge helper ---
function StatusBadge({ status }: { status: Meeting['status'] }) {
  const config = {
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
  };
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

// --- Date formatting ---
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// =================================================================
// MAIN PAGE COMPONENT
// =================================================================
export default function MeetingsPage() {
  // --- Core state ---
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agendaItems, setAgendaItems] = useState<MeetingAgendaItem[]>([]);
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [attendance, setAttendance] = useState<MeetingAttendance[]>([]);
  const [mounted, setMounted] = useState(false);

  // --- UI state ---
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCarryForwardDialog, setShowCarryForwardDialog] = useState(false);

  // --- Create meeting form state ---
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTemplateIndex, setNewTemplateIndex] = useState(0);

  // --- Action item form state ---
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDue, setNewActionDue] = useState('');

  // --- Carry forward state ---
  const [carryForwardItems, setCarryForwardItems] = useState<string[]>([]);
  const [pendingMeetingId, setPendingMeetingId] = useState<string | null>(null);

  // --- Load from localStorage on mount ---
  useEffect(() => {
    setMeetings(loadFromStorage<Meeting[]>(STORAGE_KEYS.meetings, []));
    setAgendaItems(loadFromStorage<MeetingAgendaItem[]>(STORAGE_KEYS.agenda, []));
    setActionItems(loadFromStorage<MeetingActionItem[]>(STORAGE_KEYS.actions, []));
    setAttendance(loadFromStorage<MeetingAttendance[]>(STORAGE_KEYS.attendance, []));
    setMounted(true);
  }, []);

  // --- Persist helpers ---
  const persistMeetings = useCallback((data: Meeting[]) => {
    setMeetings(data);
    saveToStorage(STORAGE_KEYS.meetings, data);
  }, []);

  const persistAgenda = useCallback((data: MeetingAgendaItem[]) => {
    setAgendaItems(data);
    saveToStorage(STORAGE_KEYS.agenda, data);
  }, []);

  const persistActions = useCallback((data: MeetingActionItem[]) => {
    setActionItems(data);
    saveToStorage(STORAGE_KEYS.actions, data);
  }, []);

  const persistAttendance = useCallback((data: MeetingAttendance[]) => {
    setAttendance(data);
    saveToStorage(STORAGE_KEYS.attendance, data);
  }, []);

  // --- Derived data ---
  const activeMeeting = meetings.find((m) => m.id === activeMeetingId) ?? null;
  const meetingAgenda = agendaItems
    .filter((a) => a.meeting_id === activeMeetingId)
    .sort((a, b) => a.order_index - b.order_index);
  const meetingActions = actionItems.filter((a) => a.meeting_id === activeMeetingId);
  const meetingAttendance = attendance.filter((a) => a.meeting_id === activeMeetingId);

  // Get all uncompleted action items from previous meetings (for carry-forward)
  const uncompletedPriorActions = actionItems.filter(
    (a) => a.status !== 'completed' && a.meeting_id !== activeMeetingId
  );

  // Count action items per meeting
  function getActionCount(meetingId: string): number {
    return actionItems.filter((a) => a.meeting_id === meetingId).length;
  }

  function getOpenActionCount(meetingId: string): number {
    return actionItems.filter((a) => a.meeting_id === meetingId && a.status !== 'completed').length;
  }

  // --- Sort meetings: upcoming first (by date desc for completed, asc for upcoming) ---
  const sortedMeetings = [...meetings].sort((a, b) => {
    // In-progress first, then scheduled, then completed
    const statusOrder = { in_progress: 0, scheduled: 1, completed: 2 };
    const diff = statusOrder[a.status] - statusOrder[b.status];
    if (diff !== 0) return diff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // =================================================================
  // CREATE MEETING
  // =================================================================
  function handleOpenCreate() {
    const today = new Date().toISOString().split('T')[0];
    setNewTitle(DEFAULT_TEMPLATES[0].name);
    setNewDate(today);
    setNewTemplateIndex(0);
    setShowCreateDialog(true);
  }

  function handleTemplateChange(index: number) {
    setNewTemplateIndex(index);
    setNewTitle(DEFAULT_TEMPLATES[index].name);
  }

  function handleCreateMeeting() {
    if (!newTitle.trim() || !newDate) return;

    const meetingId = generateMeetingId();
    const template = DEFAULT_TEMPLATES[newTemplateIndex];

    const meeting: Meeting = {
      id: meetingId,
      title: newTitle.trim(),
      date: newDate,
      status: 'scheduled',
      template_id: template.name,
      created_at: new Date().toISOString(),
    };

    // Create agenda items from template
    const newAgendaItems: MeetingAgendaItem[] = template.agenda_items.map((title, i) => ({
      id: generateAgendaItemId(),
      meeting_id: meetingId,
      order_index: i,
      title,
      notes: '',
      completed: false,
      created_at: new Date().toISOString(),
    }));

    // Create attendance records
    const newAttendance: MeetingAttendance[] = STAFF_LIST.map((name) => ({
      id: generateAttendanceId(),
      meeting_id: meetingId,
      employee_id: name.toLowerCase().replace(/\s+/g, '_'),
      employee_name: name,
      present: false,
    }));

    persistMeetings([...meetings, meeting]);
    persistAgenda([...agendaItems, ...newAgendaItems]);
    persistAttendance([...attendance, ...newAttendance]);

    setShowCreateDialog(false);

    // Check for uncompleted action items to carry forward
    const uncompleted = actionItems.filter((a) => a.status !== 'completed');
    if (uncompleted.length > 0) {
      setPendingMeetingId(meetingId);
      setCarryForwardItems([]);
      setShowCarryForwardDialog(true);
    } else {
      setActiveMeetingId(meetingId);
    }
  }

  function handleCarryForward() {
    if (!pendingMeetingId) return;

    const carried: MeetingActionItem[] = carryForwardItems.map((originalId) => {
      const original = actionItems.find((a) => a.id === originalId)!;
      return {
        id: generateActionItemId(),
        meeting_id: pendingMeetingId,
        description: original.description,
        assigned_to: original.assigned_to,
        assigned_to_name: original.assigned_to_name,
        due_date: original.due_date,
        status: 'open' as const,
        carried_forward_from: original.meeting_id,
        created_at: new Date().toISOString(),
      };
    });

    if (carried.length > 0) {
      persistActions([...actionItems, ...carried]);
    }

    setShowCarryForwardDialog(false);
    setActiveMeetingId(pendingMeetingId);
    setPendingMeetingId(null);
  }

  function toggleCarryForwardItem(itemId: string) {
    setCarryForwardItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }

  // =================================================================
  // MEETING STATUS
  // =================================================================
  function startMeeting() {
    if (!activeMeetingId) return;
    const updated = meetings.map((m) =>
      m.id === activeMeetingId
        ? { ...m, status: 'in_progress' as const, start_time: new Date().toISOString() }
        : m
    );
    persistMeetings(updated);
  }

  function endMeeting() {
    if (!activeMeetingId) return;
    const updated = meetings.map((m) =>
      m.id === activeMeetingId
        ? { ...m, status: 'completed' as const, end_time: new Date().toISOString() }
        : m
    );
    persistMeetings(updated);
  }

  // =================================================================
  // AGENDA ITEMS
  // =================================================================
  function moveAgendaItem(itemId: string, direction: 'up' | 'down') {
    const items = [...meetingAgenda];
    const idx = items.findIndex((a) => a.id === itemId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    // Swap order_index values
    const tempOrder = items[idx].order_index;
    items[idx] = { ...items[idx], order_index: items[swapIdx].order_index };
    items[swapIdx] = { ...items[swapIdx], order_index: tempOrder };

    const otherAgenda = agendaItems.filter((a) => a.meeting_id !== activeMeetingId);
    persistAgenda([...otherAgenda, ...items]);
  }

  function updateAgendaNotes(itemId: string, notes: string) {
    const updated = agendaItems.map((a) => (a.id === itemId ? { ...a, notes } : a));
    persistAgenda(updated);
  }

  function toggleAgendaComplete(itemId: string) {
    const updated = agendaItems.map((a) =>
      a.id === itemId ? { ...a, completed: !a.completed } : a
    );
    persistAgenda(updated);
  }

  // =================================================================
  // ATTENDANCE
  // =================================================================
  function toggleAttendance(attendanceId: string) {
    const updated = attendance.map((a) =>
      a.id === attendanceId ? { ...a, present: !a.present } : a
    );
    persistAttendance(updated);
  }

  // =================================================================
  // ACTION ITEMS
  // =================================================================
  function addActionItem() {
    if (!newActionDesc.trim() || !activeMeetingId) return;

    const item: MeetingActionItem = {
      id: generateActionItemId(),
      meeting_id: activeMeetingId,
      description: newActionDesc.trim(),
      assigned_to: newActionAssignee || undefined,
      assigned_to_name: newActionAssignee || undefined,
      due_date: newActionDue || undefined,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    persistActions([...actionItems, item]);
    setNewActionDesc('');
    setNewActionAssignee('');
    setNewActionDue('');
  }

  function toggleActionComplete(itemId: string) {
    const updated = actionItems.map((a) => {
      if (a.id !== itemId) return a;
      const newStatus = a.status === 'completed' ? 'open' : 'completed';
      return {
        ...a,
        status: newStatus as MeetingActionItem['status'],
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
      };
    });
    persistActions(updated);
  }

  function deleteActionItem(itemId: string) {
    persistActions(actionItems.filter((a) => a.id !== itemId));
  }

  function deleteMeeting(meetingId: string) {
    persistMeetings(meetings.filter((m) => m.id !== meetingId));
    persistAgenda(agendaItems.filter((a) => a.meeting_id !== meetingId));
    persistActions(actionItems.filter((a) => a.meeting_id !== meetingId));
    persistAttendance(attendance.filter((a) => a.meeting_id !== meetingId));
    if (activeMeetingId === meetingId) setActiveMeetingId(null);
  }

  // =================================================================
  // RENDER: Loading
  // =================================================================
  if (!mounted) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading meetings...</div>
        </div>
      </>
    );
  }

  // =================================================================
  // RENDER: Active Meeting Detail View
  // =================================================================
  if (activeMeeting) {
    const presentCount = meetingAttendance.filter((a) => a.present).length;
    const totalActions = meetingActions.length;
    const completedActions = meetingActions.filter((a) => a.status === 'completed').length;

    return (
      <>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveMeetingId(null)}
                className="mt-0.5"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{activeMeeting.title}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(activeMeeting.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={activeMeeting.status} />
              {activeMeeting.status === 'scheduled' && (
                <Button onClick={startMeeting} className="bg-christina-red hover:bg-christina-red/90 text-white min-h-[44px]">
                  <Play className="h-4 w-4 mr-2" />
                  Start Meeting
                </Button>
              )}
              {activeMeeting.status === 'in_progress' && (
                <Button onClick={endMeeting} variant="outline" className="border-christina-red text-christina-red hover:bg-christina-red/10 min-h-[44px]">
                  <Square className="h-4 w-4 mr-2" />
                  End Meeting
                </Button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-christina-red/10">
                  <Users className="h-5 w-5 text-christina-red" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{presentCount}/{STAFF_LIST.length}</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingAgenda.filter((a) => a.completed).length}/{meetingAgenda.length}</p>
                  <p className="text-sm text-muted-foreground">Agenda Items</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedActions}/{totalActions}</p>
                  <p className="text-sm text-muted-foreground">Action Items</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Agenda + Action Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Agenda Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-christina-red" />
                    Agenda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meetingAgenda.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        item.completed ? 'bg-muted/50 border-muted' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleAgendaComplete(item.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-christina-red transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={idx === 0}
                                onClick={() => moveAgendaItem(item.id, 'up')}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={idx === meetingAgenda.length - 1}
                                onClick={() => moveAgendaItem(item.id, 'down')}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            placeholder="Add notes for this item..."
                            value={item.notes}
                            onChange={(e) => updateAgendaNotes(item.id, e.target.value)}
                            className="mt-2 min-h-[60px] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-christina-red" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add new action item */}
                  <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                    <Input
                      placeholder="Describe the action item..."
                      value={newActionDesc}
                      onChange={(e) => setNewActionDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addActionItem();
                        }
                      }}
                    />
                    <div className="flex gap-3 items-end flex-wrap">
                      <div className="flex-1 min-w-[160px]">
                        <label className="text-xs text-muted-foreground mb-1 block">Assign to</label>
                        <select
                          value={newActionAssignee}
                          onChange={(e) => setNewActionAssignee(e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Unassigned</option>
                          {STAFF_LIST.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="min-w-[150px]">
                        <label className="text-xs text-muted-foreground mb-1 block">Due date</label>
                        <Input
                          type="date"
                          value={newActionDue}
                          onChange={(e) => setNewActionDue(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={addActionItem}
                        disabled={!newActionDesc.trim()}
                        className="bg-christina-red hover:bg-christina-red/90 text-white min-h-[44px]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Action item list */}
                  {meetingActions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No action items yet. Add one above.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {meetingActions.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            item.status === 'completed'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-border'
                          }`}
                        >
                          <button
                            onClick={() => toggleActionComplete(item.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-christina-red transition-colors" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {item.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {item.assigned_to_name && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {item.assigned_to_name}
                                </span>
                              )}
                              {item.due_date && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDateShort(item.due_date)}
                                </span>
                              )}
                              {item.carried_forward_from && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                  <ArrowRightFromLine className="h-3 w-3 mr-1" />
                                  Carried Forward
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500 flex-shrink-0"
                            onClick={() => deleteActionItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Attendance */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5 text-christina-red" />
                    Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {meetingAttendance.map((record) => (
                      <label
                        key={record.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          record.present
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-white border border-border hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={record.present}
                          onCheckedChange={() => toggleAttendance(record.id)}
                        />
                        <span className={`text-sm ${record.present ? 'font-medium' : 'text-muted-foreground'}`}>
                          {record.employee_name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                    {presentCount} of {STAFF_LIST.length} present
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Meeting Info</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {activeMeeting.template_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <span className="font-medium">{activeMeeting.template_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={activeMeeting.status} />
                  </div>
                  {activeMeeting.start_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started</span>
                      <span>{new Date(activeMeeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {activeMeeting.end_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ended</span>
                      <span>{new Date(activeMeeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Delete this meeting and all its data? This cannot be undone.')) {
                          deleteMeeting(activeMeeting.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Carry Forward Dialog */}
        <Dialog open={showCarryForwardDialog} onOpenChange={setShowCarryForwardDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Carry Forward Action Items</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              The following action items from previous meetings are still open. Select any you want to carry forward to this meeting.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 my-2">
              {uncompletedPriorActions.map((item) => {
                const sourceMeeting = meetings.find((m) => m.id === item.meeting_id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      carryForwardItems.includes(item.id)
                        ? 'bg-christina-red/5 border-christina-red/30'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={carryForwardItems.includes(item.id)}
                      onCheckedChange={() => toggleCarryForwardItem(item.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {item.assigned_to_name && <span>{item.assigned_to_name}</span>}
                        {sourceMeeting && <span>from {sourceMeeting.title}</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCarryForwardDialog(false);
                setActiveMeetingId(pendingMeetingId);
                setPendingMeetingId(null);
              }}>
                Skip
              </Button>
              <Button
                onClick={handleCarryForward}
                disabled={carryForwardItems.length === 0}
                className="bg-christina-red hover:bg-christina-red/90 text-white min-h-[44px]"
              >
                Carry Forward ({carryForwardItems.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // =================================================================
  // RENDER: Meeting List View (default)
  // =================================================================
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Presentation className="h-6 w-6 text-christina-red" />
              Meetings
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan, run, and track staff meetings with agendas and action items.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-christina-red hover:bg-christina-red/90 text-white min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{meetings.length}</p>
              <p className="text-sm text-muted-foreground">Total Meetings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-600">
                {meetings.filter((m) => m.status === 'in_progress').length}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">
                {meetings.filter((m) => m.status === 'scheduled').length}
              </p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-christina-red">
                {actionItems.filter((a) => a.status !== 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Open Action Items</p>
            </CardContent>
          </Card>
        </div>

        {/* Meeting list */}
        {sortedMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Presentation className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No meetings yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first meeting to get started with agendas, attendance tracking, and action items.
              </p>
              <Button onClick={handleOpenCreate} className="bg-christina-red hover:bg-christina-red/90 text-white min-h-[44px]">
                <Plus className="h-4 w-4 mr-2" />
                Create First Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMeetings.map((meeting) => {
              const actionCount = getActionCount(meeting.id);
              const openCount = getOpenActionCount(meeting.id);
              const attendees = attendance.filter(
                (a) => a.meeting_id === meeting.id && a.present
              ).length;

              return (
                <Card
                  key={meeting.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-border hover:border-christina-red/30"
                  onClick={() => setActiveMeetingId(meeting.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold truncate">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(meeting.date)}
                        </p>
                      </div>
                      <StatusBadge status={meeting.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                      {meeting.status !== 'scheduled' && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {attendees} attended
                        </span>
                      )}
                      {actionCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ListChecks className="h-3.5 w-3.5" />
                          {openCount > 0 ? `${openCount} open` : `${actionCount} done`}
                        </span>
                      )}
                      {meeting.template_id && (
                        <span className="ml-auto text-xs truncate max-w-[120px]">{meeting.template_id}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-base font-medium mb-1.5 block">Template</label>
              <select
                value={newTemplateIndex}
                onChange={(e) => handleTemplateChange(Number(e.target.value))}
                className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 text-sm"
              >
                {DEFAULT_TEMPLATES.map((t, i) => (
                  <option key={t.name} value={i}>
                    {t.name} ({t.default_duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Meeting Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Meeting title"
              />
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Date</label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Agenda Preview</label>
              <div className="border rounded-lg p-3 bg-muted/30 space-y-1.5">
                {DEFAULT_TEMPLATES[newTemplateIndex].agenda_items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="min-h-[44px]">
              Cancel
            </Button>
            <Button
              onClick={handleCreateMeeting}
              disabled={!newTitle.trim() || !newDate}
              className="bg-christina-red hover:bg-christina-red/90 text-white min-h-[44px]"
            >
              Create Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Carry Forward Dialog (when triggered from list view context) */}
      <Dialog open={showCarryForwardDialog} onOpenChange={setShowCarryForwardDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Carry Forward Action Items</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The following action items from previous meetings are still open. Select any you want to carry forward to this meeting.
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2 my-2">
            {uncompletedPriorActions.map((item) => {
              const sourceMeeting = meetings.find((m) => m.id === item.meeting_id);
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    carryForwardItems.includes(item.id)
                      ? 'bg-christina-red/5 border-christina-red/30'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={carryForwardItems.includes(item.id)}
                    onCheckedChange={() => toggleCarryForwardItem(item.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {item.assigned_to_name && <span>{item.assigned_to_name}</span>}
                      {sourceMeeting && <span>from {sourceMeeting.title}</span>}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCarryForwardDialog(false);
              setActiveMeetingId(pendingMeetingId);
              setPendingMeetingId(null);
            }}>
              Skip
            </Button>
            <Button
              onClick={handleCarryForward}
              disabled={carryForwardItems.length === 0}
              className="bg-christina-red hover:bg-christina-red/90 text-white"
            >
              Carry Forward ({carryForwardItems.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
