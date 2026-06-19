// Meeting Efficiency Storage Module for Christina's Child Care Center
// Supabase-backed dual-write with localStorage as the synchronous cache.
//
// The public API stays synchronous so every existing caller keeps compiling and
// the UI reads instantly from the local cache. Supabase is the system of record:
// reads hydrate the cache cloud-first on load (seed-on-empty), and writes update
// the local cache and mirror to the cloud in the background. Each cloud row
// follows the migration-037 shape: a `record_type` discriminator plus the typed
// meeting object (with its nested agenda, decisions, and action items) in a JSONB
// `data` column, stamped with `center_id`.

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
} from '@/lib/supabase/service';

const STORAGE_KEY = 'christinas_meetings_v2';

// ============================================================================
// Types
// ============================================================================

export type AgendaItemPurpose = 'inform' | 'discuss' | 'decide';
export type MeetingStatus = 'planned' | 'in_progress' | 'completed';
export type ActionItemStatus = 'pending' | 'completed';

export interface AgendaItem {
  id: string;
  topic: string;
  duration_minutes: number;
  presenter: string;
  purpose: AgendaItemPurpose;
  completed: boolean;
  actual_minutes?: number;
}

export interface Decision {
  id: string;
  text: string;
  owner: string;
  due_date?: string;
  made_at: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  due_date: string;
  status: ActionItemStatus;
  completed_at?: string;
  meeting_id: string;
  meeting_title: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  attendees: string[];
  status: MeetingStatus;
  agenda: AgendaItem[];
  notes_html?: string;
  decisions: Decision[];
  action_items: ActionItem[];
  effectiveness_score?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingStats {
  total: number;
  completed: number;
  in_progress: number;
  planned: number;
  avg_effectiveness: number;
  total_action_items: number;
  pending_action_items: number;
  overdue_action_items: number;
  completion_rate: number;
}

// ============================================================================
// Supabase backing
// ============================================================================

// Supabase table backing the meeting records. Each row carries a `record_type`
// discriminator and a JSONB `data` payload (see migration 037).
const MEETINGS_TABLE = 'meetings';
type MeetingRecordType = 'meeting';
const MEETING_RECORD_TYPE: MeetingRecordType = 'meeting';

// Operating center (Brooklyn Park). Default when there is no center context,
// matching how the other dual-write modules stamp center_id.
const OPERATING_CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Resolve a usable center_id for the cloud row: keep a real UUID if provided,
// otherwise fall back to the operating center.
function resolveCenterId(center_id?: string): string {
  return center_id && UUID_PATTERN.test(center_id)
    ? center_id
    : OPERATING_CENTER_ID;
}

// Shape of a row in the `meetings` table.
interface MeetingRow {
  id: string;
  center_id: string | null;
  record_type: MeetingRecordType;
  data: Record<string, unknown>;
}

// Drop the id key so it lives only as the row's primary-key column, not inside data.
function stripId<T extends { id: string }>(record: T): Record<string, unknown> {
  const { id: _id, ...rest } = record;
  return rest as Record<string, unknown>;
}

// Build the cloud row payload for an insert from a typed meeting object.
function toRow(meeting: Meeting): Record<string, unknown> {
  return {
    id: meeting.id,
    center_id: resolveCenterId(),
    record_type: MEETING_RECORD_TYPE,
    data: stripId(meeting),
  };
}

// Unwrap a cloud row back into the typed meeting object.
function fromRow(row: MeetingRow): Meeting {
  return { id: row.id, ...(row.data as object) } as Meeting;
}

// ============================================================================
// ID generation
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// Seed data
// ============================================================================

const STAFF_NAMES = [
  'Christina Tran',
  'Maria Garcia',
  'Ashley Johnson',
  'Destiny Williams',
  'Rachel Kim',
  'Jennifer Olson',
];

function buildSeedData(): Meeting[] {
  const today = new Date();
  const fmtDate = (d: Date) => d.toISOString().split('T')[0];

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 8);

  const inProgressDate = new Date(today);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);

  const twoWeeks = new Date(today);
  twoWeeks.setDate(today.getDate() + 12);

  const completedMeeting: Meeting = {
    id: 'meet_seed_001',
    title: 'March Staff Meeting',
    date: fmtDate(pastDate),
    start_time: '08:00',
    end_time: '09:00',
    attendees: ['Christina Tran', 'Maria Garcia', 'Ashley Johnson', 'Destiny Williams'],
    status: 'completed',
    started_at: `${fmtDate(pastDate)}T08:02:00.000Z`,
    completed_at: `${fmtDate(pastDate)}T09:07:00.000Z`,
    agenda: [
      {
        id: 'ag_s001_1',
        topic: 'Safety drill debrief',
        duration_minutes: 10,
        presenter: 'Christina Tran',
        purpose: 'discuss',
        completed: true,
        actual_minutes: 12,
      },
      {
        id: 'ag_s001_2',
        topic: 'CACFP documentation update',
        duration_minutes: 15,
        presenter: 'Maria Garcia',
        purpose: 'inform',
        completed: true,
        actual_minutes: 14,
      },
      {
        id: 'ag_s001_3',
        topic: 'Approve new nap schedule for infants',
        duration_minutes: 20,
        presenter: 'Ashley Johnson',
        purpose: 'decide',
        completed: true,
        actual_minutes: 22,
      },
      {
        id: 'ag_s001_4',
        topic: 'Summer staffing coverage plan',
        duration_minutes: 15,
        presenter: 'Christina Tran',
        purpose: 'discuss',
        completed: true,
        actual_minutes: 17,
      },
    ],
    notes_html:
      '<p>Team arrived on time. Safety drill debrief identified two areas for improvement: west exit door signage and infant room emergency card placement.</p><p>Maria confirmed all March meal counts are documented. One count was late on 3/7 due to sub coverage — logged with explanation.</p><p>New infant nap schedule approved unanimously. Starts Monday. Ashley will post schedule in room and update the parent board.</p><p>Summer coverage: three staff have requested time off in July. Christina will post the coverage calendar by next Friday and ask for volunteers to pick up extra shifts before hiring a seasonal sub.</p>',
    decisions: [
      {
        id: 'dec_s001_1',
        text: 'Approve new infant nap schedule effective next Monday',
        owner: 'Ashley Johnson',
        due_date: fmtDate(new Date(pastDate.getTime() + 3 * 86400000)),
        made_at: `${fmtDate(pastDate)}T08:45:00.000Z`,
      },
      {
        id: 'dec_s001_2',
        text: 'Update west exit door signage before next drill',
        owner: 'Christina Tran',
        due_date: fmtDate(new Date(pastDate.getTime() + 14 * 86400000)),
        made_at: `${fmtDate(pastDate)}T08:18:00.000Z`,
      },
    ],
    action_items: [
      {
        id: 'ai_s001_1',
        task: 'Post summer coverage calendar',
        owner: 'Christina Tran',
        due_date: fmtDate(new Date(pastDate.getTime() + 7 * 86400000)),
        status: 'completed',
        completed_at: `${fmtDate(new Date(pastDate.getTime() + 5 * 86400000))}T14:00:00.000Z`,
        meeting_id: 'meet_seed_001',
        meeting_title: 'March Staff Meeting',
      },
      {
        id: 'ai_s001_2',
        task: 'Update infant room emergency card placement',
        owner: 'Ashley Johnson',
        due_date: fmtDate(new Date(pastDate.getTime() + 3 * 86400000)),
        status: 'completed',
        completed_at: `${fmtDate(new Date(pastDate.getTime() + 2 * 86400000))}T11:00:00.000Z`,
        meeting_id: 'meet_seed_001',
        meeting_title: 'March Staff Meeting',
      },
      {
        id: 'ai_s001_3',
        task: 'Order new west exit door signage',
        owner: 'Christina Tran',
        due_date: fmtDate(new Date(pastDate.getTime() + 10 * 86400000)),
        status: 'pending',
        meeting_id: 'meet_seed_001',
        meeting_title: 'March Staff Meeting',
      },
    ],
    effectiveness_score: 87,
    created_at: `${fmtDate(new Date(pastDate.getTime() - 2 * 86400000))}T10:00:00.000Z`,
    updated_at: `${fmtDate(pastDate)}T09:07:00.000Z`,
  };

  const inProgressMeeting: Meeting = {
    id: 'meet_seed_002',
    title: 'Daily Standup — Lead Teachers',
    date: fmtDate(inProgressDate),
    start_time: '07:30',
    end_time: '07:45',
    attendees: ['Christina Tran', 'Ashley Johnson', 'Rachel Kim'],
    status: 'in_progress',
    started_at: new Date(today.getTime() - 8 * 60000).toISOString(),
    agenda: [
      {
        id: 'ag_s002_1',
        topic: 'Attendance check and ratio coverage',
        duration_minutes: 5,
        presenter: 'Christina Tran',
        purpose: 'inform',
        completed: true,
        actual_minutes: 5,
      },
      {
        id: 'ag_s002_2',
        topic: 'Any urgent parent communications',
        duration_minutes: 5,
        presenter: 'Ashley Johnson',
        purpose: 'discuss',
        completed: false,
      },
      {
        id: 'ag_s002_3',
        topic: 'Confirm afternoon sub coverage',
        duration_minutes: 5,
        presenter: 'Christina Tran',
        purpose: 'decide',
        completed: false,
      },
    ],
    notes_html: '<p>All classrooms at ratio. Destiny called out — coverage confirmed with Maria until 10am.</p>',
    decisions: [],
    action_items: [],
    created_at: `${fmtDate(inProgressDate)}T06:00:00.000Z`,
    updated_at: new Date().toISOString(),
  };

  const plannedMeeting1: Meeting = {
    id: 'meet_seed_003',
    title: 'Parent Engagement Planning',
    date: fmtDate(nextWeek),
    start_time: '14:00',
    end_time: '15:00',
    attendees: ['Christina Tran', 'Maria Garcia', 'Jennifer Olson'],
    status: 'planned',
    agenda: [
      {
        id: 'ag_s003_1',
        topic: 'Spring family event ideas',
        duration_minutes: 20,
        presenter: 'Jennifer Olson',
        purpose: 'discuss',
        completed: false,
      },
      {
        id: 'ag_s003_2',
        topic: 'Update newsletter cadence',
        duration_minutes: 15,
        presenter: 'Maria Garcia',
        purpose: 'decide',
        completed: false,
      },
      {
        id: 'ag_s003_3',
        topic: 'Review parent feedback from Q1',
        duration_minutes: 25,
        presenter: 'Christina Tran',
        purpose: 'discuss',
        completed: false,
      },
    ],
    decisions: [],
    action_items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const plannedMeeting2: Meeting = {
    id: 'meet_seed_004',
    title: 'Curriculum Review — Q2 Planning',
    date: fmtDate(twoWeeks),
    start_time: '13:00',
    end_time: '14:30',
    attendees: ['Christina Tran', 'Ashley Johnson', 'Rachel Kim', 'Destiny Williams'],
    status: 'planned',
    agenda: [
      {
        id: 'ag_s004_1',
        topic: 'Q1 curriculum outcomes review',
        duration_minutes: 20,
        presenter: 'Ashley Johnson',
        purpose: 'inform',
        completed: false,
      },
      {
        id: 'ag_s004_2',
        topic: 'Select Q2 curriculum themes',
        duration_minutes: 30,
        presenter: 'Rachel Kim',
        purpose: 'decide',
        completed: false,
      },
      {
        id: 'ag_s004_3',
        topic: 'Outdoor learning expansion proposal',
        duration_minutes: 25,
        presenter: 'Destiny Williams',
        purpose: 'discuss',
        completed: false,
      },
      {
        id: 'ag_s004_4',
        topic: 'Assign Q2 lesson plan owners',
        duration_minutes: 15,
        presenter: 'Christina Tran',
        purpose: 'decide',
        completed: false,
      },
    ],
    decisions: [],
    action_items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return [completedMeeting, inProgressMeeting, plannedMeeting1, plannedMeeting2];
}

// ============================================================================
// Storage helpers (synchronous localStorage cache)
// ============================================================================

function load(): Meeting[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Meeting[];
    const seed = buildSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    // Mirror the freshly seeded meetings to the cloud in the background.
    for (const m of seed) cloudInsert(m);
    return seed;
  } catch {
    return buildSeedData();
  }
}

function save(meetings: Meeting[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  } catch (error) {
    console.error('Error saving meetings:', error);
  }
}

// ============================================================================
// Background cloud sync (fire-and-forget; the cache stays the synchronous truth)
// ============================================================================

// Hydrate the local cache cloud-first on load. Runs once per session; if the
// cloud has rows they become the cache, seeding the cloud when it is empty.
let hydrated = false;

function hydrateFromCloud(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  void (async () => {
    try {
      const rows = await supabaseSelect<MeetingRow>(MEETINGS_TABLE, {
        filters: { record_type: MEETING_RECORD_TYPE },
      });
      if (rows === null) return; // Supabase not configured or errored: keep cache.
      if (rows.length === 0) {
        // Cloud empty: seed it from whatever the cache holds (incl. seed data).
        for (const m of load()) cloudInsert(m);
        return;
      }
      const meetings = rows.map((r) => fromRow(r));
      save(meetings);
    } catch (error) {
      console.error('Error hydrating meetings from cloud:', error);
    }
  })();
}

function cloudInsert(meeting: Meeting): void {
  void supabaseInsert<MeetingRow>(MEETINGS_TABLE, toRow(meeting)).catch(() => {});
}

function cloudUpdate(meeting: Meeting): void {
  void supabaseUpdate<MeetingRow>(MEETINGS_TABLE, meeting.id, {
    center_id: resolveCenterId(),
    record_type: MEETING_RECORD_TYPE,
    data: stripId(meeting),
  }).catch(() => {});
}

// ============================================================================
// Public API
// ============================================================================

export interface MeetingFilters {
  status?: MeetingStatus;
  from_date?: string;
  to_date?: string;
}

export function getMeetings(filters?: MeetingFilters): Meeting[] {
  hydrateFromCloud();
  let meetings = load();
  if (filters?.status) {
    meetings = meetings.filter(m => m.status === filters.status);
  }
  if (filters?.from_date) {
    meetings = meetings.filter(m => m.date >= filters.from_date!);
  }
  if (filters?.to_date) {
    meetings = meetings.filter(m => m.date <= filters.to_date!);
  }
  return meetings.sort((a, b) => a.date.localeCompare(b.date));
}

export function getMeetingById(id: string): Meeting | undefined {
  hydrateFromCloud();
  return load().find(m => m.id === id);
}

export function createMeeting(data: Omit<Meeting, 'id' | 'status' | 'decisions' | 'action_items' | 'created_at' | 'updated_at'>): Meeting {
  const meetings = load();
  const now = new Date().toISOString();
  const meeting: Meeting = {
    ...data,
    id: generateId('meet'),
    status: 'planned',
    decisions: [],
    action_items: [],
    created_at: now,
    updated_at: now,
  };
  meetings.push(meeting);
  save(meetings);
  cloudInsert(meeting);
  return meeting;
}

export function updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
  const meetings = load();
  const idx = meetings.findIndex(m => m.id === id);
  if (idx === -1) return null;
  meetings[idx] = { ...meetings[idx], ...updates, updated_at: new Date().toISOString() };
  save(meetings);
  cloudUpdate(meetings[idx]);
  return meetings[idx];
}

export function startMeeting(id: string): Meeting | null {
  return updateMeeting(id, {
    status: 'in_progress',
    started_at: new Date().toISOString(),
  });
}

export function completeMeeting(id: string): Meeting | null {
  const meetings = load();
  const meeting = meetings.find(m => m.id === id);
  if (!meeting) return null;
  const score = getEffectivenessScore(id);
  return updateMeeting(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    effectiveness_score: score,
  });
}

export function addDecision(meetingId: string, data: Omit<Decision, 'id' | 'made_at'>): Decision | null {
  const meetings = load();
  const meeting = meetings.find(m => m.id === meetingId);
  if (!meeting) return null;
  const decision: Decision = {
    ...data,
    id: generateId('dec'),
    made_at: new Date().toISOString(),
  };
  meeting.decisions.push(decision);
  meeting.updated_at = new Date().toISOString();
  save(meetings);
  cloudUpdate(meeting);
  return decision;
}

export function addActionItem(meetingId: string, data: Omit<ActionItem, 'id' | 'status' | 'meeting_id' | 'meeting_title'>): ActionItem | null {
  const meetings = load();
  const meeting = meetings.find(m => m.id === meetingId);
  if (!meeting) return null;
  const item: ActionItem = {
    ...data,
    id: generateId('ai'),
    status: 'pending',
    meeting_id: meetingId,
    meeting_title: meeting.title,
  };
  meeting.action_items.push(item);
  meeting.updated_at = new Date().toISOString();
  save(meetings);
  cloudUpdate(meeting);
  return item;
}

export function completeActionItem(meetingId: string, actionItemId: string): boolean {
  const meetings = load();
  const meeting = meetings.find(m => m.id === meetingId);
  if (!meeting) return false;
  const item = meeting.action_items.find(a => a.id === actionItemId);
  if (!item) return false;
  item.status = 'completed';
  item.completed_at = new Date().toISOString();
  meeting.updated_at = new Date().toISOString();
  save(meetings);
  cloudUpdate(meeting);
  return true;
}

export function completeActionItemGlobal(actionItemId: string): boolean {
  const meetings = load();
  for (const meeting of meetings) {
    const item = meeting.action_items.find(a => a.id === actionItemId);
    if (item) {
      item.status = 'completed';
      item.completed_at = new Date().toISOString();
      meeting.updated_at = new Date().toISOString();
      save(meetings);
      cloudUpdate(meeting);
      return true;
    }
  }
  return false;
}

export function getEffectivenessScore(meetingId: string): number {
  const meeting = getMeetingById(meetingId);
  if (!meeting) return 0;

  // Time efficiency: how close actual duration was to planned
  let timeScore = 100;
  if (meeting.started_at && meeting.completed_at) {
    const actualMinutes = (new Date(meeting.completed_at).getTime() - new Date(meeting.started_at).getTime()) / 60000;
    const plannedMinutes = meeting.agenda.reduce((s, a) => s + a.duration_minutes, 0);
    if (plannedMinutes > 0) {
      const overrun = Math.max(0, actualMinutes - plannedMinutes);
      timeScore = Math.max(0, 100 - (overrun / plannedMinutes) * 100);
    }
  }

  // Agenda completion
  const totalItems = meeting.agenda.length;
  const completedItems = meeting.agenda.filter(a => a.completed).length;
  const completionScore = totalItems > 0 ? (completedItems / totalItems) * 100 : 100;

  // Decisions made (bonus: having at least one decision)
  const decisionBonus = meeting.decisions.length > 0 ? 10 : 0;

  return Math.min(100, Math.round((timeScore * 0.4 + completionScore * 0.6) + decisionBonus));
}

export function getAllActionItems(): ActionItem[] {
  const meetings = load();
  const items: ActionItem[] = [];
  for (const meeting of meetings) {
    for (const item of meeting.action_items) {
      items.push({ ...item, meeting_title: meeting.title });
    }
  }
  return items.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export function getMeetingStats(): MeetingStats {
  const meetings = load();
  const today = new Date().toISOString().split('T')[0];
  const allItems = getAllActionItems();
  const pending = allItems.filter(a => a.status === 'pending');
  const overdue = pending.filter(a => a.due_date < today);
  const completed = allItems.filter(a => a.status === 'completed');

  const completedMeetings = meetings.filter(m => m.status === 'completed');
  const avgEffectiveness =
    completedMeetings.length > 0
      ? Math.round(completedMeetings.reduce((s, m) => s + (m.effectiveness_score ?? 0), 0) / completedMeetings.length)
      : 0;

  return {
    total: meetings.length,
    completed: completedMeetings.length,
    in_progress: meetings.filter(m => m.status === 'in_progress').length,
    planned: meetings.filter(m => m.status === 'planned').length,
    avg_effectiveness: avgEffectiveness,
    total_action_items: allItems.length,
    pending_action_items: pending.length,
    overdue_action_items: overdue.length,
    completion_rate: allItems.length > 0 ? Math.round((completed.length / allItems.length) * 100) : 0,
  };
}

export { STAFF_NAMES };
