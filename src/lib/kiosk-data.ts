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
  lookupFamilyByPin(pin: string): Promise<KioskFamily | null>;
  getTodayAttendance(childId: string): Promise<AttendanceRow | null>;
  // signedByName: the adult who dropped off / picked up (DCYF Sign In/Out Person).
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

async function callKiosk<T>(payload: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch('/api/kiosk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

// A center-bound live client. The center comes from the kiosk's per-device URL
// and is sent with every call so the server scopes the lookup/attendance to it.
export function makeLiveKioskClient(centerId?: string): KioskClient {
  return {
    lookupFamilyByPin: (pin) =>
      callKiosk<KioskFamily>({ action: 'lookup', pin, centerId }),
    getTodayAttendance: (childId) =>
      callKiosk<AttendanceRow>({ action: 'attendance', childId, centerId }),
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
    getPrivacyAttestationStatus: async (familyId) => {
      const res = await callKiosk<{ current: boolean }>({
        action: 'attest_status',
        familyId,
        centerId,
      });
      return res?.current ?? false;
    },
    recordPrivacyAttestation: async (familyId, agreedName) => {
      await callKiosk({
        action: 'record_attestation',
        familyId,
        agreedName,
        centerId,
      });
    },
  };
}

// Back-compat default: no explicit center, so the server falls back to the
// operating center. A center-bound kiosk page uses makeLiveKioskClient(id).
export const liveKioskClient: KioskClient = makeLiveKioskClient();

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
