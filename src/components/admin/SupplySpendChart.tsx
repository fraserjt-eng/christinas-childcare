'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  SupplyCategory,
  CATEGORY_LABELS,
  getMonthlySpend,
} from '@/lib/supply-inventory-storage';

const CATEGORY_COLORS: Record<SupplyCategory, string> = {
  classroom: '#2196F3',
  cleaning: '#4CAF50',
  food_kitchen: '#FF7043',
  office: '#9C27B0',
  first_aid: '#C62828',
  outdoor: '#FFD54F',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((sum: number, entry: { value: number }) => sum + entry.value, 0);
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm space-y-1">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium">${entry.value.toFixed(0)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t pt-1 mt-1 font-medium">
        <span>Total</span>
        <span>${total.toFixed(0)}</span>
      </div>
    </div>
  );
}

export function SupplySpendChart() {
  const [chartData, setChartData] = useState<Record<string, string | number>[]>([]);
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [totalLastMonth, setTotalLastMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const spend = await getMonthlySpend();

      // Group by month, with each category as a key
      const byMonth: Record<string, Record<string, number>> = {};
      for (const row of spend) {
        if (!byMonth[row.month]) byMonth[row.month] = {};
        byMonth[row.month][CATEGORY_LABELS[row.category]] = row.amount;
      }

      const months = Object.keys(byMonth).sort();
      const formatted = months.map((month) => {
        const d = new Date(month + '-01');
        return {
          month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          ...byMonth[month],
        };
      });

      setChartData(formatted);

      if (months.length >= 2) {
        const lastMonthData = byMonth[months[months.length - 1]] || {};
        const prevMonthData = byMonth[months[months.length - 2]] || {};
        setTotalThisMonth(
          Object.values(lastMonthData).reduce((s, v) => s + v, 0)
        );
        setTotalLastMonth(
          Object.values(prevMonthData).reduce((s, v) => s + v, 0)
        );
      }

      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const delta = totalThisMonth - totalLastMonth;
  const deltaPct = totalLastMonth > 0 ? (delta / totalLastMonth) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${totalThisMonth.toFixed(0)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">vs Last Month</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {delta >= 0 ? '+' : ''}${delta.toFixed(0)}
                  </p>
                  <Badge
                    className={
                      delta <= 0
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                    }
                  >
                    {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stacked bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Spend by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Bar
                  key={key}
                  dataKey={label}
                  stackId="spend"
                  fill={CATEGORY_COLORS[key as SupplyCategory]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category legend with amounts */}
      {chartData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">This Month by Category</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const lastRow = chartData[chartData.length - 1];
                const amount = (lastRow?.[label] as number) || 0;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: CATEGORY_COLORS[key as SupplyCategory] }}
                      />
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                    <span className="font-medium">${amount.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
