'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TimeOffRequestForm } from '@/components/employee/TimeOffRequestForm';
import {
  getCurrentEmployee,
  getTimeOffRequests,
  createTimeOffRequest,
} from '@/lib/employee-storage';
import { Employee, TimeOffRequest, TimeOffRequestCreate } from '@/types/employee';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmployeeTimeOffPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const emp = getCurrentEmployee();
      setEmployee(emp);

      if (emp) {
        const reqs = await getTimeOffRequests({ employee_id: emp.id });
        setRequests(reqs);
      }
    }
    loadData();
  }, []);

  const handleSubmitRequest = async (request: TimeOffRequestCreate) => {
    setLoading(true);
    await createTimeOffRequest(request);
    // Refresh requests
    if (employee) {
      const reqs = await getTimeOffRequests({ employee_id: employee.id });
      setRequests(reqs);
    }
    setShowForm(false);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: TimeOffRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Loader2 className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: TimeOffRequest['type']) => {
    const colors: Record<TimeOffRequest['type'], string> = {
      vacation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sick: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      unpaid: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return (
      <Badge className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Calculate balances (simplified - would normally come from backend)
  const balances = {
    vacation: 80, // 10 days
    sick: 40, // 5 days
    personal: 24, // 3 days
  };

  const usedHours = requests
    .filter((r) => r.status === 'approved')
    .reduce(
      (acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + r.hours_requested;
        return acc;
      },
      {} as Record<string, number>
    );

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
            Time Off
          </h1>
          <p className="text-muted-foreground">
            Request and manage your time off
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Time Off Form */}
      {showForm && (
        <TimeOffRequestForm
          employeeId={employee.id}
          onSubmit={handleSubmitRequest}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vacation</p>
                <p className="text-2xl font-bold">
                  {balances.vacation - (usedHours.vacation || 0)}h
                </p>
                <p className="text-xs text-muted-foreground">
                  of {balances.vacation}h remaining
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {Math.round(
                    ((balances.vacation - (usedHours.vacation || 0)) /
                      balances.vacation) *
                      100
                  )}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sick Leave</p>
                <p className="text-2xl font-bold">
                  {balances.sick - (usedHours.sick || 0)}h
                </p>
                <p className="text-xs text-muted-foreground">
                  of {balances.sick}h remaining
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-orange-500 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {Math.round(
                    ((balances.sick - (usedHours.sick || 0)) /
                      balances.sick) *
                      100
                  )}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personal Days</p>
                <p className="text-2xl font-bold">
                  {balances.personal - (usedHours.personal || 0)}h
                </p>
                <p className="text-xs text-muted-foreground">
                  of {balances.personal}h remaining
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-purple-500 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {Math.round(
                    ((balances.personal - (usedHours.personal || 0)) /
                      balances.personal) *
                      100
                  )}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No time off requests yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Click &quot;New Request&quot; to submit your first request
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{getTypeBadge(request.type)}</TableCell>
                    <TableCell>
                      {formatDate(request.start_date)}
                      {request.start_date !== request.end_date && (
                        <> - {formatDate(request.end_date)}</>
                      )}
                    </TableCell>
                    <TableCell>{request.hours_requested}h</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(request.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
