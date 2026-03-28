'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Users,
  UtensilsCrossed,
  ListTodo,
  AlertTriangle,
  Clock,
  Award,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { exportToCSV } from '@/lib/export-csv';
import type { TimeEntry } from '@/types/employee';
import type { DailyReport, ClockDiscrepancy, CertExpiring } from '@/app/api/reports/daily/route';

// ─── Storage keys ──────────────────────────────────────────────────────

const KEYS = {
  timeEntries: 'christinas_time_entries',
  tasks: 'christinas_tasks',
  incidents: 'christinas_incidents',
  foodCounts: 'christinas_food_counts',
  certifications: 'christinas_certifications',
  pipelineLeads: 'christinas_pipeline_leads',
  tours: 'christinas_tours',
  employees: 'christinas_employees',
  attendance: 'christinas_attendance',
} as const;

// ─── localStorage helpers ─────────────────────────────────────────────

function readKey<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

// ─── Report builder ───────────────────────────────────────────────────

function buildReport(date: string): DailyReport {
  const errors: string[] = [];

  // Enrollment: count new inquiries and tour requests created on this date
  type Lead = { stage: string; inquiry_date: string; created_at: string };
  const leads = readKey<Lead>(KEYS.pipelineLeads);
  const newInquiries = leads.filter(
    (l) => l.inquiry_date === date || l.created_at?.startsWith(date)
  ).length;

  type Tour = { scheduled_date: string; status: string; created_at: string };
  const tours = readKey<Tour>(KEYS.tours);
  const tourRequests = tours.filter(
    (t) => t.scheduled_date === date || t.created_at?.startsWith(date)
  ).length;

  // Attendance: count children and staff present today
  type AttendanceRecord = { date: string; child_id: string; status: string; staff_id?: string };
  const attendanceRecords = readKey<AttendanceRecord>(KEYS.attendance);
  const todayAttendance = attendanceRecords.filter((a) => a.date === date);
  const childrenPresent = todayAttendance.filter(
    (a) => a.child_id && a.status === 'present'
  ).length;

  // Staff on duty: time entries with clock_in on this date
  type TimeEntryRaw = TimeEntry & { employee_id: string };
  const timeEntries = readKey<TimeEntryRaw>(KEYS.timeEntries);
  const todayEntries = timeEntries.filter((e) => e.date === date);
  const staffOnDuty = new Set(todayEntries.map((e) => e.employee_id)).size;

  // Meals: check submitted counts per meal type
  type FoodCount = { date: string; meal_type: string; child_count: number; submitted_at?: string; on_time?: boolean };
  const foodCounts = readKey<FoodCount>(KEYS.foodCounts);
  const todayMeals = foodCounts.filter((f) => f.date === date);

  function mealInfo(mealType: string) {
    const entries = todayMeals.filter((f) => f.meal_type === mealType && f.child_count > 0);
    const submitted = entries.length > 0;
    const onTime = entries.some((f) => f.on_time === true);
    const childCount = entries.reduce((sum, f) => sum + f.child_count, 0);
    return { submitted, on_time: onTime, child_count: childCount };
  }

  // Tasks: count completion
  type Task = { status: string; due_date?: string };
  const tasks = readKey<Task>(KEYS.tasks);
  const activeTasks = tasks.filter((t) => t.status !== 'backlog');
  const completedTasks = activeTasks.filter((t) => t.status === 'done').length;
  const completionRate = activeTasks.length > 0
    ? Math.round((completedTasks / activeTasks.length) * 100)
    : 0;

  // Incidents: open and resolved today
  type Incident = { status: string; resolved_at?: string; date?: string };
  const incidents = readKey<Incident>(KEYS.incidents);
  const openIncidents = incidents.filter(
    (i) => i.status === 'open' || i.status === 'investigating'
  ).length;
  const resolvedToday = incidents.filter(
    (i) => i.status === 'resolved' && i.resolved_at?.startsWith(date)
  ).length;

  // Clock discrepancies: entries where clock_out is missing on the target date
  type EmployeeRecord = { id: string; first_name: string; last_name: string };
  const employees = readKey<EmployeeRecord>(KEYS.employees);
  const empMap = new Map(employees.map((e) => [e.id, `${e.first_name} ${e.last_name}`]));

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;

  // "still clocked in" = open entries on today's date (may just mean they haven't left yet)
  // "missing clockout" = open entries from a past date
  const stillClockedIn: ClockDiscrepancy[] = [];
  const missingClockout: ClockDiscrepancy[] = [];

  for (const entry of todayEntries) {
    if (!entry.clock_out) {
      const record: ClockDiscrepancy = {
        employee_id: entry.employee_id,
        employee_name: empMap.get(entry.employee_id) ?? entry.employee_id,
        date: entry.date,
        clock_in: entry.clock_in,
      };
      if (isToday) {
        stillClockedIn.push(record);
      } else {
        missingClockout.push(record);
      }
    }
  }

  // Certifications expiring within 30 days from the report date
  type CertRecord = { employee_name: string; cert_name: string; expiry_date: string; status: string };
  const certs = readKey<CertRecord>(KEYS.certifications);
  const reportDate = new Date(date);
  const thirtyDaysOut = new Date(reportDate);
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  const expiringCerts: CertExpiring[] = certs
    .filter((c) => {
      if (!c.expiry_date) return false;
      const exp = new Date(c.expiry_date);
      return exp >= reportDate && exp <= thirtyDaysOut;
    })
    .map((c) => ({
      employee_name: c.employee_name,
      cert_name: c.cert_name,
      expiry_date: c.expiry_date,
      days_remaining: Math.ceil(
        (new Date(c.expiry_date).getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.days_remaining - b.days_remaining);

  return {
    date,
    generated_at: new Date().toISOString(),
    enrollment: {
      new_inquiries: newInquiries,
      tour_requests: tourRequests,
    },
    attendance: {
      children_present: childrenPresent,
      staff_on_duty: staffOnDuty,
    },
    meals: {
      breakfast: mealInfo('breakfast'),
      am_snack: mealInfo('am_snack'),
      lunch: mealInfo('lunch'),
      pm_snack: mealInfo('pm_snack'),
    },
    tasks: {
      completed: completedTasks,
      total: activeTasks.length,
      completion_rate: completionRate,
    },
    incidents: {
      open: openIncidents,
      resolved_today: resolvedToday,
    },
    clock_discrepancies: {
      still_clocked_in: stillClockedIn,
      missing_clockout: missingClockout,
    },
    certifications_expiring_30d: expiringCerts,
    errors,
  };
}

// ─── CSV export helpers ───────────────────────────────────────────────

function exportReportCSV(report: DailyReport) {
  const rows: Record<string, unknown>[] = [
    { section: 'ENROLLMENT', metric: 'New Inquiries', value: report.enrollment.new_inquiries },
    { section: 'ENROLLMENT', metric: 'Tour Requests', value: report.enrollment.tour_requests },
    { section: 'ATTENDANCE', metric: 'Children Present', value: report.attendance.children_present },
    { section: 'ATTENDANCE', metric: 'Staff on Duty', value: report.attendance.staff_on_duty },
    { section: 'MEALS', metric: 'Breakfast Submitted', value: report.meals.breakfast.submitted ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'Breakfast On Time', value: report.meals.breakfast.on_time ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'AM Snack Submitted', value: report.meals.am_snack.submitted ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'AM Snack On Time', value: report.meals.am_snack.on_time ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'Lunch Submitted', value: report.meals.lunch.submitted ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'Lunch On Time', value: report.meals.lunch.on_time ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'PM Snack Submitted', value: report.meals.pm_snack.submitted ? 'Yes' : 'No' },
    { section: 'MEALS', metric: 'PM Snack On Time', value: report.meals.pm_snack.on_time ? 'Yes' : 'No' },
    { section: 'TASKS', metric: 'Completed', value: report.tasks.completed },
    { section: 'TASKS', metric: 'Total', value: report.tasks.total },
    { section: 'TASKS', metric: 'Completion Rate %', value: report.tasks.completion_rate },
    { section: 'INCIDENTS', metric: 'Open', value: report.incidents.open },
    { section: 'INCIDENTS', metric: 'Resolved Today', value: report.incidents.resolved_today },
    ...report.clock_discrepancies.still_clocked_in.map((d) => ({
      section: 'CLOCK DISCREPANCIES',
      metric: 'Still Clocked In',
      value: `${d.employee_name} (clocked in ${d.clock_in})`,
    })),
    ...report.clock_discrepancies.missing_clockout.map((d) => ({
      section: 'CLOCK DISCREPANCIES',
      metric: 'Missing Clockout',
      value: `${d.employee_name} on ${d.date}`,
    })),
    ...report.certifications_expiring_30d.map((c) => ({
      section: 'CERTIFICATIONS',
      metric: `${c.employee_name}: ${c.cert_name}`,
      value: `Expires ${c.expiry_date} (${c.days_remaining} days)`,
    })),
  ];

  exportToCSV(rows, `daily-report-${report.date}.csv`);
}

async function exportReportPDF(report: DailyReport) {
  // Dynamic import to avoid SSR issues with jsPDF
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const lineHeight = 7;
  let y = 20;

  function heading(text: string) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 14, y);
    y += lineHeight + 2;
  }

  function row(label: string, value: string) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}:`, 14, y);
    doc.text(value, 100, y);
    y += lineHeight;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", 14, y);
  y += lineHeight + 2;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Daily Operations Report: ${report.date}`, 14, y);
  y += lineHeight;
  doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 14, y);
  y += lineHeight + 4;

  heading('Enrollment');
  row('New Inquiries', String(report.enrollment.new_inquiries));
  row('Tour Requests', String(report.enrollment.tour_requests));
  y += 2;

  heading('Attendance');
  row('Children Present', String(report.attendance.children_present));
  row('Staff on Duty', String(report.attendance.staff_on_duty));
  y += 2;

  heading('Meal Counts');
  const mealRows = [
    ['Breakfast', report.meals.breakfast],
    ['AM Snack', report.meals.am_snack],
    ['Lunch', report.meals.lunch],
    ['PM Snack', report.meals.pm_snack],
  ] as const;
  for (const [label, meal] of mealRows) {
    const status = meal.submitted
      ? `Submitted${meal.on_time ? ' (on time)' : ' (late)'} - ${meal.child_count} children`
      : 'Not submitted';
    row(label, status);
  }
  y += 2;

  heading('Tasks');
  row('Completed', `${report.tasks.completed} / ${report.tasks.total} (${report.tasks.completion_rate}%)`);
  y += 2;

  heading('Incidents');
  row('Open', String(report.incidents.open));
  row('Resolved Today', String(report.incidents.resolved_today));
  y += 2;

  if (report.clock_discrepancies.still_clocked_in.length > 0 || report.clock_discrepancies.missing_clockout.length > 0) {
    heading('Clock Discrepancies');
    for (const d of report.clock_discrepancies.still_clocked_in) {
      row('Still Clocked In', d.employee_name);
    }
    for (const d of report.clock_discrepancies.missing_clockout) {
      row('Missing Clockout', `${d.employee_name} (${d.date})`);
    }
    y += 2;
  }

  if (report.certifications_expiring_30d.length > 0) {
    heading('Certifications Expiring (30 days)');
    for (const c of report.certifications_expiring_30d) {
      row(`${c.employee_name}: ${c.cert_name}`, `${c.expiry_date} (${c.days_remaining}d)`);
    }
  }

  doc.save(`daily-report-${report.date}.pdf`);
}

// ─── Sub-components ───────────────────────────────────────────────────

function MealRow({ label, meal }: { label: string; meal: DailyReport['meals']['breakfast'] }) {
  return (
    <div className="flex items-center justify-between py-1 border-b last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {meal.submitted ? (
          <CheckCircle2 className="h-4 w-4 text-christina-green" />
        ) : (
          <XCircle className="h-4 w-4 text-christina-coral" />
        )}
        <Badge
          variant="outline"
          className={
            meal.submitted
              ? meal.on_time
                ? 'text-green-700 border-green-300'
                : 'text-amber-700 border-amber-300'
              : 'text-red-700 border-red-300'
          }
        >
          {meal.submitted ? (meal.on_time ? 'On time' : 'Late') : 'Missing'}
        </Badge>
        {meal.child_count > 0 && (
          <span className="text-xs text-muted-foreground">{meal.child_count} children</span>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function DailyReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const [tab, setTab] = useState<'am' | 'pm'>('pm');
  const [amReport, setAmReport] = useState<DailyReport | null>(null);
  const [pmReport, setPmReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    setAmReport(buildReport(yesterday));
    setPmReport(buildReport(today));
  }, [today, yesterday]);

  const report = tab === 'am' ? amReport : pmReport;

  if (!report) {
    return (
      <DashboardLayout isAdmin>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Building report...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-christina-red" />
              Daily Operations Report
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {report.date} — generated {new Date(report.generated_at).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReportCSV(report)}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReportPDF(report)}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* AM / PM toggle */}
        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setTab('am')}
            className={`px-4 py-1.5 rounded-t text-sm font-medium transition-colors ${
              tab === 'am'
                ? 'bg-christina-red text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AM Report (yesterday, {yesterday})
          </button>
          <button
            onClick={() => setTab('pm')}
            className={`px-4 py-1.5 rounded-t text-sm font-medium transition-colors ${
              tab === 'pm'
                ? 'bg-christina-red text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            PM Report (today, {today})
          </button>
        </div>

        {/* Error banner */}
        {report.errors.length > 0 && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {report.errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}

        {/* Report cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Enrollment */}
          <SectionCard
            title="Enrollment"
            icon={<UserPlus className="h-4 w-4 text-christina-blue" />}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New inquiries</span>
                <span className="font-semibold">{report.enrollment.new_inquiries}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tour requests</span>
                <span className="font-semibold">{report.enrollment.tour_requests}</span>
              </div>
            </div>
          </SectionCard>

          {/* Attendance */}
          <SectionCard
            title="Attendance"
            icon={<Users className="h-4 w-4 text-christina-blue" />}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Children present</span>
                <span className="font-semibold">{report.attendance.children_present}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Staff on duty</span>
                <span className="font-semibold">{report.attendance.staff_on_duty}</span>
              </div>
            </div>
          </SectionCard>

          {/* Meals */}
          <SectionCard
            title="Meal Counts"
            icon={<UtensilsCrossed className="h-4 w-4 text-amber-600" />}
          >
            <div className="space-y-1">
              <MealRow label="Breakfast" meal={report.meals.breakfast} />
              <MealRow label="AM Snack" meal={report.meals.am_snack} />
              <MealRow label="Lunch" meal={report.meals.lunch} />
              <MealRow label="PM Snack" meal={report.meals.pm_snack} />
            </div>
          </SectionCard>

          {/* Tasks */}
          <SectionCard
            title="Tasks"
            icon={<ListTodo className="h-4 w-4 text-christina-green" />}
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold">
                  {report.tasks.completed} / {report.tasks.total}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-christina-green rounded-full h-2 transition-all"
                  style={{ width: `${report.tasks.completion_rate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {report.tasks.completion_rate}% complete
              </p>
            </div>
          </SectionCard>

          {/* Incidents */}
          <SectionCard
            title="Incidents"
            icon={<AlertTriangle className="h-4 w-4 text-christina-coral" />}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Open</span>
                <span className={`font-semibold ${report.incidents.open > 0 ? 'text-christina-coral' : ''}`}>
                  {report.incidents.open}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Resolved today</span>
                <span className="font-semibold text-christina-green">
                  {report.incidents.resolved_today}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Clock discrepancies */}
          <SectionCard
            title="Clock Discrepancies"
            icon={<Clock className="h-4 w-4 text-amber-600" />}
          >
            {report.clock_discrepancies.still_clocked_in.length === 0 &&
            report.clock_discrepancies.missing_clockout.length === 0 ? (
              <p className="text-sm text-muted-foreground">No discrepancies found.</p>
            ) : (
              <div className="space-y-2">
                {report.clock_discrepancies.still_clocked_in.map((d) => (
                  <div key={d.employee_id} className="text-sm">
                    <Badge variant="outline" className="text-amber-700 border-amber-300 mr-2">
                      Active
                    </Badge>
                    {d.employee_name}
                  </div>
                ))}
                {report.clock_discrepancies.missing_clockout.map((d) => (
                  <div key={`${d.employee_id}_${d.date}`} className="text-sm">
                    <Badge variant="outline" className="text-red-700 border-red-300 mr-2">
                      Missing
                    </Badge>
                    {d.employee_name} ({d.date})
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Certifications */}
          <SectionCard
            title="Certifications Expiring (30 days)"
            icon={<Award className="h-4 w-4 text-purple-600" />}
          >
            {report.certifications_expiring_30d.length === 0 ? (
              <p className="text-sm text-muted-foreground">No certifications expiring soon.</p>
            ) : (
              <div className="space-y-2">
                {report.certifications_expiring_30d.map((c, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium">{c.employee_name}</span>
                    <span className="text-muted-foreground mx-1">—</span>
                    <span>{c.cert_name}</span>
                    <Badge
                      variant="outline"
                      className={`ml-2 ${
                        c.days_remaining <= 7
                          ? 'text-red-700 border-red-300'
                          : 'text-amber-700 border-amber-300'
                      }`}
                    >
                      {c.days_remaining}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </DashboardLayout>
  );
}
