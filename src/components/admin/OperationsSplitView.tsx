'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  AlertTriangle,
  MessageSquare,
  Package,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';

// ─── Demo seed data ───────────────────────────────────────────────────────────
interface CenterStatus {
  id: string;
  name: string;
  address: string;
  attendance: { present: number; enrolled: number };
  staff: { onDuty: number; total: number };
  /** children per staff member */
  ratio: number;
  /** legal max ratio for this license type */
  maxRatio: number;
  openIncidents: number;
  pendingMessages: number;
  supplyRequests: number;
}

const SEED_CENTERS: CenterStatus[] = [
  {
    id: 'center_1',
    name: 'Crystal Center',
    address: '5510 W Broadway Ave, Crystal',
    attendance: { present: 42, enrolled: 50 },
    staff: { onDuty: 6, total: 7 },
    ratio: 7,
    maxRatio: 10,
    openIncidents: 1,
    pendingMessages: 4,
    supplyRequests: 2,
  },
  {
    id: 'center_2',
    name: 'Brooklyn Park Center',
    address: '7301 Brooklyn Blvd, Brooklyn Park',
    attendance: { present: 35, enrolled: 40 },
    staff: { onDuty: 5, total: 5 },
    ratio: 7,
    maxRatio: 10,
    openIncidents: 0,
    pendingMessages: 2,
    supplyRequests: 3,
  },
];

// ─── Threshold helpers ────────────────────────────────────────────────────────

type StatusColor = 'green' | 'yellow' | 'red';

function ratioStatus(ratio: number, max: number): StatusColor {
  if (ratio <= max * 0.7) return 'green';
  if (ratio <= max * 0.9) return 'yellow';
  return 'red';
}

function attendanceStatus(present: number, enrolled: number): StatusColor {
  const pct = present / enrolled;
  if (pct >= 0.95) return 'yellow'; // very full
  if (pct >= 0.7) return 'green';
  return 'yellow';
}

function incidentStatus(count: number): StatusColor {
  if (count === 0) return 'green';
  if (count <= 2) return 'yellow';
  return 'red';
}

const STATUS_ICON = {
  green:  <CheckCircle2 className="h-4 w-4 text-green-600" />,
  yellow: <AlertCircle className="h-4 w-4 text-amber-500" />,
  red:    <XCircle className="h-4 w-4 text-red-600" />,
};

const STATUS_VALUE_CLASS = {
  green:  'text-green-700',
  yellow: 'text-amber-600',
  red:    'text-red-700 font-bold',
};

// ─── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({
  icon,
  label,
  value,
  sub,
  status = 'green',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  status?: StatusColor;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className={`text-sm font-semibold ${STATUS_VALUE_CLASS[status]}`}>{value}</span>
          {sub && <span className="text-xs text-muted-foreground block">{sub}</span>}
        </div>
        {STATUS_ICON[status]}
      </div>
    </div>
  );
}

// ─── Center card ─────────────────────────────────────────────────────────────

function CenterCard({ center }: { center: CenterStatus }) {
  const ratioStat = ratioStatus(center.ratio, center.maxRatio);
  const attStat = attendanceStatus(center.attendance.present, center.attendance.enrolled);
  const incStat = incidentStatus(center.openIncidents);

  const overallStatus: StatusColor = [ratioStat, incStat].includes('red')
    ? 'red'
    : [ratioStat, attStat, incStat].includes('yellow')
    ? 'yellow'
    : 'green';

  const headerBorder = {
    green:  'border-green-400',
    yellow: 'border-amber-400',
    red:    'border-red-500',
  }[overallStatus];

  return (
    <Card className={`border-t-4 ${headerBorder} flex-1`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-christina-red" />
              {center.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{center.address}</p>
          </div>
          <Badge
            className={`text-xs ${
              overallStatus === 'green'
                ? 'bg-green-100 text-green-700'
                : overallStatus === 'yellow'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            } border-0`}
          >
            {overallStatus === 'green' ? 'Normal' : overallStatus === 'yellow' ? 'Monitor' : 'Action Needed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 pt-0">
        <StatRow
          icon={<Users className="h-4 w-4" />}
          label="Attendance"
          value={`${center.attendance.present} / ${center.attendance.enrolled}`}
          sub={`${Math.round((center.attendance.present / center.attendance.enrolled) * 100)}% capacity`}
          status={attStat}
        />
        <StatRow
          icon={<Users className="h-4 w-4" />}
          label="Staff on duty"
          value={`${center.staff.onDuty} / ${center.staff.total}`}
          status={center.staff.onDuty < center.staff.total ? 'yellow' : 'green'}
        />
        <StatRow
          icon={<Users className="h-4 w-4" />}
          label="Staff:Child ratio"
          value={`1:${center.ratio}`}
          sub={`Legal max 1:${center.maxRatio}`}
          status={ratioStat}
        />
        <StatRow
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Open incidents"
          value={String(center.openIncidents)}
          status={incStat}
        />
        <StatRow
          icon={<MessageSquare className="h-4 w-4" />}
          label="Pending messages"
          value={String(center.pendingMessages)}
          status={center.pendingMessages > 5 ? 'yellow' : 'green'}
        />
        <StatRow
          icon={<Package className="h-4 w-4" />}
          label="Supply requests"
          value={String(center.supplyRequests)}
          status={center.supplyRequests >= 3 ? 'yellow' : 'green'}
        />
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OperationsSplitView() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Tick seconds-ago counter
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsAgo(Math.round((Date.now() - lastUpdated.getTime()) / 1000));
    }, 5000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  function refresh() {
    setLastUpdated(new Date());
    setSecondsAgo(0);
  }

  const updatedLabel =
    secondsAgo < 60
      ? `Updated ${secondsAgo}s ago`
      : `Updated ${Math.round(secondsAgo / 60)}m ago`;

  return (
    <div className="space-y-4">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          {updatedLabel}
        </p>
        <button
          onClick={refresh}
          className="text-xs text-christina-blue hover:underline flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Side by side cards */}
      <div className="flex flex-col md:flex-row gap-4">
        {SEED_CENTERS.map((center) => (
          <CenterCard key={center.id} center={center} />
        ))}
      </div>

      {/* Demo notice */}
      <p className="text-xs text-muted-foreground text-center">
        Demo data — connect Supabase realtime for live center metrics.
      </p>
    </div>
  );
}
