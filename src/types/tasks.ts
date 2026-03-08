// Task Board + Accountability Engine types

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
}

export interface TimeBlock {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  block_type: 'arrival' | 'morning' | 'lunch' | 'nap' | 'afternoon' | 'closing' | 'flexible';
  sort_order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  done_standard: string; // Observable, specific, time-bound completion criteria
  category_id?: string;
  category_name?: string;
  time_block_id?: string;
  time_block_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  delegated_by?: string;
  center_id?: string;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'once' | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'backlog' | 'today' | 'in_progress' | 'blocked' | 'done';
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  is_nap_time_task: boolean;
  estimated_minutes?: number;
  notes?: string;
  drift_count: number; // How many times this task has missed its standard
  created_at: string;
  updated_at: string;
}

export interface DriftAlert {
  id: string;
  task_id: string;
  task_title: string;
  pattern_description: string;
  miss_count: number;
  first_miss_date: string;
  latest_miss_date: string;
  status: 'active' | 'recovery_started' | 'resolved';
  created_at: string;
}

export interface RecoveryCycle {
  id: string;
  drift_alert_id: string;
  task_id: string;
  what_happened: string;
  what_changes: string;
  support_needed: string;
  new_timeline: string;
  inspection_interval_days: number;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
}

export interface InspectionCheckpoint {
  id: string;
  recovery_cycle_id: string;
  due_date: string;
  status: 'pending' | 'completed' | 'missed';
  notes?: string;
  completed_at?: string;
}

// Accountability Assessment (adapted from Recovery/Drift 5-domain model)
export interface AccountabilityAssessment {
  id: string;
  date: string;
  responses: Record<string, number>; // question_id -> score (0-3)
  domain_scores: Record<string, number>; // domain -> avg score
  overall_score: number;
  profile_tier: string;
  created_at: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

// Default time blocks for childcare
export const DEFAULT_TIME_BLOCKS: Omit<TimeBlock, 'id'>[] = [
  { name: 'Morning Arrival', start_time: '06:00', end_time: '08:30', block_type: 'arrival', sort_order: 0 },
  { name: 'AM Activities', start_time: '08:30', end_time: '11:30', block_type: 'morning', sort_order: 1 },
  { name: 'Lunch', start_time: '11:30', end_time: '12:30', block_type: 'lunch', sort_order: 2 },
  { name: 'Nap Time', start_time: '12:30', end_time: '15:00', block_type: 'nap', sort_order: 3 },
  { name: 'PM Activities', start_time: '15:00', end_time: '17:00', block_type: 'afternoon', sort_order: 4 },
  { name: 'Closing', start_time: '17:00', end_time: '18:00', block_type: 'closing', sort_order: 5 },
];

export const DEFAULT_CATEGORIES: Omit<TaskCategory, 'id'>[] = [
  { name: 'Care Duties', color: '#4CAF50', icon: 'Heart', sort_order: 0 },
  { name: 'Admin/Paperwork', color: '#2196F3', icon: 'FileText', sort_order: 1 },
  { name: 'Communication', color: '#FF9800', icon: 'MessageSquare', sort_order: 2 },
  { name: 'Compliance/Licensing', color: '#F44336', icon: 'Shield', sort_order: 3 },
  { name: 'Curriculum/Teaching', color: '#9C27B0', icon: 'BookOpen', sort_order: 4 },
  { name: 'Food Program', color: '#FF5722', icon: 'UtensilsCrossed', sort_order: 5 },
  { name: 'Facilities/Supplies', color: '#607D8B', icon: 'Package', sort_order: 6 },
];

// Accountability Assessment Domains & Questions
export const ACCOUNTABILITY_DOMAINS = [
  'Standard Architecture',
  'Drift Recognition',
  'Recovery Architecture',
  'Inspection Practice',
  'Equity Application',
] as const;

export type AccountabilityDomain = typeof ACCOUNTABILITY_DOMAINS[number];

export interface AssessmentQuestion {
  id: string;
  domain: AccountabilityDomain;
  question: string;
  coaching_prompt: string;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Standard Architecture (5 questions)
  { id: 'sa1', domain: 'Standard Architecture', question: 'My recurring tasks have written completion criteria that describe what "done" looks like.', coaching_prompt: 'Try rewriting your top 3 recurring tasks with observable completion criteria. Not "clean classroom" but "floors swept, toys sanitized, chairs stacked by 5:30 PM."' },
  { id: 'sa2', domain: 'Standard Architecture', question: 'When I delegate a task, I describe the standard, not just the activity.', coaching_prompt: 'Before your next delegation, write down what the finished result looks like. Share that picture, not just the task name.' },
  { id: 'sa3', domain: 'Standard Architecture', question: 'My staff could describe the standard for their daily responsibilities without me present.', coaching_prompt: 'Ask two staff members to describe their top 3 daily responsibilities and what "done" means. If they describe activities instead of outcomes, your standards need work.' },
  { id: 'sa4', domain: 'Standard Architecture', question: 'I have documented standards for tasks that matter most (meal counts, ratios, parent communication).', coaching_prompt: 'Start with your highest-stakes tasks. Write one sentence per task that describes the observable standard.' },
  { id: 'sa5', domain: 'Standard Architecture', question: 'New staff can learn our standards from documentation, not just from watching others.', coaching_prompt: 'If your standards live only in experienced staff members\' heads, they disappear when those people leave.' },

  // Drift Recognition (5 questions)
  { id: 'dr1', domain: 'Drift Recognition', question: 'When a task is not completed to standard, I name it within 48 hours.', coaching_prompt: 'Silence signals acceptance. The longer you wait to name drift, the harder it becomes and the more it compounds.' },
  { id: 'dr2', domain: 'Drift Recognition', question: 'I name the pattern, not just the incident, when I see repeated misses.', coaching_prompt: 'Naming individual misses without naming the pattern keeps you in a cycle of correction without progress.' },
  { id: 'dr3', domain: 'Drift Recognition', question: 'I describe what I observed, not what I assume about motivation or effort.', coaching_prompt: 'Lead with data: "I noticed meal counts were not entered on Tuesday and Thursday" rather than "You don\'t seem to care about meal counts."' },
  { id: 'dr4', domain: 'Drift Recognition', question: 'I track task completion data so I can see patterns, not just react to individual failures.', coaching_prompt: 'Without data, drift recognition becomes subjective. Use the task board to see which tasks miss their standard repeatedly.' },
  { id: 'dr5', domain: 'Drift Recognition', question: 'My team knows that naming drift is part of how we work, not a sign of trouble.', coaching_prompt: 'If drift naming only happens during conflict, your team will associate accountability with punishment.' },

  // Recovery Architecture (5 questions)
  { id: 'ra1', domain: 'Recovery Architecture', question: 'When drift happens, I build a recovery plan with the person, not just tell them to do better.', coaching_prompt: 'Recovery is collaborative. Ask: "What happened? What needs to change? What support do you need?"' },
  { id: 'ra2', domain: 'Recovery Architecture', question: 'Recovery plans include specific actions and timelines, not vague commitments.', coaching_prompt: '"I\'ll try harder" is not a recovery plan. "I will enter meal counts by 2:00 PM daily, starting Monday" is.' },
  { id: 'ra3', domain: 'Recovery Architecture', question: 'I identify what structural support I need to provide, not just what the other person needs to change.', coaching_prompt: 'Sometimes drift happens because the system makes the right thing hard. Ask yourself what you can change to remove friction.' },
  { id: 'ra4', domain: 'Recovery Architecture', question: 'I separate recovery from discipline. The first response to drift is support, not consequences.', coaching_prompt: 'If your staff fear accountability conversations, recovery will never be honest.' },
  { id: 'ra5', domain: 'Recovery Architecture', question: 'Recovery plans are documented and accessible, not just verbal agreements.', coaching_prompt: 'What gets written down gets remembered. Verbal agreements fade and create confusion about what was actually committed to.' },

  // Inspection Practice (5 questions)
  { id: 'ip1', domain: 'Inspection Practice', question: 'After a recovery plan is set, I follow up at the agreed interval without exception.', coaching_prompt: 'The inspection is the most decisive moment. Skipping it communicates that the recovery plan was optional.' },
  { id: 'ip2', domain: 'Inspection Practice', question: 'My follow-up conversations ask about what was agreed to, not just how things are "going."', coaching_prompt: '"How\'s it going?" lets people narrate around the gap. "We agreed you would enter meal counts by 2 PM. Tell me what happened this week" is an inspection.' },
  { id: 'ip3', domain: 'Inspection Practice', question: 'When inspection reveals continued drift, I start a new recovery cycle rather than extending timelines.', coaching_prompt: 'Timeline extensions signal that deadlines are negotiable. A new cycle with adjusted structure shows you take the standard seriously.' },
  { id: 'ip4', domain: 'Inspection Practice', question: 'I inspect my own commitments (the support I promised) with the same rigor.', coaching_prompt: 'If you promised to provide a reminder system and did not deliver, name your own drift first.' },
  { id: 'ip5', domain: 'Inspection Practice', question: 'Inspection happens even when things are going well, to reinforce the standard.', coaching_prompt: 'Inspecting only when things go wrong makes inspection feel punitive. Celebrate when the standard is met.' },

  // Equity Application (5 questions)
  { id: 'ea1', domain: 'Equity Application', question: 'I track whether certain staff consistently carry more task load than others.', coaching_prompt: 'Reliable people get loaded with more work. That is not fairness; it is a tax on competence.' },
  { id: 'ea2', domain: 'Equity Application', question: 'My delegation decisions account for staff development, not just who will get it done fastest.', coaching_prompt: 'If you always delegate to the most capable person, you never develop the rest of your team.' },
  { id: 'ea3', domain: 'Equity Application', question: 'I apply the same accountability standard to all staff, regardless of tenure or relationship.', coaching_prompt: 'If a veteran teacher can skip meal counts without being named but a new hire cannot, your standard is not a standard.' },
  { id: 'ea4', domain: 'Equity Application', question: 'I consider who bears the cost when a task drifts (which children, which families).', coaching_prompt: 'Drift is never neutral. Missed meal counts cost the center money. Missed parent communications erode trust for specific families.' },
  { id: 'ea5', domain: 'Equity Application', question: 'I regularly review task distribution data to check for patterns of inequity.', coaching_prompt: 'Use the delegation dashboard to see who carries what. If the same 3 people handle 80% of the work, your system has an equity problem.' },
];

export const ASSESSMENT_SCALE = [
  { value: 0, label: 'Absent', description: 'No evidence of this practice' },
  { value: 1, label: 'Emerging', description: 'Occasional, inconsistent' },
  { value: 2, label: 'Operational', description: 'Consistent practice' },
  { value: 3, label: 'Embedded', description: 'Structural, survives bad days' },
];

export const PROFILE_TIERS = [
  { min: 80, label: 'Embedded Accountability Culture', description: 'Standards, drift recognition, recovery, inspection, and equity are woven into daily operations.' },
  { min: 60, label: 'Developing Accountability Culture', description: 'Strong in some domains but gaps remain. Focus on your lowest-scoring domain.' },
  { min: 40, label: 'Transitional Culture', description: 'Accountability exists but is inconsistent. Structural changes needed in multiple domains.' },
  { min: 0, label: 'Compliance Culture', description: 'Accountability is reactive, not structural. Start with Standard Architecture.' },
];

let taskIdCounter = 0;
export function generateTaskId(): string {
  return `task_${Date.now()}_${++taskIdCounter}`;
}
