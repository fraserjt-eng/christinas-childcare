'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClockInOutButton } from '@/components/employee/ClockInOutButton';
import {
  getCurrentEmployee,
  getActiveTimeEntry,
  getTimeEntries,
  clockIn,
  clockOut,
} from '@/lib/employee-storage';
import { Employee, TimeEntry, formatHours } from '@/types/employee';
import { Calendar, Clock, CalendarDays, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const emp = getCurrentEmployee();
      setEmployee(emp);

      if (emp) {
        const active = await getActiveTimeEntry(emp.id);
        setActiveEntry(active);

        const entries = await getTimeEntries({
          employee_id: emp.id,
        });
        // Get last 5 completed entries
        setRecentEntries(entries.filter((e) => e.clock_out).slice(0, 5));
      }
    }
    loadData();
  }, []);

  const handleClockIn = async () => {
    if (!employee) return;
    setLoading(true);
    const entry = await clockIn(employee.id);
    setActiveEntry(entry);
    setLoading(false);
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;
    setLoading(true);
    await clockOut(activeEntry.id, 30); // 30 min lunch break
    setActiveEntry(null);
    // Refresh recent entries
    if (employee) {
      const entries = await getTimeEntries({ employee_id: employee.id });
      setRecentEntries(entries.filter((e) => e.clock_out).slice(0, 5));
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {employee.first_name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {employee.job_title} • {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Clock In/Out Section */}
        <ClockInOutButton
          isClockedIn={!!activeEntry}
          activeEntry={activeEntry}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          loading={loading}
        />

        {/* Quick Links & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/employee/schedule"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span className="font-medium">My Schedule</span>
                </Link>
                <Link
                  href="/employee/pay-stubs"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Pay Stubs</span>
                </Link>
                <Link
                  href="/employee/time-off"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Time Off</span>
                </Link>
                <Link
                  href="/employee/profile"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">My Profile</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Time Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent time entries
                </p>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{formatDate(entry.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(entry.clock_in)} - {entry.clock_out ? formatTime(entry.clock_out) : 'Active'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {entry.hours_worked ? formatHours(entry.hours_worked) : '--'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week&apos;s Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">
                {formatHours(recentEntries
                  .filter((e) => {
                    const entryDate = new Date(e.date);
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    return entryDate >= startOfWeek;
                  })
                  .reduce((sum, e) => sum + (e.hours_worked || 0), 0)
                )}
              </p>
              <p className="text-sm text-muted-foreground">Hours This Week</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">
                {recentEntries.filter((e) => {
                  const entryDate = new Date(e.date);
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  return entryDate >= startOfWeek;
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Days Worked</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">${employee.hourly_rate}</p>
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">
                {employee.certifications.length}
              </p>
              <p className="text-sm text-muted-foreground">Certifications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
