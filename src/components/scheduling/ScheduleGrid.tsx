'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Loader2, Clock } from 'lucide-react';
import { Employee, ScheduleEntry, formatTime, getEmployeeFullName } from '@/types/employee';
import {
  getEmployees,
  getScheduleEntries,
} from '@/lib/employee-storage';
import { ScheduleEntryDialog } from './ScheduleEntryDialog';

interface ScheduleGridProps {
  showHoursSummary?: boolean;
  onScheduleChange?: () => void;
}

export function ScheduleGrid({
  showHoursSummary = true,
  onScheduleChange,
}: ScheduleGridProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1); // Start on Monday
    return start;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const emps = await getEmployees();
      setEmployees(emps.filter((e) => e.employment_status === 'active'));

      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const entries = await getScheduleEntries({
        startDate: currentWeekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
      });
      setSchedules(entries);
      setLoading(false);
    }
    loadData();
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const getDateForDay = (dayIndex: number): string => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  const getScheduleForEmployeeAndDay = (
    employeeId: string,
    dayIndex: number
  ): ScheduleEntry | undefined => {
    const date = getDateForDay(dayIndex);
    return schedules.find(
      (s) => s.employee_id === employeeId && s.date === date
    );
  };

  const calculateScheduledHours = (entry: ScheduleEntry): number => {
    const [startHour, startMin] = entry.start_time.split(':').map(Number);
    const [endHour, endMin] = entry.end_time.split(':').map(Number);
    return (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
  };

  const getEmployeeWeeklyHours = (employeeId: string): number => {
    const employeeSchedules = schedules.filter(
      (s) => s.employee_id === employeeId
    );
    return employeeSchedules.reduce(
      (sum, s) => sum + calculateScheduledHours(s),
      0
    );
  };

  const handleCellClick = (employeeId: string, dayIndex: number) => {
    const entry = getScheduleForEmployeeAndDay(employeeId, dayIndex);
    const date = getDateForDay(dayIndex);
    setSelectedEntry(entry || null);
    setSelectedDate(date);
    setSelectedEmployeeId(employeeId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEntry(null);
    // Reload schedules
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    getScheduleEntries({
      startDate: currentWeekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
    }).then(setSchedules);
    onScheduleChange?.();
  };

  const formatWeekRange = (): string => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 4);
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">{formatWeekRange()}</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium min-w-[180px]">
                  Staff Member
                </th>
                {weekDays.map((day, index) => {
                  const date = new Date(currentWeekStart);
                  date.setDate(date.getDate() + index);
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={day}
                      className={`text-center p-3 font-medium min-w-[100px] ${
                        isToday ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div>{day}</div>
                      <div className={`text-xs font-normal ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {date.getMonth() + 1}/{date.getDate()}
                      </div>
                    </th>
                  );
                })}
                {showHoursSummary && (
                  <th className="text-center p-3 font-medium min-w-[100px] bg-muted/30">
                    Weekly Hours
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const weeklyHours = getEmployeeWeeklyHours(employee.id);
                const isOvertime = weeklyHours > 40;
                return (
                  <tr key={employee.id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">
                        {getEmployeeFullName(employee)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee.job_title}
                      </p>
                    </td>
                    {weekDays.map((_, dayIndex) => {
                      const schedule = getScheduleForEmployeeAndDay(
                        employee.id,
                        dayIndex
                      );
                      const date = new Date(currentWeekStart);
                      date.setDate(date.getDate() + dayIndex);
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <td
                          key={dayIndex}
                          className={`p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
                            isToday ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleCellClick(employee.id, dayIndex)}
                        >
                          {schedule ? (
                            <Badge
                              variant="outline"
                              className="text-xs gap-1 cursor-pointer"
                            >
                              <Clock className="h-3 w-3" />
                              {formatTime(schedule.start_time).replace(' ', '')}
                              -
                              {formatTime(schedule.end_time).replace(' ', '')}
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      );
                    })}
                    {showHoursSummary && (
                      <td className="p-3 text-center bg-muted/30">
                        <span
                          className={`font-bold ${
                            isOvertime
                              ? 'text-red-600'
                              : weeklyHours >= 35
                              ? 'text-green-600'
                              : weeklyHours < 20
                              ? 'text-yellow-600'
                              : ''
                          }`}
                        >
                          {weeklyHours.toFixed(1)}h
                        </span>
                        {isOvertime && (
                          <div className="text-xs text-red-600">
                            +{(weeklyHours - 40).toFixed(1)} OT
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-600 rounded" />
              <span>35-40h (Full Time)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-600 rounded" />
              <span>&lt;20h (Part Time)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded" />
              <span>&gt;40h (Overtime)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleEntryDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        entry={selectedEntry}
        date={selectedDate}
        employeeId={selectedEmployeeId}
        employees={employees}
      />
    </>
  );
}
