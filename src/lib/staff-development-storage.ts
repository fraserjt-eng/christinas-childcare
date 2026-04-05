// Staff Development Storage Module for Christina's Child Care Center
// Supabase-first with localStorage fallback
//
// Training records: synced to 'training_records' table (migration 003)
//                   employee_id must be a valid UUID to write to Supabase
// Certifications:   stored in 'app_settings' table under key 'certifications'
// Dev goals:        stored in 'app_settings' table under key 'dev_goals'

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpsert,
  isSupabaseConfigured,
} from '@/lib/supabase/service';

export type CertType =
  | 'cpr_first_aid'
  | 'state_licensing'
  | 'food_handler'
  | 'mandatory_training'
  | 'other';

export type CertStatus = 'current' | 'expiring_soon' | 'expired';

export interface Certification {
  id: string;
  employee_id: string;
  employee_name: string;
  cert_type: CertType;
  cert_name: string;
  issued_date: string; // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
  document_url?: string;
  status: CertStatus;
}

export interface TrainingRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  training_name: string;
  date: string; // YYYY-MM-DD
  hours: number;
  provider: string;
  certificate_url?: string;
}

export interface DevGoal {
  id: string;
  employee_id: string;
  employee_name: string;
  goal_text: string;
  target_date: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'overdue';
  progress_notes?: string;
}

export const CERT_TYPE_LABELS: Record<CertType, string> = {
  cpr_first_aid: 'CPR / First Aid',
  state_licensing: 'State License',
  food_handler: 'Food Handler',
  mandatory_training: 'Mandatory Training',
  other: 'Other',
};

// MN state requirement: 16 hours of training per year
export const ANNUAL_TRAINING_HOURS_REQUIRED = 16;

const CERTS_KEY = 'christinas_certifications';
const TRAINING_KEY = 'christinas_training_records';
const GOALS_KEY = 'christinas_dev_goals';
const SEEDED_KEY = 'christinas_development_seeded';

// app_settings keys
const SETTINGS_KEY_CERTS = 'certifications';
const SETTINGS_KEY_GOALS = 'dev_goals';

// ============================================================================
// Generic Storage Helpers
// ============================================================================

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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(val: string): boolean {
  return UUID_PATTERN.test(val);
}

// ============================================================================
// app_settings sync helpers for certifications and dev goals
// ============================================================================

async function syncArrayToSettings(settingsKey: string, data: unknown[]): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabaseUpsert('app_settings', { key: settingsKey, value: data }, 'key');
  } catch (err) {
    console.error(`Failed to sync '${settingsKey}' to app_settings:`, err);
  }
}

async function fetchArrayFromSettings<T>(settingsKey: string): Promise<T[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const rows = await supabaseSelect<{ key: string; value: T[] }>('app_settings', {
      filters: { key: settingsKey },
      limit: 1,
    });
    if (rows && rows.length > 0 && Array.isArray(rows[0].value)) {
      return rows[0].value;
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch '${settingsKey}' from app_settings:`, err);
    return null;
  }
}

// ============================================================================
// Compute cert status based on expiry date
// ============================================================================
export function computeCertStatus(expiryDate: string): CertStatus {
  const today = new Date();
  const expiry = new Date(expiryDate + 'T12:00:00');
  const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 90) return 'expiring_soon';
  return 'current';
}

// Days until expiry (negative if expired)
export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate + 'T12:00:00');
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Seed Data
// ============================================================================

function relativeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function pastDate(daysAgo: number): string {
  return relativeDate(-daysAgo);
}

function buildSeedCertifications(): Certification[] {
  const certs: Certification[] = [];

  // Ophelia — all current
  certs.push(
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', cert_type: 'cpr_first_aid', cert_name: 'CPR/First Aid (Adult, Child, Infant)', issued_date: pastDate(180), expiry_date: relativeDate(565), status: 'current' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', cert_type: 'state_licensing', cert_name: 'MN Child Care Director License', issued_date: pastDate(400), expiry_date: relativeDate(325), status: 'current' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', cert_type: 'food_handler', cert_name: 'Food Handler Certification', issued_date: pastDate(60), expiry_date: relativeDate(1035), status: 'current' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', cert_type: 'mandatory_training', cert_name: 'Annual Mandatory Training (2024)', issued_date: pastDate(90), expiry_date: relativeDate(275), status: 'current' },
  );

  // Christina — mostly current, one expiring soon
  certs.push(
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', cert_type: 'cpr_first_aid', cert_name: 'CPR/First Aid (Adult, Child, Infant)', issued_date: pastDate(600), expiry_date: relativeDate(145), status: computeCertStatus(relativeDate(145)) },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', cert_type: 'state_licensing', cert_name: 'MN Child Care Provider License', issued_date: pastDate(300), expiry_date: relativeDate(430), status: 'current' },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', cert_type: 'food_handler', cert_name: 'Food Handler Certification', issued_date: pastDate(500), expiry_date: relativeDate(60), status: computeCertStatus(relativeDate(60)) },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', cert_type: 'mandatory_training', cert_name: 'Annual Mandatory Training (2024)', issued_date: pastDate(120), expiry_date: relativeDate(245), status: 'current' },
  );

  // Maria Santos — CPR expiring soon, food handler expired
  certs.push(
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', cert_type: 'cpr_first_aid', cert_name: 'CPR/First Aid (Adult, Child, Infant)', issued_date: pastDate(700), expiry_date: relativeDate(45), status: computeCertStatus(relativeDate(45)) },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', cert_type: 'state_licensing', cert_name: 'MN Child Care Provider License', issued_date: pastDate(200), expiry_date: relativeDate(530), status: 'current' },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', cert_type: 'food_handler', cert_name: 'Food Handler Certification', issued_date: pastDate(1100), expiry_date: relativeDate(-20), status: 'expired' },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', cert_type: 'mandatory_training', cert_name: 'Annual Mandatory Training (2024)', issued_date: pastDate(200), expiry_date: relativeDate(165), status: 'current' },
  );

  // James Robinson — state license expiring soon, mandatory training expired
  certs.push(
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', cert_type: 'cpr_first_aid', cert_name: 'CPR/First Aid (Adult, Child, Infant)', issued_date: pastDate(250), expiry_date: relativeDate(475), status: 'current' },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', cert_type: 'state_licensing', cert_name: 'MN Child Care Provider License', issued_date: pastDate(600), expiry_date: relativeDate(70), status: computeCertStatus(relativeDate(70)) },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', cert_type: 'food_handler', cert_name: 'Food Handler Certification', issued_date: pastDate(350), expiry_date: relativeDate(745), status: 'current' },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', cert_type: 'mandatory_training', cert_name: 'Annual Mandatory Training (2023)', issued_date: pastDate(460), expiry_date: relativeDate(-95), status: 'expired' },
  );

  // Sarah Kim — all current
  certs.push(
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', cert_type: 'cpr_first_aid', cert_name: 'CPR/First Aid (Adult, Child, Infant)', issued_date: pastDate(100), expiry_date: relativeDate(630), status: 'current' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', cert_type: 'state_licensing', cert_name: 'MN Child Care Provider License', issued_date: pastDate(180), expiry_date: relativeDate(555), status: 'current' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', cert_type: 'food_handler', cert_name: 'Food Handler Certification', issued_date: pastDate(90), expiry_date: relativeDate(1005), status: 'current' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', cert_type: 'mandatory_training', cert_name: 'Annual Mandatory Training (2024)', issued_date: pastDate(85), expiry_date: relativeDate(280), status: 'current' },
  );

  // David Chen — CPR expired, state license expiring soon
  certs.push(
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', cert_type: 'cpr_first_aid', cert_name: 'CPR/First Aid (Adult, Child, Infant)', issued_date: pastDate(760), expiry_date: relativeDate(-30), status: 'expired' },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', cert_type: 'state_licensing', cert_name: 'MN Child Care Provider License', issued_date: pastDate(580), expiry_date: relativeDate(55), status: computeCertStatus(relativeDate(55)) },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', cert_type: 'food_handler', cert_name: 'Food Handler Certification', issued_date: pastDate(200), expiry_date: relativeDate(895), status: 'current' },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', cert_type: 'mandatory_training', cert_name: 'Annual Mandatory Training (2024)', issued_date: pastDate(110), expiry_date: relativeDate(255), status: 'current' },
  );

  return certs;
}

function buildSeedTrainingRecords(): TrainingRecord[] {
  return [
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', training_name: 'Child Development: Infant/Toddler', date: pastDate(200), hours: 4, provider: 'MN Child Care Resource' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', training_name: 'Business Administration for Child Care', date: pastDate(150), hours: 3, provider: 'NACCRRA' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', training_name: 'Health and Safety Practices', date: pastDate(100), hours: 2, provider: 'Red Cross' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', training_name: 'CACFP Training Annual Update', date: pastDate(60), hours: 3, provider: 'MN Dept of Education' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', training_name: 'Preventing Child Abuse and Neglect', date: pastDate(30), hours: 2, provider: 'MNCPCA' },

    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', training_name: 'Positive Behavior Guidance', date: pastDate(180), hours: 3, provider: 'MN Child Care Resource' },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', training_name: 'Emergent Curriculum', date: pastDate(130), hours: 4, provider: 'Childcare Ed. Institute' },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', training_name: 'Staff Leadership and Supervision', date: pastDate(80), hours: 2, provider: 'NACCRRA' },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', training_name: 'Family Engagement Workshop', date: pastDate(40), hours: 2, provider: 'MN CEED' },

    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', training_name: 'Infant Brain Development', date: pastDate(220), hours: 3, provider: 'Zero to Three' },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', training_name: 'Language & Literacy for Infants', date: pastDate(160), hours: 3, provider: 'MN Child Care Resource' },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', training_name: 'Safe Sleep Practices', date: pastDate(90), hours: 1, provider: 'Hennepin County' },

    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', training_name: 'Toddler Social-Emotional Learning', date: pastDate(240), hours: 3, provider: 'CEED' },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', training_name: 'Positive Discipline in Child Care', date: pastDate(170), hours: 3, provider: 'MN Child Care Resource' },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', training_name: 'Inclusion Strategies for Toddlers', date: pastDate(100), hours: 2, provider: 'PACER Center' },

    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', training_name: 'Preschool Math and STEM', date: pastDate(190), hours: 3, provider: 'NAEYC' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', training_name: 'Creative Arts for Early Learners', date: pastDate(140), hours: 3, provider: 'MN Child Care Resource' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', training_name: 'Outdoor Learning Environments', date: pastDate(85), hours: 2, provider: 'Nature Explore' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', training_name: 'Assessment for School Readiness', date: pastDate(50), hours: 3, provider: 'CEED' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', training_name: 'Trauma-Informed Care', date: pastDate(20), hours: 2, provider: 'MNCPCA' },

    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', training_name: 'School-Age Program Quality', date: pastDate(210), hours: 3, provider: 'NAEYC' },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', training_name: 'STEM for School-Age Youth', date: pastDate(155), hours: 3, provider: 'Afterschool Alliance' },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', training_name: 'Youth Mental Health First Aid', date: pastDate(100), hours: 2, provider: 'NAMI Minnesota' },
  ];
}

function buildSeedDevGoals(): DevGoal[] {
  return [
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', goal_text: 'Complete MN Director credential renewal by end of Q2', target_date: relativeDate(80), status: 'active', progress_notes: 'Enrolled in renewal course. 2 of 4 modules done.' },
    { id: generateId(), employee_id: 'emp-oz', employee_name: 'Ophelia Zeogar', goal_text: 'Attend NAEYC national conference', target_date: relativeDate(180), status: 'active' },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', goal_text: 'Earn CDA renewal credential', target_date: relativeDate(120), status: 'active', progress_notes: 'Portfolio documentation in progress.' },
    { id: generateId(), employee_id: 'emp-cf', employee_name: 'Christina Fraser', goal_text: 'Complete food handler recertification', target_date: relativeDate(30), status: 'active', progress_notes: 'Registered for online course next week.' },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', goal_text: 'Renew food handler certification', target_date: relativeDate(14), status: 'overdue', progress_notes: 'Scheduling has been difficult. Need to prioritize.' },
    { id: generateId(), employee_id: 'emp-ms', employee_name: 'Maria Santos', goal_text: 'Complete 3 additional training hours in infant development', target_date: relativeDate(90), status: 'active' },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', goal_text: 'Complete annual mandatory training', target_date: relativeDate(21), status: 'overdue', progress_notes: 'Needs to register for upcoming cohort.' },
    { id: generateId(), employee_id: 'emp-jr', employee_name: 'James Robinson', goal_text: 'Pursue CDA credential — Toddler specialization', target_date: relativeDate(365), status: 'active', progress_notes: 'Researching programs.' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', goal_text: 'Lead one staff professional development session on creative arts', target_date: relativeDate(60), status: 'active', progress_notes: 'Planning outline complete. Session scheduled for April.' },
    { id: generateId(), employee_id: 'emp-sk', employee_name: 'Sarah Kim', goal_text: 'Completed 16-hour annual training requirement', target_date: relativeDate(-30), status: 'completed', progress_notes: 'Achieved 16 hours in Feb 2025.' },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', goal_text: 'Renew CPR/First Aid certification', target_date: relativeDate(21), status: 'overdue', progress_notes: 'Missed previous session. Must book within 2 weeks.' },
    { id: generateId(), employee_id: 'emp-dc', employee_name: 'David Chen', goal_text: 'Complete Youth Mental Health First Aid recertification', target_date: relativeDate(90), status: 'active' },
  ];
}

function seedIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  saveToStorage(CERTS_KEY, buildSeedCertifications());
  saveToStorage(TRAINING_KEY, buildSeedTrainingRecords());
  saveToStorage(GOALS_KEY, buildSeedDevGoals());
  localStorage.setItem(SEEDED_KEY, 'true');
}

// ============================================================================
// Certification CRUD
// Certifications are stored in app_settings (no dedicated table)
// ============================================================================

export async function getCertificationsAsync(filters?: {
  employee_id?: string;
  cert_type?: CertType;
  status?: CertStatus;
}): Promise<Certification[]> {
  const cloudData = await fetchArrayFromSettings<Certification>(SETTINGS_KEY_CERTS);

  let certs: Certification[];
  if (cloudData !== null) {
    saveToStorage(CERTS_KEY, cloudData);
    certs = cloudData;
  } else {
    seedIfNeeded();
    certs = getFromStorage<Certification>(CERTS_KEY);
  }

  if (filters) {
    if (filters.employee_id) certs = certs.filter(c => c.employee_id === filters.employee_id);
    if (filters.cert_type) certs = certs.filter(c => c.cert_type === filters.cert_type);
    if (filters.status) certs = certs.filter(c => c.status === filters.status);
  }

  return certs;
}

// Synchronous version for backward compatibility
export function getCertifications(filters?: {
  employee_id?: string;
  cert_type?: CertType;
  status?: CertStatus;
}): Certification[] {
  seedIfNeeded();
  let certs = getFromStorage<Certification>(CERTS_KEY);

  if (filters) {
    if (filters.employee_id) certs = certs.filter(c => c.employee_id === filters.employee_id);
    if (filters.cert_type) certs = certs.filter(c => c.cert_type === filters.cert_type);
    if (filters.status) certs = certs.filter(c => c.status === filters.status);
  }

  return certs;
}

export function createCertification(data: Omit<Certification, 'id' | 'status'>): Certification {
  const certs = getFromStorage<Certification>(CERTS_KEY);
  const cert: Certification = {
    ...data,
    id: generateId(),
    status: computeCertStatus(data.expiry_date),
  };
  const updated = [...certs, cert];
  saveToStorage(CERTS_KEY, updated);
  syncArrayToSettings(SETTINGS_KEY_CERTS, updated).catch(() => {});
  return cert;
}

export function updateCertification(id: string, updates: Partial<Omit<Certification, 'id'>>): Certification | null {
  const certs = getFromStorage<Certification>(CERTS_KEY);
  const idx = certs.findIndex(c => c.id === id);
  if (idx === -1) return null;
  certs[idx] = {
    ...certs[idx],
    ...updates,
    status: updates.expiry_date ? computeCertStatus(updates.expiry_date) : certs[idx].status,
  };
  saveToStorage(CERTS_KEY, certs);
  syncArrayToSettings(SETTINGS_KEY_CERTS, certs).catch(() => {});
  return certs[idx];
}

export function getExpiringCertifications(daysThreshold: number = 90): Certification[] {
  seedIfNeeded();
  const certs = getFromStorage<Certification>(CERTS_KEY);
  return certs.filter(c => {
    const days = daysUntilExpiry(c.expiry_date);
    return days >= 0 && days <= daysThreshold;
  });
}

// ============================================================================
// Training Records CRUD
// Synced to 'training_records' Supabase table when employee_id is a UUID.
// For demo employees (emp-oz, emp-cf, etc.), falls back to app_settings.
// ============================================================================

// Supabase training_records row shape
interface TrainingRecordRow {
  id: string;
  employee_id: string;
  training_type: string;
  title: string;
  hours: number;
  completed_date: string;
  expiry_date: string | null;
  certificate_url: string | null;
  verified_by: string | null;
  created_at: string;
}

function rowToTrainingRecord(row: TrainingRecordRow, employeeName?: string): TrainingRecord {
  return {
    id: row.id,
    employee_id: row.employee_id,
    employee_name: employeeName || row.employee_id,
    training_name: row.title,
    date: row.completed_date,
    hours: Number(row.hours),
    provider: row.verified_by || '',
    certificate_url: row.certificate_url || undefined,
  };
}

export async function getTrainingRecordsAsync(employeeId?: string): Promise<TrainingRecord[]> {
  // If employeeId is a UUID, try Supabase training_records table
  if (isSupabaseConfigured && employeeId && isUUID(employeeId)) {
    const rows = await supabaseSelect<TrainingRecordRow>('training_records', {
      filters: { employee_id: employeeId },
    });
    if (rows !== null) {
      return rows.map(r => rowToTrainingRecord(r));
    }
  } else if (isSupabaseConfigured && !employeeId) {
    // All records — try Supabase first
    const rows = await supabaseSelect<TrainingRecordRow>('training_records');
    if (rows !== null) {
      const supabaseRecords = rows.map(r => rowToTrainingRecord(r));
      // Also merge in localStorage demo records (non-UUID employee IDs)
      seedIfNeeded();
      const localRecords = getFromStorage<TrainingRecord>(TRAINING_KEY)
        .filter(r => !isUUID(r.employee_id));
      const allRecords = [...supabaseRecords, ...localRecords];
      allRecords.sort((a, b) => b.date.localeCompare(a.date));
      return allRecords;
    }
  }

  // localStorage fallback
  seedIfNeeded();
  let records = getFromStorage<TrainingRecord>(TRAINING_KEY);
  if (employeeId) records = records.filter(r => r.employee_id === employeeId);
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

// Synchronous version for backward compatibility
export function getTrainingRecords(employeeId?: string): TrainingRecord[] {
  seedIfNeeded();
  let records = getFromStorage<TrainingRecord>(TRAINING_KEY);
  if (employeeId) records = records.filter(r => r.employee_id === employeeId);
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export function addTrainingRecord(data: Omit<TrainingRecord, 'id'>): TrainingRecord {
  const records = getFromStorage<TrainingRecord>(TRAINING_KEY);
  const record: TrainingRecord = { ...data, id: generateId() };
  saveToStorage(TRAINING_KEY, [...records, record]);

  // If employee_id is a UUID, also write to Supabase training_records
  if (isSupabaseConfigured && isUUID(data.employee_id)) {
    supabaseInsert('training_records', {
      employee_id: data.employee_id,
      training_type: 'other',
      title: data.training_name,
      hours: data.hours,
      completed_date: data.date,
      certificate_url: data.certificate_url || null,
      verified_by: data.provider || null,
    }).catch((err) => {
      console.error('Failed to write training record to Supabase:', err);
    });
  }

  return record;
}

export function getAnnualTrainingHours(employeeId: string, year: number): number {
  const records = getTrainingRecords(employeeId);
  return records
    .filter(r => r.date.startsWith(String(year)))
    .reduce((sum, r) => sum + r.hours, 0);
}

// ============================================================================
// Development Goals CRUD
// Goals are stored in app_settings (no dedicated table)
// ============================================================================

export async function getDevGoalsAsync(employeeId?: string): Promise<DevGoal[]> {
  const cloudData = await fetchArrayFromSettings<DevGoal>(SETTINGS_KEY_GOALS);

  let goals: DevGoal[];
  if (cloudData !== null) {
    saveToStorage(GOALS_KEY, cloudData);
    goals = cloudData;
  } else {
    seedIfNeeded();
    goals = getFromStorage<DevGoal>(GOALS_KEY);
  }

  if (employeeId) goals = goals.filter(g => g.employee_id === employeeId);
  return goals.sort((a, b) => a.target_date.localeCompare(b.target_date));
}

// Synchronous version for backward compatibility
export function getDevGoals(employeeId?: string): DevGoal[] {
  seedIfNeeded();
  let goals = getFromStorage<DevGoal>(GOALS_KEY);
  if (employeeId) goals = goals.filter(g => g.employee_id === employeeId);
  return goals.sort((a, b) => a.target_date.localeCompare(b.target_date));
}

export function addDevGoal(data: Omit<DevGoal, 'id' | 'status'>): DevGoal {
  const goals = getFromStorage<DevGoal>(GOALS_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const status: DevGoal['status'] = data.target_date < today ? 'overdue' : 'active';
  const goal: DevGoal = { ...data, id: generateId(), status };
  const updated = [...goals, goal];
  saveToStorage(GOALS_KEY, updated);
  syncArrayToSettings(SETTINGS_KEY_GOALS, updated).catch(() => {});
  return goal;
}

export function updateDevGoal(id: string, updates: Partial<Omit<DevGoal, 'id'>>): DevGoal | null {
  const goals = getFromStorage<DevGoal>(GOALS_KEY);
  const idx = goals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  goals[idx] = { ...goals[idx], ...updates };
  saveToStorage(GOALS_KEY, goals);
  syncArrayToSettings(SETTINGS_KEY_GOALS, goals).catch(() => {});
  return goals[idx];
}

// ============================================================================
// Compliance Summary
// ============================================================================

export interface EmployeeComplianceStatus {
  employee_id: string;
  employee_name: string;
  certifications: Certification[];
  total_certs: number;
  current_count: number;
  expiring_count: number;
  expired_count: number;
  training_hours_this_year: number;
  training_hours_required: number;
  training_compliant: boolean;
  overall_compliant: boolean;
}

export function getComplianceStatus(employeeId: string): EmployeeComplianceStatus | null {
  seedIfNeeded();
  const certs = getCertifications({ employee_id: employeeId });
  if (certs.length === 0) return null;

  const currentYear = new Date().getFullYear();
  const trainingHours = getAnnualTrainingHours(employeeId, currentYear);

  const currentCount = certs.filter(c => c.status === 'current').length;
  const expiringCount = certs.filter(c => c.status === 'expiring_soon').length;
  const expiredCount = certs.filter(c => c.status === 'expired').length;

  return {
    employee_id: employeeId,
    employee_name: certs[0].employee_name,
    certifications: certs,
    total_certs: certs.length,
    current_count: currentCount,
    expiring_count: expiringCount,
    expired_count: expiredCount,
    training_hours_this_year: trainingHours,
    training_hours_required: ANNUAL_TRAINING_HOURS_REQUIRED,
    training_compliant: trainingHours >= ANNUAL_TRAINING_HOURS_REQUIRED,
    overall_compliant: expiredCount === 0 && trainingHours >= ANNUAL_TRAINING_HOURS_REQUIRED,
  };
}
