'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getMeetings,
  createMeeting,
  startMeeting,
  STAFF_NAMES,
  type Meeting,
  type AgendaItem,
  type AgendaItemPurpose,
} from '@/lib/meeting-storage';

interface MeetingPlannerProps {
  onMeetingStarted?: (meeting: Meeting) => void;
}

const PURPOSE_CONFIG: Record<AgendaItemPurpose, { label: string; color: string }> = {
  inform: { label: 'Inform', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  discuss: { label: 'Discuss', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  decide: { label: 'Decide', color: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_CONFIG = {
  planned: { label: 'Planned', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-christina-blue text-white' },
  completed: { label: 'Completed', color: 'bg-christina-green text-white' },
};

function generateAgendaId() {
  return `ag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function blankAgendaItem(): AgendaItem {
  return {
    id: generateAgendaId(),
    topic: '',
    duration_minutes: 10,
    presenter: '',
    purpose: 'discuss',
    completed: false,
  };
}

export function MeetingPlanner({ onMeetingStarted }: MeetingPlannerProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([blankAgendaItem()]);

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  const totalAgendaMinutes = agenda.reduce((s, a) => s + a.duration_minutes, 0);
  const slotMinutes = (() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  })();
  const timeOverrun = totalAgendaMinutes > slotMinutes;

  function toggleAttendee(name: string) {
    setSelectedAttendees(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  }

  function updateAgendaItem(idx: number, updates: Partial<AgendaItem>) {
    setAgenda(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  }

  function removeAgendaItem(idx: number) {
    setAgenda(prev => prev.filter((_, i) => i !== idx));
  }

  function addAgendaItem() {
    setAgenda(prev => [...prev, blankAgendaItem()]);
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...agenda];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setAgenda(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMeeting({
      title: title.trim(),
      date,
      start_time: startTime,
      end_time: endTime,
      attendees: selectedAttendees,
      agenda: agenda.filter(a => a.topic.trim()),
      notes_html: '',
    });
    setMeetings(getMeetings());
    setShowForm(false);
    setTitle('');
    setAgenda([blankAgendaItem()]);
    setSelectedAttendees([]);
  }

  function handleStart(meeting: Meeting) {
    const updated = startMeeting(meeting.id);
    setMeetings(getMeetings());
    if (updated && onMeetingStarted) onMeetingStarted(updated);
  }

  const upcomingMeetings = meetings.filter(m => m.status !== 'completed');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Meeting Planner</h2>
          <p className="text-sm text-muted-foreground">Schedule meetings and build structured agendas</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-christina-red hover:bg-christina-red/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          New Meeting
        </Button>
      </div>

      {/* Create meeting form */}
      {showForm && (
        <Card className="border-christina-red/30">
          <CardHeader>
            <CardTitle className="text-base">Schedule New Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  placeholder="e.g., Weekly Staff Check-In"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Date and times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="meeting-date">Date</Label>
                  <Input
                    id="meeting-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <Label>Attendees</Label>
                <div className="flex flex-wrap gap-2">
                  {STAFF_NAMES.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleAttendee(name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selectedAttendees.includes(name)
                          ? 'bg-christina-blue text-white border-christina-blue'
                          : 'bg-muted text-muted-foreground border-muted hover:border-christina-blue hover:text-christina-blue'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {selectedAttendees.length > 0 && (
                  <p className="text-xs text-muted-foreground">{selectedAttendees.length} attendee{selectedAttendees.length !== 1 ? 's' : ''} selected</p>
                )}
              </div>

              {/* Agenda builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Agenda Items</Label>
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${timeOverrun ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {timeOverrun && <AlertTriangle className="h-3.5 w-3.5" />}
                    <Clock className="h-3.5 w-3.5" />
                    Total: {totalAgendaMinutes} min
                    {slotMinutes > 0 && ` / ${slotMinutes} min slot`}
                    {timeOverrun && ` — ${totalAgendaMinutes - slotMinutes} min over`}
                  </div>
                </div>

                <div className="space-y-2">
                  {agenda.map((item, idx) => (
                    <div key={item.id} className="flex gap-2 items-start p-3 bg-muted/40 rounded-lg">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5 pt-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(idx, -1)}
                          disabled={idx === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 1)}
                          disabled={idx === agenda.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Topic */}
                        <div className="sm:col-span-4">
                          <Input
                            placeholder="Topic"
                            value={item.topic}
                            onChange={e => updateAgendaItem(idx, { topic: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        {/* Duration */}
                        <div className="sm:col-span-2">
                          <Input
                            type="number"
                            min={1}
                            max={120}
                            placeholder="Min"
                            value={item.duration_minutes}
                            onChange={e => updateAgendaItem(idx, { duration_minutes: parseInt(e.target.value) || 5 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        {/* Presenter */}
                        <div className="sm:col-span-3">
                          <Select value={item.presenter} onValueChange={v => updateAgendaItem(idx, { presenter: v })}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Presenter" />
                            </SelectTrigger>
                            <SelectContent>
                              {STAFF_NAMES.map(n => (
                                <SelectItem key={n} value={n}>{n.split(' ')[0]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Purpose */}
                        <div className="sm:col-span-3">
                          <Select
                            value={item.purpose}
                            onValueChange={v => updateAgendaItem(idx, { purpose: v as AgendaItemPurpose })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inform">Inform</SelectItem>
                              <SelectItem value="discuss">Discuss</SelectItem>
                              <SelectItem value="decide">Decide</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAgendaItem(idx)}
                        className="text-muted-foreground hover:text-red-500 flex-shrink-0 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button type="button" variant="outline" size="sm" onClick={addAgendaItem} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Agenda Item
                </Button>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" className="bg-christina-red hover:bg-christina-red/90">
                  Schedule Meeting
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming meetings */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Upcoming &amp; Active ({upcomingMeetings.length})
        </h3>

        {upcomingMeetings.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No upcoming meetings. Schedule one above.</p>
            </CardContent>
          </Card>
        )}

        {upcomingMeetings.map(meeting => {
          const totalMin = meeting.agenda.reduce((s, a) => s + a.duration_minutes, 0);
          const isExpanded = expandedMeeting === meeting.id;
          const statusCfg = STATUS_CONFIG[meeting.status];

          return (
            <Card key={meeting.id} className={meeting.status === 'in_progress' ? 'border-christina-blue/50 bg-christina-blue/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-christina-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold">{meeting.title}</span>
                      <Badge className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {meeting.start_time} – {meeting.end_time} ({totalMin} min)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Agenda preview */}
                    {isExpanded && (
                      <div className="mt-3 space-y-1.5">
                        {meeting.agenda.map((item, i) => {
                          const pCfg = PURPOSE_CONFIG[item.purpose];
                          return (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}.</span>
                              <span className="flex-1 truncate">{item.topic}</span>
                              <span className="text-muted-foreground text-xs flex-shrink-0">{item.duration_minutes}m</span>
                              <Badge variant="outline" className={`text-xs py-0 ${pCfg.color}`}>{pCfg.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {meeting.status === 'planned' && (
                      <Button size="sm" onClick={() => handleStart(meeting)} className="gap-1.5 bg-christina-green hover:bg-christina-green/90 text-white">
                        <Play className="h-3.5 w-3.5" />
                        Start
                      </Button>
                    )}
                    {meeting.status === 'in_progress' && (
                      <Button size="sm" onClick={() => onMeetingStarted?.(meeting)} className="gap-1.5 bg-christina-blue hover:bg-christina-blue/90 text-white">
                        <Play className="h-3.5 w-3.5" />
                        Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedMeeting(isExpanded ? null : meeting.id)}
                      className="gap-1 text-xs"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {isExpanded ? 'Hide' : 'Agenda'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
