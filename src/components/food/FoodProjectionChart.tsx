'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import {
  FoodProjection,
  MealType,
  MEAL_TYPE_LABELS,
  formatFoodCurrency,
} from '@/types/food';
import { getFoodProjection } from '@/lib/food-storage';

export function FoodProjectionChart() {
  const [weekProjection, setWeekProjection] = useState<FoodProjection | null>(null);
  const [monthProjection, setMonthProjection] = useState<FoodProjection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjections() {
      setLoading(true);
      const [week, month] = await Promise.all([
        getFoodProjection('week'),
        getFoodProjection('month'),
      ]);
      setWeekProjection(week);
      setMonthProjection(month);
      setLoading(false);
    }
    loadProjections();
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

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  const renderProjection = (projection: FoodProjection | null) => {
    if (!projection) return null;

    const maxMeals = Math.max(...Object.values(projection.projected_meals));

    return (
      <div className="space-y-6">
        {/* Period Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date(projection.period_start).toLocaleDateString()} -{' '}
              {new Date(projection.period_end).toLocaleDateString()}
            </span>
          </div>
          <Badge variant="outline">
            Based on {projection.based_on_days} days of data
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Meals</span>
            </div>
            <p className="text-2xl font-bold">
              {projection.total_projected_meals.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Est. Cost</span>
            </div>
            <p className="text-2xl font-bold">
              {formatFoodCurrency(projection.estimated_cost)}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Cost/Meal</span>
            </div>
            <p className="text-2xl font-bold">
              {formatFoodCurrency(
                projection.total_projected_meals > 0
                  ? projection.estimated_cost / projection.total_projected_meals
                  : 0
              )}
            </p>
          </div>
        </div>

        {/* Meal Breakdown Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Projected Meals by Type</h4>
          {mealTypes.map((mealType) => {
            const count = projection.projected_meals[mealType];
            const percent = maxMeals > 0 ? (count / maxMeals) * 100 : 0;
            return (
              <div key={mealType} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{MEAL_TYPE_LABELS[mealType]}</span>
                  <span className="text-muted-foreground">
                    {count.toLocaleString()} meals
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Average */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Average meals per day:
            </span>
            <span className="font-bold">
              {projection.based_on_days > 0
                ? Math.round(projection.total_projected_meals / (projection.period === 'week' ? 5 : 22))
                : 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Meal Projections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week">
          <TabsList className="mb-4">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            {renderProjection(weekProjection)}
          </TabsContent>
          <TabsContent value="month">
            {renderProjection(monthProjection)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
