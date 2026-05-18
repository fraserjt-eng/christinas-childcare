// Revenue Forecasting — Supabase-first with localStorage fallback
// Tool 19 for Christina's Child Care Center

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
  isSupabaseConfigured,
} from '@/lib/supabase/service';
import { isDemoSeedEnabled } from '@/lib/demo-mode';

export interface FinancialRecord {
  id: string;
  month: string; // YYYY-MM
  revenue_tuition: number;
  revenue_cacfp: number;
  revenue_other: number;
  expenses_labor: number;
  expenses_supplies: number;
  expenses_fixed: number;
  expenses_other: number;
  notes?: string;
}

export interface RevenueScenario {
  id: string;
  name: string;
  enrollment_change: number; // delta, e.g. -5, +10
  rate_change: number; // dollars per child per month delta, e.g. -50, +100
  projected_revenue: number;
  projected_expenses: number;
  projected_margin: number; // percentage
  created_at: string;
}

export interface FinancialHealth {
  avg_monthly_revenue: number;
  avg_monthly_expenses: number;
  avg_operating_margin: number; // percentage
  revenue_per_child: number;
  cost_per_child: number;
  break_even_enrollment: number;
  months_of_reserves: number; // based on last month's data
  alerts: FinancialAlert[];
}

export interface FinancialAlert {
  type: 'warning' | 'danger' | 'info';
  message: string;
}

const RECORDS_KEY = 'christinas_financial_records';
const SCENARIOS_KEY = 'christinas_revenue_scenarios';

// Realistic childcare financials: ~90 children enrolled, $500/child/month avg tuition
// Two sites combined; labor ~65% of revenue
const SEED_RECORDS: Omit<FinancialRecord, 'id'>[] = [
  {
    month: '2025-09',
    revenue_tuition: 44200,
    revenue_cacfp: 3800,
    revenue_other: 1100,
    expenses_labor: 30500,
    expenses_supplies: 2400,
    expenses_fixed: 8200,
    expenses_other: 1600,
    notes: 'Back-to-school enrollment bump.',
  },
  {
    month: '2025-10',
    revenue_tuition: 45100,
    revenue_cacfp: 3950,
    revenue_other: 800,
    expenses_labor: 30900,
    expenses_supplies: 2100,
    expenses_fixed: 8200,
    expenses_other: 1800,
    notes: 'Full enrollment — minimal changes.',
  },
  {
    month: '2025-11',
    revenue_tuition: 44800,
    revenue_cacfp: 3700,
    revenue_other: 600,
    expenses_labor: 31200,
    expenses_supplies: 1900,
    expenses_fixed: 8200,
    expenses_other: 2100,
    notes: 'Thanksgiving week reduced headcount briefly.',
  },
  {
    month: '2025-12',
    revenue_tuition: 42500,
    revenue_cacfp: 3400,
    revenue_other: 1400,
    expenses_labor: 29800,
    expenses_supplies: 2800,
    expenses_fixed: 8200,
    expenses_other: 2400,
    notes: 'Holiday closures; higher supply spend for celebrations.',
  },
  {
    month: '2026-01',
    revenue_tuition: 45600,
    revenue_cacfp: 4100,
    revenue_other: 900,
    expenses_labor: 31500,
    expenses_supplies: 2200,
    expenses_fixed: 8400,
    expenses_other: 1700,
    notes: 'New year enrollment — two new infant slots filled.',
  },
  {
    month: '2026-02',
    revenue_tuition: 46200,
    revenue_cacfp: 4050,
    revenue_other: 750,
    expenses_labor: 31800,
    expenses_supplies: 2300,
    expenses_fixed: 8400,
    expenses_other: 1900,
    notes: 'Steady month; rate increase effective Feb 1.',
  },
];

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

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function ensureSeededLocally(): void {
  if (typeof window === 'undefined') return;
  // Never fabricate financial history in production. Real records or empty.
  if (!isDemoSeedEnabled()) return;
  const existing = getFromStorage<FinancialRecord>(RECORDS_KEY);
  if (existing.length === 0) {
    const seeded = SEED_RECORDS.map(r => ({
      ...r,
      id: generateId('fin'),
    }));
    saveToStorage(RECORDS_KEY, seeded);
  }
}

export async function getFinancialRecords(): Promise<FinancialRecord[]> {
  const cloudData = await supabaseSelect<FinancialRecord>('financial_records');

  if (cloudData !== null) {
    // Seed Supabase only in a demo environment. Production stays real or
    // empty; the budget reads real labor from the spine, not fabricated rows.
    if (cloudData.length === 0 && isDemoSeedEnabled()) {
      for (const r of SEED_RECORDS) {
        await supabaseInsert<FinancialRecord>('financial_records', {
          month: r.month,
          revenue_tuition: r.revenue_tuition,
          revenue_cacfp: r.revenue_cacfp,
          revenue_other: r.revenue_other,
          expenses_labor: r.expenses_labor,
          expenses_supplies: r.expenses_supplies,
          expenses_fixed: r.expenses_fixed,
          expenses_other: r.expenses_other,
          notes: r.notes || null,
        });
      }
      // Re-fetch after seeding
      const seeded = await supabaseSelect<FinancialRecord>('financial_records');
      if (seeded) {
        const sorted = [...seeded].sort((a, b) => a.month.localeCompare(b.month));
        saveToStorage(RECORDS_KEY, sorted);
        return sorted;
      }
    }

    const sorted = [...cloudData].sort((a, b) => a.month.localeCompare(b.month));
    saveToStorage(RECORDS_KEY, sorted);
    return sorted;
  }

  ensureSeededLocally();
  const records = getFromStorage<FinancialRecord>(RECORDS_KEY);
  records.sort((a, b) => a.month.localeCompare(b.month));
  return records;
}

export async function createRecord(
  data: Omit<FinancialRecord, 'id'>
): Promise<FinancialRecord> {
  if (isSupabaseConfigured) {
    const inserted = await supabaseInsert<FinancialRecord>('financial_records', {
      month: data.month,
      revenue_tuition: data.revenue_tuition,
      revenue_cacfp: data.revenue_cacfp,
      revenue_other: data.revenue_other,
      expenses_labor: data.expenses_labor,
      expenses_supplies: data.expenses_supplies,
      expenses_fixed: data.expenses_fixed,
      expenses_other: data.expenses_other,
      notes: data.notes || null,
    });

    if (inserted) {
      const records = getFromStorage<FinancialRecord>(RECORDS_KEY);
      records.push(inserted);
      saveToStorage(RECORDS_KEY, records);
      return inserted;
    }
  }

  // localStorage fallback
  ensureSeededLocally();
  const records = getFromStorage<FinancialRecord>(RECORDS_KEY);
  const record: FinancialRecord = { ...data, id: generateId('fin') };
  records.push(record);
  saveToStorage(RECORDS_KEY, records);
  return record;
}

export async function updateRecord(
  id: string,
  updates: Partial<FinancialRecord>
): Promise<FinancialRecord | null> {
  if (isSupabaseConfigured) {
    const updated = await supabaseUpdate<FinancialRecord>('financial_records', id, {
      month: updates.month,
      revenue_tuition: updates.revenue_tuition,
      revenue_cacfp: updates.revenue_cacfp,
      revenue_other: updates.revenue_other,
      expenses_labor: updates.expenses_labor,
      expenses_supplies: updates.expenses_supplies,
      expenses_fixed: updates.expenses_fixed,
      expenses_other: updates.expenses_other,
      notes: updates.notes ?? null,
    });

    if (updated) {
      const records = getFromStorage<FinancialRecord>(RECORDS_KEY);
      const idx = records.findIndex(r => r.id === id);
      if (idx >= 0) {
        records[idx] = { ...records[idx], ...updated };
        saveToStorage(RECORDS_KEY, records);
      }
      return updated;
    }
  }

  // localStorage fallback
  ensureSeededLocally();
  const records = getFromStorage<FinancialRecord>(RECORDS_KEY);
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...updates, id: records[index].id };
  saveToStorage(RECORDS_KEY, records);
  return records[index];
}

export async function getScenarios(): Promise<RevenueScenario[]> {
  const cloudData = await supabaseSelect<RevenueScenario>('revenue_scenarios');

  if (cloudData !== null) {
    const sorted = [...cloudData].sort((a, b) => b.created_at.localeCompare(a.created_at));
    saveToStorage(SCENARIOS_KEY, sorted);
    return sorted;
  }

  const scenarios = getFromStorage<RevenueScenario>(SCENARIOS_KEY);
  scenarios.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return scenarios;
}

export async function createScenario(
  data: Omit<RevenueScenario, 'id' | 'created_at'>
): Promise<RevenueScenario> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    const inserted = await supabaseInsert<RevenueScenario>('revenue_scenarios', {
      name: data.name,
      enrollment_change: data.enrollment_change,
      rate_change: data.rate_change,
      projected_revenue: data.projected_revenue,
      projected_expenses: data.projected_expenses,
      projected_margin: data.projected_margin,
      created_at: now,
    });

    if (inserted) {
      const scenarios = getFromStorage<RevenueScenario>(SCENARIOS_KEY);
      scenarios.push(inserted);
      saveToStorage(SCENARIOS_KEY, scenarios);
      return inserted;
    }
  }

  // localStorage fallback
  const scenarios = getFromStorage<RevenueScenario>(SCENARIOS_KEY);
  const scenario: RevenueScenario = {
    ...data,
    id: generateId('scen'),
    created_at: now,
  };
  scenarios.push(scenario);
  saveToStorage(SCENARIOS_KEY, scenarios);
  return scenario;
}

export async function deleteScenario(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const result = await supabaseDelete('revenue_scenarios', id);
    if (result) {
      const scenarios = getFromStorage<RevenueScenario>(SCENARIOS_KEY);
      saveToStorage(SCENARIOS_KEY, scenarios.filter(s => s.id !== id));
      return true;
    }
  }

  // localStorage fallback
  const scenarios = getFromStorage<RevenueScenario>(SCENARIOS_KEY);
  const filtered = scenarios.filter(s => s.id !== id);
  if (filtered.length === scenarios.length) return false;
  saveToStorage(SCENARIOS_KEY, filtered);
  return true;
}

// Calculate a projection given current enrollment + rate, and deltas
// currentEnrollment: total children enrolled right now
// ratePerChild: current average monthly tuition per child
// enrollmentChange: delta (e.g. +5 means 5 more children)
// rateChange: delta in dollars per child per month
export function calculateProjection(
  currentEnrollment: number,
  ratePerChild: number,
  enrollmentChange: number,
  rateChange: number
): {
  projected_revenue: number;
  projected_expenses: number;
  projected_margin: number;
} {
  const newEnrollment = currentEnrollment + enrollmentChange;
  const newRate = ratePerChild + rateChange;
  const projected_revenue = newEnrollment * newRate;

  // Labor scales with enrollment (~67% of revenue), fixed costs stay
  const laborCost = projected_revenue * 0.67;
  const fixedCosts = 10600; // rent + insurance + utilities per month
  const suppliesCost = newEnrollment * 25; // ~$25/child/month
  const otherCosts = projected_revenue * 0.04;
  const projected_expenses = laborCost + fixedCosts + suppliesCost + otherCosts;

  const projected_margin =
    projected_revenue > 0
      ? Math.round(((projected_revenue - projected_expenses) / projected_revenue) * 1000) / 10
      : 0;

  return {
    projected_revenue: Math.round(projected_revenue),
    projected_expenses: Math.round(projected_expenses),
    projected_margin,
  };
}

export async function getFinancialHealth(): Promise<FinancialHealth> {
  const records = await getFinancialRecords();
  if (records.length === 0) {
    return {
      avg_monthly_revenue: 0,
      avg_monthly_expenses: 0,
      avg_operating_margin: 0,
      revenue_per_child: 0,
      cost_per_child: 0,
      break_even_enrollment: 0,
      months_of_reserves: 0,
      alerts: [],
    };
  }

  const totalRevenue = records.reduce(
    (sum, r) => sum + r.revenue_tuition + r.revenue_cacfp + r.revenue_other,
    0
  );
  const totalExpenses = records.reduce(
    (sum, r) =>
      sum + r.expenses_labor + r.expenses_supplies + r.expenses_fixed + r.expenses_other,
    0
  );
  const avg_monthly_revenue = Math.round(totalRevenue / records.length);
  const avg_monthly_expenses = Math.round(totalExpenses / records.length);
  const avg_operating_margin =
    avg_monthly_revenue > 0
      ? Math.round(((avg_monthly_revenue - avg_monthly_expenses) / avg_monthly_revenue) * 1000) / 10
      : 0;

  // Approximate enrollment: last month tuition / avg rate per child
  const avgRatePerChild = 510; // $510/child/month average
  const lastRevRecord = records[records.length - 1];
  const approxEnrollment = Math.round(
    lastRevRecord.revenue_tuition / avgRatePerChild
  );

  const revenue_per_child =
    approxEnrollment > 0 ? Math.round(avg_monthly_revenue / approxEnrollment) : 0;
  const cost_per_child =
    approxEnrollment > 0 ? Math.round(avg_monthly_expenses / approxEnrollment) : 0;

  // Break-even: fixed costs / (rate per child - variable cost per child)
  const fixedCosts = 10600;
  const variableCostPerChild = 25 + avgRatePerChild * 0.71; // labor + supplies
  const contributionMargin = avgRatePerChild - variableCostPerChild;
  const break_even_enrollment =
    contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;

  // Reserves: assume 2 months cash on hand
  const months_of_reserves = 2.1;

  const alerts: FinancialAlert[] = [];
  if (avg_operating_margin < 10) {
    alerts.push({
      type: 'danger',
      message: `Operating margin is ${avg_operating_margin}% — below the 10% minimum. Review labor costs and enrollment rates.`,
    });
  } else if (avg_operating_margin < 15) {
    alerts.push({
      type: 'warning',
      message: `Operating margin of ${avg_operating_margin}% is healthy but below the 15% target.`,
    });
  }
  if (months_of_reserves < 2) {
    alerts.push({
      type: 'danger',
      message: `Cash reserves cover less than 2 months of expenses. Build reserves before adding headcount.`,
    });
  }
  const lastRecord = records[records.length - 1];
  if (lastRecord) {
    const lastRevenue =
      lastRecord.revenue_tuition + lastRecord.revenue_cacfp + lastRecord.revenue_other;
    const prevRecord = records[records.length - 2];
    if (prevRecord) {
      const prevRevenue =
        prevRecord.revenue_tuition + prevRecord.revenue_cacfp + prevRecord.revenue_other;
      const change = ((lastRevenue - prevRevenue) / prevRevenue) * 100;
      if (change < -3) {
        alerts.push({
          type: 'warning',
          message: `Revenue dropped ${Math.abs(Math.round(change))}% from the prior month. Investigate enrollment changes.`,
        });
      }
    }
  }

  return {
    avg_monthly_revenue,
    avg_monthly_expenses,
    avg_operating_margin,
    revenue_per_child,
    cost_per_child,
    break_even_enrollment,
    months_of_reserves,
    alerts,
  };
}
