'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Employee, ScheduleRequest } from '@/types/employee';
import { getCurrentEmployee, getScheduleRequests } from '@/lib/employee-storage';
import { ScheduleRequestForm } from '@/components/scheduling/ScheduleRequestForm';

export default function ScheduleRequestPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [myRequests, setMyRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const emp = getCurrentEmployee();
    if (!emp) {
      router.push('/employee-login');
      return;
    }
    setEmployee(emp);

    const requests = await getScheduleRequests({ employee_id: emp.id });
    setMyRequests(requests);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuccess = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) return null;

  const getStatusBadge = (status: ScheduleRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            Denied
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/employee/schedule">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Schedule Request
          </h1>
          <p className="text-muted-foreground">
            Submit a request to change your schedule
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Form */}
        <ScheduleRequestForm employee={employee} onSuccess={handleSuccess} />

        {/* My Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No requests submitted yet
              </p>
            ) : (
              <div className="space-y-4">
                {myRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {new Date(request.requested_date).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.reason}
                    </p>
                    {request.review_notes && (
                      <p className="text-sm bg-muted/30 p-2 rounded">
                        <span className="font-medium">Response:</span>{' '}
                        {request.review_notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted{' '}
                      {new Date(request.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
