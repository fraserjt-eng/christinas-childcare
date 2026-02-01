'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, CheckCircle } from 'lucide-react';
import {
  WeeklyHoursSummary as WeeklyHoursSummaryType,
  getEmployeeFullName,
} from '@/types/employee';
import {
  getEmployees,
  getScheduleEntries,
  getTimeEntries,
} from '@/lib/employee-storage';

interface WeeklyHoursSummaryProps {
  weekStart: Date;
}

export function WeeklyHoursSummary({ weekStart }: WeeklyHoursSummaryProps) {
  const [summaries, setSummaries] = useState<WeeklyHoursSummaryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      const employees = await getEmployees();
      const schedules = await getScheduleEntries({
        startDate: startStr,
        endDate: endStr,
      });
      const timeEntries = await getTimeEntries({
        startDate: startStr,
        endDate: endStr,
      });

      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const summaryList: WeeklyHoursSummaryType[] = [];

      for (const employee of employees.filter((e) => e.employment_status === 'active')) {
        const employeeSchedules = schedules.filter(
          (s) => s.employee_id === employee.id
        );
        const employeeTimeEntries = timeEntries.filter(
          (t) => t.employee_id === employee.id
        );

        let scheduledTotal = 0;
        let actualTotal = 0;
        const byDay: WeeklyHoursSummaryType['by_day'] = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];

          const daySchedule = employeeSchedules.find((s) => s.date === dateStr);
          const dayTimeEntry = employeeTimeEntries.find((t) => t.date === dateStr);

          let scheduledHours = 0;
          let actualHours = 0;

          if (daySchedule) {
            const [startHour, startMin] = daySchedule.start_time.split(':').map(Number);
            const [endHour, endMin] = daySchedule.end_time.split(':').map(Number);
            scheduledHours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
          }

          if (dayTimeEntry?.hours_worked) {
            actualHours = dayTimeEntry.hours_worked;
          }

          scheduledTotal += scheduledHours;
          actualTotal += actualHours;

          byDay.push({
            date: dateStr,
            day_name: weekDays[i],
            scheduled_hours: scheduledHours,
            actual_hours: actualHours,
          });
        }

        const overtimeHours = Math.max(0, actualTotal - 40);

        summaryList.push({
          employee_id: employee.id,
          employee_name: getEmployeeFullName(employee),
          week_start: startStr,
          week_end: endStr,
          scheduled_hours: Math.round(scheduledTotal * 10) / 10,
          actual_hours: Math.round(actualTotal * 10) / 10,
          overtime_hours: Math.round(overtimeHours * 10) / 10,
          variance: Math.round((actualTotal - scheduledTotal) * 10) / 10,
          by_day: byDay,
        });
      }

      // Sort by overtime (descending) then by variance
      summaryList.sort((a, b) => {
        if (b.overtime_hours !== a.overtime_hours) {
          return b.overtime_hours - a.overtime_hours;
        }
        return Math.abs(b.variance) - Math.abs(a.variance);
      });

      setSummaries(summaryList);
      setLoading(false);
    }

    loadData();
  }, [weekStart]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const formatWeekRange = (): string => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  };

  // Summary stats
  const totalScheduled = summaries.reduce((s, e) => s + e.scheduled_hours, 0);
  const totalActual = summaries.reduce((s, e) => s + e.actual_hours, 0);
  const totalOvertime = summaries.reduce((s, e) => s + e.overtime_hours, 0);
  const employeesWithOvertime = summaries.filter((s) => s.overtime_hours > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Hours Summary
          </span>
          <Badge variant="outline">{formatWeekRange()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total Scheduled</p>
            <p className="text-xl font-bold">{totalScheduled.toFixed(1)}h</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total Actual</p>
            <p className="text-xl font-bold">{totalActual.toFixed(1)}h</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${totalOvertime > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-muted-foreground">Total Overtime</p>
            <p className={`text-xl font-bold ${totalOvertime > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalOvertime.toFixed(1)}h
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Employees w/ OT</p>
            <p className="text-xl font-bold">{employeesWithOvertime}</p>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {summaries.map((summary) => {
            const hasOvertime = summary.overtime_hours > 0;
            const progressPercent = Math.min((summary.actual_hours / 40) * 100, 100);

            return (
              <div
                key={summary.employee_id}
                className={`p-4 border rounded-lg ${
                  hasOvertime ? 'border-red-200 bg-red-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{summary.employee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Scheduled: {summary.scheduled_hours}h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${hasOvertime ? 'text-red-600' : ''}`}>
                      {summary.actual_hours}h
                      {hasOvertime && ` (+${summary.overtime_hours}h OT)`}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      {summary.variance > 0 ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          +{summary.variance}h over
                        </Badge>
                      ) : summary.variance < -1 ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          {Math.abs(summary.variance)}h under
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          On track
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Progress
                  value={progressPercent}
                  className={`h-2 ${
                    hasOvertime
                      ? '[&>div]:bg-red-500'
                      : summary.actual_hours >= 35
                      ? '[&>div]:bg-green-500'
                      : ''
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0h</span>
                  <span>40h</span>
                </div>
              </div>
            );
          })}
        </div>

        {summaries.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No employee data for this week
          </p>
        )}
      </CardContent>
    </Card>
  );
}
