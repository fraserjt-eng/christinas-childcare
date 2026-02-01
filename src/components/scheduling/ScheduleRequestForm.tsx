'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Send, Calendar } from 'lucide-react';
import {
  Employee,
  ScheduleRequestType,
  getScheduleRequestTypeLabel,
  getEmployeeFullName,
} from '@/types/employee';
import { createScheduleRequest, getEmployees } from '@/lib/employee-storage';
import { showToast } from '@/lib/notification-service';

interface ScheduleRequestFormProps {
  employee: Employee;
  onSuccess?: () => void;
}

export function ScheduleRequestForm({
  employee,
  onSuccess,
}: ScheduleRequestFormProps) {
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    request_type: 'schedule_change' as ScheduleRequestType,
    requested_date: '',
    current_start_time: '',
    current_end_time: '',
    requested_start_time: '',
    requested_end_time: '',
    swap_with_employee_id: '',
    reason: '',
  });

  useEffect(() => {
    async function loadEmployees() {
      const emps = await getEmployees();
      setEmployees(
        emps.filter(
          (e) => e.id !== employee.id && e.employment_status === 'active'
        )
      );
    }
    loadEmployees();
  }, [employee.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createScheduleRequest({
        employee_id: employee.id,
        request_type: formData.request_type,
        requested_date: formData.requested_date,
        current_start_time: formData.current_start_time || undefined,
        current_end_time: formData.current_end_time || undefined,
        requested_start_time: formData.requested_start_time || undefined,
        requested_end_time: formData.requested_end_time || undefined,
        swap_with_employee_id: formData.swap_with_employee_id || undefined,
        reason: formData.reason,
      });

      showToast({
        title: 'Request Submitted',
        message: 'Your schedule request has been submitted for review.',
        variant: 'success',
      });

      // Reset form
      setFormData({
        request_type: 'schedule_change',
        requested_date: '',
        current_start_time: '',
        current_end_time: '',
        requested_start_time: '',
        requested_end_time: '',
        swap_with_employee_id: '',
        reason: '',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting request:', error);
      showToast({
        title: 'Error',
        message: 'Failed to submit request. Please try again.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const requestTypes: ScheduleRequestType[] = [
    'schedule_change',
    'shift_swap',
    'time_off_coverage',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Request Schedule Change
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request_type">Request Type</Label>
            <Select
              value={formData.request_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  request_type: value as ScheduleRequestType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getScheduleRequestTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested_date">Date</Label>
            <Input
              id="requested_date"
              type="date"
              value={formData.requested_date}
              onChange={(e) =>
                setFormData({ ...formData, requested_date: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {formData.request_type === 'schedule_change' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_start">Current Start</Label>
                  <Input
                    id="current_start"
                    type="time"
                    value={formData.current_start_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_end">Current End</Label>
                  <Input
                    id="current_end"
                    type="time"
                    value={formData.current_end_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_end_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requested_start">Requested Start</Label>
                  <Input
                    id="requested_start"
                    type="time"
                    value={formData.requested_start_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requested_start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requested_end">Requested End</Label>
                  <Input
                    id="requested_end"
                    type="time"
                    value={formData.requested_end_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requested_end_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {formData.request_type === 'shift_swap' && (
            <div className="space-y-2">
              <Label htmlFor="swap_with">Swap With</Label>
              <Select
                value={formData.swap_with_employee_id}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    swap_with_employee_id: value,
                  })
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

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Please explain your request..."
              rows={3}
              required
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
