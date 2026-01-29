import { AgeGroup, LearningDomain } from './curriculum';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  domain: LearningDomain;
  ageGroup: AgeGroup;
  order: number;
  examples?: string[];
  parentTip?: string;
}

export interface DomainOverview {
  domain: LearningDomain;
  description: string;
  icon: string;
  parentFriendlyName: string;
}

export const AGE_GROUP_DISPLAY: Record<AgeGroup, { label: string; ages: string; color: string }> = {
  'infant': { label: 'Infant', ages: '6 weeks - 16 months', color: 'christina-coral' },
  'toddler': { label: 'Toddler', ages: '16 months - 33 months', color: 'christina-yellow' },
  'preschool': { label: 'Preschool', ages: '33 months - 5 years', color: 'christina-green' },
  'school-age': { label: 'School Age', ages: '5 - 12 years', color: 'christina-blue' },
};
