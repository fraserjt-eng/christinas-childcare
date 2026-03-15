'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  CheckCircle2,
  SkipForward,
  ChevronRight,
  Square,
  Plus,
  FileText,
  Gavel,
  ListTodo,
  Calendar,
  Users,
} from 'lucide-react';
import {
  getMeetingById,
  updateMeeting,
  completeMeeting,
  addDecision,
  addActionItem,
  STAFF_NAMES,
  type Meeting,
  type AgendaItemPurpose,
} from '@/lib/meeting-storage';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface MeetingTimerProps {
  meetingId: string;
  onMeetingEnded?: (meeting: Meeting) => void;
}

const PURPOSE_CONFIG: Record<AgendaItemPurpose, { label: string; color: string }> = {
  inform: { label: 'Inform', color: 'bg-blue-100 text-blue-700' },
  discuss: { label: 'Discuss', color: 'bg-yellow-100 text-yellow-700' },
  decide: { label: 'Decide', color: 'bg-red-100 text-red-700' },
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MeetingTimer({ meetingId, onMeetingEnded }: MeetingTimerProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [itemElapsedSeconds, setItemElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [decisionOwner, setDecisionOwner] = useState('');
  const [decisionDue, setDecisionDue] = useState('');
  const [actionText, setActionText] = useState('');
  const [actionOwner, setActionOwner] = useState('');
  const [actionDue, setActionDue] = useState('');
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemStartRef = useRef<number>(Date.now());
  const itemElapsedRef = useRef<number>(0);

  // Load meeting on mount
  useEffect(() => {
    const m = getMeetingById(meetingId);
    if (!m) return;
    setMeeting(m);
    setNotes(m.notes_html ?? '');

    // Calculate total elapsed from started_at
    if (m.started_at) {
      const start = new Date(m.started_at).getTime();
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }

    // Find first incomplete agenda item
    const firstIncomplete = m.agenda.findIndex(a => !a.completed);
    setCurrentItemIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
    itemStartRef.current = Date.now();
  }, [meetingId]);

  // Overall timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Per-item timer
  useEffect(() => {
    itemStartRef.current = Date.now();
    itemElapsedRef.current = 0;
    setItemElapsedSeconds(0);
    if (itemTimerRef.current) clearInterval(itemTimerRef.current);
    itemTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - itemStartRef.current) / 1000);
      itemElapsedRef.current = elapsed;
      setItemElapsedSeconds(elapsed);
    }, 1000);
    return () => { if (itemTimerRef.current) clearInterval(itemTimerRef.current); };
  }, [currentItemIdx]);

  const refreshMeeting = useCallback(() => {
    const m = getMeetingById(meetingId);
    if (m) setMeeting(m);
  }, [meetingId]);

  function advanceItem(skip = false) {
    if (!meeting) return;
    const updatedAgenda = meeting.agenda.map((item, idx) => {
      if (idx === currentItemIdx) {
        return {
          ...item,
          completed: true,
          actual_minutes: skip ? item.duration_minutes : Math.round(itemElapsedRef.current / 60),
        };
      }
      return item;
    });
    const updated = updateMeeting(meetingId, { agenda: updatedAgenda });
    if (updated) setMeeting(updated);
    const nextIdx = updatedAgenda.findIndex((item, idx) => idx > currentItemIdx && !item.completed);
    if (nextIdx !== -1) {
      setCurrentItemIdx(nextIdx);
    }
  }

  function saveNotes(html: string) {
    setNotes(html);
    updateMeeting(meetingId, { notes_html: html });
  }

  function handleAddDecision() {
    if (!decisionText.trim() || !decisionOwner) return;
    addDecision(meetingId, {
      text: decisionText.trim(),
      owner: decisionOwner,
      due_date: decisionDue || undefined,
    });
    refreshMeeting();
    setDecisionText('');
    setDecisionOwner('');
    setDecisionDue('');
    setShowDecisionForm(false);
  }

  function handleAddAction() {
    if (!actionText.trim() || !actionOwner || !actionDue) return;
    addActionItem(meetingId, {
      task: actionText.trim(),
      owner: actionOwner,
      due_date: actionDue,
    });
    refreshMeeting();
    setActionText('');
    setActionOwner('');
    setActionDue('');
    setShowActionForm(false);
  }

  function handleEndMeeting() {
    if (!endConfirm) {
      setEndConfirm(true);
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (itemTimerRef.current) clearInterval(itemTimerRef.current);
    // Mark all remaining items complete
    if (meeting) {
      const updatedAgenda = meeting.agenda.map(item => ({
        ...item,
        completed: true,
        actual_minutes: item.actual_minutes ?? item.duration_minutes,
      }));
      updateMeeting(meetingId, { agenda: updatedAgenda, notes_html: notes });
    }
    const ended = completeMeeting(meetingId);
    if (ended && onMeetingEnded) onMeetingEnded(ended);
  }

  if (!meeting) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Meeting not found.</p>
        </CardContent>
      </Card>
    );
  }

  const currentItem = meeting.agenda[currentItemIdx];
  const plannedTotalMinutes = meeting.agenda.reduce((s, a) => s + a.duration_minutes, 0);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const overallPct = plannedTotalMinutes > 0 ? Math.min(100, (elapsedMinutes / plannedTotalMinutes) * 100) : 0;

  const itemPlannedSeconds = currentItem ? currentItem.duration_minutes * 60 : 0;
  const itemPct = itemPlannedSeconds > 0 ? Math.min(100, (itemElapsedSeconds / itemPlannedSeconds) * 100) : 0;
  const itemOverrun = itemElapsedSeconds > itemPlannedSeconds;
  const itemNearLimit = itemElapsedSeconds > itemPlannedSeconds * 0.75;

  const itemTimerColor = itemOverrun
    ? 'text-red-600'
    : itemNearLimit
    ? 'text-yellow-600'
    : 'text-christina-green';

  const progressBarColor = itemOverrun
    ? 'bg-red-500'
    : itemNearLimit
    ? 'bg-yellow-500'
    : 'bg-christina-green';

  const completedCount = meeting.agenda.filter(a => a.completed).length;

  return (
    <div className="space-y-5">
      {/* Meeting header */}
      <Card className="border-christina-blue/40 bg-christina-blue/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-bold text-lg">{meeting.title}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {meeting.attendees.join(', ')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-christina-blue">
                {formatElapsed(elapsedSeconds)}
              </div>
              <div className="text-xs text-muted-foreground">
                of {plannedTotalMinutes} min planned
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={overallPct} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{completedCount} of {meeting.agenda.length} items done</span>
              <span>{Math.round(overallPct)}% of time used</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: current item + stepper */}
        <div className="lg:col-span-1 space-y-4">
          {/* Current agenda item */}
          {currentItem && (
            <Card className="border-2 border-christina-blue">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Current Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-base">{currentItem.topic}</p>
                  {currentItem.presenter && (
                    <p className="text-sm text-muted-foreground">Presenter: {currentItem.presenter}</p>
                  )}
                  <Badge className={`mt-1 text-xs ${PURPOSE_CONFIG[currentItem.purpose].color}`}>
                    {PURPOSE_CONFIG[currentItem.purpose].label}
                  </Badge>
                </div>

                {/* Item timer */}
                <div>
                  <div className={`text-3xl font-mono font-bold text-center ${itemTimerColor}`}>
                    {formatElapsed(itemElapsedSeconds)}
                  </div>
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    of {currentItem.duration_minutes} min
                  </div>
                  <div className={`h-2 rounded-full ${progressBarColor} transition-all`} style={{ width: `${itemPct}%` }} />
                  <div className="h-2 rounded-full bg-muted -mt-2" />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => advanceItem(false)}
                    className="flex-1 gap-1.5 bg-christina-green hover:bg-christina-green/90 text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => advanceItem(true)}
                    className="gap-1.5"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agenda stepper */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Agenda Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {meeting.agenda.map((item, idx) => {
                  const isCurrent = idx === currentItemIdx && !item.completed;
                  const isDone = item.completed;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                        isCurrent ? 'bg-christina-blue/10 border border-christina-blue/30' :
                        isDone ? 'opacity-60' : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isDone ? 'bg-christina-green text-white' :
                        isCurrent ? 'bg-christina-blue text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isDone ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                      </div>
                      <span className={`flex-1 truncate ${isCurrent ? 'font-semibold' : ''}`}>{item.topic}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {isDone && item.actual_minutes != null ? `${item.actual_minutes}m` : `${item.duration_minutes}m`}
                      </span>
                      {isCurrent && <ChevronRight className="h-3.5 w-3.5 text-christina-blue flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: notes + capture */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-christina-blue" />
                Meeting Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={notes}
                onChange={saveNotes}
                placeholder="Type meeting notes here..."
              />
            </CardContent>
          </Card>

          {/* Decisions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-christina-red" />
                  Decisions ({meeting.decisions.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDecisionForm(!showDecisionForm)}
                  className="gap-1 h-7 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showDecisionForm && (
                <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                  <Input
                    placeholder="We decided..."
                    value={decisionText}
                    onChange={e => setDecisionText(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Select value={decisionOwner} onValueChange={setDecisionOwner}>
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_NAMES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={decisionDue}
                      onChange={e => setDecisionDue(e.target.value)}
                      className="h-8 text-sm flex-1"
                      placeholder="Due date (optional)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddDecision} className="bg-christina-red hover:bg-christina-red/90 text-sm h-7">
                      Save Decision
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowDecisionForm(false)} className="h-7 text-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {meeting.decisions.length === 0 && !showDecisionForm && (
                <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
              )}
              {meeting.decisions.map(d => (
                <div key={d.id} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                  <Gavel className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{d.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Owner: {d.owner}{d.due_date ? ` · Due ${d.due_date}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action items */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-christina-blue" />
                  Action Items ({meeting.action_items.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowActionForm(!showActionForm)}
                  className="gap-1 h-7 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showActionForm && (
                <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                  <Input
                    placeholder="Action item..."
                    value={actionText}
                    onChange={e => setActionText(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Select value={actionOwner} onValueChange={setActionOwner}>
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_NAMES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex-1 space-y-0.5">
                      <Label className="text-xs sr-only">Due Date</Label>
                      <Input
                        type="date"
                        value={actionDue}
                        onChange={e => setActionDue(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddAction} className="bg-christina-blue hover:bg-christina-blue/90 text-sm h-7">
                      Save Action
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowActionForm(false)} className="h-7 text-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {meeting.action_items.length === 0 && !showActionForm && (
                <p className="text-sm text-muted-foreground">No action items yet.</p>
              )}
              {meeting.action_items.map(a => (
                <div key={a.id} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <ListTodo className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.task}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.owner} · Due {a.due_date}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* End meeting */}
          <div className="flex justify-end">
            {endConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">End this meeting?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndMeeting}
                  className="gap-1.5"
                >
                  <Square className="h-3.5 w-3.5" />
                  Yes, End Meeting
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEndConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndMeeting}
                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Square className="h-3.5 w-3.5" />
                End Meeting
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
