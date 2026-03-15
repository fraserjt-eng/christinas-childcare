'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Calendar, User, RefreshCw } from 'lucide-react';
import {
  getCoverageRequests,
  approveCoverage,
  denyCoverage,
  type CoverageRequest,
} from '@/lib/schedule-optimizer-storage';

// Available staff who could cover
const AVAILABLE_STAFF = [
  { id: 'emp-oz', name: 'Ophelia Zeogar' },
  { id: 'emp-cf', name: 'Christina Fraser' },
  { id: 'emp-ms', name: 'Maria Santos' },
  { id: 'emp-jr', name: 'James Robinson' },
  { id: 'emp-sk', name: 'Sarah Kim' },
  { id: 'emp-dc', name: 'David Chen' },
  { id: 'emp-lj', name: 'Lisa Johnson' },
  { id: 'emp-sz', name: 'Stephen Zeogar' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: CoverageRequest['status']) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 border gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case 'denied':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 border gap-1">
          <XCircle className="h-3 w-3" />
          Denied
        </Badge>
      );
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Approve Dialog ───────────────────────────────────────────────────────────

interface ApproveDialogProps {
  open: boolean;
  request?: CoverageRequest;
  onApprove: (id: string, coverId: string, coverName: string) => void;
  onClose: () => void;
}

function ApproveDialog({ open, request, onApprove, onClose }: ApproveDialogProps) {
  const [selectedCover, setSelectedCover] = useState('');

  if (!request) return null;

  const eligibleCovers = AVAILABLE_STAFF.filter(s => s.id !== request.requesting_employee_id);

  function handleApprove() {
    if (!selectedCover || !request) return;
    const staff = AVAILABLE_STAFF.find(s => s.id === selectedCover);
    if (staff) onApprove(request.id, staff.id, staff.name);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Approve Coverage Request</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {request.requesting_employee_name} — {formatDate(request.date)}
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            <span className="font-medium">Reason: </span>{request.reason}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Assign Cover Employee</label>
            <Select value={selectedCover} onValueChange={setSelectedCover}>
              <SelectTrigger>
                <SelectValue placeholder="Select cover employee..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleCovers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={!selectedCover}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: CoverageRequest;
  onApproveClick: (request: CoverageRequest) => void;
  onDeny: (id: string) => void;
}

function RequestCard({ request, onApproveClick, onDeny }: RequestCardProps) {
  const isPending = request.status === 'pending';

  return (
    <Card className={`${isPending ? 'border-amber-200 bg-amber-50/30' : 'bg-gray-50/50 border-gray-100'}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{request.requesting_employee_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatDate(request.date)}</span>
                <span className="text-xs text-gray-400">&bull;</span>
                <span className="text-xs text-gray-400">{timeAgo(request.created_at)}</span>
              </div>
            </div>
          </div>
          {statusBadge(request.status)}
        </div>

        <p className="text-sm text-gray-600 mb-3 pl-10">{request.reason}</p>

        {request.status === 'approved' && request.cover_employee_name && (
          <div className="flex items-center gap-1.5 pl-10 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">
              {request.cover_employee_name} will cover
            </span>
          </div>
        )}

        {isPending && (
          <div className="flex gap-2 pl-10">
            <Button
              size="sm"
              onClick={() => onApproveClick(request)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeny(request.id)}
              className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Deny
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CoverageRequests() {
  const [mounted, setMounted] = useState(false);
  const [allRequests, setAllRequests] = useState<CoverageRequest[]>([]);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [approveTarget, setApproveTarget] = useState<CoverageRequest | undefined>();
  const [approveOpen, setApproveOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function loadRequests() {
    setAllRequests(getCoverageRequests());
  }

  useEffect(() => {
    loadRequests();
  }, []);

  if (!mounted) { return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" /></div>; }

  function handleApproveClick(request: CoverageRequest) {
    setApproveTarget(request);
    setApproveOpen(true);
  }

  function handleApprove(id: string, coverId: string, coverName: string) {
    approveCoverage(id, coverId, coverName);
    loadRequests();
  }

  function handleDeny(id: string) {
    denyCoverage(id);
    loadRequests();
  }

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const historyRequests = allRequests.filter(r => r.status !== 'pending');

  const displayed = tab === 'pending' ? pendingRequests : historyRequests;

  return (
    <div className="space-y-4">
      {/* Tab toggles */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={tab === 'pending' ? 'default' : 'outline'}
          onClick={() => setTab('pending')}
          className={tab === 'pending' ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white' : ''}
        >
          Pending
          {pendingRequests.length > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
              tab === 'pending' ? 'bg-white text-[#C62828]' : 'bg-amber-100 text-amber-700'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </Button>
        <Button
          size="sm"
          variant={tab === 'history' ? 'default' : 'outline'}
          onClick={() => setTab('history')}
          className={tab === 'history' ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white' : ''}
        >
          History
        </Button>
        <Button variant="ghost" size="sm" onClick={loadRequests} className="ml-auto gap-1.5 text-gray-500">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Requests list */}
      {displayed.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-8 pb-8 text-center">
            {tab === 'pending' ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No pending coverage requests</p>
                <p className="text-xs text-gray-400 mt-1">Staff requests will appear here for your review.</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No coverage request history yet.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onApproveClick={handleApproveClick}
              onDeny={handleDeny}
            />
          ))}
        </div>
      )}

      <ApproveDialog
        open={approveOpen}
        request={approveTarget}
        onApprove={handleApprove}
        onClose={() => setApproveOpen(false)}
      />
    </div>
  );
}
