/**
 * Behavioral Pattern Detection
 * Scans incident_reports for repeat behaviors, severity escalation, and high-frequency incidents per child.
 * Fitness test gap: "No behavioral pattern detection"
 */

import { supabaseSelect } from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { BehavioralPattern } from './types';

interface IncidentRow {
  id: string;
  // incident_reports has no single child_name column; children involved in an
  // incident are stored as an array of names (a single incident can involve
  // more than one child), so each is attributed the incident below.
  involved_children: string[] | null;
  incident_type: string;
  severity: string;
  description: string;
  reported_at: string | null;
  created_at: string;
}

const SEVERITY_ORDER: Record<string, number> = {
  minor: 1,
  moderate: 2,
  serious: 3,
  critical: 4,
};

export async function detectBehavioralPatterns(
  daysBack: number = 30,
  threshold: number = 3
): Promise<BehavioralPattern[]> {
  if (!isSupabaseConfigured) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const incidents = await supabaseSelect<IncidentRow>('incident_reports');
  if (!incidents) return [];

  // Filter to recent incidents
  const recent = incidents.filter(
    (i) => new Date(i.reported_at || i.created_at) >= cutoffDate
  );

  // Group by child name. An incident can involve several children, so it is
  // counted for each one; incidents with no named child fall under 'Unknown'.
  const byChild = new Map<string, IncidentRow[]>();
  for (const incident of recent) {
    const names =
      incident.involved_children && incident.involved_children.length > 0
        ? incident.involved_children
        : ['Unknown'];
    for (const rawName of names) {
      const name = (rawName || '').trim() || 'Unknown';
      const existing = byChild.get(name) || [];
      existing.push(incident);
      byChild.set(name, existing);
    }
  }

  const patterns: BehavioralPattern[] = [];

  const entries = Array.from(byChild.entries());
  for (const [childName, childIncidents] of entries) {
    // Sort by date ascending
    childIncidents.sort(
      (a: IncidentRow, b: IncidentRow) =>
        new Date(a.reported_at || a.created_at).getTime() -
        new Date(b.reported_at || b.created_at).getTime()
    );

    const recentFormatted = childIncidents.map((i: IncidentRow) => ({
      date: i.reported_at || i.created_at,
      type: i.incident_type || 'unknown',
      severity: i.severity || 'minor',
      description: i.description || '',
    }));

    // Check for frequent incidents
    if (childIncidents.length >= threshold) {
      patterns.push({
        childName,
        incidentCount: childIncidents.length,
        recentIncidents: recentFormatted,
        pattern: 'frequent_incidents',
        recommendation: `${childName} has ${childIncidents.length} incidents in the last ${daysBack} days. Review for underlying causes and consider a behavior support plan.`,
      });
      continue;
    }

    // Check for severity escalation
    if (childIncidents.length >= 2) {
      const severities = childIncidents.map(
        (i: IncidentRow) => SEVERITY_ORDER[i.severity || 'minor'] || 1
      );
      const isEscalating = severities.every(
        (s: number, idx: number) => idx === 0 || s >= severities[idx - 1]
      );
      const hasIncrease =
        severities[severities.length - 1] > severities[0];

      if (isEscalating && hasIncrease) {
        patterns.push({
          childName,
          incidentCount: childIncidents.length,
          recentIncidents: recentFormatted,
          pattern: 'severity_escalation',
          recommendation: `Severity is escalating for ${childName}. Started at ${childIncidents[0].severity || 'minor'}, now at ${childIncidents[childIncidents.length - 1].severity || 'unknown'}. Proactive intervention recommended.`,
        });
        continue;
      }
    }

    // Check for repeat behavior type
    if (childIncidents.length >= 2) {
      const typeCounts: Record<string, number> = {};
      for (const i of childIncidents) {
        const t = i.incident_type || 'unknown';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      }

      for (const type of Object.keys(typeCounts)) {
        const count = typeCounts[type];
        if (count >= 2) {
          patterns.push({
            childName,
            incidentCount: childIncidents.length,
            recentIncidents: recentFormatted,
            pattern: 'repeat_behavior',
            recommendation: `${childName} has ${count} "${type}" incidents in ${daysBack} days. This is a repeating pattern that needs attention.`,
          });
          break;
        }
      }
    }
  }

  // Sort by incident count descending
  patterns.sort((a, b) => b.incidentCount - a.incidentCount);

  return patterns;
}
