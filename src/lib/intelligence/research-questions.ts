// Research Questions Catalog
// Each question is a hypothesis the auto-researcher tests nightly against platform data.
// Framework tags map findings back to J's IP so the inbox teaches the framework, not just the feature.

export type FrameworkTag =
  | 'four_friction_types'
  | 'feedback_conductance'
  | 'recovery_based_accountability'
  | 'high_warmth_high_structure'
  | 'equity_typologies'
  | 'operational'
  | 'compliance'
  | 'financial';

export type ResearchCategory =
  | 'cacfp'
  | 'staffing'
  | 'behavioral'
  | 'enrollment'
  | 'training'
  | 'compliance'
  | 'financial'
  | 'feedback_loops'
  | 'operational';

export type DataSource =
  | 'food_counts'
  | 'attendance'
  | 'employees'
  | 'time_entries'
  | 'incident_reports'
  | 'training_records'
  | 'enrollment_inquiries'
  | 'tour_requests'
  | 'staff_schedules'
  | 'action_plans'
  | 'rechecks'
  | 'recommendations';

export interface ResearchQuestion {
  id: string;
  category: ResearchCategory;
  frameworkTag: FrameworkTag;
  question: string;
  hypothesis: string;
  dataSources: DataSource[];
  lookbackDays: number;
  severity: 'info' | 'opportunity' | 'risk';
}

export const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  // CACFP + Financial
  {
    id: 'cacfp-reimbursement-rate',
    category: 'cacfp',
    frameworkTag: 'financial',
    question: 'Is CACFP reimbursement a healthy percentage of monthly revenue?',
    hypothesis:
      'Industry average for childcare CACFP reimbursement is 8-12% of revenue. Below 8% suggests meals are under-claimed or documentation is incomplete.',
    dataSources: ['food_counts'],
    lookbackDays: 30,
    severity: 'opportunity',
  },
  {
    id: 'cacfp-missed-meals',
    category: 'cacfp',
    frameworkTag: 'compliance',
    question: 'Which meals are most often missed or submitted late?',
    hypothesis:
      'Meals submitted after end-of-day cannot be reimbursed. Patterns of missed meals by day or type point to workflow gaps.',
    dataSources: ['food_counts'],
    lookbackDays: 14,
    severity: 'risk',
  },

  // Staffing + Ratios
  {
    id: 'staffing-understaffed-days',
    category: 'staffing',
    frameworkTag: 'operational',
    question: 'Which day of the week is most often understaffed?',
    hypothesis:
      'Thin coverage on a predictable day means the schedule is broken, not people. Look for repeat absences on specific weekdays.',
    dataSources: ['staff_schedules', 'time_entries', 'attendance'],
    lookbackDays: 30,
    severity: 'risk',
  },
  {
    id: 'staffing-clock-discrepancies',
    category: 'staffing',
    frameworkTag: 'operational',
    question: 'Which employees most often have missing or late clock-outs?',
    hypothesis:
      'Repeated clock-out failures break payroll and suggest a workflow or training gap.',
    dataSources: ['time_entries'],
    lookbackDays: 14,
    severity: 'info',
  },

  // Behavioral + Incidents
  {
    id: 'behavioral-severity-escalation',
    category: 'behavioral',
    frameworkTag: 'recovery_based_accountability',
    question: 'Which children show severity escalation across incidents?',
    hypothesis:
      'A child whose incidents trend from minor to moderate to serious needs proactive support, not incident logging. Recovery-Based Accountability: name the harm, build the recovery.',
    dataSources: ['incident_reports'],
    lookbackDays: 30,
    severity: 'risk',
  },
  {
    id: 'behavioral-environmental-cluster',
    category: 'behavioral',
    frameworkTag: 'four_friction_types',
    question: 'Are incidents clustering around specific times, rooms, or activities?',
    hypothesis:
      'Clustered incidents point to environmental friction (transition times, room setup, activity overwhelm), not individual child behavior.',
    dataSources: ['incident_reports'],
    lookbackDays: 30,
    severity: 'opportunity',
  },

  // Enrollment + Pipeline
  {
    id: 'enrollment-tour-dropoff',
    category: 'enrollment',
    frameworkTag: 'operational',
    question: 'Where do prospective families fall out of the enrollment pipeline?',
    hypothesis:
      'A funnel drop between tour-scheduled and tour-completed suggests a tour experience or follow-up gap. A drop between tour-completed and enrolled suggests a conversion gap (pricing, wait-list, communication).',
    dataSources: ['enrollment_inquiries', 'tour_requests'],
    lookbackDays: 60,
    severity: 'opportunity',
  },
  {
    id: 'enrollment-stale-pipeline',
    category: 'enrollment',
    frameworkTag: 'operational',
    question: 'Which pipeline entries have gone 14+ days without contact?',
    hypothesis:
      'Stale leads are lost revenue. Identify by last-contact date and flag for outreach.',
    dataSources: ['enrollment_inquiries'],
    lookbackDays: 30,
    severity: 'risk',
  },

  // Training + Compliance
  {
    id: 'training-expiring-certifications',
    category: 'training',
    frameworkTag: 'compliance',
    question: 'Which staff certifications expire in the next 60 days without a renewal plan?',
    hypothesis:
      'Expired certifications are immediate licensing risk. Every cert should have a renewal plan 60 days before expiration.',
    dataSources: ['training_records', 'employees'],
    lookbackDays: 60,
    severity: 'risk',
  },
  {
    id: 'training-completion-drift',
    category: 'training',
    frameworkTag: 'feedback_conductance',
    question: 'Which training modules have the lowest completion rate across staff?',
    hypothesis:
      'Low completion signals either content that is too dense, low buy-in, or an access gap. Feedback Conductance: the signal (training assignment) is not being transmitted into action.',
    dataSources: ['training_records', 'employees'],
    lookbackDays: 90,
    severity: 'info',
  },

  // Feedback Conductance (responses to intelligence)
  {
    id: 'feedback-unresponded-cards',
    category: 'feedback_loops',
    frameworkTag: 'feedback_conductance',
    question: 'Which intelligence recommendations have gone unresponded for 7+ days?',
    hypothesis:
      'Feedback Conductance RA (Recovery Architecture) weak when cards are flagged but no action plan is created. Low conductance = problems named but not addressed.',
    dataSources: ['recommendations', 'action_plans'],
    lookbackDays: 14,
    severity: 'opportunity',
  },
  {
    id: 'feedback-recheck-backlog',
    category: 'feedback_loops',
    frameworkTag: 'feedback_conductance',
    question: 'Which re-checks are overdue or showing issues persist after action?',
    hypothesis:
      'Feedback Conductance IP (Inspection Practice) weak when re-checks stall. Persisting issues need escalation, not another card.',
    dataSources: ['rechecks', 'action_plans'],
    lookbackDays: 14,
    severity: 'risk',
  },

  // Equity + Access
  {
    id: 'equity-attendance-gaps',
    category: 'operational',
    frameworkTag: 'equity_typologies',
    question: 'Do attendance patterns suggest access barriers for any family group?',
    hypothesis:
      'Consistent late drop-offs, early pick-ups, or absences clustered by family can point to transportation, work schedule, or engagement barriers that Clear and Care practices could address.',
    dataSources: ['attendance'],
    lookbackDays: 30,
    severity: 'opportunity',
  },

  // Financial / margin
  {
    id: 'financial-revenue-forecast-variance',
    category: 'financial',
    frameworkTag: 'financial',
    question: 'Is actual revenue tracking against the forecast, or drifting?',
    hypothesis:
      'Variance >10% between forecast and actual means either the forecast was wrong or something changed. Both deserve investigation.',
    dataSources: ['food_counts', 'attendance'],
    lookbackDays: 30,
    severity: 'info',
  },
];

export function getQuestionById(id: string): ResearchQuestion | undefined {
  return RESEARCH_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsByCategory(category: ResearchCategory): ResearchQuestion[] {
  return RESEARCH_QUESTIONS.filter((q) => q.category === category);
}
