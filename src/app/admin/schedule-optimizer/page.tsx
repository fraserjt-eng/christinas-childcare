'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ShieldCheck, DollarSign, RefreshCw } from 'lucide-react';
import { ScheduleOptimizer } from '@/components/admin/ScheduleOptimizer';
import { RatioComplianceView } from '@/components/admin/RatioComplianceView';
import { LaborCostProjection } from '@/components/admin/LaborCostProjection';
import { CoverageRequests } from '@/components/admin/CoverageRequests';

export default function ScheduleOptimizerPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-[#C62828]" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Schedule Optimizer</h1>
          <p className="text-muted-foreground text-sm">Weekly scheduling, ratio compliance, labor costs, and coverage requests</p>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="ratios" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Ratio Compliance
          </TabsTrigger>
          <TabsTrigger value="cost" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Labor Cost
          </TabsTrigger>
          <TabsTrigger value="coverage" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coverage Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <ScheduleOptimizer />
        </TabsContent>

        <TabsContent value="ratios">
          <RatioComplianceView />
        </TabsContent>

        <TabsContent value="cost">
          <LaborCostProjection />
        </TabsContent>

        <TabsContent value="coverage">
          <CoverageRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
