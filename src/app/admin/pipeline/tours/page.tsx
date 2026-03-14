'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ClipboardCheck, Mail, Star, UserCheck } from 'lucide-react';
import { TourScheduler } from '@/components/admin/TourScheduler';
import { TourChecklist } from '@/components/admin/TourChecklist';
import { TourFollowUp } from '@/components/admin/TourFollowUp';
import { Tour, getTourStats, TourStats } from '@/lib/tour-storage';

export default function ToursPage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [stats, setStats] = useState<TourStats | null>(null);

  useEffect(() => {
    getTourStats().then(setStats);
  }, []);

  function handleTourSelect(tour: Tour) {
    setActiveTour(tour);
    setActiveTab('checklist');
  }

  function handleTourComplete(tour: Tour) {
    setActiveTour(tour);
    getTourStats().then(setStats);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Tour Management</h1>
            <p className="text-muted-foreground text-sm">
              Schedule tours, run checklists, and track follow-ups
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold text-christina-blue">{stats.scheduled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-christina-green">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-christina-red">{stats.conversion_rate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-christina-yellow">
                    {stats.avg_feedback_score > 0 ? stats.avg_feedback_score : '--'}
                  </p>
                </div>
                <Star className="h-5 w-5 text-christina-yellow" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Follow-up alert badge */}
      {stats && stats.follow_up_pending > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
          <Mail className="h-4 w-4 text-orange-600" />
          <p className="text-sm text-orange-800">
            <span className="font-semibold">{stats.follow_up_pending}</span> completed{' '}
            {stats.follow_up_pending === 1 ? 'tour needs' : 'tours need'} a follow-up email.
          </p>
          <button
            className="ml-auto text-sm font-medium text-orange-700 hover:underline"
            onClick={() => setActiveTab('followup')}
          >
            Review
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Tour Calendar
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Tour Checklist
            {activeTour && (
              <Badge className="ml-1 bg-christina-red text-white text-xs px-1.5 py-0">
                Active
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="followup" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Follow-up Tracking
            {stats && stats.follow_up_pending > 0 && (
              <Badge className="ml-1 bg-christina-coral text-white text-xs px-1.5 py-0">
                {stats.follow_up_pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="pt-4">
          <TourScheduler onTourSelect={handleTourSelect} />
        </TabsContent>

        <TabsContent value="checklist" className="pt-4">
          {activeTour ? (
            <TourChecklist tour={activeTour} onComplete={handleTourComplete} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No active tour selected.</p>
                <p className="text-sm text-muted-foreground">
                  Go to <button
                    className="text-christina-red hover:underline font-medium"
                    onClick={() => setActiveTab('calendar')}
                  >Tour Calendar</button> and click a scheduled tour to begin.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followup" className="pt-4">
          <TourFollowUp />
        </TabsContent>
      </Tabs>
    </div>
  );
}
