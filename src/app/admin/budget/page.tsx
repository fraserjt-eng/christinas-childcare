'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, Building, Package, UtensilsCrossed, Shield, Megaphone,
  Wrench, Briefcase, GraduationCap, MoreHorizontal, FileDown,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info,
  DollarSign, PieChart, BarChart3, Wallet
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Site definitions
const sites = [
  { id: 'crystal', name: 'Crystal Location' },
  { id: 'brooklyn-park', name: 'Brooklyn Park Location' },
];

// Budget categories with icons
const budgetCategories = [
  { id: 'payroll', name: 'Payroll & Benefits', icon: Users },
  { id: 'rent', name: 'Rent & Utilities', icon: Building },
  { id: 'supplies', name: 'Supplies & Materials', icon: Package },
  { id: 'food', name: 'Food & CACFP', icon: UtensilsCrossed },
  { id: 'insurance', name: 'Insurance', icon: Shield },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'maintenance', name: 'Maintenance & Repairs', icon: Wrench },
  { id: 'professional', name: 'Professional Services', icon: Briefcase },
  { id: 'training', name: 'Staff Training', icon: GraduationCap },
  { id: 'misc', name: 'Miscellaneous', icon: MoreHorizontal },
];

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Month = typeof months[number];

interface MonthData {
  budget: number;
  actual: number;
}

interface BudgetRow {
  categoryId: string;
  category: string;
  jan: MonthData;
  feb: MonthData;
  mar: MonthData;
  apr: MonthData;
  may: MonthData;
  jun: MonthData;
  jul: MonthData;
  aug: MonthData;
  sep: MonthData;
  oct: MonthData;
  nov: MonthData;
  dec: MonthData;
}

// Generate realistic sample data for a site
function generateSiteData(siteId: string): BudgetRow[] {
  const baseMultiplier = siteId === 'crystal' ? 1.0 : 0.9;

  const categoryBudgets: Record<string, number> = {
    payroll: 25000,
    rent: 8000,
    supplies: 3000,
    food: 4500,
    insurance: 2500,
    marketing: 1500,
    maintenance: 2000,
    professional: 1800,
    training: 800,
    misc: 1200,
  };

  return budgetCategories.map(cat => {
    const baseBudget = Math.round(categoryBudgets[cat.id] * baseMultiplier);
    const row: BudgetRow = {
      categoryId: cat.id,
      category: cat.name,
      jan: { budget: baseBudget, actual: 0 },
      feb: { budget: baseBudget, actual: 0 },
      mar: { budget: baseBudget, actual: 0 },
      apr: { budget: baseBudget, actual: 0 },
      may: { budget: baseBudget, actual: 0 },
      jun: { budget: baseBudget, actual: 0 },
      jul: { budget: baseBudget, actual: 0 },
      aug: { budget: baseBudget, actual: 0 },
      sep: { budget: baseBudget, actual: 0 },
      oct: { budget: baseBudget, actual: 0 },
      nov: { budget: baseBudget, actual: 0 },
      dec: { budget: baseBudget, actual: 0 },
    };

    // Generate realistic actual amounts (some variance from budget)
    months.forEach((month, idx) => {
      // Only populate actuals for months that have passed (assuming current month is around month 6)
      if (idx < 6) {
        const variance = 0.85 + Math.random() * 0.3; // 85% to 115% of budget
        row[month].actual = Math.round(baseBudget * variance);
      }
    });

    return row;
  });
}

// Initial data for all sites
function generateInitialData(): Record<string, BudgetRow[]> {
  return {
    crystal: generateSiteData('crystal'),
    'brooklyn-park': generateSiteData('brooklyn-park'),
  };
}

export default function BudgetPage() {
  const [selectedSite, setSelectedSite] = useState('crystal');
  const [budgetData, setBudgetData] = useState<Record<string, BudgetRow[]>>(generateInitialData);
  const [activeTab, setActiveTab] = useState('dashboard');

  const currentSiteData = budgetData[selectedSite];

  // Calculate derived values
  const calculations = useMemo(() => {
    const data = currentSiteData;

    // YTD calculations per row
    const rowTotals = data.map(row => {
      const ytdBudget = months.reduce((sum, m) => sum + row[m].budget, 0);
      const ytdActual = months.reduce((sum, m) => sum + row[m].actual, 0);
      const variance = ytdBudget - ytdActual;
      const percentUsed = ytdBudget > 0 ? (ytdActual / ytdBudget) * 100 : 0;
      return { ...row, ytdBudget, ytdActual, variance, percentUsed };
    });

    // Column totals
    const columnTotals = months.reduce((acc, month) => {
      acc[month] = {
        budget: data.reduce((sum, row) => sum + row[month].budget, 0),
        actual: data.reduce((sum, row) => sum + row[month].actual, 0),
      };
      return acc;
    }, {} as Record<Month, MonthData>);

    // Grand totals
    const totalBudget = rowTotals.reduce((sum, r) => sum + r.ytdBudget, 0);
    const totalActual = rowTotals.reduce((sum, r) => sum + r.ytdActual, 0);
    const totalVariance = totalBudget - totalActual;
    const burnRate = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    // Health score (100 = perfectly on budget, higher/lower = over/under)
    const healthScore = Math.max(0, Math.min(100, 100 - Math.abs(burnRate - 50)));

    return { rowTotals, columnTotals, totalBudget, totalActual, totalVariance, burnRate, healthScore };
  }, [currentSiteData]);

  // Update cell value
  const updateCell = (categoryId: string, month: Month, type: 'budget' | 'actual', value: number) => {
    setBudgetData(prev => ({
      ...prev,
      [selectedSite]: prev[selectedSite].map(row =>
        row.categoryId === categoryId
          ? { ...row, [month]: { ...row[month], [type]: value } }
          : row
      ),
    }));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get variance color
  const getVarianceColor = (variance: number, budget: number) => {
    if (budget === 0) return 'text-muted-foreground';
    const percentVariance = (variance / budget) * 100;
    if (percentVariance > 5) return 'text-green-600';
    if (percentVariance < -5) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Get badge variant for percent used
  const getPercentBadge = (percent: number) => {
    if (percent > 100) return 'destructive';
    if (percent > 90) return 'secondary';
    return 'default';
  };

  // Export to Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Dashboard summary sheet
    const dashboardData = [
      ['Christina\'s Child Care - Budget Report'],
      ['Site:', sites.find(s => s.id === selectedSite)?.name || selectedSite],
      ['Generated:', new Date().toLocaleDateString()],
      [],
      ['Key Metrics', 'Value'],
      ['Total Annual Budget', formatCurrency(calculations.totalBudget)],
      ['Total YTD Actual', formatCurrency(calculations.totalActual)],
      ['Variance', formatCurrency(calculations.totalVariance)],
      ['Burn Rate', calculations.burnRate.toFixed(1) + '%'],
      ['Budget Health Score', calculations.healthScore.toFixed(0) + '/100'],
    ];
    const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(wb, dashboardSheet, 'Dashboard');

    // Annual budget sheet
    const annualHeaders = [
      'Category',
      ...months.flatMap(m => [`${m.toUpperCase()} Budget`, `${m.toUpperCase()} Actual`]),
      'YTD Budget', 'YTD Actual', 'Variance', '% Used'
    ];
    const annualRows = calculations.rowTotals.map(row => [
      row.category,
      ...months.flatMap(m => [row[m].budget, row[m].actual]),
      row.ytdBudget, row.ytdActual, row.variance, (row.percentUsed).toFixed(1) + '%'
    ]);
    const annualData = [annualHeaders, ...annualRows];

    // Add totals row
    annualData.push([
      'TOTAL',
      ...months.flatMap(m => [calculations.columnTotals[m].budget, calculations.columnTotals[m].actual]),
      calculations.totalBudget, calculations.totalActual, calculations.totalVariance,
      calculations.burnRate.toFixed(1) + '%'
    ]);

    const annualSheet = XLSX.utils.aoa_to_sheet(annualData);
    XLSX.utils.book_append_sheet(wb, annualSheet, 'Annual Budget');

    // Site comparison sheet
    const comparisonHeaders = ['Category', ...sites.flatMap(s => [`${s.name} Budget`, `${s.name} Actual`])];
    const comparisonRows = budgetCategories.map(cat => {
      const row: (string | number)[] = [cat.name];
      sites.forEach(site => {
        const siteRow = budgetData[site.id].find(r => r.categoryId === cat.id);
        if (siteRow) {
          const ytdBudget = months.reduce((sum, m) => sum + siteRow[m].budget, 0);
          const ytdActual = months.reduce((sum, m) => sum + siteRow[m].actual, 0);
          row.push(ytdBudget, ytdActual);
        }
      });
      return row;
    });
    const comparisonSheet = XLSX.utils.aoa_to_sheet([comparisonHeaders, ...comparisonRows]);
    XLSX.utils.book_append_sheet(wb, comparisonSheet, 'Site Comparison');

    // Monthly breakdown sheet
    const monthlyHeaders = ['Month', 'Total Budget', 'Total Actual', 'Variance', '% Used'];
    const monthlyRows = months.map((m, idx) => {
      const budget = calculations.columnTotals[m].budget;
      const actual = calculations.columnTotals[m].actual;
      const variance = budget - actual;
      const percent = budget > 0 ? (actual / budget * 100).toFixed(1) + '%' : '0%';
      return [monthLabels[idx], budget, actual, variance, percent];
    });
    const monthlySheet = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyRows]);
    XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly View');

    XLSX.writeFile(wb, `Christina-Budget-${selectedSite}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Dashboard insights
  const insights = useMemo(() => {
    const results: Array<{ type: 'warning' | 'success' | 'info'; title: string; description: string }> = [];

    // Check for categories over budget
    calculations.rowTotals.forEach(row => {
      if (row.percentUsed > 100) {
        results.push({
          type: 'warning',
          title: `${row.category} Over Budget`,
          description: `This category is ${(row.percentUsed - 100).toFixed(1)}% over budget. Consider reviewing expenses.`,
        });
      } else if (row.percentUsed < 40 && row.ytdActual > 0) {
        results.push({
          type: 'success',
          title: `${row.category} Under Budget`,
          description: `Running ${(100 - row.percentUsed).toFixed(0)}% under budget. Great cost management!`,
        });
      }
    });

    // Add general insights
    if (calculations.burnRate > 55) {
      results.push({
        type: 'warning',
        title: 'Spending Trending High',
        description: 'Overall spending is ahead of schedule. Review non-essential expenses.',
      });
    } else if (calculations.burnRate < 45) {
      results.push({
        type: 'info',
        title: 'Budget Buffer Available',
        description: `You have approximately ${formatCurrency(calculations.totalVariance)} available for investments.`,
      });
    }

    return results.slice(0, 4); // Limit to 4 insights
  }, [calculations]);

  // Top expense categories for chart visualization
  const topCategories = useMemo(() => {
    return [...calculations.rowTotals]
      .sort((a, b) => b.ytdActual - a.ytdActual)
      .slice(0, 5);
  }, [calculations.rowTotals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">Track and manage budgets across all locations</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="annual">Annual Budget</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="comparison">Site Comparison</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculations.totalBudget)}</div>
                <p className="text-xs text-muted-foreground">Annual allocation</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">YTD Actual</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculations.totalActual)}</div>
                <p className="text-xs text-muted-foreground">Spent to date</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Variance</CardTitle>
                {calculations.totalVariance >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${calculations.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(calculations.totalVariance))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {calculations.totalVariance >= 0 ? 'Under budget' : 'Over budget'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculations.healthScore.toFixed(0)}/100</div>
                <Progress value={calculations.healthScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Burn Rate & Top Categories */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Burn Rate
                </CardTitle>
                <CardDescription>Budget utilization progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">YTD Progress</span>
                    <span className="font-medium">{calculations.burnRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={calculations.burnRate} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {calculations.burnRate <= 50
                      ? 'Spending is on track for mid-year.'
                      : 'Spending is above expected mid-year pace.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Expense Categories
                </CardTitle>
                <CardDescription>Highest spending areas YTD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCategories.map((cat, idx) => {
                    const Icon = budgetCategories.find(c => c.id === cat.categoryId)?.icon || MoreHorizontal;
                    return (
                      <div key={cat.categoryId} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-4">{idx + 1}.</span>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm truncate">{cat.category}</span>
                        <span className="font-medium">{formatCurrency(cat.ytdActual)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Budget Insights
              </CardTitle>
              <CardDescription>AI-powered recommendations based on your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {insights.length > 0 ? insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />}
                    {insight.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                    {insight.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Budget is on track. No concerns at this time.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Budget Tab */}
        <TabsContent value="annual">
          <Card>
            <CardHeader>
              <CardTitle>Annual Budget - {sites.find(s => s.id === selectedSite)?.name}</CardTitle>
              <CardDescription>Click on any cell to edit. Totals update automatically.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Category</TableHead>
                    {months.map((m, idx) => (
                      <TableHead key={m} className="text-center min-w-[140px]" colSpan={2}>
                        {monthLabels[idx]}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[100px]">YTD Budget</TableHead>
                    <TableHead className="text-center min-w-[100px]">YTD Actual</TableHead>
                    <TableHead className="text-center min-w-[100px]">Variance</TableHead>
                    <TableHead className="text-center min-w-[80px]">% Used</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10"></TableHead>
                    {months.map(m => (
                      <>
                        <TableHead key={`${m}-b`} className="text-center text-xs">Budget</TableHead>
                        <TableHead key={`${m}-a`} className="text-center text-xs">Actual</TableHead>
                      </>
                    ))}
                    <TableHead colSpan={4}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.rowTotals.map(row => {
                    const Icon = budgetCategories.find(c => c.id === row.categoryId)?.icon || MoreHorizontal;
                    return (
                      <TableRow key={row.categoryId}>
                        <TableCell className="sticky left-0 bg-white z-10 font-medium">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {row.category}
                          </div>
                        </TableCell>
                        {months.map(m => (
                          <>
                            <TableCell key={`${m}-b`} className="p-1">
                              <Input
                                type="number"
                                value={row[m].budget}
                                onChange={(e) => updateCell(row.categoryId, m, 'budget', Number(e.target.value))}
                                className="h-8 text-center text-sm"
                              />
                            </TableCell>
                            <TableCell key={`${m}-a`} className="p-1">
                              <Input
                                type="number"
                                value={row[m].actual}
                                onChange={(e) => updateCell(row.categoryId, m, 'actual', Number(e.target.value))}
                                className="h-8 text-center text-sm bg-muted/30"
                              />
                            </TableCell>
                          </>
                        ))}
                        <TableCell className="text-center font-medium">{formatCurrency(row.ytdBudget)}</TableCell>
                        <TableCell className="text-center font-medium">{formatCurrency(row.ytdActual)}</TableCell>
                        <TableCell className={`text-center font-medium ${getVarianceColor(row.variance, row.ytdBudget)}`}>
                          {formatCurrency(row.variance)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getPercentBadge(row.percentUsed)}>
                            {row.percentUsed.toFixed(0)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell className="sticky left-0 bg-muted/50 z-10">TOTAL</TableCell>
                    {months.map(m => (
                      <>
                        <TableCell key={`${m}-b`} className="text-center">
                          {formatCurrency(calculations.columnTotals[m].budget)}
                        </TableCell>
                        <TableCell key={`${m}-a`} className="text-center">
                          {formatCurrency(calculations.columnTotals[m].actual)}
                        </TableCell>
                      </>
                    ))}
                    <TableCell className="text-center">{formatCurrency(calculations.totalBudget)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(calculations.totalActual)}</TableCell>
                    <TableCell className={`text-center ${getVarianceColor(calculations.totalVariance, calculations.totalBudget)}`}>
                      {formatCurrency(calculations.totalVariance)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getPercentBadge(calculations.burnRate)}>
                        {calculations.burnRate.toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly View Tab */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown - {sites.find(s => s.id === selectedSite)?.name}</CardTitle>
              <CardDescription>Month-by-month spending analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">% Used</TableHead>
                    <TableHead className="w-[200px]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {months.map((m, idx) => {
                    const budget = calculations.columnTotals[m].budget;
                    const actual = calculations.columnTotals[m].actual;
                    const variance = budget - actual;
                    const percent = budget > 0 ? (actual / budget) * 100 : 0;
                    return (
                      <TableRow key={m}>
                        <TableCell className="font-medium">{monthLabels[idx]}</TableCell>
                        <TableCell className="text-right">{formatCurrency(budget)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(actual)}</TableCell>
                        <TableCell className={`text-right ${getVarianceColor(variance, budget)}`}>
                          {formatCurrency(variance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getPercentBadge(percent)}>
                            {percent.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Progress value={Math.min(percent, 100)} className="h-2" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Site Comparison</CardTitle>
              <CardDescription>Compare budget performance across all locations</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Category</TableHead>
                    {sites.map(site => (
                      <TableHead key={site.id} className="text-center min-w-[180px]" colSpan={3}>
                        {site.name}
                      </TableHead>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    {sites.map(site => (
                      <>
                        <TableHead key={`${site.id}-b`} className="text-center text-xs">Budget</TableHead>
                        <TableHead key={`${site.id}-a`} className="text-center text-xs">Actual</TableHead>
                        <TableHead key={`${site.id}-v`} className="text-center text-xs">Var %</TableHead>
                      </>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetCategories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {cat.name}
                          </div>
                        </TableCell>
                        {sites.map(site => {
                          const siteRow = budgetData[site.id].find(r => r.categoryId === cat.id);
                          if (!siteRow) return null;
                          const ytdBudget = months.reduce((sum, m) => sum + siteRow[m].budget, 0);
                          const ytdActual = months.reduce((sum, m) => sum + siteRow[m].actual, 0);
                          const varPercent = ytdBudget > 0 ? ((ytdBudget - ytdActual) / ytdBudget) * 100 : 0;
                          return (
                            <>
                              <TableCell key={`${site.id}-b`} className="text-center">
                                {formatCurrency(ytdBudget)}
                              </TableCell>
                              <TableCell key={`${site.id}-a`} className="text-center">
                                {formatCurrency(ytdActual)}
                              </TableCell>
                              <TableCell
                                key={`${site.id}-v`}
                                className={`text-center ${varPercent > 0 ? 'text-green-600' : varPercent < 0 ? 'text-red-600' : ''}`}
                              >
                                {varPercent > 0 ? '+' : ''}{varPercent.toFixed(1)}%
                              </TableCell>
                            </>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {/* Site Totals */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>TOTAL</TableCell>
                    {sites.map(site => {
                      const siteData = budgetData[site.id];
                      const totalBudget = siteData.reduce((sum, row) =>
                        sum + months.reduce((mSum, m) => mSum + row[m].budget, 0), 0);
                      const totalActual = siteData.reduce((sum, row) =>
                        sum + months.reduce((mSum, m) => mSum + row[m].actual, 0), 0);
                      const varPercent = totalBudget > 0 ? ((totalBudget - totalActual) / totalBudget) * 100 : 0;
                      return (
                        <>
                          <TableCell key={`${site.id}-b`} className="text-center">
                            {formatCurrency(totalBudget)}
                          </TableCell>
                          <TableCell key={`${site.id}-a`} className="text-center">
                            {formatCurrency(totalActual)}
                          </TableCell>
                          <TableCell
                            key={`${site.id}-v`}
                            className={`text-center ${varPercent > 0 ? 'text-green-600' : varPercent < 0 ? 'text-red-600' : ''}`}
                          >
                            {varPercent > 0 ? '+' : ''}{varPercent.toFixed(1)}%
                          </TableCell>
                        </>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
