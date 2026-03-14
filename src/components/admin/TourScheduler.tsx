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
import { CalendarDays, Clock, Plus, User, Phone, Mail, MapPin, X } from 'lucide-react';
import {
  Tour,
  TourStatus,
  getTours,
  createTour,
  getAvailableSlots,
} from '@/lib/tour-storage';

const STATUS_LABELS: Record<TourStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<TourStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  no_show: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const CENTERS = [
  { id: 'crystal', name: 'Crystal Location' },
  { id: 'brooklyn-park', name: 'Brooklyn Park Location' },
];

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Build a 4-week calendar grid from today
function buildCalendarDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setDate(today.getDate() - today.getDay()); // start of current week (Sunday)
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

interface ScheduleFormData {
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  center_id: string;
}

const EMPTY_FORM: ScheduleFormData = {
  parent_name: '',
  parent_email: '',
  parent_phone: '',
  scheduled_date: '',
  scheduled_time: '',
  center_id: 'crystal',
};

interface TourSchedulerProps {
  onTourSelect?: (tour: Tour) => void;
}

export function TourScheduler({ onTourSelect }: TourSchedulerProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ScheduleFormData>(EMPTY_FORM);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const calendarDays = buildCalendarDays();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getTours();
    setTours(data);
  }

  async function handleDateChange(date: string) {
    setForm(prev => ({ ...prev, scheduled_date: date, scheduled_time: '' }));
    if (date && form.center_id) {
      const slots = await getAvailableSlots(date, form.center_id);
      setAvailableSlots(slots);
    }
  }

  async function handleCenterChange(centerId: string) {
    setForm(prev => ({ ...prev, center_id: centerId, scheduled_time: '' }));
    if (form.scheduled_date) {
      const slots = await getAvailableSlots(form.scheduled_date, centerId);
      setAvailableSlots(slots);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.parent_name || !form.scheduled_date || !form.scheduled_time) return;
    setSaving(true);
    const center = CENTERS.find(c => c.id === form.center_id);
    await createTour({
      ...form,
      center_name: center?.name ?? form.center_id,
    });
    await load();
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
  }

  // Tours on a specific calendar day
  function toursOnDay(dateStr: string): Tour[] {
    return tours.filter(t => t.scheduled_date === dateStr);
  }

  // Upcoming tours (scheduled, in the future)
  const upcomingTours = tours
    .filter(t => t.status === 'scheduled')
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));

  const today = new Date().toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Upcoming tours list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-christina-red" />
              Upcoming Tours
            </CardTitle>
            <Button
              size="sm"
              className="bg-christina-red hover:bg-christina-red/90"
              onClick={() => setShowForm(v => !v)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Schedule Tour
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingTours.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tours scheduled. Click &quot;Schedule Tour&quot; to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingTours.map(tour => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onTourSelect?.(tour)}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium text-sm">{tour.parent_name}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(tour.scheduled_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {tour.center_name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{formatShortDate(tour.scheduled_date)}</p>
                    <Badge className={`text-xs border ${STATUS_COLORS[tour.status]}`}>
                      {STATUS_LABELS[tour.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule form */}
      {showForm && (
        <Card className="border-2 border-christina-red/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Schedule a New Tour</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="parent_name" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Parent / Guardian Name
                  </Label>
                  <Input
                    id="parent_name"
                    value={form.parent_name}
                    onChange={e => setForm(p => ({ ...p, parent_name: e.target.value }))}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="parent_phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </Label>
                  <Input
                    id="parent_phone"
                    value={form.parent_phone}
                    onChange={e => setForm(p => ({ ...p, parent_phone: e.target.value }))}
                    placeholder="(612) 555-0000"
                    type="tel"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="parent_email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Label>
                  <Input
                    id="parent_email"
                    value={form.parent_email}
                    onChange={e => setForm(p => ({ ...p, parent_email: e.target.value }))}
                    placeholder="parent@email.com"
                    type="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="center_id" className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </Label>
                  <Select value={form.center_id} onValueChange={handleCenterChange}>
                    <SelectTrigger id="center_id">
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                    <SelectContent>
                      {CENTERS.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="scheduled_date" className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Date
                  </Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={form.scheduled_date}
                    min={today}
                    onChange={e => handleDateChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Time Slot
                  </Label>
                  {form.scheduled_date ? (
                    availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map(slot => (
                          <Button
                            key={slot}
                            type="button"
                            variant={form.scheduled_time === slot ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setForm(p => ({ ...p, scheduled_time: slot }))}
                            className={
                              form.scheduled_time === slot
                                ? 'bg-christina-red hover:bg-christina-red/90'
                                : ''
                            }
                          >
                            {formatTime(slot)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        No available slots on this date for the selected location.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      Select a date to see available time slots.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving || !form.parent_name || !form.scheduled_date || !form.scheduled_time}
                  className="bg-christina-red hover:bg-christina-red/90"
                >
                  {saving ? 'Scheduling...' : 'Schedule Tour'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 4-week calendar grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-christina-blue" />
            4-Week View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Day name header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Weeks */}
            {[0, 1, 2, 3].map(week => (
              <div key={week} className="grid grid-cols-7 gap-1 mb-1">
                {calendarDays.slice(week * 7, week * 7 + 7).map(dateStr => {
                  const dayTours = toursOnDay(dateStr);
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;
                  return (
                    <div
                      key={dateStr}
                      className={`rounded-md p-1 min-h-[52px] border text-xs cursor-pointer transition-colors ${
                        isToday
                          ? 'border-christina-red bg-red-50'
                          : isPast
                          ? 'border-muted bg-muted/20 opacity-60'
                          : 'border-muted hover:bg-muted/30'
                      } ${selectedDate === dateStr ? 'ring-2 ring-christina-red' : ''}`}
                      onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                    >
                      <p className={`font-medium mb-0.5 ${isToday ? 'text-christina-red' : ''}`}>
                        {new Date(dateStr + 'T12:00:00').getDate()}
                      </p>
                      {dayTours.map(t => (
                        <div
                          key={t.id}
                          className={`rounded px-0.5 truncate ${STATUS_COLORS[t.status]} border`}
                        >
                          {formatTime(t.scheduled_time)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {selectedDate && (
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
              <p className="text-sm font-medium mb-2">
                {formatShortDate(selectedDate)}
              </p>
              {toursOnDay(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No tours on this day.</p>
              ) : (
                <div className="space-y-1.5">
                  {toursOnDay(selectedDate).map(tour => (
                    <div
                      key={tour.id}
                      className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:shadow-sm"
                      onClick={() => onTourSelect?.(tour)}
                    >
                      <span className="text-sm font-medium">{tour.parent_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(tour.scheduled_time)}
                        </span>
                        <Badge className={`text-xs border ${STATUS_COLORS[tour.status]}`}>
                          {STATUS_LABELS[tour.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
