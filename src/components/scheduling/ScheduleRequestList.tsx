'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Check,
  X,
  Loader2,
  Clock,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react';
import {
  ScheduleRequest,
  Employee,
  getScheduleRequestTypeLabel,
  formatTime,
  getEmployeeFullName,
} from '@/types/employee';
import {
  getScheduleRequests,
  getEmployees,
  approveScheduleRequest,
  denyScheduleRequest,
} from '@/lib/employee-storage';
import { showToast } from '@/lib/notification-service';

interface ScheduleRequestListProps {
  statusFilter?: 'all' | 'pending' | 'approved' | 'denied';
  onUpdate?: () => void;
}

export function ScheduleRequestList({
  statusFilter = 'all',
  onUpdate,
}: ScheduleRequestListProps) {
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(
    null
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny'>('approve');

  const loadData = async () => {
    setLoading(true);

    const emps = await getEmployees();
    const empMap = new Map<string, Employee>();
    emps.forEach((e) => empMap.set(e.id, e));
    setEmployees(empMap);

    const reqs = await getScheduleRequests(
      statusFilter === 'all' ? undefined : { status: statusFilter }
    );
    setRequests(reqs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openReviewDialog = (
    request: ScheduleRequest,
    action: 'approve' | 'deny'
  ) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedRequest) return;
    setProcessing(selectedRequest.id);

    try {
      if (reviewAction === 'approve') {
        await approveScheduleRequest(selectedRequest.id, 'admin', reviewNotes);
        showToast({
          title: 'Request Approved',
          message: 'The schedule request has been approved.',
          variant: 'success',
        });
      } else {
        await denyScheduleRequest(selectedRequest.id, 'admin', reviewNotes);
        showToast({
          title: 'Request Denied',
          message: 'The schedule request has been denied.',
          variant: 'warning',
        });
      }

      setReviewDialogOpen(false);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: ScheduleRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
            <Check className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="gap-1 text-red-600 border-red-300">
            <X className="h-3 w-3" />
            Denied
          </Badge>
        );
    }
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
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Schedule Requests</span>
            <Badge variant="secondary">{requests.length} requests</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No schedule requests found
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const employee = employees.get(request.employee_id);
                const swapEmployee = request.swap_with_employee_id
                  ? employees.get(request.swap_with_employee_id)
                  : null;

                return (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {employee
                              ? getEmployeeFullName(employee)
                              : 'Unknown Employee'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.requested_date).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                          <Badge variant="secondary">
                            {getScheduleRequestTypeLabel(request.request_type)}
                          </Badge>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Request Details */}
                    <div className="text-sm space-y-1">
                      {request.current_start_time && request.current_end_time && (
                        <p>
                          <span className="text-muted-foreground">Current:</span>{' '}
                          {formatTime(request.current_start_time)} -{' '}
                          {formatTime(request.current_end_time)}
                        </p>
                      )}
                      {request.requested_start_time &&
                        request.requested_end_time && (
                          <p>
                            <span className="text-muted-foreground">Requested:</span>{' '}
                            {formatTime(request.requested_start_time)} -{' '}
                            {formatTime(request.requested_end_time)}
                          </p>
                        )}
                      {swapEmployee && (
                        <p>
                          <span className="text-muted-foreground">Swap with:</span>{' '}
                          {getEmployeeFullName(swapEmployee)}
                        </p>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p>{request.reason}</p>
                    </div>

                    {/* Review Notes */}
                    {request.review_notes && (
                      <div className="p-2 bg-muted/30 rounded text-sm">
                        <span className="font-medium">Admin Notes:</span>{' '}
                        {request.review_notes}
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewDialog(request, 'deny')}
                          className="gap-1 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openReviewDialog(request, 'approve')}
                          className="gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    )}

                    {/* Submitted/Reviewed timestamp */}
                    <p className="text-xs text-muted-foreground">
                      Submitted{' '}
                      {new Date(request.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {request.reviewed_at && (
                        <>
                          {' '}
                          • Reviewed{' '}
                          {new Date(request.reviewed_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          )}
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Deny'} Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {reviewAction === 'approve'
                ? 'Are you sure you want to approve this schedule request?'
                : 'Are you sure you want to deny this schedule request?'}
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Any notes about this approval...'
                    : 'Reason for denial...'
                }
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={processing !== null}
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              >
                {processing && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {reviewAction === 'approve' ? 'Approve' : 'Deny'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
