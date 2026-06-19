// Authorization Storage Module — Tool 04: State Authorization Tracking
// Supabase-first with localStorage as the synchronous fallback cache.
//
// Dual-write pattern (mirrors supply-inventory-storage): the cloud `authorizations`
// table is the source of truth, the localStorage cache is what the synchronous
// callers read. Reads serve the local cache immediately (seed-on-empty) and kick
// off a background hydration from Supabase that refreshes the cache for the next
// render. Writes update the local cache synchronously and fire the cloud write in
// the background. Every cloud row stamps center_id and stores the typed fields in
// a JSONB `data` column (see migration 032). Public signatures stay synchronous so
// the existing callers keep compiling unchanged.

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
} from '@/lib/supabase/service';
import { currentCenterId } from '@/lib/current-center';

export type AuthType = 'county_authorization' | 'state_subsidy' | 'ccap' | 'other';
export type AuthStatus = 'active' | 'expiring_soon' | 'expired' | 'pending' | 'renewal_pending';

export interface ChildAuthorization {
  id: string;
  child_name: string;
  parent_name: string;
  auth_type: AuthType;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  status: AuthStatus;
  renewal_submitted_at?: string;
  renewal_approved_at?: string;
  notes?: string;
  center_id?: string;
  created_at: string;
  updated_at: string;
}

export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  county_authorization: 'County Authorization',
  state_subsidy: 'State Subsidy',
  ccap: 'CCAP',
  other: 'Other',
};

export const AUTH_STATUS_LABELS: Record<AuthStatus, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  pending: 'Pending',
  renewal_pending: 'Renewal Pending',
};

const AUTHORIZATIONS_KEY = 'christinas_authorizations';
const AVG_MONTHLY_RATE = 1200;

// Supabase table backing the authorization records. Single record kind, so no
// `record_type` discriminator: typed fields live in a JSONB `data` column
// (see migration 032).
const AUTHORIZATIONS_TABLE = 'authorizations';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Resolve a usable center_id for the cloud row: keep a real UUID if provided,
// otherwise fall back to the current center (cc_center cookie, else Brooklyn Park).
function resolveCenterId(center_id?: string): string {
  return center_id && UUID_PATTERN.test(center_id)
    ? center_id
    : currentCenterId();
}

// Shape of a row in the `authorizations` table.
interface AuthorizationRow {
  id: string;
  center_id: string | null;
  data: Record<string, unknown>;
}

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

// Drop the id key so it lives only as the row's primary-key column, not inside data.
function stripId<T extends { id: string }>(record: T): Record<string, unknown> {
  const { id: _id, ...rest } = record;
  return rest as Record<string, unknown>;
}

// Build the cloud row payload for an insert from a typed authorization object.
function toRow(record: ChildAuthorization): Record<string, unknown> {
  return {
    id: record.id,
    center_id: resolveCenterId(record.center_id),
    data: stripId(record),
  };
}

// Unwrap a cloud row back into the typed authorization object.
function fromRow(row: AuthorizationRow): ChildAuthorization {
  return { id: row.id, ...(row.data as object) } as ChildAuthorization;
}

// ─── Cloud sync (background, non-blocking) ──────────────────────────

// Hydrate the local cache from Supabase. Runs in the background so the
// synchronous read functions can serve the cache without awaiting. No-op when
// Supabase is not configured (supabaseSelect returns null) or on error.
async function cloudHydrate(): Promise<void> {
  const rows = await supabaseSelect<AuthorizationRow>(AUTHORIZATIONS_TABLE, {
    filters: { center_id: currentCenterId() },
  });
  if (rows === null) return;
  const auths = rows.map((r) => fromRow(r));
  if (auths.length === 0) return;
  saveToStorage(AUTHORIZATIONS_KEY, auths);
}

// Fire-and-forget background sync. Swallows errors so a cloud hiccup never
// breaks the synchronous local read/write path.
function syncFromCloud(): void {
  if (typeof window === 'undefined') return;
  void cloudHydrate().catch(() => {
    /* cloud unavailable; local cache remains authoritative */
  });
}

// Push a freshly created authorization to the cloud, then seed any locally
// generated records (e.g. seed data) that aren't there yet.
function cloudInsert(auth: ChildAuthorization): void {
  if (typeof window === 'undefined') return;
  void supabaseInsert<AuthorizationRow>(AUTHORIZATIONS_TABLE, toRow(auth)).catch(
    () => {
      /* cloud unavailable; local cache remains authoritative */
    }
  );
}

// Push an update to the cloud row for an existing authorization.
function cloudUpdate(auth: ChildAuthorization): void {
  if (typeof window === 'undefined') return;
  void supabaseUpdate<AuthorizationRow>(AUTHORIZATIONS_TABLE, auth.id, {
    center_id: resolveCenterId(auth.center_id),
    data: stripId(auth),
  }).catch(() => {
    /* cloud unavailable; local cache remains authoritative */
  });
}

// Seed the cloud table from the local cache (first run only).
function cloudSeed(auths: ChildAuthorization[]): void {
  if (typeof window === 'undefined') return;
  for (const auth of auths) {
    void supabaseInsert<AuthorizationRow>(
      AUTHORIZATIONS_TABLE,
      toRow(auth)
    ).catch(() => {
      /* cloud unavailable; local cache remains authoritative */
    });
  }
}

// ─── Status Computation ─────────────────────────────────────────────

export function computeStatus(auth: Pick<ChildAuthorization, 'start_date' | 'end_date' | 'status' | 'renewal_submitted_at'>): AuthStatus {
  // Preserve manual statuses that don't derive purely from dates
  if (auth.status === 'pending') return 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(auth.end_date);
  endDate.setHours(0, 0, 0, 0);

  const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 30) {
    if (auth.renewal_submitted_at) return 'renewal_pending';
    return 'expiring_soon';
  }
  return 'active';
}

export function getDaysRemaining(endDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Seed Data ──────────────────────────────────────────────────────

function buildSeedData(): ChildAuthorization[] {
  const today = new Date();

  function dateOffset(days: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  function pastDate(days: number): string {
    return dateOffset(-days);
  }

  const seed: Omit<ChildAuthorization, 'id' | 'created_at' | 'updated_at' | 'status'>[] = [
    {
      child_name: 'Aaliyah Thompson',
      parent_name: 'DeShawn Thompson',
      auth_type: 'ccap',
      start_date: pastDate(180),
      end_date: dateOffset(120),
      center_id: 'center_001',
    },
    {
      child_name: 'Marcus Rivera',
      parent_name: 'Elena Rivera',
      auth_type: 'state_subsidy',
      start_date: pastDate(90),
      end_date: dateOffset(18),
      center_id: 'center_001',
    },
    {
      child_name: 'Priya Patel',
      parent_name: 'Anil Patel',
      auth_type: 'county_authorization',
      start_date: pastDate(60),
      end_date: dateOffset(7),
      renewal_submitted_at: pastDate(14),
      center_id: 'center_001',
    },
    {
      child_name: 'James O\'Brien',
      parent_name: 'Colleen O\'Brien',
      auth_type: 'ccap',
      start_date: pastDate(210),
      end_date: pastDate(15),
      center_id: 'center_001',
    },
    {
      child_name: 'Sofia Nguyen',
      parent_name: 'Minh Nguyen',
      auth_type: 'state_subsidy',
      start_date: pastDate(30),
      end_date: dateOffset(200),
      center_id: 'center_001',
    },
    {
      child_name: 'Elijah Washington',
      parent_name: 'Tamara Washington',
      auth_type: 'ccap',
      start_date: pastDate(5),
      end_date: dateOffset(175),
      center_id: 'center_001',
      notes: 'Awaiting final approval documentation',
    },
    {
      child_name: 'Amara Johnson',
      parent_name: 'Keisha Johnson',
      auth_type: 'county_authorization',
      start_date: pastDate(120),
      end_date: dateOffset(25),
      center_id: 'center_001',
    },
    {
      child_name: 'Leo Chen',
      parent_name: 'Wei Chen',
      auth_type: 'state_subsidy',
      start_date: pastDate(45),
      end_date: pastDate(3),
      center_id: 'center_001',
      notes: 'Family contacted, renewal in progress',
    },
    {
      child_name: 'Zoe Martinez',
      parent_name: 'Rosa Martinez',
      auth_type: 'ccap',
      start_date: pastDate(365),
      end_date: dateOffset(90),
      renewal_submitted_at: pastDate(7),
      center_id: 'center_001',
    },
    {
      child_name: 'Noah Williams',
      parent_name: 'Angela Williams',
      auth_type: 'other',
      start_date: pastDate(200),
      end_date: dateOffset(150),
      center_id: 'center_001',
      notes: 'Employer childcare benefit program',
    },
    {
      child_name: 'Isabelle Brown',
      parent_name: 'Marcus Brown',
      auth_type: 'county_authorization',
      start_date: today.toISOString().split('T')[0],
      end_date: dateOffset(365),
      center_id: 'center_001',
      notes: 'New enrollment — authorization just received',
    },
    {
      child_name: 'Jaylen Davis',
      parent_name: 'Tanya Davis',
      auth_type: 'state_subsidy',
      start_date: pastDate(100),
      end_date: dateOffset(12),
      center_id: 'center_001',
    },
  ];

  // Indexes that should be treated as 'pending' (awaiting initial approval)
  // Index 5 = Elijah Washington
  const pendingIndexes = new Set([5]);

  return seed.map((s, idx) => {
    const initialStatus: AuthStatus = pendingIndexes.has(idx) ? 'pending' : 'active';
    const partial = {
      ...s,
      id: `auth_seed_${idx + 1}`,
      created_at: new Date(s.start_date).toISOString(),
      updated_at: new Date().toISOString(),
      status: initialStatus as AuthStatus,
    };
    partial.status = computeStatus(partial);
    return partial;
  });
}

// Read the local cache, seeding on first load. Triggers a background cloud
// hydration so the next read reflects the cloud source of truth. Keeps the
// public read functions synchronous for the existing callers.
function loadCache(): ChildAuthorization[] {
  let auths = getFromStorage<ChildAuthorization>(AUTHORIZATIONS_KEY);

  // Seed on first load (local cache empty)
  if (auths.length === 0) {
    auths = buildSeedData();
    saveToStorage(AUTHORIZATIONS_KEY, auths);
    // Seed the cloud table from the same data (first run only)
    cloudSeed(auths);
  } else {
    // Refresh the cache from the cloud in the background for the next render
    syncFromCloud();
  }

  return auths;
}

// ─── CRUD ───────────────────────────────────────────────────────────

export function getAuthorizations(filters?: {
  status?: AuthStatus;
  auth_type?: AuthType;
  center_id?: string;
}): ChildAuthorization[] {
  let auths = loadCache();

  // Recompute statuses on every read to stay current
  auths = auths.map((a) => ({ ...a, status: computeStatus(a) }));

  if (filters) {
    if (filters.status) {
      auths = auths.filter((a) => a.status === filters.status);
    }
    if (filters.auth_type) {
      auths = auths.filter((a) => a.auth_type === filters.auth_type);
    }
    if (filters.center_id) {
      auths = auths.filter((a) => a.center_id === filters.center_id);
    }
  }

  return auths;
}

export function createAuthorization(
  data: Omit<ChildAuthorization, 'id' | 'status' | 'created_at' | 'updated_at'>
): ChildAuthorization {
  const auths = getFromStorage<ChildAuthorization>(AUTHORIZATIONS_KEY);
  const auth: ChildAuthorization = {
    ...data,
    id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  auth.status = computeStatus(auth);

  // Update the local cache synchronously, then write to Supabase in the background
  auths.push(auth);
  saveToStorage(AUTHORIZATIONS_KEY, auths);
  cloudInsert(auth);
  return auth;
}

export function updateAuthorization(
  id: string,
  updates: Partial<Omit<ChildAuthorization, 'id' | 'created_at'>>
): ChildAuthorization | null {
  const auths = getFromStorage<ChildAuthorization>(AUTHORIZATIONS_KEY);
  const index = auths.findIndex((a) => a.id === id);
  if (index === -1) return null;

  auths[index] = {
    ...auths[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  auths[index].status = computeStatus(auths[index]);

  // Update the local cache synchronously, then write to Supabase in the background
  saveToStorage(AUTHORIZATIONS_KEY, auths);
  cloudUpdate(auths[index]);
  return auths[index];
}

// ─── Queries ────────────────────────────────────────────────────────

export function getExpiringAuthorizations(daysThreshold = 30): ChildAuthorization[] {
  const all = getAuthorizations();
  return all
    .filter((a) => {
      const days = getDaysRemaining(a.end_date);
      return days >= 0 && days <= daysThreshold;
    })
    .sort((a, b) => getDaysRemaining(a.end_date) - getDaysRemaining(b.end_date));
}

export interface RenewalStats {
  totalActive: number;
  expiringSoon: number;
  expired: number;
  pending: number;
  renewalPending: number;
  avgProcessingDays: number;
  revenueAtRisk: number;
  monthlyRenewalsCompleted: number;
  monthlyRenewalsOverdue: number;
}

export function getRenewalStats(): RenewalStats {
  const all = getAuthorizations();

  const totalActive = all.filter((a) => a.status === 'active').length;
  const expiringSoon = all.filter((a) => a.status === 'expiring_soon').length;
  const expired = all.filter((a) => a.status === 'expired').length;
  const pending = all.filter((a) => a.status === 'pending').length;
  const renewalPending = all.filter((a) => a.status === 'renewal_pending').length;

  // Average processing days: for renewals that have both submitted and approved dates
  const completedRenewals = all.filter(
    (a) => a.renewal_submitted_at && a.renewal_approved_at
  );
  const avgProcessingDays =
    completedRenewals.length > 0
      ? Math.round(
          completedRenewals.reduce((sum, a) => {
            const submitted = new Date(a.renewal_submitted_at!).getTime();
            const approved = new Date(a.renewal_approved_at!).getTime();
            return sum + (approved - submitted) / (1000 * 60 * 60 * 24);
          }, 0) / completedRenewals.length
        )
      : 21; // default estimate

  const revenueAtRisk = expired * AVG_MONTHLY_RATE;

  // This month renewals
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRenewalsCompleted = all.filter(
    (a) =>
      a.renewal_approved_at &&
      new Date(a.renewal_approved_at) >= monthStart
  ).length;

  // Overdue: expiring_soon with no renewal submitted
  const monthlyRenewalsOverdue = all.filter(
    (a) =>
      (a.status === 'expiring_soon' || a.status === 'expired') &&
      !a.renewal_submitted_at
  ).length;

  return {
    totalActive,
    expiringSoon,
    expired,
    pending,
    renewalPending,
    avgProcessingDays,
    revenueAtRisk,
    monthlyRenewalsCompleted,
    monthlyRenewalsOverdue,
  };
}
