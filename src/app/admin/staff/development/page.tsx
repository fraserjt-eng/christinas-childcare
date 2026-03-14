'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, ShieldCheck, BookOpen, Target } from 'lucide-react';
import { CertificationTracker } from '@/components/admin/CertificationTracker';
import { TrainingLog } from '@/components/admin/TrainingLog';
import { DevPlanTracker } from '@/components/admin/DevPlanTracker';

export default function StaffDevelopmentPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-[#C62828]" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Development</h1>
          <p className="text-muted-foreground text-sm">Certifications, training records, and professional development goals</p>
        </div>
      </div>

      <Tabs defaultValue="certifications" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="certifications" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Training Log
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" />
            Development Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications">
          <CertificationTracker />
        </TabsContent>

        <TabsContent value="training">
          <TrainingLog />
        </TabsContent>

        <TabsContent value="goals">
          <DevPlanTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
