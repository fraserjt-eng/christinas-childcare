'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Clock, BarChart2, AlertTriangle } from 'lucide-react';
import { IncidentForm } from '@/components/admin/IncidentForm';
import { IncidentTimeline } from '@/components/admin/IncidentTimeline';
import { IncidentAnalytics } from '@/components/admin/IncidentAnalytics';
import { getUnnotifiedParents, getComplianceReport } from '@/lib/incident-log-storage';

export default function IncidentLogPage() {
  const [overdueCount, setOverdueCount] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);

  const loadCounts = async () => {
    const [overdue, compliance] = await Promise.all([
      getUnnotifiedParents(),
      getComplianceReport(),
    ]);
    setOverdueCount(overdue.length);
    setFollowUpCount(compliance.follow_up_pending);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Incident &amp; Communication Log
        </h1>
        <p className="text-muted-foreground">
          Document incidents, track parent notifications, and review compliance.
        </p>
      </div>

      {/* Alert banners */}
      {(overdueCount > 0 || followUpCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {overdueCount > 0 && (
            <Card className="border-red-400 bg-red-50/50 flex-1 min-w-[240px]">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    {overdueCount} incident{overdueCount !== 1 ? 's' : ''} with no parent notification after 24h
                  </p>
                  <p className="text-xs text-red-600">
                    State licensing requires notification within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {followUpCount > 0 && (
            <Card className="border-yellow-300 bg-yellow-50/50 flex-1 min-w-[240px]">
              <CardContent className="p-3 flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-700">
                    {followUpCount} follow-up{followUpCount !== 1 ? 's' : ''} pending
                  </p>
                  <p className="text-xs text-yellow-600">Review the timeline to mark complete</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="report">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="report" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Report Incident
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
            {overdueCount > 0 && (
              <Badge className="ml-1 bg-red-500 text-white h-5 min-w-5 text-xs">
                {overdueCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-4 max-w-2xl">
          <IncidentForm onSaved={loadCounts} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <IncidentTimeline onRefresh={loadCounts} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <IncidentAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
