'use client';

import { useState, useEffect } from 'react';
import { centerDate, shiftCenterDate } from '@/lib/center-time';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Users, Calendar, ClipboardList, AlertTriangle } from 'lucide-react';
import { supabaseSelect } from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getPendingActionPlans, getUpcomingRechecks } from '@/lib/intelligence/action-plan-storage';

interface StaffScheduleRow {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  role?: string;
}

interface TourRow {
  id: string;
  parent_name: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
}

function getTomorrowDate(): string {
  // Tomorrow in the center's timezone. Doing local +1 then toISOString
  // rolled an evening Central time forward an extra UTC day (showed May 20
  // when tomorrow was May 19).
  return shiftCenterDate(centerDate(), 1);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function NextDayPrep() {
  const [staff, setStaff] = useState<StaffScheduleRow[]>([]);
  const [tours, setTours] = useState<TourRow[]>([]);
  const [actionItems, setActionItems] = useState(0);
  const [rechecks, setRechecks] = useState(0);
  const [loading, setLoading] = useState(true);
  const tomorrow = getTomorrowDate();

  useEffect(() => {
    async function load() {
      try {
        if (isSupabaseConfigured) {
          const staffData = await supabaseSelect<StaffScheduleRow>('staff_schedules', {
            filters: { date: tomorrow },
          });
          if (staffData) setStaff(staffData);

          const tourData = await supabaseSelect<TourRow>('tour_requests', {
            filters: { preferred_date: tomorrow },
          });
          if (tourData) setTours(tourData.filter((t) => t.status !== 'cancelled'));
        }

        setActionItems(getPendingActionPlans().length);
        setRechecks(getUpcomingRechecks(2).length);
      } catch (error) {
        console.error('NextDayPrep load error:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tomorrow]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const hasIssues = staff.length === 0 || actionItems > 0 || rechecks > 0;

  return (
    <Card className={hasIssues ? 'border-christina-yellow' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sunrise className="h-5 w-5 text-christina-yellow" />
          Tomorrow: {formatDate(tomorrow)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Staff scheduled */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            Staff Scheduled
          </span>
          <Badge variant={staff.length > 0 ? 'secondary' : 'destructive'}>
            {staff.length > 0 ? `${staff.length} staff` : 'None scheduled'}
          </Badge>
        </div>

        {/* Scheduled tours */}
        {tours.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Tours Scheduled
            </span>
            <Badge variant="outline">{tours.length} tour{tours.length !== 1 ? 's' : ''}</Badge>
          </div>
        )}

        {/* Pending action plans */}
        {actionItems > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4 text-christina-coral" />
              Pending Action Plans
            </span>
            <Badge variant="destructive">{actionItems}</Badge>
          </div>
        )}

        {/* Upcoming re-checks */}
        {rechecks > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-christina-yellow" />
              Re-checks Due
            </span>
            <Badge className="bg-christina-yellow text-black">{rechecks}</Badge>
          </div>
        )}

        {!hasIssues && staff.length > 0 && tours.length === 0 && (
          <p className="text-sm text-muted-foreground">All clear for tomorrow.</p>
        )}
      </CardContent>
    </Card>
  );
}
