'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { ScheduleRequestList } from '@/components/scheduling/ScheduleRequestList';

export default function ScheduleRequestsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Schedule Requests
        </h1>
        <p className="text-muted-foreground">
          Review and manage employee schedule change requests
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <Check className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="denied" className="gap-2">
            <X className="h-4 w-4" />
            Denied
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            All Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ScheduleRequestList
            key={`pending-${refreshKey}`}
            statusFilter="pending"
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="approved">
          <ScheduleRequestList
            key={`approved-${refreshKey}`}
            statusFilter="approved"
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="denied">
          <ScheduleRequestList
            key={`denied-${refreshKey}`}
            statusFilter="denied"
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="all">
          <ScheduleRequestList
            key={`all-${refreshKey}`}
            statusFilter="all"
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
