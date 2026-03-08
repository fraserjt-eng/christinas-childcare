// HR types

export interface HRTemplate {
  id: string;
  name: string;
  type: 'offer_letter' | 'onboarding_checklist' | 'performance_review' | 'corrective_action' | 'termination' | 'policy_ack' | 'custom';
  fields: TemplateField[];
  is_system: boolean;
  created_at: string;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'signature' | 'checkbox' | 'select';
  required: boolean;
  options?: string[]; // for select type
  default_value?: string;
}

export interface HRDocument {
  id: string;
  employee_id: string;
  employee_name: string;
  template_id?: string;
  template_name?: string;
  type: HRTemplate['type'];
  title: string;
  field_values: Record<string, string>;
  status: 'draft' | 'pending_signature' | 'signed' | 'filed';
  signed_at?: string;
  signed_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DisciplineRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  level: 'verbal' | 'written' | 'final' | 'termination';
  reason: string;
  details: string;
  improvement_plan?: string;
  follow_up_date?: string;
  issued_by: string;
  witness?: string;
  employee_acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
}

export const DISCIPLINE_LEVELS: { value: DisciplineRecord['level']; label: string; color: string }[] = [
  { value: 'verbal', label: 'Verbal Warning', color: '#FF9800' },
  { value: 'written', label: 'Written Warning', color: '#F44336' },
  { value: 'final', label: 'Final Warning', color: '#B71C1C' },
  { value: 'termination', label: 'Termination', color: '#000000' },
];

export const HR_TEMPLATE_TYPES: { value: HRTemplate['type']; label: string }[] = [
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'onboarding_checklist', label: 'Onboarding Checklist' },
  { value: 'performance_review', label: 'Performance Review' },
  { value: 'corrective_action', label: 'Corrective Action' },
  { value: 'termination', label: 'Termination' },
  { value: 'policy_ack', label: 'Policy Acknowledgment' },
  { value: 'custom', label: 'Custom' },
];

// Pre-built system templates
export const SYSTEM_TEMPLATES: Omit<HRTemplate, 'id' | 'created_at'>[] = [
  {
    name: 'Offer Letter',
    type: 'offer_letter',
    is_system: true,
    fields: [
      { id: 'f1', label: 'Position Title', type: 'text', required: true },
      { id: 'f2', label: 'Start Date', type: 'date', required: true },
      { id: 'f3', label: 'Hourly Rate', type: 'text', required: true },
      { id: 'f4', label: 'Schedule', type: 'text', required: true },
      { id: 'f5', label: 'Center Location', type: 'select', required: true, options: ['Crystal Center', 'Brooklyn Park Center'] },
      { id: 'f6', label: 'Additional Notes', type: 'textarea', required: false },
      { id: 'f7', label: 'Employee Signature', type: 'signature', required: true },
      { id: 'f8', label: 'Date Signed', type: 'date', required: true },
    ],
  },
  {
    name: 'Onboarding Checklist',
    type: 'onboarding_checklist',
    is_system: true,
    fields: [
      { id: 'f1', label: 'Background check completed', type: 'checkbox', required: true },
      { id: 'f2', label: 'First aid/CPR certification verified', type: 'checkbox', required: true },
      { id: 'f3', label: 'Mandatory reporter training completed', type: 'checkbox', required: true },
      { id: 'f4', label: 'Center policies reviewed', type: 'checkbox', required: true },
      { id: 'f5', label: 'Emergency procedures reviewed', type: 'checkbox', required: true },
      { id: 'f6', label: 'Classroom assignment confirmed', type: 'checkbox', required: true },
      { id: 'f7', label: 'Mentor/buddy assigned', type: 'checkbox', required: true },
      { id: 'f8', label: 'CACFP meal count training completed', type: 'checkbox', required: true },
      { id: 'f9', label: 'Photo/video upload procedure reviewed', type: 'checkbox', required: true },
      { id: 'f10', label: 'Scheduling system (Homebase) training', type: 'checkbox', required: true },
      { id: 'f11', label: 'Completed By', type: 'signature', required: true },
      { id: 'f12', label: 'Date Completed', type: 'date', required: true },
    ],
  },
  {
    name: 'Performance Review',
    type: 'performance_review',
    is_system: true,
    fields: [
      { id: 'f1', label: 'Review Period', type: 'text', required: true },
      { id: 'f2', label: 'Classroom Management', type: 'select', required: true, options: ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'] },
      { id: 'f3', label: 'Communication with Families', type: 'select', required: true, options: ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'] },
      { id: 'f4', label: 'Teamwork & Reliability', type: 'select', required: true, options: ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'] },
      { id: 'f5', label: 'Compliance & Documentation', type: 'select', required: true, options: ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'] },
      { id: 'f6', label: 'Strengths', type: 'textarea', required: true },
      { id: 'f7', label: 'Areas for Growth', type: 'textarea', required: true },
      { id: 'f8', label: 'Goals for Next Period', type: 'textarea', required: true },
      { id: 'f9', label: 'Employee Comments', type: 'textarea', required: false },
      { id: 'f10', label: 'Reviewer Signature', type: 'signature', required: true },
      { id: 'f11', label: 'Employee Signature', type: 'signature', required: true },
      { id: 'f12', label: 'Date', type: 'date', required: true },
    ],
  },
  {
    name: 'Corrective Action',
    type: 'corrective_action',
    is_system: true,
    fields: [
      { id: 'f1', label: 'Level', type: 'select', required: true, options: ['Verbal Warning', 'Written Warning', 'Final Warning'] },
      { id: 'f2', label: 'Date of Incident', type: 'date', required: true },
      { id: 'f3', label: 'Description of Issue', type: 'textarea', required: true },
      { id: 'f4', label: 'Previous Discussions/Warnings', type: 'textarea', required: false },
      { id: 'f5', label: 'Expected Improvement', type: 'textarea', required: true },
      { id: 'f6', label: 'Support Provided', type: 'textarea', required: false },
      { id: 'f7', label: 'Follow-up Date', type: 'date', required: true },
      { id: 'f8', label: 'Consequences if Not Corrected', type: 'textarea', required: true },
      { id: 'f9', label: 'Supervisor Signature', type: 'signature', required: true },
      { id: 'f10', label: 'Employee Signature', type: 'signature', required: true },
      { id: 'f11', label: 'Witness', type: 'text', required: false },
      { id: 'f12', label: 'Date', type: 'date', required: true },
    ],
  },
];

let hrCounter = 0;
export function generateHRDocId(): string {
  return `hr_${Date.now()}_${++hrCounter}`;
}

export function generateTemplateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateDisciplineId(): string {
  return `disc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
