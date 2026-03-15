'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import {
  SupplyRequest,
  getRequests,
  fulfillRequest,
  denyRequest,
} from '@/lib/supply-inventory-storage';

interface RestockQueueProps {
  onRefresh?: () => void;
}

const URGENCY_CONFIG = {
  today: {
    label: 'Today',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
  },
  this_week: {
    label: 'This Week',
    badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  routine: {
    label: 'Routine',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: RefreshCw,
  },
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function RequestCard({
  request,
  onFulfill,
  onDeny,
  showActions,
}: {
  request: SupplyRequest;
  onFulfill?: (id: string) => void;
  onDeny?: (id: string) => void;
  showActions: boolean;
}) {
  const urgency = URGENCY_CONFIG[request.urgency];
  const UrgencyIcon = urgency.icon;

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/20">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{request.item_name}</span>
          <Badge className={`text-xs border ${urgency.badgeClass}`}>
            <UrgencyIcon className="h-3 w-3 mr-1" />
            {urgency.label}
          </Badge>
          {!showActions && (
            <Badge
              className={`text-xs border ${
                request.status === 'fulfilled'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}
            >
              {request.status === 'fulfilled' ? 'Fulfilled' : 'Denied'}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Requested by <strong>{request.requested_by}</strong> &middot;{' '}
          {request.classroom} &middot; {formatRelativeTime(request.created_at)}
        </p>
        {request.notes && (
          <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{request.notes}&rdquo;</p>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onFulfill?.(request.id)}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Fulfill
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            onClick={() => onDeny?.(request.id)}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Deny
          </Button>
        </div>
      )}
    </div>
  );
}

export function RestockQueue({ onRefresh }: RestockQueueProps) {
  const [pending, setPending] = useState<SupplyRequest[]>([]);
  const [history, setHistory] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [pendingData, historyData] = await Promise.all([
      getRequests({ status: 'pending' }),
      getRequests(),
    ]);
    setPending(pendingData);
    setHistory(historyData.filter((r) => r.status !== 'pending'));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFulfill = async (id: string) => {
    await fulfillRequest(id);
    await loadData();
    onRefresh?.();
  };

  const handleDeny = async (id: string) => {
    await denyRequest(id);
    await loadData();
    onRefresh?.();
  };

  const todayCount = pending.filter((r) => r.urgency === 'today').length;
  const weekCount = pending.filter((r) => r.urgency === 'this_week').length;
  const routineCount = pending.filter((r) => r.urgency === 'routine').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C62828]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      {pending.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {todayCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{todayCount} needed today</span>
            </div>
          )}
          {weekCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">
              <Clock className="h-4 w-4" />
              <span>{weekCount} this week</span>
            </div>
          )}
          {routineCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
              <RefreshCw className="h-4 w-4" />
              <span>{routineCount} routine</span>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <Badge className="ml-2 bg-[#C62828] text-white h-5 min-w-5 text-xs">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-400" />
                <p className="font-medium">All caught up</p>
                <p className="text-sm mt-1">No pending supply requests.</p>
              </CardContent>
            </Card>
          ) : (
            pending.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onFulfill={handleFulfill}
                onDeny={handleDeny}
                showActions
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {history.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No request history yet.</p>
              </CardContent>
            </Card>
          ) : (
            history.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
