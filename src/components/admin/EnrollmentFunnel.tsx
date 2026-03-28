'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, ArrowRight, Clock } from 'lucide-react';
import {
  FunnelStat,
  getFunnelStats,
} from '@/lib/enrollment-pipeline-storage';

// Gradient from light coral to deep red as stages progress
const STAGE_COLORS = [
  '#FFCDD2',
  '#EF9A9A',
  '#E57373',
  '#EF5350',
  '#F44336',
  '#C62828',
  '#4CAF50',
];

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ value: any; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-600">{payload[0].value} leads</p>
    </div>
  );
}

// ─── Conversion Arrow ─────────────────────────────────────────────────

function ConversionBadge({ rate }: { rate: number | null }) {
  if (rate === null) return null;
  const color =
    rate >= 70 ? 'bg-green-100 text-green-800' :
    rate >= 40 ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      <ArrowRight className="h-3 w-3" />
      {rate}%
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function EnrollmentFunnel() {
  const [stats, setStats] = useState<FunnelStat[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getFunnelStats();
      setStats(data);
    };
    load();
  }, []);

  const chartData = stats.map((s) => ({
    name: s.label,
    count: s.count,
    avgDays: s.avgDaysInStage,
  }));

  const totalLeads = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-[#C62828]">{totalLeads}</p>
          <p className="text-sm text-gray-600 mt-1">Total in Pipeline</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {stats.find((s) => s.stage === 'active')?.count ?? 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Active Students</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {(stats.find((s) => s.stage === 'enrolled')?.count ?? 0) +
              (stats.find((s) => s.stage === 'active')?.count ?? 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Enrolled + Active</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {stats.find((s) => s.stage === 'waitlist')?.count ?? 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">On Waitlist</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pipeline by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={STAGE_COLORS[index] || '#C62828'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage-by-stage breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage Conversion & Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.map((stat, idx) => (
              <div
                key={stat.stage}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[idx] || '#C62828' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-800">{stat.label}</span>
                    {stat.conversionFromPrev !== null && (
                      <ConversionBadge rate={stat.conversionFromPrev} />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Avg {stat.avgDaysInStage}d in stage
                    </span>
                  </div>
                </div>
                <Badge className="bg-gray-200 text-gray-800 text-sm font-bold px-3">
                  {stat.count}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Conversion rate shows leads advancing from prior stage. Active stage represents enrolled children.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
