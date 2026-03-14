'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock, User, MapPin, Calendar } from 'lucide-react';
import { Tour, TourChecklistItem, completeTour, updateTour, getDefaultChecklist } from '@/lib/tour-storage';

interface TourChecklistProps {
  tour: Tour;
  onComplete: (tour: Tour) => void;
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatDuration(startMs: number): string {
  const elapsed = Math.floor((Date.now() - startMs) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TourChecklist({ tour, onComplete }: TourChecklistProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState('0:00');
  const [items, setItems] = useState<TourChecklistItem[]>(
    tour.checklist_items && tour.checklist_items.length > 0
      ? tour.checklist_items
      : getDefaultChecklist()
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatDuration(startTimeRef.current));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = items.filter(i => i.completed).length;
  const progressPct = Math.round((completedCount / items.length) * 100);
  const allChecked = completedCount === items.length;

  function toggleItem(id: string) {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  async function handleComplete() {
    setSaving(true);
    const updated = await completeTour(tour.id, items);
    if (updated) {
      setDone(true);
      onComplete(updated);
    }
    setSaving(false);
  }

  async function handleSaveProgress() {
    await updateTour(tour.id, { checklist_items: items });
  }

  if (done) {
    return (
      <Card className="border-2 border-christina-green">
        <CardContent className="p-8 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-christina-green mx-auto" />
          <h3 className="text-xl font-bold text-christina-green">Tour Completed!</h3>
          <p className="text-muted-foreground">
            All {items.length} steps finished in {elapsed}.
          </p>
          <p className="text-sm text-muted-foreground">
            Don&apos;t forget to send a follow-up email within 24 hours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tour header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-christina-red" />
                <span className="font-semibold text-lg">{tour.parent_name}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(tour.scheduled_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(tour.scheduled_time)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tour.center_name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 text-base px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                {elapsed}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tour progress</span>
          <span className="font-medium">{completedCount} of {items.length} steps</span>
        </div>
        <Progress value={progressPct} className="h-2.5" />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items
          .sort((a, b) => a.order - b.order)
          .map(item => (
            <Card
              key={item.id}
              className={`transition-all ${item.completed ? 'bg-green-50/60 border-green-200' : 'hover:shadow-sm'}`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={item.id}
                    className={`flex-1 text-sm leading-snug cursor-pointer select-none ${
                      item.completed ? 'line-through text-muted-foreground' : 'font-medium'
                    }`}
                  >
                    <span className="text-xs text-muted-foreground mr-2">
                      {item.order + 1}.
                    </span>
                    {item.label}
                  </label>
                  {item.completed && (
                    <CheckCircle2 className="h-4 w-4 text-christina-green shrink-0" />
                  )}
                </div>
                {item.completed && (
                  <div className="pl-7">
                    <Textarea
                      placeholder="Optional notes for this step..."
                      value={notes[item.id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                      rows={2}
                      className="text-sm resize-none bg-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveProgress}
          className="flex-1 sm:flex-none"
        >
          Save Progress
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!allChecked || saving}
          className={`flex-1 sm:flex-none ${
            allChecked
              ? 'bg-christina-green hover:bg-christina-green/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Complete Tour'}
        </Button>
      </div>
      {!allChecked && (
        <p className="text-xs text-muted-foreground text-center">
          Check all {items.length} steps to complete the tour
        </p>
      )}
    </div>
  );
}
