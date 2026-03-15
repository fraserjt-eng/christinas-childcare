'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileCheck, Phone, Clock, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  INCIDENT_TYPE_LABELS,
  SEVERITY_LABELS,
  getIncidentStats,
  getWeeklyTrend,
  getComplianceReport,
} from '@/lib/incident-log-storage';

const TYPE_COLORS = ['#C62828', '#FF7043', '#9C27B0', '#2196F3', '#607D8B'];
const SEVERITY_COLORS: Record<string, string> = {
  minor: '#4CAF50',
  moderate: '#FFD54F',
  serious: '#C62828',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow p-2 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function IncidentAnalytics() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getIncidentStats>> | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<{ week: string; count: number }[]>([]);
  const [compliance, setCompliance] = useState<Awaited<ReturnType<typeof getComplianceReport>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 56); // 8 weeks
      const [statsData, trendData, complianceData] = await Promise.all([
        getIncidentStats(
          startDate.toISOString().split('T')[0],
          now.toISOString().split('T')[0]
        ),
        getWeeklyTrend(),
        getComplianceReport(),
      ]);
      setStats(statsData);
      setWeeklyTrend(trendData);
      setCompliance(complianceData);
      setLoading(false);
    }
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats || !compliance) return null;

  const typeChartData = Object.entries(stats.by_type)
    .map(([key, count]) => ({
      name: INCIDENT_TYPE_LABELS[key as keyof typeof INCIDENT_TYPE_LABELS],
      count,
    }))
    .filter((d) => d.count > 0);

  const severityPieData = Object.entries(stats.by_severity)
    .map(([key, count]) => ({
      name: SEVERITY_LABELS[key as keyof typeof SEVERITY_LABELS],
      value: count,
      color: SEVERITY_COLORS[key],
    }))
    .filter((d) => d.value > 0);

  const classroomData = Object.entries(stats.by_classroom)
    .map(([name, count]) => ({ name: name.replace(/ \(.*\)/, ''), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const timeOfDayData = [
    { period: 'Morning', count: stats.by_time_of_day.morning },
    { period: 'Afternoon', count: stats.by_time_of_day.afternoon },
  ];

  return (
    <div className="space-y-6">
      {/* Compliance summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileCheck className="h-6 w-6 mx-auto mb-1 text-[#2196F3]" />
            <p className="text-2xl font-bold">{compliance.fully_documented_pct}%</p>
            <p className="text-xs text-muted-foreground">Documentation Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold">{compliance.parent_notified_pct}%</p>
            <p className="text-xs text-muted-foreground">Parent Notification Rate</p>
          </CardContent>
        </Card>
        <Card
          className={
            compliance.overdue_notifications > 0
              ? 'border-red-300 bg-red-50/30'
              : ''
          }
        >
          <CardContent className="p-4 text-center">
            <Clock
              className={`h-6 w-6 mx-auto mb-1 ${
                compliance.overdue_notifications > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            />
            <p
              className={`text-2xl font-bold ${
                compliance.overdue_notifications > 0 ? 'text-red-700' : ''
              }`}
            >
              {compliance.overdue_notifications}
            </p>
            <p className="text-xs text-muted-foreground">Overdue Notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-[#C62828]" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Incidents (8 weeks)</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incidents Per Week (Last 8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Incidents"
                stroke="#C62828"
                strokeWidth={2}
                dot={{ fill: '#C62828', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Type and severity side-by-side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Incident Type</CardTitle>
          </CardHeader>
          <CardContent>
            {typeChartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
                    {typeChartData.map((_, index) => (
                      <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Severity</CardTitle>
          </CardHeader>
          <CardContent>
            {severityPieData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No data</p>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={severityPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {severityPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 flex-wrap justify-center mt-2">
                  {severityPieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Classroom breakdown */}
      {classroomData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={classroomData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Incidents" fill="#2196F3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Time of day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time of Day Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {timeOfDayData.map((d) => {
              const total = stats.by_time_of_day.morning + stats.by_time_of_day.afternoon;
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={d.period} className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold">{d.count}</p>
                  <p className="text-sm font-medium mt-1">{d.period}</p>
                  <p className="text-xs text-muted-foreground">{pct}% of incidents</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Total incidents on record</span>
            <span className="font-medium">{compliance.total_incidents}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Fully documented</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2196F3] rounded-full"
                  style={{ width: `${compliance.fully_documented_pct}%` }}
                />
              </div>
              <Badge
                className={
                  compliance.fully_documented_pct >= 90
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }
              >
                {compliance.fully_documented_pct}%
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Parent notification rate</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${compliance.parent_notified_pct}%` }}
                />
              </div>
              <Badge
                className={
                  compliance.parent_notified_pct >= 90
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }
              >
                {compliance.parent_notified_pct}%
              </Badge>
            </div>
          </div>
          {compliance.follow_up_pending > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-700">Follow-ups pending</span>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                {compliance.follow_up_pending}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
