'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, BarChart3 } from 'lucide-react';
import { ScheduleGrid } from '@/components/scheduling/ScheduleGrid';
import { WeeklyHoursSummary } from '@/components/scheduling/WeeklyHoursSummary';

export default function SchedulingPage() {
  const [currentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1); // Start on Monday
    return start;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Staff Scheduling
        </h1>
        <p className="text-muted-foreground">
          Create and manage employee schedules
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule" className="gap-2">
            <Clock className="h-4 w-4" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Hours Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <ScheduleGrid showHoursSummary={true} />
        </TabsContent>

        <TabsContent value="hours">
          <WeeklyHoursSummary weekStart={currentWeekStart} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
