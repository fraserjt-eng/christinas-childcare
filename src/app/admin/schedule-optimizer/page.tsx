'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ShieldCheck, DollarSign, RefreshCw, Loader2 } from 'lucide-react';

// Lazy load to ensure client-only rendering
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function ScheduleOptimizerPage() {
  const mounted = useMounted();
  const [LoadedComponents, setLoaded] = useState<{
    ScheduleOptimizer?: React.ComponentType;
    RatioComplianceView?: React.ComponentType;
    LaborCostProjection?: React.ComponentType;
    CoverageRequests?: React.ComponentType;
  }>({});

  useEffect(() => {
    if (!mounted) return;
    Promise.all([
      import('@/components/admin/ScheduleOptimizer'),
      import('@/components/admin/RatioComplianceView'),
      import('@/components/admin/LaborCostProjection'),
      import('@/components/admin/CoverageRequests'),
    ]).then(([s, r, l, c]) => {
      setLoaded({
        ScheduleOptimizer: s.ScheduleOptimizer,
        RatioComplianceView: r.RatioComplianceView,
        LaborCostProjection: l.LaborCostProjection,
        CoverageRequests: c.CoverageRequests,
      });
    }).catch(err => {
      console.error('Failed to load schedule components:', err);
    });
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          {LoadedComponents.ScheduleOptimizer ? <LoadedComponents.ScheduleOptimizer /> : <Loading />}
        </TabsContent>

        <TabsContent value="ratios">
          {LoadedComponents.RatioComplianceView ? <LoadedComponents.RatioComplianceView /> : <Loading />}
        </TabsContent>

        <TabsContent value="cost">
          {LoadedComponents.LaborCostProjection ? <LoadedComponents.LaborCostProjection /> : <Loading />}
        </TabsContent>

        <TabsContent value="coverage">
          {LoadedComponents.CoverageRequests ? <LoadedComponents.CoverageRequests /> : <Loading />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
