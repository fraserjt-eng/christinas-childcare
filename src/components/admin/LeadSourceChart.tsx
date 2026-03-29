'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Trophy, TrendingUp } from 'lucide-react';
import {
  LeadSourceStat,
  getLeadSourceStats,
} from '@/lib/enrollment-pipeline-storage';

const SOURCE_COLORS: Record<string, string> = {
  website: '#2196F3',
  referral: '#4CAF50',
  drive_by: '#FFD54F',
  social_media: '#C62828',
  other: '#9E9E9E',
};

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ name: string; value: any; payload: { source: string; conversionRate: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-gray-800">{item.name}</p>
      <p className="text-gray-600">{item.value} leads</p>
      <p className="text-gray-500">Conversion: {item.payload.conversionRate}%</p>
    </div>
  );
}

export function LeadSourceChart() {
  const [stats, setStats] = useState<LeadSourceStat[]>([]);

  useEffect(() => {
    getLeadSourceStats().then(setStats);
  }, []);

  const nonEmpty = stats.filter((s) => s.count > 0);

  const pieData = nonEmpty.map((s) => ({
    name: s.label,
    value: s.count,
    source: s.source,
    conversionRate: s.conversionRate,
  }));

  const best = nonEmpty.reduce<LeadSourceStat | null>((top, s) => {
    if (s.count === 0) return top;
    if (!top) return s;
    return s.conversionRate > top.conversionRate ? s : top;
  }, null);

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leads by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={SOURCE_COLORS[entry.source] || '#9E9E9E'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Best performer callout */}
      {best && best.count > 0 && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Best converting source: {best.label}
            </p>
            <p className="text-xs text-green-600">
              {best.conversionRate}% conversion rate &bull; {best.converted} of {best.count} leads enrolled
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Source Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Source</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Leads</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Share</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Conversion</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.source} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SOURCE_COLORS[stat.source] || '#9E9E9E' }}
                      />
                      <span className="font-medium text-gray-800">{stat.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{stat.count}</td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {total > 0 ? Math.round((stat.count / total) * 100) : 0}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-medium ${
                        stat.conversionRate >= 60 ? 'text-green-700' :
                        stat.conversionRate >= 30 ? 'text-yellow-700' :
                        'text-red-600'
                      }`}
                    >
                      {stat.conversionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {best && stat.source === best.source && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Top Performer
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
