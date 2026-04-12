// Training & Development System Types

export type TrainingRole = 'parent' | 'teacher' | 'admin' | 'owner';
export type CompetencyLevel = 'guided' | 'independent' | 'mentor';
export type SectionType = 'learn' | 'practice' | 'check';
export type UnitStatus = 'locked' | 'active' | 'completed';
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type SectionStatus = 'locked' | 'available' | 'completed';

// Static content types (from TypeScript data files)

export interface TrainingUnit {
  id: string;
  number: number;
  title: string;
  description: string;
  moduleIds: string[];
  roles: TrainingRole[];
}

export interface TrainingModule {
  id: string;
  number: number;
  unitId: string;
  title: string;
  format: string;
  durationMinutes: number;
  roles: TrainingRole[];
  contextBridge: string;
  completionBridge: string;
  portalPages: string[];
  learningOutcomes: string[];
  costImpact: string;
  hasKnowledgeCheck: boolean;
}

export interface KnowledgeQuestion {
  id: string;
  moduleId: string;
  questionText: string;
  choices: { label: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Competency {
  id: string;
  number: number;
  title: string;
  roles: TrainingRole[];
  unitIds: string[];
  levels: {
    guided: string;
    independent: string;
    mentor: string;
  };
}

export interface PracticeTask {
  id: string;
  moduleId: string;
  text: string;
}

// Activity-based learning types

export type ActivityType = 'walkthrough' | 'scenario' | 'spotlight' | 'explore' | 'reflection';

export interface WalkthroughStep {
  instruction: string;
  screenshotCaption?: string;
  tryItLink?: string;
}

export interface ScenarioOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ExplorePage {
  path: string;
  name: string;
  description: string;
}

export interface TrainingActivity {
  id: string;
  type: ActivityType;
  title: string;
  steps?: WalkthroughStep[];
  scenario?: { situation: string; options: ScenarioOption[] };
  spotlight?: { concept: string; detail: string; whyItMatters: string };
  pages?: ExplorePage[];
  prompt?: string;
}

export interface ModuleContent {
  moduleId: string;
  activities?: TrainingActivity[];
  learnSections: LearnSection[];
  discussionQuestions: string[];
  commonMistakes: { mistake: string; prevention: string }[];
}

export interface LearnSection {
  title: string;
  content: string;
}

// Supabase record types (stored in database)

export interface TrainingProgress {
  id: string;
  user_id: string;
  module_id: string;
  section: SectionType;
  completed: boolean;
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface TrainingKnowledgeCheck {
  id: string;
  user_id: string;
  module_id: string;
  question_id: string;
  selected_answer: string;
  correct: boolean;
  attempted_at: string;
}

export interface TrainingGateAssessment {
  id: string;
  user_id: string;
  unit_id: string;
  competency_id: string;
  self_rating: CompetencyLevel | null;
  admin_rating: CompetencyLevel | null;
  self_assessed_at: string | null;
  admin_assessed_at: string | null;
}

export interface TrainingGateOverride {
  id: string;
  user_id: string;
  unit_id: string;
  overridden_by: string;
  reason: string | null;
  created_at: string;
}

export interface TrainingUnitUnlock {
  id: string;
  unit_id: string;
  unlocked: boolean;
  unlocked_at: string | null;
  unlocked_by: string | null;
}

// Derived/computed state types

export interface UnitProgressInfo {
  unit: TrainingUnit;
  status: UnitStatus;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
}

export interface ModuleProgressInfo {
  module: TrainingModule;
  status: ModuleStatus;
  sections: {
    learn: SectionStatus;
    practice: SectionStatus;
    check: SectionStatus;
  };
}
