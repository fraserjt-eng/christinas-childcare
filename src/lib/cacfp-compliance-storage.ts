// CACFP Compliance Storage Module
// localStorage for demo mode, designed for Supabase migration

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

const COMPLIANCE_KEY = 'cacfp-compliance';
const REIMBURSEMENT_KEY = 'cacfp-reimbursements';

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

// Get or create compliance record for a month
export async function getCACFPCompliance(month: string): Promise<CACFPComplianceRecord> {
  const allRecords = getFromStorage<Record<string, CACFPComplianceRecord>>(COMPLIANCE_KEY) || {};

  if (allRecords[month]) {
    return allRecords[month];
  }

  // Create new record with default checklist
  const record: CACFPComplianceRecord = {
    id: `cacfp_${month}_${Date.now()}`,
    month,
    checklist: getDefaultChecklist(),
    audit_score: 0,
    updated_at: new Date().toISOString(),
  };

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
  const allRecords = getFromStorage<Record<string, CACFPComplianceRecord>>(COMPLIANCE_KEY) || {};
  const record = allRecords[month] || await getCACFPCompliance(month);

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

// Get all reimbursement records
export async function getReimbursements(): Promise<ReimbursementRecord[]> {
  const records = getFromStorage<ReimbursementRecord[]>(REIMBURSEMENT_KEY);
  return records || [];
}

// Upsert a reimbursement record
export async function upsertReimbursement(record: ReimbursementRecord): Promise<void> {
  const records = (getFromStorage<ReimbursementRecord[]>(REIMBURSEMENT_KEY)) || [];
  const index = records.findIndex(r => r.month === record.month);

  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }

  records.sort((a, b) => b.month.localeCompare(a.month));
  saveToStorage(REIMBURSEMENT_KEY, records);
}

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
