/**
 * Staffing & Operational Alert Scan
 * Reads employee, enrollment pipeline, food count, and training data
 * to surface operational risks.
 */

import { StaffingAlert } from './types';
import { getEmployees } from '@/lib/employee-storage';
import { getLeads } from '@/lib/enrollment-pipeline-storage';
import { getFoodCounts } from '@/lib/food-storage';
import { getAllProgress } from '@/lib/training/training-storage';
import { trainingModules } from '@/lib/training/modules';

export async function runStaffingScan(): Promise<StaffingAlert[]> {
  const alerts: StaffingAlert[] = [];

  const employees = await getEmployees();
  const leads = await getLeads();
  const foodCounts = await getFoodCounts();
  const allProgress = await getAllProgress();

  // 1. Staff with no certifications listed (compliance risk)
  const noCerts = employees.filter(
    (e) => e.employment_status === 'active' && (!e.certifications || e.certifications.length === 0)
  );
  if (noCerts.length > 0) {
    alerts.push({
      type: 'cert_expiring',
      severity: 'warning',
      title: `${noCerts.length} staff missing certification records`,
      detail: 'Active employees have no certifications on file. This is a licensing compliance risk.',
      dataPoints: noCerts.map((e) => `${e.first_name} ${e.last_name} (${e.job_title})`),
      actionLink: '/admin/compliance',
    });
  }

  // 2. Enrollment pipeline stale: inquiries in "contacted" stage for 7+ days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const staleLeads = leads.filter(
    (l) =>
      l.stage === 'inquiry' &&
      new Date(l.updated_at).getTime() < sevenDaysAgo
  );
  if (staleLeads.length > 0) {
    alerts.push({
      type: 'pipeline_stale',
      severity: 'warning',
      title: `${staleLeads.length} stale inquiry${staleLeads.length > 1 ? 'ies' : 'y'} in pipeline`,
      detail: 'Inquiry-stage families have had no follow-up in 7+ days. They may lose interest or enroll elsewhere.',
      dataPoints: staleLeads.map(
        (l) => `${l.child_name} (${l.parent_name}) - last updated ${new Date(l.updated_at).toLocaleDateString()}`
      ),
      actionLink: '/admin/pipeline',
    });
  }

  // 3. CACFP submission gaps: missing meal counts in the last 5 weekdays
  const today = new Date();
  const recentWeekdays: string[] = [];
  const checkDate = new Date(today);
  while (recentWeekdays.length < 5) {
    checkDate.setDate(checkDate.getDate() - 1);
    const day = checkDate.getDay();
    if (day !== 0 && day !== 6) {
      recentWeekdays.push(checkDate.toISOString().split('T')[0]);
    }
  }

  const countDates = new Set(foodCounts.map((fc) => fc.date));
  const missingDates = recentWeekdays.filter((d) => !countDates.has(d));
  if (missingDates.length >= 2) {
    alerts.push({
      type: 'cacfp_gap',
      severity: 'action_needed',
      title: `${missingDates.length} missed meal count${missingDates.length > 1 ? 's' : ''} this week`,
      detail: 'CACFP reimbursement requires daily meal counts. Missing days mean lost revenue.',
      dataPoints: missingDates.map((d) => `Missing: ${d}`),
      actionLink: '/admin/food-counts',
    });
  }

  // 4. Training rollout: percentage of staff with any training progress
  const activeStaff = employees.filter((e) => e.employment_status === 'active');
  const staffWithProgress = new Set(allProgress.map((p) => p.user_id));
  const engagementRate = activeStaff.length > 0 ? staffWithProgress.size / activeStaff.length : 1;

  if (engagementRate < 0.4 && activeStaff.length > 0) {
    alerts.push({
      type: 'training_behind',
      severity: 'warning',
      title: `Training engagement at ${Math.round(engagementRate * 100)}%`,
      detail: `Only ${staffWithProgress.size} of ${activeStaff.length} active staff have started the training system. Consider scheduling dedicated training time.`,
      dataPoints: activeStaff
        .filter((e) => !staffWithProgress.has(e.id))
        .slice(0, 5)
        .map((e) => `${e.first_name} ${e.last_name} - no progress`),
      actionLink: '/admin/training',
    });
  }

  // 5. Quick stats: total modules completed across all staff
  const completedModules = new Set<string>();
  for (const p of allProgress) {
    if (p.completed) {
      completedModules.add(`${p.user_id}::${p.module_id}::${p.section}`);
    }
  }
  const totalPossible = activeStaff.length * trainingModules.length * 3; // 3 sections each
  const completionRate = totalPossible > 0 ? completedModules.size / totalPossible : 0;

  if (completionRate > 0.5 && activeStaff.length > 0) {
    alerts.push({
      type: 'training_behind',
      severity: 'info',
      title: `Training completion at ${Math.round(completionRate * 100)}%`,
      detail: `${completedModules.size} section completions across ${activeStaff.length} staff members. Good progress.`,
      dataPoints: [],
      actionLink: '/admin/training',
    });
  }

  return alerts;
}
