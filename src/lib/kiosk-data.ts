// Kiosk data layer. Two implementations behind one interface:
//
//   liveKioskClient — talks ONLY to the service-role /api/kiosk route. The
//   browser has no direct table access, so a stranger with the public anon key
//   cannot read the family/child roster. PIN-guessing is rate limited server
//   side.
//
//   demoKioskClient — talks to the demo_* tables with the anon key. Those
//   tables hold only fabricated data and power the public /demo sandbox.
//
// The shared kiosk UI takes a KioskClient and does not know which it has.

import { supabase } from '@/lib/supabase';

export interface FamilyParent {
  id: string;
  family_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relationship: string;
  is_primary: boolean;
}

export interface FamilyChildRow {
  id: string;
  family_id: string;
  name: string;
  date_of_birth: string | null;
  classroom: string | null;
  photo_url?: string | null;
}

export interface KioskFamily {
  id: string;
  email: string;
  parents: FamilyParent[];
  children: FamilyChildRow[];
}

export interface AttendanceRow {
  id?: string;
  child_id: string;
  child_name: string;
  family_id?: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
}

export interface KioskClient {
  // The center this client is bound to (live kiosks only). Lets the UI queue
  // offline actions with the right center attached.
  readonly centerId?: string;
  // Resolves to the family, or null when the PIN genuinely is not at this
  // center. Throws KioskSystemError when the system itself is unreachable
  // (timeout, network down, server error) so the UI can tell the difference.
  lookupFamilyByPin(pin: string): Promise<KioskFamily | null>;
  getTodayAttendance(childId: string): Promise<AttendanceRow | null>;
  // signedByName: the adult who dropped off / picked up (DCYF Sign In/Out Person).
  // Both throw KioskSystemError when the system is unreachable so the UI can
  // queue the action for later instead of losing it.
  checkIn(child: FamilyChildRow, familyId: string, signedByName?: string): Promise<void>;
  checkOut(childId: string, familyId?: string, signedByName?: string): Promise<void>;
  // MN DCYF privacy-notice gate: is the family's agreement current (right
  // version, within the year)? And record an agreement.
  getPrivacyAttestationStatus(familyId: string): Promise<boolean>;
  recordPrivacyAttestation(familyId: string, agreedName: string): Promise<void>;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// The single operating center (Brooklyn Park) — used for live attendance. Id
// retained from the original seed record, renamed from "Crystal Center" once
// the business consolidated to one location.
const OPERATING_CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';

// ============================================================
// LIVE: everything through the locked server route
// ============================================================

// A SYSTEM failure (unreachable database, hung request, server error) is not
// the same as "PIN not found". The June outage froze the kiosk on "Checking..."
// because a hung fetch never resolved and every failure collapsed into null.
export type KioskFailReason = 'timeout' | 'network' | 'server' | 'busy';

export class KioskSystemError extends Error {
  readonly reason: KioskFailReason;
  constructor(reason: KioskFailReason) {
    super(`Kiosk system unreachable (${reason})`);
    this.name = 'KioskSystemError';
    this.reason = reason;
  }
}

// Hard ceiling on every kiosk request so the pad can never hang forever.
const KIOSK_TIMEOUT_MS = 8000;

// Resolves within KIOSK_TIMEOUT_MS no matter what. Returns the data (or null
// for a genuine "not found" style response). Throws KioskSystemError on
// timeout, network failure, rate limiting, or a 5xx from the server.
async function callKiosk<T>(payload: Record<string, unknown>): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), KIOSK_TIMEOUT_MS);
  try {
    const res = await fetch('/api/kiosk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    // 429 (too many wrong PIN attempts at this center): busy, not down. The pad
    // shows a "use the front desk" message rather than a scary outage screen.
    if (res.status === 429) throw new KioskSystemError('busy');
    // 5xx / 503 (database down): the system, not the PIN.
    if (res.status >= 500) throw new KioskSystemError('server');
    // Other 4xx: the server deterministically rejected this request (bad
    // input, guard failure). Retrying will not help; keep the old null.
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data ?? null) as T | null;
  } catch (err) {
    if (err instanceof KioskSystemError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new KioskSystemError('timeout');
    }
    throw new KioskSystemError('network');
  } finally {
    clearTimeout(timer);
  }
}

// A center-bound live client. The center comes from the kiosk's per-device URL
// and is sent with every call so the server scopes the lookup/attendance to it.
export function makeLiveKioskClient(centerId?: string): KioskClient {
  return {
    centerId,
    // Throws KioskSystemError when the system is unreachable; the PIN pad
    // shows a "we can't reach the system" message instead of a false
    // "PIN not found".
    lookupFamilyByPin: (pin) =>
      callKiosk<KioskFamily>({ action: 'lookup', pin, centerId }),
    // Display-only: a missing row just renders "Not here yet", so a system
    // failure degrades to null rather than crashing the child tiles.
    getTodayAttendance: async (childId) => {
      try {
        return await callKiosk<AttendanceRow>({ action: 'attendance', childId, centerId });
      } catch {
        return null;
      }
    },
    // Throw on system failure so the UI can queue the action offline.
    checkIn: async (child, familyId, signedByName) => {
      await callKiosk({
        action: 'checkin',
        childId: child.id,
        childName: child.name,
        familyId,
        signedByName: signedByName || null,
        centerId,
      });
    },
    checkOut: async (childId, familyId, signedByName) => {
      await callKiosk({ action: 'checkout', childId, familyId, signedByName: signedByName || null, centerId });
    },
    // Privacy gate: if the system is down we cannot verify, so show the
    // notice (false) and record best-effort. Never block a family on it.
    getPrivacyAttestationStatus: async (familyId) => {
      try {
        const res = await callKiosk<{ current: boolean }>({
          action: 'attest_status',
          familyId,
          centerId,
        });
        return res?.current ?? false;
      } catch {
        return false;
      }
    },
    recordPrivacyAttestation: async (familyId, agreedName) => {
      try {
        await callKiosk({
          action: 'record_attestation',
          familyId,
          agreedName,
          centerId,
        });
      } catch {
        // Best effort during an outage; the family still proceeds.
      }
    },
  };
}

// Back-compat default: no explicit center, so the server falls back to the
// operating center. A center-bound kiosk page uses makeLiveKioskClient(id).
export const liveKioskClient: KioskClient = makeLiveKioskClient();

// ============================================================
// Offline check-in queue. When a check-in/out fails because the system is
// unreachable (not because the server rejected it), the kiosk saves the
// action locally and replays it when the system comes back, so the front
// desk is never blocked. Lookup still needs the database; only the action
// after a successful lookup is queued.
// ============================================================

export interface PendingKioskAction {
  action: 'checkin' | 'checkout';
  childId: string;
  childName: string;
  familyId: string;
  centerId?: string;
  signedByName?: string;
  ts: number;
}

const PENDING_ACTIONS_KEY = 'kiosk_pending_actions';

function actionKey(item: PendingKioskAction): string {
  return `${item.action}|${item.childId}|${item.ts}`;
}

function isSameLocalDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function readPendingActions(): PendingKioskAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PENDING_ACTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is PendingKioskAction =>
        !!x &&
        (x.action === 'checkin' || x.action === 'checkout') &&
        typeof x.childId === 'string' &&
        typeof x.familyId === 'string' &&
        typeof x.ts === 'number'
    );
  } catch {
    return [];
  }
}

function writePendingActions(items: PendingKioskAction[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: nothing more we can do offline.
  }
}

// Save a failed action for replay. Deduped: the same child + action on the
// same day is only ever queued once (replay itself is idempotent because the
// server already guards against double check-ins).
export function queueKioskAction(item: PendingKioskAction): void {
  const items = readPendingActions();
  const duplicate = items.some(
    (x) => x.childId === item.childId && x.action === item.action && isSameLocalDay(x.ts, item.ts)
  );
  if (duplicate) return;
  items.push(item);
  writePendingActions(items);
}

let flushingKioskQueue = false;

// Replay queued actions against /api/kiosk. Successful (or deterministically
// rejected) items are removed; items that still cannot reach the system stay
// queued. Actions from a previous day are dropped, never replayed: recording
// yesterday's check-in today would corrupt the attendance record.
export async function flushKioskQueue(): Promise<void> {
  if (flushingKioskQueue || typeof window === 'undefined') return;
  flushingKioskQueue = true;
  try {
    const items = readPendingActions();
    if (items.length === 0) return;
    const resolved = new Set<string>();
    const now = Date.now();
    for (const item of items) {
      if (!isSameLocalDay(item.ts, now)) {
        resolved.add(actionKey(item));
        continue;
      }
      try {
        if (item.action === 'checkin') {
          await callKiosk({
            action: 'checkin',
            childId: item.childId,
            childName: item.childName,
            familyId: item.familyId,
            signedByName: item.signedByName || null,
            centerId: item.centerId,
          });
        } else {
          // Guard a stale queued checkout against a fresh re-entry: if the child
          // now has an OPEN check-in that began AFTER this checkout was queued,
          // they came back in, so drop the checkout instead of marking a present
          // child as gone. (Replaying against the same session, or none, is benign.)
          const current = await callKiosk<AttendanceRow>({
            action: 'attendance',
            childId: item.childId,
            centerId: item.centerId,
          });
          const reEntered =
            !!current && !!current.check_in && !current.check_out &&
            new Date(current.check_in).getTime() > item.ts;
          if (reEntered) {
            resolved.add(actionKey(item));
            continue;
          }
          await callKiosk({
            action: 'checkout',
            childId: item.childId,
            familyId: item.familyId,
            signedByName: item.signedByName || null,
            centerId: item.centerId,
          });
        }
        resolved.add(actionKey(item));
      } catch {
        // System still unreachable: keep it for the next flush.
      }
    }
    if (resolved.size > 0) {
      // Re-read before writing so an action queued mid-flush is not lost.
      writePendingActions(readPendingActions().filter((x) => !resolved.has(actionKey(x))));
    }
  } finally {
    flushingKioskQueue = false;
  }
}

// ============================================================
// DEMO: anon key against demo_* tables (fabricated data only)
// ============================================================

export const demoKioskClient: KioskClient = {
  async lookupFamilyByPin(pin) {
    const { data: families, error } = await supabase
      .from('demo_families')
      .select('id, email, pin, status')
      .eq('pin', pin)
      .eq('status', 'active')
      .limit(1);
    if (error || !families || families.length === 0) return null;
    const family = families[0];

    const { data: parents } = await supabase
      .from('demo_family_parents')
      .select('*')
      .eq('family_id', family.id);
    const { data: children } = await supabase
      .from('demo_family_children')
      .select('*')
      .eq('family_id', family.id);

    return {
      id: family.id,
      email: family.email,
      parents: parents || [],
      children: children || [],
    };
  },

  async getTodayAttendance(childId) {
    const { data } = await supabase
      .from('demo_attendance')
      .select('*')
      .eq('child_id', childId)
      .eq('date', getTodayDate())
      .limit(1);
    return data?.[0] || null;
  },

  async checkIn(child, familyId) {
    const today = getTodayDate();
    const { data } = await supabase
      .from('demo_attendance')
      .select('*')
      .eq('child_id', child.id)
      .eq('date', today)
      .limit(1);
    const existing = data?.[0];

    if (existing && existing.check_in && !existing.check_out) return;

    if (existing && existing.check_out) {
      await supabase
        .from('demo_attendance')
        .update({ check_out: null, check_in: new Date().toISOString() })
        .eq('id', existing.id);
      return;
    }

    await supabase.from('demo_attendance').insert({
      child_id: child.id,
      child_name: child.name,
      date: today,
      check_in: new Date().toISOString(),
      center_id: OPERATING_CENTER_ID,
      notes: `family:${familyId}`,
    });
  },

  async checkOut(childId) {
    await supabase
      .from('demo_attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('child_id', childId)
      .eq('date', getTodayDate());
  },

  // Demo always shows the notice (so the flow is visible) and never persists.
  async getPrivacyAttestationStatus() {
    return false;
  },
  async recordPrivacyAttestation() {
    /* demo: no-op */
  },
};
