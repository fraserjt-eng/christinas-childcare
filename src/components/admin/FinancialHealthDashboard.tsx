'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { FinancialRecord, FinancialHealth, getFinancialRecords, getFinancialHealth } from '@/lib/financial-storage';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function totalRevenue(r: FinancialRecord): number {
  return r.revenue_tuition + r.revenue_cacfp + r.revenue_other;
}

function totalExpenses(r: FinancialRecord): number {
  return r.expenses_labor + r.expenses_supplies + r.expenses_fixed + r.expenses_other;
}

function formatMonth(yyyymm: string): string {
  return new Date(yyyymm + '-01').toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export function FinancialHealthDashboard() {
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);

  useEffect(() => {
    getFinancialHealth().then(setHealth);
    getFinancialRecords().then(setRecords);
  }, []);

  if (!health || records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          Loading financial data...
        </CardContent>
      </Card>
    );
  }

  const last = records[records.length - 1];
  const prev = records[records.length - 2];

  const lastRevenue = last ? totalRevenue(last) : 0;
  const prevRevenue = prev ? totalRevenue(prev) : 0;
  const lastExpenses = last ? totalExpenses(last) : 0;
  const prevExpenses = prev ? totalExpenses(prev) : 0;
  const revenueChange = prevRevenue > 0 ? ((lastRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const expenseChange = prevExpenses > 0 ? ((lastExpenses - prevExpenses) / prevExpenses) * 100 : 0;

  const kpis = [
    {
      label: 'Avg Monthly Revenue',
      value: formatCurrency(health.avg_monthly_revenue),
      sub: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% last month`,
      trend: revenueChange >= 0,
      icon: DollarSign,
      color: 'text-christina-green',
    },
    {
      label: 'Avg Monthly Expenses',
      value: formatCurrency(health.avg_monthly_expenses),
      sub: `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% last month`,
      trend: expenseChange < 0, // lower is better
      icon: TrendingDown,
      color: expenseChange < 0 ? 'text-christina-green' : 'text-christina-coral',
    },
    {
      label: 'Operating Margin',
      value: `${health.avg_operating_margin}%`,
      sub: health.avg_operating_margin >= 15 ? 'Target: 15%+' : 'Below 15% target',
      trend: health.avg_operating_margin >= 15,
      icon: TrendingUp,
      color: health.avg_operating_margin >= 15 ? 'text-christina-green' : 'text-christina-coral',
    },
    {
      label: 'Break-even Enrollment',
      value: `${health.break_even_enrollment} children`,
      sub: `Revenue/child: ${formatCurrency(health.revenue_per_child)}/mo`,
      trend: true,
      icon: Users,
      color: 'text-christina-blue',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {health.alerts.length > 0 && (
        <div className="space-y-2">
          {health.alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.type === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {alert.type === 'danger' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />}
              {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />}
              {alert.type === 'info' && <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />}
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {kpi.trend ? (
                    <TrendingUp className="h-3 w-3 text-christina-green" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-christina-coral" />
                  )}
                  {kpi.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Per-child metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-christina-blue" />
            Per-Child Economics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-1">
              <p className="text-xs text-muted-foreground">Revenue per child</p>
              <p className="text-2xl font-bold text-christina-blue">
                {formatCurrency(health.revenue_per_child)}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 space-y-1">
              <p className="text-xs text-muted-foreground">Cost per child</p>
              <p className="text-2xl font-bold text-christina-red">
                {formatCurrency(health.cost_per_child)}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-100 space-y-1">
              <p className="text-xs text-muted-foreground">Contribution margin</p>
              <p className="text-2xl font-bold text-christina-green">
                {formatCurrency(health.revenue_per_child - health.cost_per_child)}
              </p>
              <p className="text-xs text-muted-foreground">per child per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month-over-month table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Month-over-Month Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium py-2 pr-4">Month</th>
                  <th className="text-right font-medium py-2 px-4">Revenue</th>
                  <th className="text-right font-medium py-2 px-4">Expenses</th>
                  <th className="text-right font-medium py-2 px-4">Net</th>
                  <th className="text-right font-medium py-2 pl-4">Margin</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => {
                  const rev = totalRevenue(r);
                  const exp = totalExpenses(r);
                  const net = rev - exp;
                  const margin = rev > 0 ? Math.round((net / rev) * 10) / 10 : 0;
                  const prevR = records[i - 1];
                  const revChange = prevR
                    ? ((rev - totalRevenue(prevR)) / totalRevenue(prevR)) * 100
                    : null;
                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/20">
                      <td className="py-2 pr-4 font-medium">{formatMonth(r.month)}</td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {formatCurrency(rev)}
                          {revChange !== null && (
                            <Badge
                              className={`text-xs ml-1 ${
                                revChange >= 0
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                              } border`}
                            >
                              {revChange >= 0 ? '+' : ''}
                              {revChange.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right text-muted-foreground">
                        {formatCurrency(exp)}
                      </td>
                      <td className={`py-2 px-4 text-right font-medium ${net >= 0 ? 'text-christina-green' : 'text-christina-coral'}`}>
                        {net >= 0 ? '+' : ''}{formatCurrency(net)}
                      </td>
                      <td className="py-2 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {margin >= 0 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-christina-green" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-christina-coral" />
                          )}
                          <span className={margin >= 10 ? 'text-christina-green' : 'text-christina-coral'}>
                            {margin}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
