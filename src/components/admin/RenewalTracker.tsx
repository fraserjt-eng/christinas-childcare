'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import {
  ChildAuthorization,
  RenewalStats,
  AUTH_TYPE_LABELS,
  getAuthorizations,
  getRenewalStats,
  updateAuthorization,
  getDaysRemaining,
} from '@/lib/authorization-storage';

// ─── Stat Tile ───────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}

function StatTile({ label, value, sub, icon, iconBg, valueColor }: StatTileProps) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl font-bold ${valueColor || 'text-gray-900'}`}>{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Renewal Row ─────────────────────────────────────────────────────

function RenewalRow({
  auth,
  onMarkApproved,
}: {
  auth: ChildAuthorization;
  onMarkApproved: (id: string) => void;
}) {
  const submittedDaysAgo = auth.renewal_submitted_at
    ? Math.floor(
        (Date.now() - new Date(auth.renewal_submitted_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const daysLeft = getDaysRemaining(auth.end_date);

  const urgency =
    daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'critical' : daysLeft <= 14 ? 'warning' : 'normal';

  const urgencyColors: Record<string, string> = {
    expired: 'border-l-4 border-red-500',
    critical: 'border-l-4 border-orange-500',
    warning: 'border-l-4 border-yellow-400',
    normal: 'border-l-4 border-purple-400',
  };

  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${urgencyColors[urgency]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{auth.child_name}</span>
            <Badge variant="outline" className="text-xs">
              {AUTH_TYPE_LABELS[auth.auth_type]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{auth.parent_name}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 flex-wrap">
            {submittedDaysAgo !== null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Submitted {submittedDaysAgo}d ago
              </span>
            )}
            <span className={daysLeft < 0 ? 'text-red-600 font-medium' : daysLeft <= 7 ? 'text-orange-600 font-medium' : ''}>
              Expires: {new Date(auth.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {daysLeft < 0 && ` (${Math.abs(daysLeft)}d overdue)`}
              {daysLeft >= 0 && ` (${daysLeft}d left)`}
            </span>
          </div>
          {auth.notes && (
            <p className="text-xs text-gray-500 mt-1 italic">{auth.notes}</p>
          )}
        </div>
        {auth.status === 'renewal_pending' && (
          <Button
            size="sm"
            onClick={() => onMarkApproved(auth.id)}
            className="bg-[#4CAF50] hover:bg-green-700 text-white h-8 text-xs flex-shrink-0"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark Approved
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function RenewalTracker() {
  const [stats, setStats] = useState<RenewalStats | null>(null);
  const [activeRenewals, setActiveRenewals] = useState<ChildAuthorization[]>([]);
  const [overdueRenewals, setOverdueRenewals] = useState<ChildAuthorization[]>([]);

  function load() {
    const all = getAuthorizations();
    setStats(getRenewalStats());
    setActiveRenewals(
      all.filter((a) => a.status === 'renewal_pending').sort(
        (a, b) => getDaysRemaining(a.end_date) - getDaysRemaining(b.end_date)
      )
    );
    setOverdueRenewals(
      all
        .filter((a) => (a.status === 'expiring_soon' || a.status === 'expired') && !a.renewal_submitted_at)
        .sort((a, b) => getDaysRemaining(a.end_date) - getDaysRemaining(b.end_date))
    );
  }

  useEffect(() => {
    load();
  }, []);

  const handleMarkApproved = (id: string) => {
    updateAuthorization(id, {
      renewal_approved_at: new Date().toISOString(),
    });
    load();
  };

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Avg Processing Time"
          value={`${stats.avgProcessingDays} days`}
          sub="submission to approval"
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatTile
          label="Revenue at Risk"
          value={`$${stats.revenueAtRisk.toLocaleString()}`}
          sub={`${stats.expired} expired × $1,200/mo`}
          icon={<TrendingDown className="h-5 w-5" />}
          iconBg="bg-red-100 text-red-600"
          valueColor={stats.revenueAtRisk > 0 ? 'text-red-600' : 'text-gray-900'}
        />
        <StatTile
          label="Completed This Month"
          value={String(stats.monthlyRenewalsCompleted)}
          sub="renewals approved"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-green-100 text-green-600"
          valueColor="text-green-700"
        />
        <StatTile
          label="Overdue Renewals"
          value={String(stats.monthlyRenewalsOverdue)}
          sub="no submission yet"
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-orange-100 text-orange-600"
          valueColor={stats.monthlyRenewalsOverdue > 0 ? 'text-orange-600' : 'text-gray-900'}
        />
      </div>

      {/* Active Renewals In Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-purple-600" />
            Renewals In Progress
            {activeRenewals.length > 0 && (
              <Badge className="bg-purple-100 text-purple-800 ml-1">
                {activeRenewals.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRenewals.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No renewals currently in processing.
            </p>
          ) : (
            <div className="space-y-3">
              {activeRenewals.map((auth) => (
                <RenewalRow key={auth.id} auth={auth} onMarkApproved={handleMarkApproved} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue: Need Renewal Started */}
      {overdueRenewals.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              Needs Renewal Started
              <Badge className="bg-orange-100 text-orange-800 ml-1">
                {overdueRenewals.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueRenewals.map((auth) => (
                <div key={auth.id} className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{auth.child_name}</p>
                    <p className="text-xs text-gray-500">{auth.parent_name} &bull; {AUTH_TYPE_LABELS[auth.auth_type]}</p>
                    <p className="text-xs text-orange-700 mt-1 font-medium">
                      {getDaysRemaining(auth.end_date) < 0
                        ? `Expired ${Math.abs(getDaysRemaining(auth.end_date))} days ago`
                        : `Expires in ${getDaysRemaining(auth.end_date)} days`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateAuthorization(auth.id, {
                        renewal_submitted_at: new Date().toISOString(),
                      });
                      load();
                    }}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 h-8 text-xs flex-shrink-0"
                  >
                    Submit Renewal
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
