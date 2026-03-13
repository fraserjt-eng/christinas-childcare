'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { getMealComplianceSummary } from '@/lib/food-storage';
import { MealComplianceSummary } from '@/types/food';

interface ComplianceSummaryProps {
  month?: string; // YYYY-MM, defaults to current month
}

export function ComplianceSummary({ month }: ComplianceSummaryProps) {
  const [summary, setSummary] = useState<MealComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = month || (() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  })();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getMealComplianceSummary(currentMonth);
      setSummary(data);
      setLoading(false);
    }
    load();
  }, [currentMonth]);

  if (loading || !summary) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const complianceColor =
    summary.compliance_rate >= 90
      ? 'text-christina-green'
      : summary.compliance_rate >= 70
        ? 'text-christina-yellow'
        : 'text-christina-coral';

  const complianceBadge =
    summary.compliance_rate >= 90
      ? 'bg-green-100 text-green-800'
      : summary.compliance_rate >= 70
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Meal Count Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Rate */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">On-time submission rate</p>
            <p className={`text-3xl font-bold ${complianceColor}`}>
              {summary.compliance_rate}%
            </p>
          </div>
          <Badge className={complianceBadge}>
            {summary.compliance_rate >= 90
              ? 'On Track'
              : summary.compliance_rate >= 70
                ? 'Needs Attention'
                : 'At Risk'}
          </Badge>
        </div>

        <Progress value={summary.compliance_rate} className="h-2" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-700">{summary.on_time_count}</p>
            <p className="text-xs text-green-600">On Time</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-700">{summary.late_count}</p>
            <p className="text-xs text-yellow-600">Late</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-700">{summary.missed_count}</p>
            <p className="text-xs text-red-600">Missed</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <DollarSign className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-700">{summary.total_submitted}</p>
            <p className="text-xs text-blue-600">Total Submitted</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {summary.total_expected} total meal counts expected this month ({summary.total_submitted} submitted)
        </p>
      </CardContent>
    </Card>
  );
}
