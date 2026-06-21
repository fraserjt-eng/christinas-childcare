// Incident & Communication Log Storage for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
} from '@/lib/supabase/service';
import { isDemoSeedEnabled } from '@/lib/demo-mode';

// ============================================================================
// Types
// ============================================================================

export type IncidentType = 'injury' | 'illness' | 'behavioral' | 'property' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious';

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  injury: 'Injury',
  illness: 'Illness',
  behavioral: 'Behavioral',
  property: 'Property Damage',
  other: 'Other',
};

export const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  serious: 'Serious',
};

export interface IncidentAuditEntry {
  changed_by: string;
  changed_at: string;
  changes: Array<{ field: string; old_value: string; new_value: string }>;
}

export interface IncidentLog {
  id: string;
  date: string;
  time: string;
  child_name: string;
  classroom: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  action_taken: string;
  witnesses?: string;
  staff_on_duty: string;
  parent_notified: boolean;
  parent_notified_at?: string;
  parent_acknowledged_at?: string;
  follow_up_required: boolean;
  follow_up_completed_at?: string;
  photo_urls?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  audit_trail?: IncidentAuditEntry[];
}

export interface IncidentStats {
  total: number;
  by_type: Record<IncidentType, number>;
  by_severity: Record<IncidentSeverity, number>;
  by_classroom: Record<string, number>;
  by_time_of_day: { morning: number; afternoon: number };
  notification_compliance: number;
  documentation_complete: number;
}

// ============================================================================
// Storage Key
// ============================================================================

const KEY = 'christinas_incident_log';

// ============================================================================
// Generic Helpers
// ============================================================================

function getFromStorage(): IncidentLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading incident log from storage:', error);
    return [];
  }
}

function saveToStorage(data: IncidentLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving incident log to storage:', error);
  }
}

function generateId(): string {
  return `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// CRUD
// ============================================================================

export async function getIncidents(filters?: {
  incident_type?: IncidentType;
  severity?: IncidentSeverity;
  classroom?: string;
  parent_notified?: boolean;
  startDate?: string;
  endDate?: string;
}): Promise<IncidentLog[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<IncidentLog>('incident_reports');
  let incidents = cloudData !== null ? cloudData : getFromStorage();

  // Incident reports describe real children. Only seed fabricated reports in a
  // throwaway demo environment; the live app returns the real (possibly empty) list.
  if (incidents.length === 0 && isDemoSeedEnabled()) {
    await seedIncidentData();
    incidents = getFromStorage();
  }

  if (filters) {
    if (filters.incident_type) {
      incidents = incidents.filter((i) => i.incident_type === filters.incident_type);
    }
    if (filters.severity) {
      incidents = incidents.filter((i) => i.severity === filters.severity);
    }
    if (filters.classroom) {
      incidents = incidents.filter((i) => i.classroom === filters.classroom);
    }
    if (filters.parent_notified !== undefined) {
      incidents = incidents.filter((i) => i.parent_notified === filters.parent_notified);
    }
    if (filters.startDate) {
      incidents = incidents.filter((i) => i.date >= filters.startDate!);
    }
    if (filters.endDate) {
      incidents = incidents.filter((i) => i.date <= filters.endDate!);
    }
  }

  incidents.sort((a, b) => {
    const aDateTime = `${a.date}T${a.time}`;
    const bDateTime = `${b.date}T${b.time}`;
    return bDateTime.localeCompare(aDateTime);
  });

  return incidents;
}

export async function createIncident(
  data: Omit<IncidentLog, 'id' | 'created_at'>
): Promise<IncidentLog> {
  const incident: IncidentLog = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
    audit_trail: [],
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<IncidentLog>('incident_reports', incident as unknown as Record<string, unknown>);
  const incidents = getFromStorage();
  incidents.push(incident);
  saveToStorage(incidents);
  return incident;
}

export async function updateIncident(
  id: string,
  updates: Partial<Omit<IncidentLog, 'id' | 'created_at'>>,
  changedBy?: string
): Promise<IncidentLog | null> {
  const incidents = getFromStorage();
  const index = incidents.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const existing = incidents[index];

  // Build an audit entry that records what changed
  const trackedFields = [
    'date', 'time', 'child_name', 'classroom', 'incident_type', 'severity',
    'description', 'action_taken', 'witnesses', 'staff_on_duty', 'parent_notified',
    'follow_up_required', 'notes',
  ] as const;

  const changes: Array<{ field: string; old_value: string; new_value: string }> = [];
  for (const field of trackedFields) {
    if (field in updates) {
      const oldVal = String(existing[field] ?? '');
      const newVal = String((updates as Record<string, unknown>)[field] ?? '');
      if (oldVal !== newVal) {
        changes.push({ field, old_value: oldVal, new_value: newVal });
      }
    }
  }

  const auditEntry: IncidentAuditEntry = {
    changed_by: changedBy || 'unknown',
    changed_at: new Date().toISOString(),
    changes,
  };

  const updatedIncident: IncidentLog = {
    ...existing,
    ...updates,
    id,
    created_at: existing.created_at,
    audit_trail: [...(existing.audit_trail || []), auditEntry],
  };

  // Write to Supabase first, then cache locally
  await supabaseUpdate<IncidentLog>('incident_reports', id, {
    ...updates,
    audit_trail: updatedIncident.audit_trail,
  } as Record<string, unknown>);

  incidents[index] = updatedIncident;
  saveToStorage(incidents);
  return updatedIncident;
}

// ============================================================================
// Specialized Queries
// ============================================================================

export async function getUnnotifiedParents(): Promise<IncidentLog[]> {
  const incidents = await getIncidents({ parent_notified: false });
  // Flag incidents older than 24 hours with no notification
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return incidents.filter((i) => new Date(i.created_at).getTime() < cutoff);
}

export async function getIncidentStats(
  startDate: string,
  endDate: string
): Promise<IncidentStats> {
  const incidents = await getIncidents({ startDate, endDate });

  const by_type: Record<IncidentType, number> = {
    injury: 0,
    illness: 0,
    behavioral: 0,
    property: 0,
    other: 0,
  };
  const by_severity: Record<IncidentSeverity, number> = {
    minor: 0,
    moderate: 0,
    serious: 0,
  };
  const by_classroom: Record<string, number> = {};
  let morning = 0;
  let afternoon = 0;

  for (const inc of incidents) {
    by_type[inc.incident_type]++;
    by_severity[inc.severity]++;
    by_classroom[inc.classroom] = (by_classroom[inc.classroom] || 0) + 1;

    const hour = parseInt(inc.time.split(':')[0]);
    if (hour < 12) {
      morning++;
    } else {
      afternoon++;
    }
  }

  const total = incidents.length;
  const notified = incidents.filter((i) => i.parent_notified).length;
  const complete = incidents.filter(
    (i) =>
      i.description.length > 10 &&
      i.action_taken.length > 10 &&
      i.staff_on_duty.length > 0
  ).length;

  return {
    total,
    by_type,
    by_severity,
    by_classroom,
    by_time_of_day: { morning, afternoon },
    notification_compliance: total > 0 ? Math.round((notified / total) * 100) : 100,
    documentation_complete: total > 0 ? Math.round((complete / total) * 100) : 100,
  };
}

export async function getComplianceReport(): Promise<{
  total_incidents: number;
  parent_notified_pct: number;
  fully_documented_pct: number;
  overdue_notifications: number;
  follow_up_pending: number;
}> {
  const cloudData = await supabaseSelect<IncidentLog>('incident_reports');
  const incidents = cloudData !== null ? cloudData : getFromStorage();
  if (incidents.length === 0) return {
    total_incidents: 0,
    parent_notified_pct: 100,
    fully_documented_pct: 100,
    overdue_notifications: 0,
    follow_up_pending: 0,
  };

  const total = incidents.length;
  const notified = incidents.filter((i) => i.parent_notified).length;
  const documented = incidents.filter(
    (i) => i.description && i.action_taken && i.staff_on_duty
  ).length;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const overdue = incidents.filter(
    (i) => !i.parent_notified && new Date(i.created_at).getTime() < cutoff
  ).length;
  const followUpPending = incidents.filter(
    (i) => i.follow_up_required && !i.follow_up_completed_at
  ).length;

  return {
    total_incidents: total,
    parent_notified_pct: Math.round((notified / total) * 100),
    fully_documented_pct: Math.round((documented / total) * 100),
    overdue_notifications: overdue,
    follow_up_pending: followUpPending,
  };
}

// ============================================================================
// Weekly Trend Data (last 8 weeks)
// ============================================================================

export async function getWeeklyTrend(): Promise<{ week: string; count: number }[]> {
  const cloudData = await supabaseSelect<IncidentLog>('incident_reports');
  const incidents = cloudData !== null ? cloudData : getFromStorage();
  const result: { week: string; count: number }[] = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    const count = incidents.filter((inc) => inc.date >= startStr && inc.date <= endStr).length;
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    result.push({ week: label, count });
  }

  return result;
}

// ============================================================================
// Seed Data
// ============================================================================

async function seedIncidentData(): Promise<void> {
  const now = new Date();

  const incidents: IncidentLog[] = [
    {
      id: 'inc_seed_1',
      date: daysAgo(now, 1),
      time: '09:15',
      child_name: 'Lucas M.',
      classroom: 'Butterflies (3-4yr)',
      incident_type: 'injury',
      severity: 'minor',
      description: 'Child tripped on the rug near the reading corner and scraped his left knee. No blood, minor red mark.',
      action_taken: 'Cleaned the area with antiseptic wipe, applied bandage. Child was comforted and returned to play within 5 minutes.',
      witnesses: 'Teacher Aide Sandra',
      staff_on_duty: 'Maria Chen',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 1),
      parent_acknowledged_at: daysAgoISO(now, 1),
      follow_up_required: false,
      created_by: 'Maria Chen',
      created_at: daysAgoISO(now, 1),
    },
    {
      id: 'inc_seed_2',
      date: daysAgo(now, 2),
      time: '13:40',
      child_name: 'Amara K.',
      classroom: 'Sunflowers (PreK)',
      incident_type: 'illness',
      severity: 'moderate',
      description: 'Child complained of stomach pain after lunch and vomited once in the bathroom. Temperature taken: 99.8°F.',
      action_taken: 'Child was isolated in quiet area, parent contacted immediately. Parent picked up child within 30 minutes. Classroom surfaces wiped down.',
      staff_on_duty: 'Rachel Torres',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 2),
      parent_acknowledged_at: daysAgoISO(now, 2),
      follow_up_required: true,
      follow_up_completed_at: daysAgoISO(now, 1),
      notes: 'Child returned next day healthy. Parents reported stomach bug resolved.',
      created_by: 'Rachel Torres',
      created_at: daysAgoISO(now, 2),
    },
    {
      id: 'inc_seed_3',
      date: daysAgo(now, 3),
      time: '10:05',
      child_name: 'Noah T.',
      classroom: 'Ladybugs (2-3yr)',
      incident_type: 'behavioral',
      severity: 'minor',
      description: 'Child bit another child on the forearm during toy dispute at the block station. Skin not broken.',
      action_taken: 'Biting child separated and redirected. Affected child comforted, arm checked (no mark visible after 10 minutes). Both sets of parents notified per policy.',
      witnesses: 'James Okafor',
      staff_on_duty: 'Sandra Williams',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 3),
      follow_up_required: true,
      notes: 'Behavior plan discussion scheduled with parents of biting child.',
      created_by: 'Sandra Williams',
      created_at: daysAgoISO(now, 3),
    },
    {
      id: 'inc_seed_4',
      date: daysAgo(now, 5),
      time: '14:30',
      child_name: 'Sofia D.',
      classroom: 'Bumblebees (Infant)',
      incident_type: 'injury',
      severity: 'minor',
      description: 'Infant rolled off the changing pad approximately 4 inches onto a padded floor mat during diaper change. Child cried briefly, no injuries observed.',
      action_taken: 'Full assessment performed, child monitored for 30 minutes. No bruising, swelling, or changes in behavior. Director notified per fall protocol. Parents called immediately.',
      staff_on_duty: 'James Okafor',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 5),
      parent_acknowledged_at: daysAgoISO(now, 5),
      follow_up_required: true,
      follow_up_completed_at: daysAgoISO(now, 4),
      created_by: 'James Okafor',
      created_at: daysAgoISO(now, 5),
    },
    {
      id: 'inc_seed_5',
      date: daysAgo(now, 7),
      time: '11:20',
      child_name: 'Elijah R.',
      classroom: 'Butterflies (3-4yr)',
      incident_type: 'injury',
      severity: 'moderate',
      description: 'Child fell from the low climbing structure on the playground (height approx. 2 feet) and landed on right arm. Child reported arm pain. No visible deformity.',
      action_taken: 'Ice pack applied. Child kept calm and still. Parent contacted and advised to seek medical evaluation. Parent arrived within 20 minutes and took child to urgent care.',
      witnesses: 'Maria Chen, Sandra Williams',
      staff_on_duty: 'Rachel Torres',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 7),
      parent_acknowledged_at: daysAgoISO(now, 7),
      follow_up_required: true,
      follow_up_completed_at: daysAgoISO(now, 6),
      notes: 'Parent reported no fracture found on X-ray, soft tissue sprain only. Child cleared to return.',
      created_by: 'Rachel Torres',
      created_at: daysAgoISO(now, 7),
    },
    {
      id: 'inc_seed_6',
      date: daysAgo(now, 10),
      time: '08:45',
      child_name: 'Zoe L.',
      classroom: 'Sunflowers (PreK)',
      incident_type: 'illness',
      severity: 'minor',
      description: 'Child arrived with mild cough and runny nose. Temperature taken at 8:45am: 98.6°F. No fever.',
      action_taken: 'Teacher monitored child throughout morning. Child remained comfortable and participated normally. Parent notified via app message to watch for fever development.',
      staff_on_duty: 'Maria Chen',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 10),
      follow_up_required: false,
      created_by: 'Maria Chen',
      created_at: daysAgoISO(now, 10),
    },
    {
      id: 'inc_seed_7',
      date: daysAgo(now, 14),
      time: '15:10',
      child_name: 'Mateo V.',
      classroom: 'Ladybugs (2-3yr)',
      incident_type: 'property',
      severity: 'minor',
      description: 'Child knocked over the class fish tank stand, causing the 5-gallon tank to fall. Tank cracked and water spilled. Fish safely recovered in a bucket.',
      action_taken: 'Area cleared immediately, no children injured. Water cleaned up. Fish placed in temporary container. Parents notified of incident. Replacement tank ordered.',
      staff_on_duty: 'Sandra Williams',
      parent_notified: false,
      follow_up_required: true,
      created_by: 'Sandra Williams',
      created_at: daysAgoISO(now, 14),
    },
    {
      id: 'inc_seed_8',
      date: daysAgo(now, 18),
      time: '10:55',
      child_name: 'Chloe P.',
      classroom: 'Sunflowers (PreK)',
      incident_type: 'behavioral',
      severity: 'moderate',
      description: 'Child had significant tantrum lasting approximately 20 minutes, throwing objects (small blocks) and hitting staff member on the arm twice. Child was unable to self-regulate.',
      action_taken: 'Classroom cleared of other children for safety. Child given calm-down space with sensory tools. Staff member checked, no injury. Director notified. Parent called to discuss and schedule meeting.',
      witnesses: 'Rachel Torres',
      staff_on_duty: 'Maria Chen',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 18),
      parent_acknowledged_at: daysAgoISO(now, 17),
      follow_up_required: true,
      notes: 'Parent meeting scheduled for Monday to discuss behavior support plan.',
      created_by: 'Maria Chen',
      created_at: daysAgoISO(now, 18),
    },
    {
      id: 'inc_seed_9',
      date: daysAgo(now, 21),
      time: '12:30',
      child_name: 'Aiden S.',
      classroom: 'Bumblebees (Infant)',
      incident_type: 'illness',
      severity: 'serious',
      description: 'Infant developed hives on torso and arms approximately 15 minutes after lunch. Possible allergic reaction. No breathing difficulty observed.',
      action_taken: 'Director notified immediately. 911 called as precaution per allergy protocol. Child monitored closely. Parent reached within 3 minutes. EMS arrived and assessed child, determined mild allergic reaction. Parent transported child to ER.',
      staff_on_duty: 'James Okafor',
      parent_notified: true,
      parent_notified_at: daysAgoISO(now, 21),
      parent_acknowledged_at: daysAgoISO(now, 21),
      follow_up_required: true,
      follow_up_completed_at: daysAgoISO(now, 20),
      notes: 'Hospital confirmed mild allergic reaction to a new food introduced at home that morning. Allergy file updated.',
      created_by: 'James Okafor',
      created_at: daysAgoISO(now, 21),
    },
  ];

  saveToStorage(incidents);
}

function daysAgo(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function daysAgoISO(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
