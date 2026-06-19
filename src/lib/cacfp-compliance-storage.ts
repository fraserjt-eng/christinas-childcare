// CACFP Compliance Storage Module for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
} from '@/lib/supabase/service';
import { currentCenterId } from '@/lib/current-center';

// ============================================================================
// Types
// ============================================================================

export interface CACFPChecklistItem {
  id: string;
  label: string;
  category: 'meal_counts' | 'documentation' | 'training' | 'facility' | 'records';
  autoCheck: boolean; // true = system can verify, false = manual check
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  required: boolean;
}

export interface CACFPComplianceRecord {
  id: string;
  month: string; // YYYY-MM
  checklist: CACFPChecklistItem[];
  audit_score: number; // 0-100
  notes?: string;
  updated_at: string;
}

export interface ReimbursementRecord {
  month: string;
  expected_amount: number;
  actual_amount: number;
  submitted: boolean;
  submitted_at?: string;
  received: boolean;
  received_at?: string;
  discrepancy_notes?: string;
}

// ============================================================================
// Storage Keys
// ============================================================================

const COMPLIANCE_KEY = 'cacfp-compliance';
const REIMBURSEMENT_KEY = 'cacfp-reimbursements';

// Supabase table backing both CACFP record kinds. Each row carries a
// `record_type` discriminator and a JSONB `data` payload (see migration 033).
const CACFP_TABLE = 'cacfp_records';
type CACFPRecordType = 'compliance' | 'reimbursement';

// Shape of a row in the `cacfp_records` table.
interface CACFPRow {
  id: string;
  center_id: string | null;
  record_type: CACFPRecordType;
  data: Record<string, unknown>;
}

// Build the cloud row payload for an insert/update from a typed CACFP object.
function toRow(
  id: string,
  recordType: CACFPRecordType,
  data: Record<string, unknown>
): Record<string, unknown> {
  return {
    id,
    center_id: currentCenterId(),
    record_type: recordType,
    data,
  };
}

// Stable cloud row id for a compliance record (one per month).
function complianceRowId(month: string): string {
  return `cacfp_compliance_${month}`;
}

// Stable cloud row id for a reimbursement record (one per month).
function reimbursementRowId(month: string): string {
  return `cacfp_reimbursement_${month}`;
}

// Fetch all rows of one record type from the cloud; null when not configured/error.
async function cloudFetch<T>(recordType: CACFPRecordType): Promise<T[] | null> {
  const rows = await supabaseSelect<CACFPRow>(CACFP_TABLE, {
    filters: { record_type: recordType, center_id: currentCenterId() },
  });
  if (rows === null) return null;
  return rows.map((r) => r.data as T);
}

// ============================================================================
// Default checklist
// ============================================================================

// Default CACFP monthly checklist items
function getDefaultChecklist(): CACFPChecklistItem[] {
  return [
    // Meal Counts
    { id: 'mc-1', label: 'All daily meal counts submitted', category: 'meal_counts', autoCheck: true, completed: false, required: true },
    { id: 'mc-2', label: 'Meal counts match attendance records', category: 'meal_counts', autoCheck: true, completed: false, required: true },
    { id: 'mc-3', label: 'No meal count exceeds enrolled capacity', category: 'meal_counts', autoCheck: true, completed: false, required: true },

    // Documentation
    { id: 'doc-1', label: 'Weekly menus posted and on file', category: 'documentation', autoCheck: false, completed: false, required: true },
    { id: 'doc-2', label: 'Meal production records complete', category: 'documentation', autoCheck: false, completed: false, required: true },
    { id: 'doc-3', label: 'Income eligibility forms current', category: 'documentation', autoCheck: false, completed: false, required: true },
    { id: 'doc-4', label: 'Enrollment forms up to date', category: 'documentation', autoCheck: false, completed: false, required: true },

    // Training
    { id: 'tr-1', label: 'CACFP civil rights training complete', category: 'training', autoCheck: false, completed: false, required: true },
    { id: 'tr-2', label: 'Food safety training current', category: 'training', autoCheck: false, completed: false, required: true },
    { id: 'tr-3', label: 'Staff meal count procedures reviewed', category: 'training', autoCheck: false, completed: false, required: false },

    // Facility
    { id: 'fac-1', label: 'Kitchen inspection passed and current', category: 'facility', autoCheck: false, completed: false, required: true },
    { id: 'fac-2', label: 'Food storage temperatures logged', category: 'facility', autoCheck: false, completed: false, required: true },
    { id: 'fac-3', label: 'Sanitization procedures followed', category: 'facility', autoCheck: false, completed: false, required: false },

    // Records
    { id: 'rec-1', label: 'Monthly claim submitted to sponsor', category: 'records', autoCheck: false, completed: false, required: true },
    { id: 'rec-2', label: 'Previous month reimbursement received', category: 'records', autoCheck: false, completed: false, required: false },
    { id: 'rec-3', label: 'Vendor receipts filed', category: 'records', autoCheck: false, completed: false, required: false },
  ];
}

// ============================================================================
// Generic Helpers
// ============================================================================

function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

// ============================================================================
// Compliance Records
// ============================================================================

// Get or create compliance record for a month
export async function getCACFPCompliance(month: string): Promise<CACFPComplianceRecord> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await cloudFetch<CACFPComplianceRecord>('compliance');
  if (cloudData !== null) {
    const cloudMatch = cloudData.find((r) => r.month === month);
    if (cloudMatch) {
      // Refresh the local cache so reads stay consistent
      const allRecords =
        getFromStorage<Record<string, CACFPComplianceRecord>>(COMPLIANCE_KEY) || {};
      allRecords[month] = cloudMatch;
      saveToStorage(COMPLIANCE_KEY, allRecords);
      return cloudMatch;
    }
  } else {
    // Cloud unavailable: serve a cached record if we have one
    const allRecords =
      getFromStorage<Record<string, CACFPComplianceRecord>>(COMPLIANCE_KEY) || {};
    if (allRecords[month]) {
      return allRecords[month];
    }
  }

  // Create new record with default checklist
  const record: CACFPComplianceRecord = {
    id: `cacfp_${month}_${Date.now()}`,
    month,
    checklist: getDefaultChecklist(),
    audit_score: 0,
    updated_at: new Date().toISOString(),
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<CACFPRow>(
    CACFP_TABLE,
    toRow(complianceRowId(month), 'compliance', record as unknown as Record<string, unknown>)
  );

  const allRecords =
    getFromStorage<Record<string, CACFPComplianceRecord>>(COMPLIANCE_KEY) || {};
  allRecords[month] = record;
  saveToStorage(COMPLIANCE_KEY, allRecords);
  return record;
}

// Update a checklist item
export async function updateChecklistItem(
  month: string,
  itemId: string,
  updates: Partial<CACFPChecklistItem>
): Promise<CACFPComplianceRecord> {
  const record = await getCACFPCompliance(month);

  const itemIndex = record.checklist.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    record.checklist[itemIndex] = { ...record.checklist[itemIndex], ...updates };
    if (updates.completed && !record.checklist[itemIndex].completedAt) {
      record.checklist[itemIndex].completedAt = new Date().toISOString();
    }
  }

  // Recalculate audit score
  record.audit_score = calculateAuditScore(record.checklist);
  record.updated_at = new Date().toISOString();

  // Write to Supabase first, then cache locally
  await supabaseUpdate<CACFPRow>(CACFP_TABLE, complianceRowId(month), {
    center_id: currentCenterId(),
    record_type: 'compliance',
    data: record as unknown as Record<string, unknown>,
  });

  const allRecords =
    getFromStorage<Record<string, CACFPComplianceRecord>>(COMPLIANCE_KEY) || {};
  allRecords[month] = record;
  saveToStorage(COMPLIANCE_KEY, allRecords);
  return record;
}

// Calculate audit readiness score (0-100)
export function calculateAuditScore(checklist: CACFPChecklistItem[]): number {
  const requiredItems = checklist.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed);
  const optionalItems = checklist.filter(item => !item.required);
  const completedOptional = optionalItems.filter(item => item.completed);

  if (requiredItems.length === 0) return 100;

  // Required items are worth 80% of the score, optional items 20%
  const requiredScore = (completedRequired.length / requiredItems.length) * 80;
  const optionalScore = optionalItems.length > 0
    ? (completedOptional.length / optionalItems.length) * 20
    : 20;

  return Math.round(requiredScore + optionalScore);
}

// ============================================================================
// Reimbursement Records
// ============================================================================

// Get all reimbursement records
export async function getReimbursements(): Promise<ReimbursementRecord[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await cloudFetch<ReimbursementRecord>('reimbursement');
  let records =
    cloudData !== null
      ? cloudData
      : getFromStorage<ReimbursementRecord[]>(REIMBURSEMENT_KEY) || [];

  records = [...records].sort((a, b) => b.month.localeCompare(a.month));

  // Keep the local cache in sync when the cloud is the source of truth
  if (cloudData !== null) {
    saveToStorage(REIMBURSEMENT_KEY, records);
  }

  return records;
}

// Upsert a reimbursement record
export async function upsertReimbursement(record: ReimbursementRecord): Promise<void> {
  // Write to Supabase first (update if the month's row exists, else insert)
  const cloudData = await cloudFetch<ReimbursementRecord>('reimbursement');
  const existsInCloud =
    cloudData !== null && cloudData.some((r) => r.month === record.month);

  if (existsInCloud) {
    await supabaseUpdate<CACFPRow>(CACFP_TABLE, reimbursementRowId(record.month), {
      center_id: currentCenterId(),
      record_type: 'reimbursement',
      data: record as unknown as Record<string, unknown>,
    });
  } else {
    await supabaseInsert<CACFPRow>(
      CACFP_TABLE,
      toRow(
        reimbursementRowId(record.month),
        'reimbursement',
        record as unknown as Record<string, unknown>
      )
    );
  }

  // Then update the local cache
  const records = getFromStorage<ReimbursementRecord[]>(REIMBURSEMENT_KEY) || [];
  const index = records.findIndex(r => r.month === record.month);

  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }

  records.sort((a, b) => b.month.localeCompare(a.month));
  saveToStorage(REIMBURSEMENT_KEY, records);
}

// ============================================================================
// Reporting
// ============================================================================

// Get compliance gap report
export function getComplianceGaps(checklist: CACFPChecklistItem[]): {
  critical: CACFPChecklistItem[];
  recommended: CACFPChecklistItem[];
} {
  const incomplete = checklist.filter(item => !item.completed);
  return {
    critical: incomplete.filter(item => item.required),
    recommended: incomplete.filter(item => !item.required),
  };
}
