'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  PieChart,
} from 'lucide-react';
import {
  InventoryCategory,
  CATEGORY_LABELS,
  formatFoodCurrency,
} from '@/types/food';
import { getInventoryItems, getCACFPMonthlyReport } from '@/lib/food-storage';

export function CostTracker() {
  const [loading, setLoading] = useState(true);
  const [costByCategory, setCostByCategory] = useState<Record<InventoryCategory, number>>({} as Record<InventoryCategory, number>);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [monthlyMeals, setMonthlyMeals] = useState(0);
  const [averageCostPerMeal, setAverageCostPerMeal] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Calculate inventory value by category
      const items = await getInventoryItems();
      const categoryTotals: Record<InventoryCategory, number> = {
        dairy: 0,
        protein: 0,
        grains: 0,
        fruits: 0,
        vegetables: 0,
        beverages: 0,
        snacks: 0,
        supplies: 0,
      };

      let totalValue = 0;
      for (const item of items) {
        if (item.cost_per_unit) {
          const itemValue = item.quantity * item.cost_per_unit;
          categoryTotals[item.category] += itemValue;
          totalValue += itemValue;
        }
      }

      setCostByCategory(categoryTotals);
      setTotalInventoryValue(totalValue);

      // Get monthly meals data
      const today = new Date();
      const monthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthlyReport = await getCACFPMonthlyReport(monthStr);
      setMonthlyMeals(monthlyReport.grand_total);

      // Calculate average cost per meal (using inventory value as proxy)
      if (monthlyReport.grand_total > 0) {
        setAverageCostPerMeal(totalValue / monthlyReport.grand_total);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  // Budget thresholds (example values)
  const monthlyBudget = 5000;
  const budgetUsed = totalInventoryValue;
  const budgetPercent = Math.min((budgetUsed / monthlyBudget) * 100, 100);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(CATEGORY_LABELS) as InventoryCategory[];
  const sortedCategories = categories
    .filter((c) => costByCategory[c] > 0)
    .sort((a, b) => costByCategory[b] - costByCategory[a]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">
                  {formatFoodCurrency(totalInventoryValue)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Meals</p>
                <p className="text-2xl font-bold">{monthlyMeals.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Cost/Meal</p>
                <p className="text-2xl font-bold">
                  {formatFoodCurrency(averageCostPerMeal)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Status</p>
                <p className="text-2xl font-bold">
                  {budgetPercent.toFixed(0)}%
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  budgetPercent > 90
                    ? 'bg-red-100'
                    : budgetPercent > 75
                    ? 'bg-yellow-100'
                    : 'bg-green-100'
                }`}
              >
                {budgetPercent > 90 ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              {formatFoodCurrency(budgetUsed)} of {formatFoodCurrency(monthlyBudget)}
            </span>
            <span className="text-muted-foreground">
              {formatFoodCurrency(monthlyBudget - budgetUsed)} remaining
            </span>
          </div>
          <Progress
            value={budgetPercent}
            className={`h-3 ${
              budgetPercent > 90
                ? '[&>div]:bg-red-500'
                : budgetPercent > 75
                ? '[&>div]:bg-yellow-500'
                : ''
            }`}
          />
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCategories.map((category) => {
              const value = costByCategory[category];
              const percent = (value / totalInventoryValue) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[category]}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {formatFoodCurrency(value)}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}

            {sortedCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No inventory cost data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CACFP Reimbursement Estimate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CACFP Reimbursement Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Breakfast</p>
              <p className="text-xl font-bold">
                {formatFoodCurrency((monthlyMeals / 4) * 1.91)}
              </p>
              <p className="text-xs text-muted-foreground">$1.91/meal</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Lunch/Supper</p>
              <p className="text-xl font-bold">
                {formatFoodCurrency((monthlyMeals / 4) * 3.65)}
              </p>
              <p className="text-xs text-muted-foreground">$3.65/meal</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Snacks</p>
              <p className="text-xl font-bold">
                {formatFoodCurrency((monthlyMeals / 2) * 0.97)}
              </p>
              <p className="text-xs text-muted-foreground">$0.97/snack</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            * Estimates based on CACFP Tier 1 reimbursement rates (2024)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
