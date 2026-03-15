'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, BarChart3, GripVertical, ShieldCheck, DollarSign, RefreshCw, Send } from 'lucide-react';
import { ScheduleGrid } from '@/components/scheduling/ScheduleGrid';
import { WeeklyHoursSummary } from '@/components/scheduling/WeeklyHoursSummary';
import DragScheduleBoard from '@/components/admin/DragScheduleBoard';
import ScheduleDistribution from '@/components/admin/ScheduleDistribution';

// Lazy load optimizer components to prevent hydration crashes
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function LazyRatioCompliance() {
  const mounted = useMounted();
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    if (!mounted) return;
    import('@/components/admin/RatioComplianceView').then(m => setComp(() => m.RatioComplianceView));
  }, [mounted]);
  if (!Comp) return <Spinner />;
  return <Comp />;
}

function LazyLaborCost() {
  const mounted = useMounted();
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    if (!mounted) return;
    import('@/components/admin/LaborCostProjection').then(m => setComp(() => m.LaborCostProjection));
  }, [mounted]);
  if (!Comp) return <Spinner />;
  return <Comp />;
}

function LazyCoverage() {
  const mounted = useMounted();
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    if (!mounted) return;
    import('@/components/admin/CoverageRequests').then(m => setComp(() => m.CoverageRequests));
  }, [mounted]);
  if (!Comp) return <Spinner />;
  return <Comp />;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" />
    </div>
  );
}

export default function SchedulingPage() {
  const [currentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1);
    return start;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Staff Scheduling
        </h1>
        <p className="text-muted-foreground">
          Build schedules, check compliance, manage costs, and publish to staff
        </p>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="board" className="gap-2">
            <GripVertical className="h-4 w-4" />
            Schedule Board
          </TabsTrigger>
          <TabsTrigger value="grid" className="gap-2">
            <Clock className="h-4 w-4" />
            Weekly Grid
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Hours Summary
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
            Coverage
          </TabsTrigger>
          <TabsTrigger value="publish" className="gap-2">
            <Send className="h-4 w-4" />
            Publish
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <DragScheduleBoard />
        </TabsContent>

        <TabsContent value="grid">
          <ScheduleGrid showHoursSummary={true} />
        </TabsContent>

        <TabsContent value="hours">
          <WeeklyHoursSummary weekStart={currentWeekStart} />
        </TabsContent>

        <TabsContent value="ratios">
          <LazyRatioCompliance />
        </TabsContent>

        <TabsContent value="cost">
          <LazyLaborCost />
        </TabsContent>

        <TabsContent value="coverage">
          <LazyCoverage />
        </TabsContent>

        <TabsContent value="publish">
          <ScheduleDistribution />
        </TabsContent>
      </Tabs>
    </div>
  );
}
