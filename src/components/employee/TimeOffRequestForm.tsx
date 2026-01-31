'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TimeOffType, TimeOffRequestCreate } from '@/types/employee';
import { Calendar, Clock, Send } from 'lucide-react';

interface TimeOffRequestFormProps {
  employeeId: string;
  onSubmit: (request: TimeOffRequestCreate) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function TimeOffRequestForm({
  employeeId,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: TimeOffRequestFormProps) {
  const [type, setType] = React.useState<TimeOffType>('vacation');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');

  const timeOffTypes: { value: TimeOffType; label: string; description: string }[] = [
    { value: 'vacation', label: 'Vacation', description: 'Paid time off for personal activities' },
    { value: 'sick', label: 'Sick Leave', description: 'Time off due to illness' },
    { value: 'personal', label: 'Personal Day', description: 'Personal matters requiring time off' },
    { value: 'unpaid', label: 'Unpaid Leave', description: 'Time off without pay' },
  ];

  const calculateHours = (): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    // Assuming 8-hour workdays
    return diffDays * 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    const request: TimeOffRequestCreate = {
      employee_id: employeeId,
      type,
      start_date: startDate,
      end_date: endDate,
      hours_requested: calculateHours(),
      reason: reason || undefined,
    };

    await onSubmit(request);

    // Reset form
    setType('vacation');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Request Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Off Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type of Leave</Label>
            <Select value={type} onValueChange={(v) => setType(v as TimeOffType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {timeOffTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                required
              />
            </div>
          </div>

          {/* Hours Preview */}
          {startDate && endDate && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{calculateHours()} hours</span>
                <span className="text-muted-foreground"> requested</span>
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
