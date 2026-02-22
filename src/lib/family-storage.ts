// Family Storage Module for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

import {
  FamilyAccount,
  FamilyChild,
  FamilyParent,
  generateFamilyId,
  generateParentId,
  generateChildId,
} from '@/types/family';

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
// Family CRUD
// ============================================================================

export async function getFamilies(): Promise<FamilyAccount[]> {
  return getFromStorage<FamilyAccount>(STORAGE_KEYS.families);
}

export async function getFamily(id: string): Promise<FamilyAccount | null> {
  const families = await getFamilies();
  return families.find((f) => f.id === id) || null;
}

export async function getFamilyByEmail(email: string): Promise<FamilyAccount | null> {
  const families = await getFamilies();
  return families.find((f) => f.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createFamily(data: Omit<FamilyAccount, 'id' | 'created_at' | 'updated_at'>): Promise<FamilyAccount> {
  const families = await getFamilies();
  const now = new Date().toISOString();

  const newFamily: FamilyAccount = {
    ...data,
    id: generateFamilyId(),
    created_at: now,
    updated_at: now,
  };

  families.push(newFamily);
  saveToStorage(STORAGE_KEYS.families, families);
  return newFamily;
}

export async function updateFamily(id: string, updates: Partial<FamilyAccount>): Promise<FamilyAccount | null> {
  const families = await getFamilies();
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
  const families = await getFamilies();
  const index = families.findIndex((f) => f.id === familyId);

  if (index === -1) return null;

  const newChild: FamilyChild = {
    ...child,
    id: generateChildId(),
  };

  families[index].children.push(newChild);
  families[index].updated_at = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.families, families);

  // Update current family session if it matches
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
  const families = await getFamilies();
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

  // Update current family session if it matches
  const current = getCurrentFamily();
  if (current && current.id === familyId) {
    setCurrentFamily(families[familyIndex]);
  }

  return updatedChild;
}

export async function removeChild(familyId: string, childId: string): Promise<boolean> {
  const families = await getFamilies();
  const familyIndex = families.findIndex((f) => f.id === familyId);

  if (familyIndex === -1) return false;

  const childIndex = families[familyIndex].children.findIndex((c) => c.id === childId);
  if (childIndex === -1) return false;

  families[familyIndex].children.splice(childIndex, 1);
  families[familyIndex].updated_at = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.families, families);

  // Update current family session if it matches
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
    password_hash: password, // In production, use proper hashing
    parents: [primaryParent],
    children: [],
  });

  setCurrentFamily(family);
  return family;
}

export async function authenticateFamily(
  email: string,
  password: string
): Promise<FamilyAccount | null> {
  const family = await getFamilyByEmail(email);
  if (family && family.password_hash === password) {
    setCurrentFamily(family);
    return family;
  }
  return null;
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
    password_hash: 'parent123',
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
    password_hash: 'garcia123',
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

  const existingFamilies = await getFamilies();

  if (existingFamilies.length === 0) {
    for (const familyData of SEED_FAMILIES) {
      await createFamily(familyData);
      familyCount++;
    }
  }

  return { families: familyCount };
}
