'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OnboardingBuilder } from '@/components/admin/OnboardingBuilder';
import { OnboardingTracker } from '@/components/admin/OnboardingTracker';
import { ClipboardList } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> Digital Onboarding
        </h1>
        <p className="text-muted-foreground">Build onboarding templates and track new hire progress</p>
      </div>

      <Tabs defaultValue="tracker">
        <TabsList>
          <TabsTrigger value="tracker">Active Onboardings</TabsTrigger>
          <TabsTrigger value="builder">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-4">
          <OnboardingTracker />
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          <OnboardingBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
