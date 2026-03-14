'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, AlertTriangle, Users } from 'lucide-react';

// ─── Seed data (past 5 days) ─────────────────────────────────────────────────

function getDayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

const ATTENDANCE_DATA = [4, 3, 2, 1, 0].map((daysAgo) => ({
  day: getDayLabel(daysAgo),
  crystal: 40 + Math.floor(Math.sin(daysAgo) * 4),
  brooklynPark: 33 + Math.floor(Math.cos(daysAgo) * 3),
}));

// Hardcode realistic variation
ATTENDANCE_DATA[0].crystal = 38;
ATTENDANCE_DATA[0].brooklynPark = 30;
ATTENDANCE_DATA[1].crystal = 41;
ATTENDANCE_DATA[1].brooklynPark = 35;
ATTENDANCE_DATA[2].crystal = 44;
ATTENDANCE_DATA[2].brooklynPark = 33;
ATTENDANCE_DATA[3].crystal = 42;
ATTENDANCE_DATA[3].brooklynPark = 36;
ATTENDANCE_DATA[4].crystal = 40;
ATTENDANCE_DATA[4].brooklynPark = 34;

const INCIDENT_DATA = [4, 3, 2, 1, 0].map((daysAgo, i) => ({
  day: getDayLabel(daysAgo),
  crystal:      [0, 1, 0, 1, 0][i],
  brooklynPark: [1, 0, 0, 0, 1][i],
}));

const RATIO_DATA = [4, 3, 2, 1, 0].map((daysAgo, i) => ({
  day: getDayLabel(daysAgo),
  crystal:      [6.3, 6.8, 7.3, 7.0, 6.7][i],
  brooklynPark: [6.6, 7.0, 6.6, 7.2, 6.8][i],
}));

// Stat cards
const CRYSTAL_AVG_RATIO = (RATIO_DATA.reduce((s, d) => s + d.crystal, 0) / RATIO_DATA.length).toFixed(1);
const BKP_AVG_RATIO = (RATIO_DATA.reduce((s, d) => s + d.brooklynPark, 0) / RATIO_DATA.length).toFixed(1);
const CRYSTAL_BEST_DAY = ATTENDANCE_DATA.reduce((best, d) => d.crystal > best.crystal ? d : best).day;
const BKP_BEST_DAY = ATTENDANCE_DATA.reduce((best, d) => d.brooklynPark > best.brooklynPark ? d : best).day;
const CRYSTAL_WORST_DAY = ATTENDANCE_DATA.reduce((worst, d) => d.crystal < worst.crystal ? d : worst).day;
const BKP_WORST_DAY = ATTENDANCE_DATA.reduce((worst, d) => d.brooklynPark < worst.brooklynPark ? d : worst).day;

const CRYSTAL_COLOR = '#C62828';
const BKP_COLOR = '#2196F3';

const CUSTOM_TOOLTIP_STYLE = {
  fontSize: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

export function CenterTrends() {
  return (
    <div className="space-y-4">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Crystal avg ratio</p>
            <p className="text-xl font-bold">1:{CRYSTAL_AVG_RATIO}</p>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Brooklyn Park avg ratio</p>
            <p className="text-xl font-bold">1:{BKP_AVG_RATIO}</p>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Crystal attendance</p>
            <p className="text-xs font-semibold text-green-600">Best: {CRYSTAL_BEST_DAY}</p>
            <p className="text-xs font-semibold text-amber-600">Low: {CRYSTAL_WORST_DAY}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">BKP attendance</p>
            <p className="text-xs font-semibold text-green-600">Best: {BKP_BEST_DAY}</p>
            <p className="text-xs font-semibold text-amber-600">Low: {BKP_WORST_DAY}</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-christina-blue" />
            Attendance — Past 5 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ATTENDANCE_DATA} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="crystal"
                name="Crystal"
                stroke={CRYSTAL_COLOR}
                strokeWidth={2}
                dot={{ r: 4, fill: CRYSTAL_COLOR }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="brooklynPark"
                name="Brooklyn Park"
                stroke={BKP_COLOR}
                strokeWidth={2}
                dot={{ r: 4, fill: BKP_COLOR }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Incidents bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Incidents — Past 5 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={INCIDENT_DATA} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="crystal" name="Crystal" fill={CRYSTAL_COLOR} radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="brooklynPark" name="Brooklyn Park" fill={BKP_COLOR} radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ratio trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-christina-green" />
            Staff:Child Ratio — Past 5 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={RATIO_DATA} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[5, 10]} />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`1:${value}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="crystal"
                name="Crystal"
                stroke={CRYSTAL_COLOR}
                strokeWidth={2}
                dot={{ r: 3, fill: CRYSTAL_COLOR }}
              />
              <Line
                type="monotone"
                dataKey="brooklynPark"
                name="Brooklyn Park"
                stroke={BKP_COLOR}
                strokeWidth={2}
                dot={{ r: 3, fill: BKP_COLOR }}
              />
              {/* Legal limit reference line via annotation */}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-1">Legal max ratio: 1:10</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Demo data — connect Supabase for live historical metrics.
      </p>
    </div>
  );
}
