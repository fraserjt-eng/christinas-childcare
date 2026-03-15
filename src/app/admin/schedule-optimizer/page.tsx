'use client';

// Dynamic imports with ssr:false to avoid hydration issues
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ShieldCheck, DollarSign, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports to isolate client-side rendering issues
const ScheduleOptimizer = dynamic(
  () => import('@/components/admin/ScheduleOptimizer').then(m => ({ default: m.ScheduleOptimizer })),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
);
const RatioComplianceView = dynamic(
  () => import('@/components/admin/RatioComplianceView').then(m => ({ default: m.RatioComplianceView })),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
);
const LaborCostProjection = dynamic(
  () => import('@/components/admin/LaborCostProjection').then(m => ({ default: m.LaborCostProjection })),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
);
const CoverageRequests = dynamic(
  () => import('@/components/admin/CoverageRequests').then(m => ({ default: m.CoverageRequests })),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
);

function LoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" />
    </div>
  );
}

export default function ScheduleOptimizerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl font-bold">Schedule Optimizer</h1>
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
