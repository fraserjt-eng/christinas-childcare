// Family Portal Types for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

// ============================================================================
// Family Types
// ============================================================================

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface FamilyParent {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  photo_url?: string;
  is_primary: boolean;
}

export interface FamilyChild {
  id: string;
  name: string;
  date_of_birth: string;
  classroom?: string;
  allergies: string[];
  medical_notes?: string;
  emergency_contacts: EmergencyContact[];
  photo_url?: string;
}

export interface FamilyAccount {
  id: string;
  email: string;
  password_hash: string;
  parents: FamilyParent[];
  children: FamilyChild[];
  family_bio?: string;
  family_photo_url?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export type FamilyAccountCreate = Omit<FamilyAccount, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// ID Generators
// ============================================================================

export function generateFamilyId(): string {
  return `fam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateParentId(): string {
  return `par_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateChildId(): string {
  return `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
