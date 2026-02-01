'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UtensilsCrossed,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  Loader2,
  Settings,
} from 'lucide-react';
import { FoodCountGrid } from '@/components/food/FoodCountGrid';
import { FoodProjectionChart } from '@/components/food/FoodProjectionChart';
import { CostTracker } from '@/components/food/CostTracker';
import { ClassroomSettings } from '@/components/food/ClassroomSettings';
import {
  getCACFPDailyReport,
  getCACFPMonthlyReport,
  seedFoodData,
} from '@/lib/food-storage';
import { CACFPDailyReport, MEAL_TYPE_LABELS, MealType } from '@/types/food';

export default function FoodCountsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dailyReport, setDailyReport] = useState<CACFPDailyReport | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClassroomUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  const loadDailyReport = async (date: string) => {
    const report = await getCACFPDailyReport(date);
    setDailyReport(report);
  };

  useEffect(() => {
    async function init() {
      // Seed sample data if needed
      await seedFoodData();
      loadDailyReport(selectedDate);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDailyReport(selectedDate);
  }, [selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" />
            Food Counts (CACFP)
          </h1>
          <p className="text-muted-foreground">
            Track daily meal counts for CACFP reporting
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="h-4 w-4" />
            Daily Counts
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            CACFP Reports
          </TabsTrigger>
          <TabsTrigger value="projections" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Projections
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Cost Tracking
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Daily Counts Tab */}
        <TabsContent value="daily" className="space-y-4">
          {/* Date Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous Day
                </Button>
                <div className="flex items-center gap-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  {isToday && <Badge>Today</Badge>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  Next Day
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <p className="text-center text-lg font-medium mt-2">
                {formatDate(selectedDate)}
              </p>
            </CardContent>
          </Card>

          {/* Food Count Grid */}
          <FoodCountGrid key={refreshKey} date={selectedDate} onSave={() => loadDailyReport(selectedDate)} />

          {/* Daily Summary */}
          {dailyReport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily CACFP Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {mealTypes.map((mealType) => (
                    <div
                      key={mealType}
                      className="p-4 bg-muted/30 rounded-lg text-center"
                    >
                      <p className="text-sm text-muted-foreground">
                        {MEAL_TYPE_LABELS[mealType]}
                      </p>
                      <p className="text-2xl font-bold">
                        {dailyReport.totals[mealType].children}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{dailyReport.totals[mealType].adults} adults
                      </p>
                    </div>
                  ))}
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      {dailyReport.grand_total}
                    </p>
                    <p className="text-xs text-muted-foreground">meals served</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CACFP Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <CACFPReportsView />
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          <FoodProjectionChart />
        </TabsContent>

        {/* Cost Tracking Tab */}
        <TabsContent value="costs" className="space-y-4">
          <CostTracker />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <ClassroomSettings onUpdate={handleClassroomUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// CACFP Reports Sub-component
function CACFPReportsView() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{
    meal_totals: Record<MealType, number>;
    grand_total: number;
    average_daily: number;
  } | null>(null);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      const report = await getCACFPMonthlyReport(selectedMonth);
      setMonthlyData({
        meal_totals: report.meal_totals,
        grand_total: report.grand_total,
        average_daily: report.average_daily,
      });
      setLoading(false);
    }
    loadReport();
  }, [selectedMonth]);

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Monthly CACFP Report</CardTitle>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : monthlyData ? (
            <div className="space-y-6">
              {/* Monthly Totals */}
              <div className="grid gap-4 md:grid-cols-5">
                {mealTypes.map((mealType) => (
                  <div
                    key={mealType}
                    className="p-4 bg-muted/30 rounded-lg text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      {MEAL_TYPE_LABELS[mealType]}
                    </p>
                    <p className="text-2xl font-bold">
                      {monthlyData.meal_totals[mealType].toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {monthlyData.grand_total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Average Daily</p>
                  <p className="text-xl font-bold">{monthlyData.average_daily}</p>
                  <p className="text-xs text-muted-foreground">meals per day</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Est. Reimbursement
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    ${((monthlyData.grand_total / 4) * 1.91 + (monthlyData.grand_total / 4) * 3.65 + (monthlyData.grand_total / 2) * 0.97).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on Tier 1 rates
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Report Status</p>
                  <Badge className="mt-2">Ready for Submission</Badge>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export CACFP Report
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No data available for this month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
