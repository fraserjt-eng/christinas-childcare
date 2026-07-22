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
  classroom_id?: string;
  allergies: string[];
  medical_notes?: string;
  emergency_contacts: EmergencyContact[];
  photo_url?: string;
  // Last day of care for THIS child (inclusive), blank/absent while enrolled.
  // A sibling leaving does not end the household; see FamilyAccount.end_date
  // for that. Migration 053.
  end_date?: string;
  end_reason?: string;
}

export interface FamilyAccount {
  id: string;
  email: string;
  password_hash: string;
  pin?: string;
  status: 'pending' | 'active' | 'inactive';
  approved_by?: string;
  approved_at?: string;
  parents: FamilyParent[];
  children: FamilyChild[];
  family_bio?: string;
  family_photo_url?: string;
  address?: string;
  // The center this household belongs to. Moving a family rewrites this and
  // every child's center; past attendance stays with the center that gave care.
  center_id?: string;
  // Last day of care for the whole household (inclusive), blank while enrolled.
  end_date?: string;
  end_reason?: string;
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
