'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';
import { getMealComplianceSummary } from '@/lib/food-storage';
import { MealComplianceSummary, CACFP_RATES, formatFoodCurrency } from '@/types/food';

interface RevenueImpactCardProps {
  month?: string; // YYYY-MM
}

export function RevenueImpactCard({ month }: RevenueImpactCardProps) {
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
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasRevenueLoss = summary.estimated_revenue_lost > 0;

  return (
    <Card className={hasRevenueLoss ? 'border-christina-coral/30' : ''}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasRevenueLoss ? (
          <>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-christina-coral flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  Estimated revenue at risk this month
                </p>
                <p className="text-2xl font-bold text-christina-coral mt-1">
                  {formatFoodCurrency(summary.estimated_revenue_lost)}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  From {summary.missed_count} missed meal count{summary.missed_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">CACFP Rates</p>
                <div className="mt-1 space-y-1 text-sm">
                  <p>Breakfast: {formatFoodCurrency(CACFP_RATES.breakfast)}</p>
                  <p>Snack: {formatFoodCurrency(CACFP_RATES.am_snack)}</p>
                  <p>Lunch: {formatFoodCurrency(CACFP_RATES.lunch)}</p>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Monthly Impact</p>
                <div className="mt-1 space-y-1 text-sm">
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingDown className="h-3 w-3" />
                    <span>{summary.missed_count} missed</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{summary.late_count} late</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <DollarSign className="h-8 w-8 text-christina-green mx-auto mb-2" />
            <p className="font-medium text-green-800">No revenue at risk</p>
            <p className="text-sm text-green-600 mt-1">
              All meal counts submitted on time this month
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
