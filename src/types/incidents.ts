// Incident and Training types

export interface Incident {
  id: string;
  center_id?: string;
  incident_number: string;
  date: string;
  time?: string;
  location: string;
  type: 'injury' | 'illness' | 'behavioral' | 'medication_error' | 'safety_hazard' | 'property_damage' | 'licensing_violation' | 'other';
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  children_involved: { name: string; age?: string; classroom?: string }[];
  staff_involved: { name: string; role_in_incident: string }[];
  witnesses: string[];
  immediate_action: string;
  parent_notified: boolean;
  parent_notified_at?: string;
  parent_notified_by?: string;
  licensing_reportable: boolean;
  licensing_reported_at?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  follow_up_completed_at?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_by: string;
  reported_by_name: string;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingModule {
  id: string;
  module_key: string;
  title: string;
  description: string;
  sections: TrainingSection[];
  quiz: QuizQuestion[];
  estimated_minutes: number;
  sort_order: number;
}

export interface TrainingSection {
  heading: string;
  body: string;
  tips?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface TrainingCompletion {
  id: string;
  employee_id: string;
  employee_name: string;
  module_key: string;
  score: number;
  completed_at: string;
}

export const INCIDENT_TYPES: { value: Incident['type']; label: string }[] = [
  { value: 'injury', label: 'Injury' },
  { value: 'illness', label: 'Illness' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'medication_error', label: 'Medication Error' },
  { value: 'safety_hazard', label: 'Safety Hazard' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'licensing_violation', label: 'Licensing Violation' },
  { value: 'other', label: 'Other' },
];

export const SEVERITY_LEVELS: { value: Incident['severity']; label: string; color: string }[] = [
  { value: 'minor', label: 'Minor', color: '#4CAF50' },
  { value: 'moderate', label: 'Moderate', color: '#FF9800' },
  { value: 'serious', label: 'Serious', color: '#F44336' },
  { value: 'critical', label: 'Critical', color: '#B71C1C' },
];

let incidentCounter = 0;
export function generateIncidentId(): string {
  return `inc_${Date.now()}_${++incidentCounter}`;
}

export function generateIncidentNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `INC-${year}-${seq}`;
}
