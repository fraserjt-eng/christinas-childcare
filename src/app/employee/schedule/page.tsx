'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getCurrentEmployee,
  getScheduleEntries,
} from '@/lib/employee-storage';
import { Employee, ScheduleEntry, formatTime } from '@/types/employee';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function EmployeeSchedulePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1); // Start on Monday
    return start;
  });

  useEffect(() => {
    async function loadData() {
      const emp = getCurrentEmployee();
      setEmployee(emp);

      if (emp) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const entries = await getScheduleEntries({
          employee_id: emp.id,
          startDate: currentWeekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
        });
        setScheduleEntries(entries);
      }
    }
    loadData();
  }, [currentWeekStart]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getScheduleForDay = (dayIndex: number): ScheduleEntry | undefined => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    const dateString = date.toISOString().split('T')[0];
    return scheduleEntries.find((e) => e.date === dateString);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const isToday = (dayIndex: number): boolean => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDateHeader = (start: Date): string => {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const calculateWeeklyHours = (): number => {
    let total = 0;
    scheduleEntries.forEach((entry) => {
      const [startHour, startMin] = entry.start_time.split(':').map(Number);
      const [endHour, endMin] = entry.end_time.split(':').map(Number);
      const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
      total += hours;
    });
    return total;
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            My Schedule
          </h1>
          <p className="text-muted-foreground">
            View your upcoming work schedule
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {calculateWeeklyHours()}h scheduled this week
        </Badge>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <CardTitle className="text-lg">
              {formatDateHeader(currentWeekStart)}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop View - Week Grid */}
          <div className="hidden md:grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const schedule = getScheduleForDay(index);
              const today = isToday(index);
              const date = new Date(currentWeekStart);
              date.setDate(date.getDate() + index);

              return (
                <div
                  key={day}
                  className={`p-3 rounded-lg border ${
                    today
                      ? 'border-primary bg-primary/5'
                      : 'border-muted bg-muted/30'
                  }`}
                >
                  <div className="text-center mb-2">
                    <p className="text-sm font-medium">{day}</p>
                    <p className={`text-2xl font-bold ${today ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </p>
                  </div>
                  {schedule ? (
                    <div className="text-center space-y-1">
                      <Badge className="w-full justify-center">
                        {formatTime(schedule.start_time)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">to</p>
                      <Badge variant="outline" className="w-full justify-center">
                        {formatTime(schedule.end_time)}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Off</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile View - List */}
          <div className="md:hidden space-y-3">
            {weekDays.map((day, index) => {
              const schedule = getScheduleForDay(index);
              const today = isToday(index);
              const date = new Date(currentWeekStart);
              date.setDate(date.getDate() + index);

              return (
                <div
                  key={day}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    today
                      ? 'border-primary bg-primary/5'
                      : 'border-muted bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      today ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div>
                      <p className="font-medium">{fullWeekDays[index]}</p>
                      {today && (
                        <Badge variant="secondary" className="text-xs">Today</Badge>
                      )}
                    </div>
                  </div>
                  {schedule ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Off</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{scheduleEntries.length}</p>
              <p className="text-sm text-muted-foreground">Days Scheduled</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{calculateWeeklyHours()}h</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">
                ${(calculateWeeklyHours() * (employee?.hourly_rate || 0)).toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Est. Gross Pay</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
