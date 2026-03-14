'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, Trash2, Save, BarChart3 } from 'lucide-react';
import {
  RevenueScenario,
  getScenarios,
  createScenario,
  deleteScenario,
  calculateProjection,
  getFinancialRecords,
} from '@/lib/financial-storage';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const BASELINE_ENROLLMENT = 90;
const BASELINE_RATE = 510; // dollars per child per month

export function ScenarioModeler() {
  const [scenarios, setScenarios] = useState<RevenueScenario[]>([]);
  const [enrollmentChange, setEnrollmentChange] = useState(0);
  const [rateChange, setRateChange] = useState(0);
  const [scenarioName, setScenarioName] = useState('');
  const [saving, setSaving] = useState(false);
  const [baselineRevenue, setBaselineRevenue] = useState(0);

  const projection = calculateProjection(
    BASELINE_ENROLLMENT,
    BASELINE_RATE,
    enrollmentChange,
    rateChange
  );

  const baseline = calculateProjection(BASELINE_ENROLLMENT, BASELINE_RATE, 0, 0);

  useEffect(() => {
    getScenarios().then(setScenarios);
    // Get latest actual revenue as baseline reference
    getFinancialRecords().then(records => {
      if (records.length > 0) {
        const last = records[records.length - 1];
        setBaselineRevenue(last.revenue_tuition + last.revenue_cacfp + last.revenue_other);
      }
    });
  }, []);

  async function handleSave() {
    if (!scenarioName.trim()) return;
    setSaving(true);
    await createScenario({
      name: scenarioName.trim(),
      enrollment_change: enrollmentChange,
      rate_change: rateChange,
      projected_revenue: projection.projected_revenue,
      projected_expenses: projection.projected_expenses,
      projected_margin: projection.projected_margin,
    });
    const updated = await getScenarios();
    setScenarios(updated.slice(0, 3)); // cap at 3 for comparison
    setScenarioName('');
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteScenario(id);
    const updated = await getScenarios();
    setScenarios(updated);
  }

  function AdjustControl({
    label,
    value,
    onChange,
    min,
    max,
    step,
    prefix,
    suffix,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step: number;
    prefix?: string;
    suffix?: string;
  }) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">{label}</Label>
          <span className="text-sm font-semibold">
            {value === 0 ? (
              <span className="text-muted-foreground">No change</span>
            ) : value > 0 ? (
              <span className="text-christina-green">
                +{prefix}{value}{suffix}
              </span>
            ) : (
              <span className="text-christina-coral">
                {prefix}{value}{suffix}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onChange(Math.max(min, value - step))}
          >
            –
          </Button>
          <div className="flex-1 relative">
            <div
              className="h-2 rounded-full bg-muted"
            >
              <div
                className={`h-full rounded-full transition-all ${
                  value > 0 ? 'bg-christina-green' : value < 0 ? 'bg-christina-coral' : 'bg-muted-foreground'
                }`}
                style={{
                  width: `${((value - min) / (max - min)) * 100}%`,
                }}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onChange(Math.min(max, value + step))}
          >
            +
          </Button>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1 accent-christina-red"
        />
      </div>
    );
  }

  const revenueVsBaseline = projection.projected_revenue - baseline.projected_revenue;
  const marginClass =
    projection.projected_margin >= 15
      ? 'text-christina-green'
      : projection.projected_margin >= 10
      ? 'text-yellow-600'
      : 'text-christina-coral';

  return (
    <div className="space-y-5">
      {/* Builder */}
      <Card className="border-2 border-christina-blue/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-christina-blue" />
            Scenario Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AdjustControl
              label="Enrollment change (children)"
              value={enrollmentChange}
              onChange={setEnrollmentChange}
              min={-5}
              max={10}
              step={1}
              suffix=" children"
            />
            <AdjustControl
              label="Rate change per child"
              value={rateChange}
              onChange={setRateChange}
              min={-50}
              max={100}
              step={5}
              prefix="$"
              suffix="/mo"
            />
          </div>

          {/* Projected metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-center">
              <p className="text-xs text-muted-foreground mb-1">Projected Revenue</p>
              <p className="text-xl font-bold text-christina-green">
                {formatCurrency(projection.projected_revenue)}
              </p>
              <p className={`text-xs mt-1 flex items-center justify-center gap-0.5 ${
                revenueVsBaseline >= 0 ? 'text-christina-green' : 'text-christina-coral'
              }`}>
                {revenueVsBaseline >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {revenueVsBaseline >= 0 ? '+' : ''}{formatCurrency(revenueVsBaseline)} vs baseline
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center">
              <p className="text-xs text-muted-foreground mb-1">Projected Expenses</p>
              <p className="text-xl font-bold text-christina-red">
                {formatCurrency(projection.projected_expenses)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Net: {formatCurrency(projection.projected_revenue - projection.projected_expenses)}
              </p>
            </div>
            <div className={`p-4 rounded-lg border text-center ${
              projection.projected_margin >= 15
                ? 'bg-green-50 border-green-100'
                : projection.projected_margin >= 10
                ? 'bg-yellow-50 border-yellow-100'
                : 'bg-red-50 border-red-100'
            }`}>
              <p className="text-xs text-muted-foreground mb-1">Operating Margin</p>
              <p className={`text-xl font-bold ${marginClass}`}>
                {projection.projected_margin}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Target: 15%</p>
            </div>
          </div>

          {/* Save scenario */}
          <div className="flex gap-2">
            <Input
              placeholder="Scenario name (e.g. &quot;Add 5 infants&quot;)"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={saving || !scenarioName.trim() || scenarios.length >= 3}
              className="bg-christina-blue hover:bg-christina-blue/90"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {scenarios.length >= 3 && (
            <p className="text-xs text-muted-foreground">
              Delete a saved scenario to add another (max 3 for side-by-side comparison).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Baseline */}
      <Card className="border border-muted">
        <CardHeader>
          <CardTitle className="text-base">
            Baseline (current: {BASELINE_ENROLLMENT} children @ {formatCurrency(BASELINE_RATE)}/mo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Revenue</p>
              <p className="font-bold">{formatCurrency(baseline.projected_revenue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expenses</p>
              <p className="font-bold">{formatCurrency(baseline.projected_expenses)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Margin</p>
              <p className="font-bold">{baseline.projected_margin}%</p>
            </div>
          </div>
          {baselineRevenue > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Last month actual revenue: {formatCurrency(baselineRevenue)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Saved scenarios comparison */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Saved Scenarios ({scenarios.length}/3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenarios.map(s => {
                const revDelta = s.projected_revenue - baseline.projected_revenue;
                return (
                  <div key={s.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="font-semibold">{s.name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>
                            Enrollment: {s.enrollment_change >= 0 ? '+' : ''}{s.enrollment_change}
                          </span>
                          <span>
                            Rate: {s.rate_change >= 0 ? '+' : ''}${s.rate_change}/child/mo
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-bold text-sm text-christina-green">
                          {formatCurrency(s.projected_revenue)}
                        </p>
                        <p className={`text-xs ${revDelta >= 0 ? 'text-christina-green' : 'text-christina-coral'}`}>
                          {revDelta >= 0 ? '+' : ''}{formatCurrency(revDelta)}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="text-xs text-muted-foreground">Expenses</p>
                        <p className="font-bold text-sm text-christina-red">
                          {formatCurrency(s.projected_expenses)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Net: {formatCurrency(s.projected_revenue - s.projected_expenses)}
                        </p>
                      </div>
                      <div className={`text-center p-2 rounded ${
                        s.projected_margin >= 15
                          ? 'bg-green-50'
                          : s.projected_margin >= 10
                          ? 'bg-yellow-50'
                          : 'bg-red-50'
                      }`}>
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className={`font-bold text-sm ${
                          s.projected_margin >= 15
                            ? 'text-christina-green'
                            : s.projected_margin >= 10
                            ? 'text-yellow-700'
                            : 'text-christina-coral'
                        }`}>
                          {s.projected_margin}%
                        </p>
                        <Badge
                          className={`text-xs mt-0.5 ${
                            s.projected_margin >= 15
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : s.projected_margin >= 10
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          } border`}
                        >
                          {s.projected_margin >= 15 ? 'Healthy' : s.projected_margin >= 10 ? 'Acceptable' : 'Risk'}
                        </Badge>
                      </div>
                    </div>
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
