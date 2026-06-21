// Enrollment Pipeline Storage Module — Tool 08: Enrollment Funnel
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
} from '@/lib/supabase/service';
import { isDemoSeedEnabled } from '@/lib/demo-mode';

export type PipelineStage =
  | 'inquiry'
  | 'tour_scheduled'
  | 'tour_completed'
  | 'application'
  | 'waitlist'
  | 'enrolled'
  | 'active';

export type LeadSource = 'website' | 'referral' | 'drive_by' | 'social_media' | 'other';

export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'tour'
  | 'application_received'
  | 'stage_change'
  | 'follow_up';

export interface PipelineLead {
  id: string;
  child_name: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  stage: PipelineStage;
  lead_source: LeadSource;
  inquiry_date: string;
  last_activity: string;
  notes?: string;
  assigned_to?: string;
  center_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineActivity {
  id: string;
  pipeline_id: string;
  activity_type: ActivityType;
  notes: string;
  created_at: string;
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  inquiry: 'Inquiry',
  tour_scheduled: 'Tour Scheduled',
  tour_completed: 'Tour Completed',
  application: 'Application',
  waitlist: 'Waitlist',
  enrolled: 'Enrolled',
  active: 'Active',
};

export const STAGE_PROBABILITY: Record<PipelineStage, number> = {
  inquiry: 0.10,
  tour_scheduled: 0.20,
  tour_completed: 0.40,
  application: 0.60,
  waitlist: 0.75,
  enrolled: 0.90,
  active: 1.00,
};

export const STAGE_ORDER: PipelineStage[] = [
  'inquiry',
  'tour_scheduled',
  'tour_completed',
  'application',
  'waitlist',
  'enrolled',
  'active',
];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: 'Website',
  referral: 'Referral',
  drive_by: 'Drive-By',
  social_media: 'Social Media',
  other: 'Other',
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: 'Note',
  call: 'Phone Call',
  email: 'Email',
  tour: 'Tour',
  application_received: 'Application Received',
  stage_change: 'Stage Change',
  follow_up: 'Follow-Up',
};

const LEADS_KEY = 'christinas_pipeline_leads';
const ACTIVITIES_KEY = 'christinas_pipeline_activities';
const CENTER_CAPACITY = 72;
const CURRENT_ENROLLMENT = 58;

// ─── Helpers ────────────────────────────────────────────────────────

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

function daysBetween(dateA: string, dateB: string): number {
  return Math.abs(
    Math.floor(
      (new Date(dateA).getTime() - new Date(dateB).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
}

// ─── Seed Data ──────────────────────────────────────────────────────

function buildSeedLeads(): PipelineLead[] {
  const today = new Date();

  function dateOffset(days: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  const seeds: Omit<PipelineLead, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      child_name: 'Emma Rodriguez',
      parent_name: 'Carmen Rodriguez',
      parent_email: 'carmen.r@email.com',
      parent_phone: '(612) 555-0101',
      stage: 'active',
      lead_source: 'referral',
      inquiry_date: dateOffset(90),
      last_activity: dateOffset(5),
      assigned_to: 'Christina',
      center_id: 'center_001',
    },
    {
      child_name: 'Liam Foster',
      parent_name: 'Brian Foster',
      parent_email: 'brian.foster@email.com',
      parent_phone: '(612) 555-0102',
      stage: 'enrolled',
      lead_source: 'website',
      inquiry_date: dateOffset(45),
      last_activity: dateOffset(2),
      assigned_to: 'Christina',
      center_id: 'center_001',
    },
    {
      child_name: 'Ava Kim',
      parent_name: 'Ji-Young Kim',
      parent_email: 'jiyoung.k@email.com',
      parent_phone: '(612) 555-0103',
      stage: 'enrolled',
      lead_source: 'referral',
      inquiry_date: dateOffset(60),
      last_activity: dateOffset(4),
      assigned_to: 'Christina',
      center_id: 'center_001',
    },
    {
      child_name: 'Noah Garcia',
      parent_name: 'Roberto Garcia',
      parent_email: 'rgarcia@email.com',
      parent_phone: '(612) 555-0104',
      stage: 'waitlist',
      lead_source: 'website',
      inquiry_date: dateOffset(30),
      last_activity: dateOffset(3),
      center_id: 'center_001',
      notes: 'Interested in infant room, opening expected next month',
    },
    {
      child_name: 'Olivia Pham',
      parent_name: 'Linh Pham',
      parent_email: 'linh.pham@email.com',
      parent_phone: '(612) 555-0105',
      stage: 'waitlist',
      lead_source: 'social_media',
      inquiry_date: dateOffset(20),
      last_activity: dateOffset(1),
      center_id: 'center_001',
    },
    {
      child_name: 'William Scott',
      parent_name: 'James Scott',
      parent_email: 'james.scott@email.com',
      parent_phone: '(612) 555-0106',
      stage: 'application',
      lead_source: 'referral',
      inquiry_date: dateOffset(22),
      last_activity: dateOffset(2),
      assigned_to: 'Christina',
      center_id: 'center_001',
    },
    {
      child_name: 'Isabella Chen',
      parent_name: 'Mei Chen',
      parent_email: 'mei.chen@email.com',
      parent_phone: '(612) 555-0107',
      stage: 'application',
      lead_source: 'website',
      inquiry_date: dateOffset(18),
      last_activity: dateOffset(5),
      center_id: 'center_001',
      notes: 'Submitted application, waiting for income verification',
    },
    {
      child_name: 'Benjamin Clark',
      parent_name: 'Sarah Clark',
      parent_email: 'sarah.clark@email.com',
      parent_phone: '(612) 555-0108',
      stage: 'tour_completed',
      lead_source: 'drive_by',
      inquiry_date: dateOffset(14),
      last_activity: dateOffset(8),
      center_id: 'center_001',
      notes: 'Loved the outdoor space, comparing with one other center',
    },
    {
      child_name: 'Mia Johnson',
      parent_name: 'Tiffany Johnson',
      parent_email: 'tiffany.j@email.com',
      parent_phone: '(612) 555-0109',
      stage: 'tour_completed',
      lead_source: 'referral',
      inquiry_date: dateOffset(10),
      last_activity: dateOffset(3),
      center_id: 'center_001',
    },
    {
      child_name: 'Elijah Brooks',
      parent_name: 'Monica Brooks',
      parent_email: 'mbrooks@email.com',
      parent_phone: '(612) 555-0110',
      stage: 'tour_scheduled',
      lead_source: 'website',
      inquiry_date: dateOffset(7),
      last_activity: dateOffset(7),
      center_id: 'center_001',
    },
    {
      child_name: 'Charlotte Lewis',
      parent_name: 'David Lewis',
      parent_email: 'david.lewis@email.com',
      parent_phone: '(612) 555-0111',
      stage: 'tour_scheduled',
      lead_source: 'social_media',
      inquiry_date: dateOffset(5),
      last_activity: dateOffset(5),
      center_id: 'center_001',
    },
    {
      child_name: 'James Walker',
      parent_name: 'Patricia Walker',
      parent_email: 'p.walker@email.com',
      parent_phone: '(612) 555-0112',
      stage: 'inquiry',
      lead_source: 'drive_by',
      inquiry_date: dateOffset(3),
      last_activity: dateOffset(3),
      center_id: 'center_001',
    },
    {
      child_name: 'Amelia Harris',
      parent_name: 'Shannon Harris',
      parent_email: 'sharris@email.com',
      parent_phone: '(612) 555-0113',
      stage: 'inquiry',
      lead_source: 'website',
      inquiry_date: dateOffset(2),
      last_activity: dateOffset(2),
      center_id: 'center_001',
    },
    {
      child_name: 'Lucas Martin',
      parent_name: 'Diego Martin',
      parent_email: 'diego.m@email.com',
      parent_phone: '(612) 555-0114',
      stage: 'inquiry',
      lead_source: 'referral',
      inquiry_date: dateOffset(1),
      last_activity: dateOffset(1),
      center_id: 'center_001',
      notes: 'Referred by the Rodriguez family',
    },
    {
      child_name: 'Sophia Turner',
      parent_name: 'Lisa Turner',
      parent_email: 'lisa.turner@email.com',
      parent_phone: '(612) 555-0115',
      stage: 'inquiry',
      lead_source: 'social_media',
      inquiry_date: dateOffset(0),
      last_activity: dateOffset(0),
      center_id: 'center_001',
    },
    {
      child_name: 'Henry Adams',
      parent_name: 'Marcus Adams',
      parent_email: 'madams@email.com',
      parent_phone: '(612) 555-0116',
      stage: 'active',
      lead_source: 'referral',
      inquiry_date: dateOffset(120),
      last_activity: dateOffset(1),
      assigned_to: 'Christina',
      center_id: 'center_001',
    },
    {
      child_name: 'Aria Wilson',
      parent_name: 'Keisha Wilson',
      parent_email: 'k.wilson@email.com',
      parent_phone: '(612) 555-0117',
      stage: 'active',
      lead_source: 'website',
      inquiry_date: dateOffset(200),
      last_activity: dateOffset(0),
      assigned_to: 'Christina',
      center_id: 'center_001',
    },
  ];

  return seeds.map((s, idx) => ({
    ...s,
    id: `lead_seed_${idx + 1}`,
    created_at: new Date(s.inquiry_date).toISOString(),
    updated_at: new Date(s.last_activity).toISOString(),
  }));
}

function buildSeedActivities(leads: PipelineLead[]): PipelineActivity[] {
  const activities: PipelineActivity[] = [];
  let counter = 1;

  for (const lead of leads) {
    // Add inquiry activity
    activities.push({
      id: `act_seed_${counter++}`,
      pipeline_id: lead.id,
      activity_type: 'note',
      notes: `Initial inquiry received via ${SOURCE_LABELS[lead.lead_source]}`,
      created_at: new Date(lead.inquiry_date).toISOString(),
    });

    // Add stage-appropriate activities
    if (lead.stage === 'tour_scheduled' || STAGE_ORDER.indexOf(lead.stage) > STAGE_ORDER.indexOf('tour_scheduled')) {
      activities.push({
        id: `act_seed_${counter++}`,
        pipeline_id: lead.id,
        activity_type: 'call',
        notes: 'Called to schedule tour. Parent confirmed availability.',
        created_at: new Date(lead.inquiry_date).toISOString(),
      });
    }

    if (lead.stage === 'tour_completed' || STAGE_ORDER.indexOf(lead.stage) > STAGE_ORDER.indexOf('tour_completed')) {
      activities.push({
        id: `act_seed_${counter++}`,
        pipeline_id: lead.id,
        activity_type: 'tour',
        notes: 'Tour completed. Family toured classrooms and met staff.',
        created_at: new Date(lead.last_activity).toISOString(),
      });
    }

    if (lead.stage === 'application' || STAGE_ORDER.indexOf(lead.stage) > STAGE_ORDER.indexOf('application')) {
      activities.push({
        id: `act_seed_${counter++}`,
        pipeline_id: lead.id,
        activity_type: 'application_received',
        notes: 'Application submitted and received.',
        created_at: new Date(lead.last_activity).toISOString(),
      });
    }
  }

  return activities;
}

// ─── CRUD ───────────────────────────────────────────────────────────

export async function getLeads(filters?: {
  stage?: PipelineStage;
  lead_source?: LeadSource;
  assigned_to?: string;
  center_id?: string;
}): Promise<PipelineLead[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<PipelineLead>('enrollment_inquiries');
  let leads = cloudData !== null
    ? cloudData
    : getFromStorage<PipelineLead>(LEADS_KEY);

  // Pipeline leads are real prospective families. Only seed fabricated leads in a
  // throwaway demo environment; the live app returns the real (possibly empty) list.
  if (leads.length === 0 && isDemoSeedEnabled()) {
    leads = buildSeedLeads();
    const activities = buildSeedActivities(leads);
    saveToStorage(LEADS_KEY, leads);
    saveToStorage(ACTIVITIES_KEY, activities);
  }

  if (filters) {
    if (filters.stage) {
      leads = leads.filter((l) => l.stage === filters.stage);
    }
    if (filters.lead_source) {
      leads = leads.filter((l) => l.lead_source === filters.lead_source);
    }
    if (filters.assigned_to) {
      leads = leads.filter((l) => l.assigned_to === filters.assigned_to);
    }
    if (filters.center_id) {
      leads = leads.filter((l) => l.center_id === filters.center_id);
    }
  }

  return leads.sort((a, b) => b.last_activity.localeCompare(a.last_activity));
}

export async function createLead(
  data: Omit<PipelineLead, 'id' | 'created_at' | 'updated_at'>
): Promise<PipelineLead> {
  const lead: PipelineLead = {
    ...data,
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Write to Supabase first, then cache locally
  await supabaseInsert<PipelineLead>('enrollment_inquiries', lead as unknown as Record<string, unknown>);
  const leads = getFromStorage<PipelineLead>(LEADS_KEY);
  leads.push(lead);
  saveToStorage(LEADS_KEY, leads);
  return lead;
}

export async function updateLeadStage(
  id: string,
  stage: PipelineStage,
  notes?: string
): Promise<PipelineLead | null> {
  const leads = getFromStorage<PipelineLead>(LEADS_KEY);
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  const prevStage = leads[index].stage;
  const stageUpdates = {
    stage,
    last_activity: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };

  // Write to Supabase first
  await supabaseUpdate<PipelineLead>('enrollment_inquiries', id, stageUpdates);

  leads[index] = { ...leads[index], ...stageUpdates };
  saveToStorage(LEADS_KEY, leads);

  // Log activity
  await addActivity(id, 'stage_change', notes || `Moved from ${STAGE_LABELS[prevStage]} to ${STAGE_LABELS[stage]}`);

  return leads[index];
}

export async function addActivity(
  pipelineId: string,
  activityType: ActivityType,
  notes: string
): Promise<PipelineActivity> {
  const activity: PipelineActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pipeline_id: pipelineId,
    activity_type: activityType,
    notes,
    created_at: new Date().toISOString(),
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<PipelineActivity>('pipeline_activities', activity as unknown as Record<string, unknown>);
  const activities = getFromStorage<PipelineActivity>(ACTIVITIES_KEY);
  activities.push(activity);
  saveToStorage(ACTIVITIES_KEY, activities);

  // Update last_activity on the lead
  const leads = getFromStorage<PipelineLead>(LEADS_KEY);
  const index = leads.findIndex((l) => l.id === pipelineId);
  if (index !== -1) {
    leads[index].last_activity = new Date().toISOString().split('T')[0];
    leads[index].updated_at = new Date().toISOString();
    saveToStorage(LEADS_KEY, leads);
  }

  return activity;
}

export async function getActivitiesForLead(pipelineId: string): Promise<PipelineActivity[]> {
  const cloudData = await supabaseSelect<PipelineActivity>('pipeline_activities', {
    filters: { pipeline_id: pipelineId },
  });
  if (cloudData !== null) {
    return cloudData.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const activities = getFromStorage<PipelineActivity>(ACTIVITIES_KEY);
  return activities
    .filter((a) => a.pipeline_id === pipelineId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ─── Analytics ──────────────────────────────────────────────────────

export interface FunnelStat {
  stage: PipelineStage;
  label: string;
  count: number;
  conversionFromPrev: number | null;
  avgDaysInStage: number;
}

export async function getFunnelStats(): Promise<FunnelStat[]> {
  const leads = await getLeads();
  const today = new Date().toISOString().split('T')[0];

  const countByStage: Record<PipelineStage, number> = {
    inquiry: 0,
    tour_scheduled: 0,
    tour_completed: 0,
    application: 0,
    waitlist: 0,
    enrolled: 0,
    active: 0,
  };

  for (const lead of leads) {
    countByStage[lead.stage]++;
  }

  return STAGE_ORDER.map((stage, idx) => {
    const count = countByStage[stage];
    const prevCount = idx > 0 ? countByStage[STAGE_ORDER[idx - 1]] : null;
    const conversionFromPrev =
      prevCount !== null && prevCount > 0
        ? Math.round((count / prevCount) * 100)
        : null;

    // Average days in stage: days between inquiry_date and last_activity for leads in this stage
    const stageLeads = leads.filter((l) => l.stage === stage);
    const avgDaysInStage =
      stageLeads.length > 0
        ? Math.round(
            stageLeads.reduce((sum, l) => sum + daysBetween(l.inquiry_date, today), 0) /
              stageLeads.length
          )
        : 0;

    return {
      stage,
      label: STAGE_LABELS[stage],
      count,
      conversionFromPrev,
      avgDaysInStage,
    };
  });
}

export interface LeadSourceStat {
  source: LeadSource;
  label: string;
  count: number;
  converted: number;
  conversionRate: number;
}

export async function getLeadSourceStats(): Promise<LeadSourceStat[]> {
  const leads = await getLeads();
  const convertedStages = new Set<PipelineStage>(['enrolled', 'active']);

  const sourceKeys: LeadSource[] = ['website', 'referral', 'drive_by', 'social_media', 'other'];

  return sourceKeys.map((source) => {
    const sourceLeads = leads.filter((l) => l.lead_source === source);
    const converted = sourceLeads.filter((l) => convertedStages.has(l.stage)).length;
    const conversionRate =
      sourceLeads.length > 0 ? Math.round((converted / sourceLeads.length) * 100) : 0;

    return {
      source,
      label: SOURCE_LABELS[source],
      count: sourceLeads.length,
      converted,
      conversionRate,
    };
  });
}

export async function getStaleLeads(daysSinceActivity = 7): Promise<PipelineLead[]> {
  const leads = await getLeads();
  const today = new Date().toISOString().split('T')[0];
  return leads.filter((l) => {
    if (l.stage === 'active') return false;
    return daysBetween(l.last_activity, today) >= daysSinceActivity;
  });
}

export interface RevenueProjection {
  totalProjected: number;
  byStage: { stage: PipelineStage; label: string; count: number; projected: number }[];
  currentEnrollment: number;
  capacity: number;
  openSlots: number;
}

export async function getRevenueProjection(avgMonthlyRate = 1350): Promise<RevenueProjection> {
  const leads = await getLeads();

  const byStage = STAGE_ORDER.map((stage) => {
    const count = leads.filter((l) => l.stage === stage).length;
    const projected = Math.round(count * STAGE_PROBABILITY[stage] * avgMonthlyRate);
    return { stage, label: STAGE_LABELS[stage], count, projected };
  });

  const totalProjected = byStage.reduce((sum, s) => sum + s.projected, 0);

  return {
    totalProjected,
    byStage,
    currentEnrollment: CURRENT_ENROLLMENT,
    capacity: CENTER_CAPACITY,
    openSlots: CENTER_CAPACITY - CURRENT_ENROLLMENT,
  };
}
