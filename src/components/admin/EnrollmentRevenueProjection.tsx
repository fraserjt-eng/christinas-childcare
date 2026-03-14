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
import { DollarSign, Users, TrendingUp, Target } from 'lucide-react';
import {
  RevenueProjection,
  STAGE_PROBABILITY,
  STAGE_ORDER,
  getRevenueProjection,
} from '@/lib/enrollment-pipeline-storage';

const AVG_MONTHLY_RATE = 1350;

// Stage colors for bar chart, matching funnel gradient
const STAGE_BAR_COLORS = [
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
  payload?: Array<{ value: any }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-600">${(payload[0].value as number).toLocaleString()} projected</p>
    </div>
  );
}

// ─── Capacity Gauge ───────────────────────────────────────────────────

function CapacityGauge({ current, capacity }: { current: number; capacity: number }) {
  const pct = Math.min(100, Math.round((current / capacity) * 100));
  const barColor =
    pct >= 95 ? '#4CAF50' : pct >= 80 ? '#2196F3' : pct >= 60 ? '#FFD54F' : '#FF7043';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Enrollment vs Capacity</span>
        <span className="font-semibold">
          {current} / {capacity}
          <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span>{capacity} capacity</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function EnrollmentRevenueProjection() {
  const [projection, setProjection] = useState<RevenueProjection | null>(null);

  useEffect(() => {
    setProjection(getRevenueProjection(AVG_MONTHLY_RATE));
  }, []);

  if (!projection) return null;

  const currentMonthlyRevenue = projection.currentEnrollment * AVG_MONTHLY_RATE;
  const totalPipelineValue = projection.totalProjected;

  // Chart data: exclude active stage from "pipeline" bar chart; include all for context
  const chartData = projection.byStage.map((s, idx) => ({
    name: s.label,
    projected: s.projected,
    count: s.count,
    probability: Math.round(STAGE_PROBABILITY[s.stage] * 100),
    color: STAGE_BAR_COLORS[idx],
  }));

  const summaryStats = [
    {
      label: 'Current Monthly Revenue',
      value: `$${currentMonthlyRevenue.toLocaleString()}`,
      sub: `${projection.currentEnrollment} enrolled × $${AVG_MONTHLY_RATE.toLocaleString()}/mo`,
      icon: <DollarSign className="h-5 w-5" />,
      iconBg: 'bg-green-100 text-green-600',
      valueColor: 'text-green-700',
    },
    {
      label: 'Pipeline Value',
      value: `$${totalPipelineValue.toLocaleString()}`,
      sub: 'probability-weighted projection',
      icon: <TrendingUp className="h-5 w-5" />,
      iconBg: 'bg-blue-100 text-blue-600',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Open Slots',
      value: String(projection.openSlots),
      sub: `of ${projection.capacity} total capacity`,
      icon: <Target className="h-5 w-5" />,
      iconBg: projection.openSlots > 5 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600',
      valueColor: projection.openSlots > 5 ? 'text-yellow-700' : 'text-green-700',
    },
    {
      label: 'Revenue at Full Capacity',
      value: `$${(projection.capacity * AVG_MONTHLY_RATE).toLocaleString()}`,
      sub: `$${((projection.capacity - projection.currentEnrollment) * AVG_MONTHLY_RATE).toLocaleString()} gap to close`,
      icon: <Users className="h-5 w-5" />,
      iconBg: 'bg-purple-100 text-purple-600',
      valueColor: 'text-purple-700',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-xl font-bold ${stat.valueColor}`}>{stat.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Capacity gauge */}
      <Card>
        <CardContent className="pt-5">
          <CapacityGauge
            current={projection.currentEnrollment}
            capacity={projection.capacity}
          />
        </CardContent>
      </Card>

      {/* Pipeline value bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pipeline Value by Stage
          </CardTitle>
          <p className="text-xs text-gray-500">
            Projected revenue = leads in stage &times; stage probability &times; ${AVG_MONTHLY_RATE.toLocaleString()}/mo
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={45} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="projected" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed stage table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Stage-by-Stage Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Stage</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Leads</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Probability</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Projected Value</th>
              </tr>
            </thead>
            <tbody>
              {projection.byStage.map((row, idx) => (
                <tr key={row.stage} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STAGE_BAR_COLORS[idx] || '#C62828' }}
                      />
                      <span className="font-medium text-gray-800">{row.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{row.count}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      className={`text-xs ${
                        STAGE_ORDER.indexOf(row.stage) >= 5
                          ? 'bg-green-100 text-green-800'
                          : STAGE_ORDER.indexOf(row.stage) >= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {Math.round(STAGE_PROBABILITY[row.stage] * 100)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    ${row.projected.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 text-gray-900">Total Pipeline</td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {projection.byStage.reduce((sum, r) => sum + r.count, 0)}
                </td>
                <td />
                <td className="px-4 py-3 text-right text-[#C62828]">
                  ${projection.totalProjected.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
