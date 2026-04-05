export const runtime = 'nodejs';

// Daily operations report API route
// Returns a structured JSON snapshot of the center's operational state for a given date.
// Because this app is currently localStorage-only, the server-side handler returns
// a scaffold with zeros. The real data is assembled client-side via the page component
// which has access to localStorage. This route exists so the data shape is defined and
// the endpoint is available for future Supabase migration.

import { NextResponse } from 'next/server';

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
    const date = dateParam || new Date().toISOString().split('T')[0];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Server-side scaffold. Data is localStorage-only for now.
    // A future Supabase migration will populate real values here.
    const report = buildEmptyReport(date);

    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('daily report route error:', err);
    const date = new Date().toISOString().split('T')[0];
    const report = buildEmptyReport(date);
    report.errors.push('Server error generating report. Data shown may be incomplete.');
    return NextResponse.json(report, { status: 500 });
  }
}
