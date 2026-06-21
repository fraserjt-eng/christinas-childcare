'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

export function CenterTrends() {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <LineChart className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-gray-700">No historical data yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Attendance, incident, and staff-ratio trends will appear here once daily
          metrics start accumulating.
        </p>
      </CardContent>
    </Card>
  );
}
