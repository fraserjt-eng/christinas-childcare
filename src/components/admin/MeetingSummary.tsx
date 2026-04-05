'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Users,
  Gavel,
  ListTodo,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import {
  getMeetings,
  type Meeting,
  type AgendaItemPurpose,
} from '@/lib/meeting-storage';
import { sanitizeHTML } from '@/lib/sanitize';

interface MeetingSummaryProps {
  meetingId?: string;
  onBack?: () => void;
}

const PURPOSE_CONFIG: Record<AgendaItemPurpose, { label: string; color: string }> = {
  inform: { label: 'Inform', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  discuss: { label: 'Discuss', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  decide: { label: 'Decide', color: 'bg-red-100 text-red-700 border-red-200' },
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-christina-green';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-christina-green/10 border-christina-green/30';
  if (score >= 60) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function formatDuration(startIso: string, endIso: string): string {
  const minutes = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function MeetingSummaryCard({ meeting, onBack }: { meeting: Meeting; onBack?: () => void }) {
  const [showNotes, setShowNotes] = useState(false);

  const totalPlanned = meeting.agenda.reduce((s, a) => s + a.duration_minutes, 0);
  const totalActual = meeting.agenda.reduce((s, a) => s + (a.actual_minutes ?? a.duration_minutes), 0);
  const overallDiff = totalActual - totalPlanned;
  const today = new Date().toISOString().split('T')[0];

  const pendingItems = meeting.action_items.filter(a => a.status === 'pending');
  const completedItems = meeting.action_items.filter(a => a.status === 'completed');

  return (
    <div className="space-y-5">
      {/* Back button */}
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to History
        </Button>
      )}

      {/* Header */}
      <Card className="border-christina-green/30 bg-christina-green/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="font-bold text-xl">{meeting.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {meeting.start_time} – {meeting.end_time}
                  {meeting.started_at && meeting.completed_at && (
                    <span className="ml-1">({formatDuration(meeting.started_at, meeting.completed_at)} actual)</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {meeting.attendees.join(', ')}
                </span>
              </div>
            </div>
            {meeting.effectiveness_score != null && (
              <div className={`flex flex-col items-center p-3 rounded-xl border ${scoreBg(meeting.effectiveness_score)}`}>
                <span className={`text-3xl font-bold ${scoreColor(meeting.effectiveness_score)}`}>
                  {meeting.effectiveness_score}%
                </span>
                <span className="text-xs text-muted-foreground font-medium mt-0.5">Effectiveness</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agenda recap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-christina-blue" />
            Agenda Recap
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              Planned: {totalPlanned}m / Actual: {totalActual}m
              {overallDiff !== 0 && (
                <span className={overallDiff > 0 ? ' text-red-500' : ' text-christina-green'}>
                  {' '}({overallDiff > 0 ? '+' : ''}{overallDiff}m)
                </span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meeting.agenda.map((item, idx) => {
              const actual = item.actual_minutes ?? item.duration_minutes;
              const diff = actual - item.duration_minutes;
              const pCfg = PURPOSE_CONFIG[item.purpose];
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    item.completed ? 'bg-christina-green text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{item.topic}</span>
                  {item.presenter && (
                    <span className="text-xs text-muted-foreground hidden sm:block">{item.presenter}</span>
                  )}
                  <Badge variant="outline" className={`text-xs py-0 ${pCfg.color}`}>{pCfg.label}</Badge>
                  <span className="text-xs text-muted-foreground">{item.duration_minutes}m planned</span>
                  <span className={`text-xs font-medium ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-christina-green' : 'text-muted-foreground'}`}>
                    {diff === 0 ? `${actual}m` : diff > 0 ? `+${diff}m over` : `${Math.abs(diff)}m under`}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {meeting.notes_html && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-christina-blue" />
                Notes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)} className="gap-1 h-7 text-xs">
                {showNotes ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showNotes ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </CardHeader>
          {showNotes && (
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(meeting.notes_html) }}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* Decisions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gavel className="h-4 w-4 text-christina-red" />
            Decisions ({meeting.decisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meeting.decisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No decisions recorded.</p>
          ) : (
            <div className="space-y-2">
              {meeting.decisions.map(d => (
                <div key={d.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Gavel className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{d.text}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>Owner: {d.owner}</span>
                      {d.due_date && <span>Due: {d.due_date}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-christina-blue" />
            Action Items ({meeting.action_items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meeting.action_items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No action items recorded.</p>
          ) : (
            <div className="space-y-2">
              {meeting.action_items.map(a => {
                const isOverdue = a.status === 'pending' && a.due_date < today;
                return (
                  <div
                    key={a.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      a.status === 'completed'
                        ? 'bg-green-50 border-green-100'
                        : isOverdue
                        ? 'bg-red-50 border-red-100'
                        : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    {a.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-christina-green flex-shrink-0 mt-0.5" />
                    ) : isOverdue ? (
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ListTodo className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${a.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {a.task}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{a.owner}</span>
                        <span>Due: {a.due_date}</span>
                        {isOverdue && <Badge className="bg-red-100 text-red-700 text-xs py-0">Overdue</Badge>}
                        {a.status === 'completed' && a.completed_at && (
                          <Badge className="bg-green-100 text-green-700 text-xs py-0">
                            Done {new Date(a.completed_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-christina-green" />
                  {completedItems.length} completed
                </span>
                <span className="flex items-center gap-1">
                  <ListTodo className="h-3 w-3 text-blue-500" />
                  {pendingItems.length} pending
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function MeetingSummary({ meetingId }: MeetingSummaryProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(meetingId ?? null);

  useEffect(() => {
    const completed = getMeetings({ status: 'completed' });
    setMeetings(completed.slice().reverse());
  }, []);

  useEffect(() => {
    if (meetingId) setSelectedId(meetingId);
  }, [meetingId]);

  const selected = selectedId ? meetings.find(m => m.id === selectedId) : null;

  if (selected) {
    return (
      <MeetingSummaryCard
        meeting={selected}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Meeting History</h2>
        <p className="text-sm text-muted-foreground">Review completed meetings, notes, and outcomes</p>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No completed meetings yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetings.map(meeting => {
            const totalItems = meeting.action_items.length;
            const doneItems = meeting.action_items.filter(a => a.status === 'completed').length;

            return (
              <Card
                key={meeting.id}
                className="cursor-pointer hover:border-christina-blue/40 transition-colors"
                onClick={() => setSelectedId(meeting.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-christina-green/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-christina-green" />
                      </div>
                      <div>
                        <p className="font-semibold">{meeting.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span>{new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span>{meeting.start_time} – {meeting.end_time}</span>
                          <span>{meeting.attendees.length} attendees</span>
                          {totalItems > 0 && (
                            <span>{doneItems}/{totalItems} actions done</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.effectiveness_score != null && (
                        <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${scoreBg(meeting.effectiveness_score)} ${scoreColor(meeting.effectiveness_score)}`}>
                          {meeting.effectiveness_score}%
                        </div>
                      )}
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
