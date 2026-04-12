'use client';

import { OperationsSplitView } from '@/components/admin/OperationsSplitView';
import { CenterTrends } from '@/components/admin/CenterTrends';
import { Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OperationsPage() {
  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-christina-red" />
            Cross-Site Operations
          </h1>
          <p className="text-muted-foreground">Real-time view of both centers</p>
        </div>
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live Status</TabsTrigger>
            <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="mt-4">
            <OperationsSplitView />
          </TabsContent>
          <TabsContent value="trends" className="mt-4">
            <CenterTrends />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
