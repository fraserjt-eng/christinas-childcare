export const runtime = 'nodejs';

// Daily operations report API route
// Returns a structured JSON snapshot of the center's operational state for a given date.
// Because this app is currently localStorage-only, the server-side handler returns
// a scaffold with zeros. The real data is assembled client-side via the page component
// which has access to localStorage. This route exists so the data shape is defined and
// the endpoint is available for future Supabase migration.

import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/client';
import { centerDate } from '@/lib/center-time';

export interface DailyReportMeal {
  submitted: boolean;
  on_time: boolean;
  child_count: number;
}

export interface ClockDiscrepancy {
  employee_id: string;
  employee_name: string;
  date: string;
  clock_in: string;
}

export interface CertExpiring {
  employee_name: string;
  cert_name: string;
  expiry_date: string;
  days_remaining: number;
}

export interface DailyReport {
  date: string;
  generated_at: string;
  enrollment: {
    new_inquiries: number;
    tour_requests: number;
  };
  attendance: {
    children_present: number;
    staff_on_duty: number;
  };
  meals: {
    breakfast: DailyReportMeal;
    am_snack: DailyReportMeal;
    lunch: DailyReportMeal;
    pm_snack: DailyReportMeal;
  };
  tasks: {
    completed: number;
    total: number;
    completion_rate: number;
  };
  incidents: {
    open: number;
    resolved_today: number;
  };
  clock_discrepancies: {
    still_clocked_in: ClockDiscrepancy[];
    missing_clockout: ClockDiscrepancy[];
  };
  certifications_expiring_30d: CertExpiring[];
  errors: string[];
}

const emptyMeal: DailyReportMeal = {
  submitted: false,
  on_time: false,
  child_count: 0,
};

function buildEmptyReport(date: string): DailyReport {
  return {
    date,
    generated_at: new Date().toISOString(),
    enrollment: {
      new_inquiries: 0,
      tour_requests: 0,
    },
    attendance: {
      children_present: 0,
      staff_on_duty: 0,
    },
    meals: {
      breakfast: { ...emptyMeal },
      am_snack: { ...emptyMeal },
      lunch: { ...emptyMeal },
      pm_snack: { ...emptyMeal },
    },
    tasks: {
      completed: 0,
      total: 0,
      completion_rate: 0,
    },
    incidents: {
      open: 0,
      resolved_today: 0,
    },
    clock_discrepancies: {
      still_clocked_in: [],
      missing_clockout: [],
    },
    certifications_expiring_30d: [],
    errors: [],
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const date = dateParam || centerDate();

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const report = buildEmptyReport(date);
    const supabase = getSupabase();

    if (supabase) {
      const errors: string[] = [];

      // Attendance: unique children present on this date. Filter by the
      // `date` column so this agrees with /admin/ratios, the owner
      // dashboard, /admin/attendance, and /api/pulse/floor (all use `date`).
      // Filtering by the check_in timestamp would diverge at the UTC day
      // boundary for an evening check-in.
      const { data: attendance } = await supabase
        .from('attendance')
        .select('child_id, check_in, check_out')
        .eq('date', date);
      if (attendance) {
        const uniqueChildren = new Set(attendance.map((a: { child_id: string }) => a.child_id));
        report.attendance.children_present = uniqueChildren.size;
      }

      // Staff on duty: employees with time_entries on this date. Same
      // reasoning — filter by `date` so staff_on_duty here matches
      // /api/pulse/floor and the ratio monitor.
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('employee_id, clock_in, clock_out')
        .eq('date', date);
      if (timeEntries) {
        const uniqueStaff = new Set(timeEntries.map((t: { employee_id: string }) => t.employee_id));
        report.attendance.staff_on_duty = uniqueStaff.size;

        // Clock discrepancies: still clocked in (no clock_out)
        const stillIn = timeEntries.filter((t: { clock_out: string | null; employee_id: string; clock_in: string }) => !t.clock_out);
        report.clock_discrepancies.still_clocked_in = stillIn.map((t: { employee_id: string; clock_in: string }) => ({
          employee_id: t.employee_id,
          employee_name: 'Staff',
          date,
          clock_in: t.clock_in,
        }));
      }

      // Meals
      const { data: meals } = await supabase
        .from('food_counts')
        .select('meal_type, child_count')
        .eq('date', date);
      if (meals) {
        for (const m of meals as Array<{ meal_type: string; child_count: number }>) {
          const key = m.meal_type as keyof typeof report.meals;
          if (report.meals[key]) {
            report.meals[key].submitted = true;
            report.meals[key].child_count = m.child_count;
            report.meals[key].on_time = true;
          }
        }
      }

      // Incidents
      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('id, status')
        .gte('reported_at', `${date}T00:00:00`)
        .lte('reported_at', `${date}T23:59:59`);
      if (incidents) {
        report.incidents.open = incidents.filter((i: { status: string }) => i.status !== 'resolved').length;
        report.incidents.resolved_today = incidents.filter((i: { status: string }) => i.status === 'resolved').length;
      }

      // Enrollment inquiries
      const { data: inquiries } = await supabase
        .from('enrollment_inquiries')
        .select('id')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);
      if (inquiries) {
        report.enrollment.new_inquiries = inquiries.length;
      }

      // Tour requests
      const { data: tours } = await supabase
        .from('tour_requests')
        .select('id')
        .eq('preferred_date', date);
      if (tours) {
        report.enrollment.tour_requests = tours.length;
      }

      // Expiring certifications (30 day window)
      const thirtyDaysOut = new Date();
      thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
      const { data: certs } = await supabase
        .from('training_records')
        .select('employee_id, title, expiry_date')
        .lte('expiry_date', thirtyDaysOut.toISOString().split('T')[0])
        .gte('expiry_date', date);
      if (certs) {
        report.certifications_expiring_30d = (certs as Array<{ employee_id: string; title: string; expiry_date: string }>).map((c) => ({
          employee_name: c.employee_id,
          cert_name: c.title || 'Unknown',
          expiry_date: c.expiry_date,
          days_remaining: Math.ceil(
            (new Date(c.expiry_date).getTime() - new Date(date).getTime()) / 86400000
          ),
        }));
      }

      report.errors = errors;
    }

    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('daily report route error:', err);
    const date = centerDate();
    const report = buildEmptyReport(date);
    report.errors.push('Server error generating report. Data shown may be incomplete.');
    return NextResponse.json(report, { status: 500 });
  }
}
