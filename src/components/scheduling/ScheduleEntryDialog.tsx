'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Loader2, Trash2 } from 'lucide-react';
import {
  Employee,
  ScheduleEntry,
  getEmployeeFullName,
} from '@/types/employee';
import {
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
} from '@/lib/employee-storage';

interface ScheduleEntryDialogProps {
  open: boolean;
  onClose: () => void;
  entry?: ScheduleEntry | null;
  date: string;
  employeeId: string;
  employees: Employee[];
}

export function ScheduleEntryDialog({
  open,
  onClose,
  entry,
  date,
  employeeId,
  employees,
}: ScheduleEntryDialogProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    start_time: '08:00',
    end_time: '16:00',
    notes: '',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        employee_id: entry.employee_id,
        start_time: entry.start_time,
        end_time: entry.end_time,
        notes: entry.notes || '',
      });
    } else {
      setFormData({
        employee_id: employeeId,
        start_time: '08:00',
        end_time: '16:00',
        notes: '',
      });
    }
  }, [entry, employeeId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (entry) {
        await updateScheduleEntry(entry.id, {
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes || undefined,
        });
      } else {
        await createScheduleEntry({
          employee_id: formData.employee_id,
          date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes || undefined,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving schedule entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirm('Are you sure you want to delete this shift?')) return;

    setDeleting(true);
    try {
      await deleteScheduleEntry(entry.id);
      onClose();
    } catch (error) {
      console.error('Error deleting schedule entry:', error);
    } finally {
      setDeleting(false);
    }
  };

  const employee = employees.find((e) => e.id === formData.employee_id);
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate hours
  const calculateHours = (): string => {
    const [startHour, startMin] = formData.start_time.split(':').map(Number);
    const [endHour, endMin] = formData.end_time.split(':').map(Number);
    const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
    return hours.toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Edit Shift' : 'Add Shift'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <p className="font-medium">{formattedDate}</p>
            {employee && (
              <p className="text-muted-foreground">
                {getEmployeeFullName(employee)} • {employee.job_title}
              </p>
            )}
          </div>

          {!entry && (
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {getEmployeeFullName(emp)} - {emp.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="p-2 bg-primary/5 rounded text-sm text-center">
            Shift duration: <span className="font-bold">{calculateHours()} hours</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g., Cover for Maria's PTO"
              rows={2}
            />
          </div>

          <div className="flex justify-between pt-4">
            {entry ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {entry ? 'Update' : 'Add'} Shift
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
