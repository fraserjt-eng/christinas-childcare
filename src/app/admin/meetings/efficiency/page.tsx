'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users2, Clock, TrendingUp, ListTodo, Play, CalendarPlus } from 'lucide-react';
import { MeetingPlanner } from '@/components/admin/MeetingPlanner';
import { MeetingTimer } from '@/components/admin/MeetingTimer';
import { MeetingSummary } from '@/components/admin/MeetingSummary';
import { ActionItemTracker } from '@/components/admin/ActionItemTracker';
import { getMeetings, getMeetingStats, type Meeting, type MeetingStats } from '@/lib/meeting-storage';

export default function MeetingEfficiencyPage() {
  const [activeTab, setActiveTab] = useState('plan');
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [stats, setStats] = useState<MeetingStats | null>(null);

  function refresh() {
    const inProgress = getMeetings({ status: 'in_progress' });
    if (inProgress.length > 0) {
      setActiveMeeting(inProgress[0]);
    }
    setStats(getMeetingStats());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleMeetingStarted(meeting: Meeting) {
    setActiveMeeting(meeting);
    setActiveTab('active');
  }

  function handleMeetingEnded() {
    setActiveMeeting(null);
    setStats(getMeetingStats());
    setActiveTab('history');
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users2 className="h-6 w-6 text-christina-red" />
            Meeting Efficiency System
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Plan agendas, run timed meetings, and track every action item to completion
          </p>
        </div>

        {/* Live stats strip */}
        {stats && (
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Avg effectiveness: <strong className="text-foreground">{stats.avg_effectiveness}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ListTodo className="h-4 w-4" />
              <span>Pending actions: <strong className="text-foreground">{stats.pending_action_items}</strong></span>
            </div>
            {stats.overdue_action_items > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {stats.overdue_action_items} overdue
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Active meeting banner */}
      {activeMeeting && activeTab !== 'active' && (
        <Card className="border-christina-blue/50 bg-christina-blue/5 cursor-pointer" onClick={() => setActiveTab('active')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-christina-blue animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Meeting in progress: {activeMeeting.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activeMeeting.agenda.filter(a => a.completed).length} of {activeMeeting.agenda.length} agenda items done
                </p>
              </div>
              <button className="text-xs text-christina-blue font-medium hover:underline flex items-center gap-1">
                <Play className="h-3 w-3" />
                Resume
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="plan" className="gap-1.5">
            <CalendarPlus className="h-4 w-4" />
            Plan Meeting
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5" disabled={!activeMeeting}>
            <Clock className="h-4 w-4" />
            Active Meeting
            {activeMeeting && (
              <span className="ml-1 w-2 h-2 rounded-full bg-christina-blue animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Meeting History
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-1.5">
            <ListTodo className="h-4 w-4" />
            Action Items
            {stats && stats.overdue_action_items > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs py-0 px-1.5 h-4">
                {stats.overdue_action_items}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="mt-5">
          <MeetingPlanner onMeetingStarted={handleMeetingStarted} />
        </TabsContent>

        <TabsContent value="active" className="mt-5">
          {activeMeeting ? (
            <MeetingTimer
              meetingId={activeMeeting.id}
              onMeetingEnded={handleMeetingEnded}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No meeting in progress</p>
                <p className="text-sm mt-1">Start a planned meeting from the Plan Meeting tab.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          <MeetingSummary />
        </TabsContent>

        <TabsContent value="actions" className="mt-5">
          <ActionItemTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
