'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { FinancialRecord, getFinancialRecords } from '@/lib/financial-storage';

function formatMonth(yyyymm: string): string {
  return new Date(yyyymm + '-01').toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

function formatCurrencyShort(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

function buildChartData(records: FinancialRecord[]) {
  return records.map(r => {
    const revenue = r.revenue_tuition + r.revenue_cacfp + r.revenue_other;
    const expenses = r.expenses_labor + r.expenses_supplies + r.expenses_fixed + r.expenses_other;
    const net = revenue - expenses;
    return {
      month: formatMonth(r.month),
      revenue,
      expenses,
      net,
      tuition: r.revenue_tuition,
      cacfp: r.revenue_cacfp,
      other_rev: r.revenue_other,
      labor: r.expenses_labor,
      supplies: r.expenses_supplies,
      fixed: r.expenses_fixed,
      other_exp: r.expenses_other,
    };
  });
}

export function CashFlowChart() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);

  useEffect(() => {
    getFinancialRecords().then(setRecords);
  }, []);

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          Loading financial data...
        </CardContent>
      </Card>
    );
  }

  const data = buildChartData(records);

  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  };

  return (
    <div className="space-y-5">
      {/* Revenue vs expenses area chart with net income line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-christina-red" />
            Revenue vs. Expenses — 6-Month Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={formatCurrencyShort}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#4CAF50"
                  fill="#4CAF50"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#C62828"
                  fill="#C62828"
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net Income"
                  stroke="#2196F3"
                  strokeWidth={2.5}
                  dot={{ fill: '#2196F3', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue breakdown stacked bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrencyShort} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="tuition" name="Tuition" stackId="rev" fill="#4CAF50" />
                <Bar dataKey="cacfp" name="CACFP" stackId="rev" fill="#8BC34A" />
                <Bar dataKey="other_rev" name="Other" stackId="rev" fill="#C8E6C9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expense breakdown stacked bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrencyShort} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="labor" name="Labor" stackId="exp" fill="#C62828" />
                <Bar dataKey="fixed" name="Fixed" stackId="exp" fill="#FF7043" />
                <Bar dataKey="supplies" name="Supplies" stackId="exp" fill="#FFD54F" />
                <Bar dataKey="other_exp" name="Other" stackId="exp" fill="#FFECB3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
