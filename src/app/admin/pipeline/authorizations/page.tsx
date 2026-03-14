'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthorizationGrid } from '@/components/admin/AuthorizationGrid';
import { RenewalTracker } from '@/components/admin/RenewalTracker';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function AuthorizationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#C62828]" />
          State Authorization Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor CCAP, county, and state subsidy authorizations. Track renewals and expiring coverage.
        </p>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Authorization Status
          </TabsTrigger>
          <TabsTrigger value="renewals" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Renewal Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <AuthorizationGrid />
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4">
          <RenewalTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
