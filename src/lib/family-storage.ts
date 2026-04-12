// Family Storage Module for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
  isSupabaseConfigured,
} from '@/lib/supabase/service';
import { getSupabase } from '@/lib/supabase/client';

import {
  FamilyAccount,
  FamilyChild,
  FamilyParent,
  generateFamilyId,
  generateParentId,
  generateChildId,
} from '@/types/family';

// ============================================================================
// Password Hashing (SHA-256 via Web Crypto — works in browser + Node 18+)
// ============================================================================

async function hashPasswordAsync(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  // globalThis.crypto.subtle works in both browser and Node.js 18+
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hash = await hashPasswordAsync(password);
  return hash === storedHash;
}

// Storage keys
const STORAGE_KEYS = {
  families: 'christinas_families',
  currentFamily: 'christinas_current_family',
};

// ============================================================================
// Generic Storage Helpers
// ============================================================================

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// ============================================================================
// Supabase Helpers — reconstruct FamilyAccount from 3 tables
// ============================================================================

// Row shapes returned by Supabase (snake_case, UUIDs for ids)
interface FamilyRow {
  id: string;
  email: string;
  password_hash: string;
  pin: string | null;
  status: 'pending' | 'active' | 'inactive';
  approved_by: string | null;
  approved_at: string | null;
  address: string | null;
  family_bio: string | null;
  created_at: string;
  updated_at: string;
}

interface FamilyParentRow {
  id: string;
  family_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

interface FamilyChildRow {
  id: string;
  family_id: string;
  name: string;
  date_of_birth: string | null;
  classroom: string | null;
  allergies: string[];
  medical_notes: string | null;
  created_at: string;
}

async function fetchFamiliesFromSupabase(): Promise<FamilyAccount[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const [families, parents, children] = await Promise.all([
      supabaseSelect<FamilyRow>('families'),
      supabaseSelect<FamilyParentRow>('family_parents'),
      supabaseSelect<FamilyChildRow>('family_children'),
    ]);

    if (!families) return null;

    return families.map((f) => {
      const familyParents: FamilyParent[] = (parents || [])
        .filter((p) => p.family_id === f.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone || '',
          email: p.email || '',
          relationship: (p.relationship || 'guardian') as FamilyParent['relationship'],
          is_primary: p.is_primary,
        }));

      const familyChildren: FamilyChild[] = (children || [])
        .filter((c) => c.family_id === f.id)
        .map((c) => ({
          id: c.id,
          name: c.name,
          date_of_birth: c.date_of_birth || '',
          classroom: c.classroom || '',
          allergies: c.allergies || [],
          medical_notes: c.medical_notes || undefined,
          emergency_contacts: [],
        }));

      return {
        id: f.id,
        email: f.email,
        password_hash: f.password_hash,
        pin: f.pin || undefined,
        status: f.status,
        approved_by: f.approved_by || undefined,
        approved_at: f.approved_at || undefined,
        address: f.address || undefined,
        family_bio: f.family_bio || undefined,
        parents: familyParents,
        children: familyChildren,
        created_at: f.created_at,
        updated_at: f.updated_at,
      } as FamilyAccount;
    });
  } catch (err) {
    console.error('Error fetching families from Supabase:', err);
    return null;
  }
}

// ============================================================================
// Family CRUD
// ============================================================================

export async function getFamilies(): Promise<FamilyAccount[]> {
  const cloudData = await fetchFamiliesFromSupabase();
  if (cloudData !== null) {
    saveToStorage(STORAGE_KEYS.families, cloudData);
    return cloudData;
  }
  return getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
}

export async function getFamily(id: string): Promise<FamilyAccount | null> {
  const families = await getFamilies();
  return families.find((f) => f.id === id) || null;
}

export async function getFamilyByEmail(email: string): Promise<FamilyAccount | null> {
  const families = await getFamilies();
  const found = families.find((f) => f.email.toLowerCase() === email.toLowerCase());
  if (found) return found;

  // Fallback: check localStorage directly in case Supabase returned empty
  const localFamilies = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  return localFamilies.find((f) => f.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getFamilyByPin(pin: string): Promise<FamilyAccount | null> {
  const families = await getFamilies();
  return families.find((f) => f.pin === pin && f.status === 'active') || null;
}

export function generateFamilyPin(): string {
  // Generate unique 4-digit PIN not already in use
  const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  const existingPins = new Set(families.map((f) => f.pin).filter(Boolean));
  let pin: string;
  do {
    pin = String(Math.floor(1000 + Math.random() * 9000));
  } while (existingPins.has(pin));
  return pin;
}

export async function createFamily(data: Omit<FamilyAccount, 'id' | 'created_at' | 'updated_at'>): Promise<FamilyAccount> {
  const now = new Date().toISOString();
  const localId = generateFamilyId();

  if (isSupabaseConfigured) {
    try {
      const familyRow = await supabaseInsert<FamilyRow>('families', {
        email: data.email,
        password_hash: data.password_hash,
        pin: data.pin || null,
        status: data.status || 'active',
        approved_by: data.approved_by || null,
        approved_at: data.approved_at || null,
        address: data.address || null,
        family_bio: data.family_bio || null,
      });

      if (familyRow) {
        const supabase = getSupabase()!;
        // Insert parents
        if (data.parents && data.parents.length > 0) {
          await supabase.from('family_parents').insert(
            data.parents.map((p) => ({
              family_id: familyRow.id,
              name: p.name,
              phone: p.phone || null,
              email: p.email || null,
              relationship: p.relationship || 'guardian',
              is_primary: p.is_primary || false,
            }))
          );
        }
        // Insert children
        if (data.children && data.children.length > 0) {
          await supabase.from('family_children').insert(
            data.children.map((c) => ({
              family_id: familyRow.id,
              name: c.name,
              date_of_birth: c.date_of_birth || null,
              classroom: c.classroom || null,
              allergies: c.allergies || [],
              medical_notes: c.medical_notes || null,
            }))
          );
        }

        const newFamily: FamilyAccount = {
          ...data,
          id: familyRow.id,
          created_at: familyRow.created_at,
          updated_at: familyRow.updated_at,
        };

        const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
        families.push(newFamily);
        saveToStorage(STORAGE_KEYS.families, families);
        return newFamily;
      }
    } catch (err) {
      console.error('Error creating family in Supabase:', err);
    }
  }

  // localStorage-only fallback
  const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  const newFamily: FamilyAccount = {
    ...data,
    status: data.status || 'active',
    id: localId,
    created_at: now,
    updated_at: now,
  };

  families.push(newFamily);
  saveToStorage(STORAGE_KEYS.families, families);
  return newFamily;
}

export async function updateFamily(id: string, updates: Partial<FamilyAccount>): Promise<FamilyAccount | null> {
  if (isSupabaseConfigured) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { parents: _p, children: _c, ...rowUpdates } = updates;
      const updated = await supabaseUpdate<FamilyRow>('families', id, {
        email: rowUpdates.email,
        password_hash: rowUpdates.password_hash,
        pin: rowUpdates.pin ?? null,
        status: rowUpdates.status,
        approved_by: rowUpdates.approved_by ?? null,
        approved_at: rowUpdates.approved_at ?? null,
        address: rowUpdates.address ?? null,
        family_bio: rowUpdates.family_bio ?? null,
      });

      if (updated) {
        // Refresh full family list from Supabase
        const families = await fetchFamiliesFromSupabase();
        if (families) {
          saveToStorage(STORAGE_KEYS.families, families);
          return families.find((f) => f.id === id) || null;
        }
      }
    } catch (err) {
      console.error('Error updating family in Supabase:', err);
    }
  }

  // localStorage fallback
  const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  const index = families.findIndex((f) => f.id === id);

  if (index === -1) return null;

  const updatedFamily: FamilyAccount = {
    ...families[index],
    ...updates,
    id: families[index].id,
    created_at: families[index].created_at,
    updated_at: new Date().toISOString(),
  };

  families[index] = updatedFamily;
  saveToStorage(STORAGE_KEYS.families, families);
  return updatedFamily;
}

// ============================================================================
// Child Management
// ============================================================================

export async function addChild(familyId: string, child: Omit<FamilyChild, 'id'>): Promise<FamilyChild | null> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('family_children')
        .insert({
          family_id: familyId,
          name: child.name,
          date_of_birth: child.date_of_birth || null,
          classroom: child.classroom || null,
          allergies: child.allergies || [],
          medical_notes: child.medical_notes || null,
        })
        .select()
        .single();

      if (!error && data) {
        const newChild: FamilyChild = {
          id: data.id,
          name: data.name,
          date_of_birth: data.date_of_birth || '',
          classroom: data.classroom || '',
          allergies: data.allergies || [],
          medical_notes: data.medical_notes || undefined,
          emergency_contacts: child.emergency_contacts || [],
        };

        // Update cache
        const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
        const idx = families.findIndex((f) => f.id === familyId);
        if (idx >= 0) {
          families[idx].children.push(newChild);
          families[idx].updated_at = new Date().toISOString();
          saveToStorage(STORAGE_KEYS.families, families);
          const current = getCurrentFamily();
          if (current && current.id === familyId) setCurrentFamily(families[idx]);
        }
        return newChild;
      }
    } catch (err) {
      console.error('Error adding child in Supabase:', err);
    }
  }

  // localStorage fallback
  const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  const index = families.findIndex((f) => f.id === familyId);

  if (index === -1) return null;

  const newChild: FamilyChild = {
    ...child,
    id: generateChildId(),
  };

  families[index].children.push(newChild);
  families[index].updated_at = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.families, families);

  const current = getCurrentFamily();
  if (current && current.id === familyId) {
    setCurrentFamily(families[index]);
  }

  return newChild;
}

export async function updateChild(
  familyId: string,
  childId: string,
  updates: Partial<FamilyChild>
): Promise<FamilyChild | null> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('family_children')
        .update({
          name: updates.name,
          date_of_birth: updates.date_of_birth ?? undefined,
          classroom: updates.classroom ?? undefined,
          allergies: updates.allergies ?? undefined,
          medical_notes: updates.medical_notes ?? undefined,
        })
        .eq('id', childId)
        .select()
        .single();

      if (!error && data) {
        const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
        const familyIdx = families.findIndex((f) => f.id === familyId);
        if (familyIdx >= 0) {
          const childIdx = families[familyIdx].children.findIndex((c) => c.id === childId);
          if (childIdx >= 0) {
            families[familyIdx].children[childIdx] = {
              ...families[familyIdx].children[childIdx],
              ...updates,
              id: childId,
            };
            families[familyIdx].updated_at = new Date().toISOString();
            saveToStorage(STORAGE_KEYS.families, families);
            const current = getCurrentFamily();
            if (current && current.id === familyId) setCurrentFamily(families[familyIdx]);
          }
          return families[familyIdx].children.find((c) => c.id === childId) || null;
        }
      }
    } catch (err) {
      console.error('Error updating child in Supabase:', err);
    }
  }

  // localStorage fallback
  const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  const familyIndex = families.findIndex((f) => f.id === familyId);

  if (familyIndex === -1) return null;

  const childIndex = families[familyIndex].children.findIndex((c) => c.id === childId);
  if (childIndex === -1) return null;

  const updatedChild: FamilyChild = {
    ...families[familyIndex].children[childIndex],
    ...updates,
    id: childId,
  };

  families[familyIndex].children[childIndex] = updatedChild;
  families[familyIndex].updated_at = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.families, families);

  const current = getCurrentFamily();
  if (current && current.id === familyId) {
    setCurrentFamily(families[familyIndex]);
  }

  return updatedChild;
}

export async function removeChild(familyId: string, childId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const result = await supabaseDelete('family_children', childId);
      if (result) {
        const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
        const idx = families.findIndex((f) => f.id === familyId);
        if (idx >= 0) {
          families[idx].children = families[idx].children.filter((c) => c.id !== childId);
          families[idx].updated_at = new Date().toISOString();
          saveToStorage(STORAGE_KEYS.families, families);
          const current = getCurrentFamily();
          if (current && current.id === familyId) setCurrentFamily(families[idx]);
        }
        return true;
      }
    } catch (err) {
      console.error('Error removing child in Supabase:', err);
    }
  }

  // localStorage fallback
  const families = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  const familyIndex = families.findIndex((f) => f.id === familyId);

  if (familyIndex === -1) return false;

  const childIndex = families[familyIndex].children.findIndex((c) => c.id === childId);
  if (childIndex === -1) return false;

  families[familyIndex].children.splice(childIndex, 1);
  families[familyIndex].updated_at = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.families, families);

  const current = getCurrentFamily();
  if (current && current.id === familyId) {
    setCurrentFamily(families[familyIndex]);
  }

  return true;
}

// ============================================================================
// Profile Management
// ============================================================================

export async function updateFamilyProfile(
  familyId: string,
  profile: {
    family_bio?: string;
    family_photo_url?: string;
    address?: string;
    parents?: FamilyParent[];
  }
): Promise<FamilyAccount | null> {
  const updated = await updateFamily(familyId, profile);

  // Update current family session if it matches
  if (updated) {
    const current = getCurrentFamily();
    if (current && current.id === familyId) {
      setCurrentFamily(updated);
    }
  }

  return updated;
}

// ============================================================================
// Photo Compression
// ============================================================================

export function compressPhoto(file: File, maxSize: number = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down to maxSize
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Session Management
// ============================================================================

export function setCurrentFamily(family: FamilyAccount): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.currentFamily, JSON.stringify(family));
}

export function getCurrentFamily(): FamilyAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.currentFamily);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearCurrentFamily(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.currentFamily);
}

// ============================================================================
// Authentication
// ============================================================================

export async function registerFamily(
  email: string,
  password: string,
  parentName: string,
  phone: string
): Promise<FamilyAccount> {
  // Check if email already exists
  const existing = await getFamilyByEmail(email);
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const primaryParent: FamilyParent = {
    id: generateParentId(),
    name: parentName,
    phone,
    email,
    relationship: 'guardian',
    is_primary: true,
  };

  const family = await createFamily({
    email,
    password_hash: await hashPasswordAsync(password),
    status: 'pending',
    parents: [primaryParent],
    children: [],
  });

  // Do not set as current family until approved
  return family;
}

export async function authenticateFamily(
  email: string,
  password: string
): Promise<{ family: FamilyAccount | null; pending: boolean }> {
  const family = await getFamilyByEmail(email);
  if (family && await verifyPassword(password, family.password_hash)) {
    if (family.status === 'pending') {
      return { family: null, pending: true };
    }
    if (family.status === 'inactive') {
      return { family: null, pending: false };
    }
    setCurrentFamily(family);
    return { family, pending: false };
  }
  return { family: null, pending: false };
}

export function logoutFamily(): void {
  clearCurrentFamily();
}

// ============================================================================
// Seed Data
// ============================================================================

const SEED_FAMILIES: Omit<FamilyAccount, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    email: 'parent@demo.com',
    password_hash: '82e3edf5f5f3a46b5f94579b61817fd9a1f356adcef5ee22da3b96ef775c4860',
    status: 'active',
    pin: '1234',
    parents: [
      {
        id: 'par_demo_1',
        name: 'Sarah Brown',
        phone: '(555) 111-2222',
        email: 'parent@demo.com',
        relationship: 'mother',
        is_primary: true,
      },
      {
        id: 'par_demo_2',
        name: 'Michael Brown',
        phone: '(555) 111-3333',
        email: 'michael.brown@email.com',
        relationship: 'father',
        is_primary: false,
      },
    ],
    children: [
      {
        id: 'child_demo_1',
        name: 'Noah Brown',
        date_of_birth: '2022-03-15',
        classroom: 'Bright Butterflies',
        allergies: ['Peanuts'],
        medical_notes: 'Carries EpiPen',
        emergency_contacts: [
          { name: 'Grandma Carol', phone: '(555) 999-1111', relationship: 'Grandmother' },
        ],
      },
      {
        id: 'child_demo_2',
        name: 'Ava Brown',
        date_of_birth: '2021-07-22',
        classroom: 'Rising Stars',
        allergies: [],
        emergency_contacts: [
          { name: 'Grandma Carol', phone: '(555) 999-1111', relationship: 'Grandmother' },
        ],
      },
    ],
    family_bio: 'We love spending weekends at the park and reading together before bedtime.',
    address: '1234 Oak Street, Crystal, MN 55428',
  },
  {
    email: 'garcia@demo.com',
    password_hash: '589abe9e2a0564741d6761595f0b6a19870e00b1aebc9a421a724aa8dd3bf890',
    pin: '5678',
    status: 'active',
    parents: [
      {
        id: 'par_demo_3',
        name: 'Maria Garcia',
        phone: '(555) 444-5555',
        email: 'garcia@demo.com',
        relationship: 'mother',
        is_primary: true,
      },
    ],
    children: [
      {
        id: 'child_demo_3',
        name: 'Sofia Garcia',
        date_of_birth: '2023-01-10',
        classroom: 'Little Explorers',
        allergies: ['Dairy'],
        medical_notes: 'Lactose intolerant - please use dairy alternatives',
        emergency_contacts: [
          { name: 'Uncle Diego', phone: '(555) 666-7777', relationship: 'Uncle' },
        ],
      },
    ],
    family_bio: 'Bilingual family - Sofia speaks both English and Spanish!',
    address: '567 Maple Ave, Crystal, MN 55428',
  },
];

export async function seedFamilyData(): Promise<{ families: number }> {
  let familyCount = 0;

  // Always ensure localStorage has seed data for fallback auth
  const localFamilies = getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
  if (localFamilies.length === 0) {
    const now = new Date().toISOString();
    const seeded: FamilyAccount[] = SEED_FAMILIES.map((data) => ({
      ...data,
      id: generateFamilyId(),
      created_at: now,
      updated_at: now,
    }));
    saveToStorage(STORAGE_KEYS.families, seeded);
    familyCount = seeded.length;
  }

  // Also try to seed to Supabase if configured
  try {
    const existingFamilies = await getFamilies();
    if (existingFamilies.length === 0) {
      for (const familyData of SEED_FAMILIES) {
        await createFamily(familyData);
      }
    }
  } catch (error) {
    console.error('Supabase family seed failed, localStorage fallback active:', error);
  }

  return { families: familyCount };
}
