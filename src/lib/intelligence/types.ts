/**
 * Intelligence Layer Types
 * Used by training-scan, staffing-scan, and the intelligence dashboard.
 */

export interface TrainingDigestItem {
  type: 'stuck' | 'low_pass_rate' | 'pending_review' | 'timeline_drift' | 'milestone';
  severity: 'info' | 'warning' | 'action_needed';
  title: string;
  detail: string;
  moduleId?: string;
  userId?: string;
  actionLink?: string;
}

export interface StaffingAlert {
  type: 'cert_cluster' | 'cert_expiring' | 'pipeline_stale' | 'cacfp_gap' | 'training_behind';
  severity: 'info' | 'warning' | 'action_needed';
  title: string;
  detail: string;
  dataPoints: string[];
  actionLink?: string;
}

export interface DigestResult {
  generatedAt: string;
  training: TrainingDigestItem[];
  staffing: StaffingAlert[];
}

export interface AIRecommendation {
  id: string;
  category: 'training' | 'staffing' | 'operations' | 'compliance' | 'revenue';
  priority: 'high' | 'medium' | 'low';
  title: string;
  recommendation: string;
  basedOn: string[];
  generatedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface RecommendationDecision {
  id: string;
  recommendationId: string;
  recommendationTitle: string;
  decision: 'approved' | 'denied';
  reason: string | null;
  decidedBy: string;
  decidedAt: string;
}

// Phase 3: Behavioral pattern detection
export interface BehavioralPattern {
  childName: string;
  incidentCount: number;
  recentIncidents: Array<{
    date: string;
    type: string;
    severity: string;
    description: string;
  }>;
  pattern: 'repeat_behavior' | 'severity_escalation' | 'frequent_incidents';
  recommendation: string;
}

// Phase 3: Cross-day pattern detection
export interface CrossDayAnomaly {
  metric: string;
  todayValue: number;
  averageValue: number;
  deviation: number;
  direction: 'above' | 'below';
  severity: 'info' | 'warning' | 'action_needed';
  description: string;
}

// Phase 4: Action plans from intelligence cards
export interface ActionPlan {
  id: string;
  recommendationId: string;
  // Core action fields
  action: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  createdAt: string;
  completedAt?: string;
  recheckDate?: string;
  recheckResult?: 'resolved' | 'persists' | 'pending';
  // Root Cause Analysis (borrowed from MnMTSS Hub CNA pattern)
  problemStatement?: string;
  whys?: string[]; // 5 Whys
  identifiedRootCause?: string;
  successMeasure?: string;
  notes?: string;
}

// Phase 4: Re-check scheduling
export interface RecheckItem {
  id: string;
  actionPlanId: string;
  scanType: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'escalated';
  originalFinding: string;
  recheckResult?: string;
}
