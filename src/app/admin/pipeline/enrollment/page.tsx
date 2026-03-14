'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentFunnel } from '@/components/admin/EnrollmentFunnel';
import { PipelineBoard } from '@/components/admin/PipelineBoard';
import { LeadSourceChart } from '@/components/admin/LeadSourceChart';
import { EnrollmentRevenueProjection } from '@/components/admin/EnrollmentRevenueProjection';
import { TrendingUp, LayoutGrid, PieChart, DollarSign } from 'lucide-react';

export default function EnrollmentPipelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#C62828]" />
          Enrollment Funnel
        </h1>
        <p className="text-muted-foreground mt-1">
          Track leads from first inquiry through active enrollment. Monitor conversion rates, pipeline value, and lead sources.
        </p>
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="funnel" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Funnel View
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Pipeline Board
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <PieChart className="h-4 w-4" />
            Lead Sources
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue Projection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <EnrollmentFunnel />
        </TabsContent>

        <TabsContent value="board" className="space-y-4">
          <PipelineBoard />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <LeadSourceChart />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <EnrollmentRevenueProjection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
