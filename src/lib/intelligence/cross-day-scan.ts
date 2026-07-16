/**
 * Cross-Day Pattern Detection
 * Compares today's operational metrics against rolling 30-day averages.
 * Fitness test gap: "No cross-day pattern detection"
 */

import { supabaseSelect } from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { CrossDayAnomaly } from './types';

interface AttendanceRow {
  id: string;
  child_id: string;
  check_in: string;
  check_out: string | null;
  center_id: string;
}

interface FoodCountRow {
  id: string;
  meal_type: string;
  child_count: number;
  date: string;
}

interface IncidentRow {
  id: string;
  reported_at: string | null;
  created_at: string;
  severity: string;
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function detectCrossDayAnomalies(
  targetDate?: Date
): Promise<CrossDayAnomaly[]> {
  if (!isSupabaseConfigured) return [];

  const today = targetDate || new Date();
  const todayStr = toDateString(today);
  const anomalies: CrossDayAnomaly[] = [];

  // Fetch last 30 days of data
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Attendance data
  const attendance = await supabaseSelect<AttendanceRow>('attendance');
  if (attendance) {
    const dailyCounts = new Map<string, Set<string>>();
    for (const a of attendance) {
      const date = a.check_in ? toDateString(new Date(a.check_in)) : null;
      if (!date) continue;
      const existing = dailyCounts.get(date) || new Set();
      existing.add(a.child_id);
      dailyCounts.set(date, existing);
    }

    const todayCount = dailyCounts.get(todayStr)?.size || 0;
    const pastDays: number[] = [];
    const countEntries = Array.from(dailyCounts.entries());
    for (const [date, children] of countEntries) {
      if (date !== todayStr && date >= toDateString(thirtyDaysAgo)) {
        pastDays.push(children.size);
      }
    }

    if (pastDays.length >= 5) {
      const avg = pastDays.reduce((s, v) => s + v, 0) / pastDays.length;
      const deviation = avg > 0 ? ((todayCount - avg) / avg) * 100 : 0;

      if (Math.abs(deviation) > 20) {
        anomalies.push({
          metric: 'Attendance',
          todayValue: todayCount,
          averageValue: Math.round(avg),
          deviation: Math.round(deviation),
          direction: deviation > 0 ? 'above' : 'below',
          severity: Math.abs(deviation) > 40 ? 'action_needed' : 'warning',
          description:
            deviation < -20
              ? `Attendance is ${Math.abs(Math.round(deviation))}% below the 30-day average. Check for illness patterns or scheduling issues.`
              : `Attendance is ${Math.round(deviation)}% above average. Verify staffing ratios are adequate.`,
        });
      }
    }
  }

  // Meal count data
  const meals = await supabaseSelect<FoodCountRow>('food_counts');
  if (meals) {
    const dailyMeals = new Map<string, number>();
    for (const m of meals) {
      const date = m.date || '';
      dailyMeals.set(date, (dailyMeals.get(date) || 0) + (m.child_count || 0));
    }

    const todayMeals = dailyMeals.get(todayStr) || 0;
    const pastMeals: number[] = [];
    const mealEntries = Array.from(dailyMeals.entries());
    for (const [date, count] of mealEntries) {
      if (date !== todayStr && date >= toDateString(thirtyDaysAgo)) {
        pastMeals.push(count);
      }
    }

    if (pastMeals.length >= 5) {
      const avg = pastMeals.reduce((s, v) => s + v, 0) / pastMeals.length;
      const deviation = avg > 0 ? ((todayMeals - avg) / avg) * 100 : 0;

      if (Math.abs(deviation) > 25) {
        anomalies.push({
          metric: 'Meal Counts',
          todayValue: todayMeals,
          averageValue: Math.round(avg),
          deviation: Math.round(deviation),
          direction: deviation > 0 ? 'above' : 'below',
          severity: deviation < -25 ? 'warning' : 'info',
          description:
            deviation < -25
              ? `Meal counts are ${Math.abs(Math.round(deviation))}% below average. Possible CACFP documentation gap.`
              : `Meal counts are ${Math.round(deviation)}% above average.`,
        });
      }
    }
  }

  // Incident data
  const incidents = await supabaseSelect<IncidentRow>('incident_reports');
  if (incidents) {
    const dailyIncidents = new Map<string, number>();
    for (const i of incidents) {
      const src = i.reported_at || i.created_at;
      const date = src ? toDateString(new Date(src)) : '';
      if (!date) continue;
      dailyIncidents.set(date, (dailyIncidents.get(date) || 0) + 1);
    }

    const todayIncidents = dailyIncidents.get(todayStr) || 0;
    const pastIncidentCounts: number[] = [];
    const incidentEntries = Array.from(dailyIncidents.entries());
    for (const [date, count] of incidentEntries) {
      if (date !== todayStr && date >= toDateString(thirtyDaysAgo)) {
        pastIncidentCounts.push(count);
      }
    }

    if (pastIncidentCounts.length >= 5) {
      const avg =
        pastIncidentCounts.reduce((s, v) => s + v, 0) /
        pastIncidentCounts.length;

      if (todayIncidents > avg * 2 && todayIncidents >= 2) {
        anomalies.push({
          metric: 'Incidents',
          todayValue: todayIncidents,
          averageValue: Math.round(avg * 10) / 10,
          deviation: Math.round(((todayIncidents - avg) / (avg || 1)) * 100),
          direction: 'above',
          severity: 'action_needed',
          description: `${todayIncidents} incidents today vs average of ${(avg).toFixed(1)}. Review for environmental or staffing factors.`,
        });
      }
    }
  }

  return anomalies;
}
