export type UserRole = 'owner' | 'admin' | 'teacher' | 'parent';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  capacity: number;
  is_active: boolean;
}

export interface Classroom {
  id: string;
  center_id: string;
  name: string;
  age_group: 'infant' | 'toddler' | 'preschool' | 'school_age';
  min_age_months: number;
  max_age_months: number;
  capacity: number;
  staff_ratio: string;
  lead_teacher_id?: string;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  classroom_id?: string;
  photo_url?: string;
  allergies?: string;
  medical_notes?: string;
  emergency_contact: string;
  emergency_phone: string;
  enrolled_date: string;
  status: 'active' | 'waitlist' | 'inactive';
}

export interface ParentChild {
  id: string;
  parent_id: string;
  child_id: string;
  relationship: string;
}

export interface Inquiry {
  id: string;
  parent_name: string;
  email: string;
  phone: string;
  child_name: string;
  child_age: string;
  preferred_start: string;
  program_interest: string;
  message?: string;
  status: 'new' | 'contacted' | 'toured' | 'enrolled' | 'declined';
  created_at: string;
}

export interface Attendance {
  id: string;
  child_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  checked_in_by?: string;
  notes?: string;
}

export interface FoodCount {
  id: string;
  classroom_id: string;
  date: string;
  meal_type: 'breakfast' | 'am_snack' | 'lunch' | 'pm_snack';
  count: number;
  recorded_by: string;
}

export interface StaffSchedule {
  id: string;
  user_id: string;
  center_id: string;
  date: string;
  start_time: string;
  end_time: string;
  classroom_id?: string;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  age_group: 'infant' | 'toddler' | 'preschool' | 'school_age';
  duration_weeks: number;
  description: string;
  objectives: string[];
  materials: string[];
  activities: CurriculumActivity[];
}

export interface CurriculumActivity {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  domain: 'cognitive' | 'physical' | 'social_emotional' | 'language' | 'creative';
}

export interface LessonPlan {
  id: string;
  classroom_id: string;
  week_start: string;
  activities: { day: number; activity_id: string; time_slot: string }[];
  notes?: string;
}

export interface ProgressReport {
  id: string;
  child_id: string;
  teacher_id: string;
  date: string;
  period: string;
  milestones: { area: string; milestone: string; status: 'emerging' | 'developing' | 'achieved' }[];
  notes: string;
  shared_with_parents: boolean;
}

export interface StrategicPlan {
  id: string;
  center_id: string;
  mission: string;
  vision: string;
  values: string[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  priorities: { title: string; description: string; timeline: string; status: string }[];
  updated_at: string;
}

export interface Event {
  id: string;
  center_id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'holiday' | 'event' | 'meeting' | 'deadline';
}
