'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, Clock, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
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
import {
  getLaborCost,
  getOvertimeAlerts,
  type LaborCostDay,
  type EmployeeCostSummary,
  type OvertimeAlert,
} from '@/lib/schedule-optimizer-storage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(offset: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diff + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-[#C62828]">Cost: <span className="font-bold">{formatCurrency(payload[0]?.value || 0)}</span></p>
      <p className="text-gray-600">Hours: <span className="font-medium">{(payload[1]?.value || 0).toFixed(1)}h</span></p>
    </div>
  );
}

// ─── Overtime Alert Row ───────────────────────────────────────────────────────

function OvertimeAlertRow({ alert }: { alert: OvertimeAlert }) {
  const pct = Math.min(100, (alert.weekly_hours / 50) * 100);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        alert.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100'
      }`}>
        <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-800 truncate">{alert.employee_name}</p>
          <span className={`text-xs font-bold ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
            {alert.weekly_hours.toFixed(1)}h
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {alert.weekly_hours >= alert.threshold
            ? `${(alert.weekly_hours - alert.threshold).toFixed(1)}h over 40h`
            : `${(alert.threshold - alert.weekly_hours).toFixed(1)}h until overtime`}
        </p>
      </div>
    </div>
  );
}

// ─── Employee Cost Row ────────────────────────────────────────────────────────

function EmployeeCostRow({ emp }: { emp: EmployeeCostSummary }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{emp.employee_name}</p>
        <p className="text-xs text-gray-500">{emp.total_hours.toFixed(1)}h scheduled</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-800">{formatCurrency(emp.total_cost)}</p>
        {emp.overtime_hours > 0 && (
          <p className="text-xs text-amber-600">{emp.overtime_hours.toFixed(1)}h OT</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LaborCostProjection() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dailyCosts, setDailyCosts] = useState<LaborCostDay[]>([]);
  const [employeeCosts, setEmployeeCosts] = useState<EmployeeCostSummary[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [overtimeAlerts, setOvertimeAlerts] = useState<OvertimeAlert[]>([]);

  const monday = getMondayOfWeek(weekOffset);

  const loadData = useCallback(() => {
    const start = monday.toISOString().slice(0, 10);
    const endDate = new Date(monday);
    endDate.setDate(monday.getDate() + 4);
    const end = endDate.toISOString().slice(0, 10);

    const data = getLaborCost(start, end);
    setDailyCosts(data.daily);
    setEmployeeCosts(data.by_employee);
    setTotalCost(data.total_cost);
    setTotalHours(data.total_hours);

    setOvertimeAlerts(getOvertimeAlerts(start));
  }, [monday]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weekLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }`;

  const monthProjection = totalCost * 4.33;

  return (
    <div className="space-y-5">
      {/* Week nav */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w - 1)} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-gray-800 min-w-52 text-center">{weekLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w + 1)} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
            This Week
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="bg-[#C62828]/5 border-[#C62828]/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-[#C62828]" />
              <p className="text-xs font-medium text-gray-600">Weekly Labor Cost</p>
            </div>
            <p className="text-2xl font-bold text-[#C62828]">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#2196F3]" />
              <p className="text-xs font-medium text-gray-600">Total Hours</p>
            </div>
            <p className="text-2xl font-bold text-[#2196F3]">{totalHours.toFixed(0)}h</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <p className="text-xs font-medium text-gray-600">Month Projection</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(monthProjection)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Based on this week x 4.33</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Daily Labor Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyCosts} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day_label"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]} name="Cost">
                {dailyCosts.map((entry, index) => (
                  <Cell key={index} fill={entry.cost > 0 ? '#C62828' : '#e5e7eb'} opacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} name="Hours" hide />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overtime alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Overtime Alerts
              {overtimeAlerts.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs ml-1">
                  {overtimeAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {overtimeAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No overtime concerns this week.</p>
            ) : (
              overtimeAlerts.map(alert => (
                <OvertimeAlertRow key={alert.employee_id} alert={alert} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Per-employee costs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#C62828]" />
              Cost by Employee
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 max-h-64 overflow-y-auto">
            {employeeCosts.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No shifts scheduled this week.</p>
            ) : (
              employeeCosts.map(emp => (
                <EmployeeCostRow key={emp.employee_id} emp={emp} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
