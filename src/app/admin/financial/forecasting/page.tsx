'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Sliders } from 'lucide-react';
import { FinancialHealthDashboard } from '@/components/admin/FinancialHealthDashboard';
import { CashFlowChart } from '@/components/admin/CashFlowChart';
import { ScenarioModeler } from '@/components/admin/ScenarioModeler';

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Revenue Forecasting</h1>
          <p className="text-muted-foreground text-sm">
            Financial health, cash flow analysis, and scenario planning
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="health">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health" className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Financial Health
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" />
            Scenario Modeling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="pt-4">
          <FinancialHealthDashboard />
        </TabsContent>

        <TabsContent value="cashflow" className="pt-4">
          <CashFlowChart />
        </TabsContent>

        <TabsContent value="scenarios" className="pt-4">
          <ScenarioModeler />
        </TabsContent>
      </Tabs>
    </div>
  );
}
