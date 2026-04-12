import { TrainingUnit } from '@/types/training';

export const trainingUnits: TrainingUnit[] = [
  {
    id: 'unit-1',
    number: 1,
    title: 'Getting Started',
    description: 'Foundation skills. Login, navigation, profiles, and kiosk check-in. Everyone starts here.',
    moduleIds: ['M01', 'M02', 'M03', 'M04'],
    roles: ['parent', 'teacher', 'admin', 'owner'],
  },
  {
    id: 'unit-2',
    number: 2,
    title: 'Daily Rhythms',
    description: 'The heartbeat of the center. Attendance, meals, photos, tasks, and daily reports.',
    moduleIds: ['M05', 'M06', 'M07', 'M08', 'M09'],
    roles: ['parent', 'teacher', 'admin', 'owner'],
  },
  {
    id: 'unit-3',
    number: 3,
    title: 'Communication & Family Engagement',
    description: 'Building trust and retention through consistent communication with families.',
    moduleIds: ['M10', 'M11', 'M12', 'M13'],
    roles: ['parent', 'teacher', 'admin', 'owner'],
  },
  {
    id: 'unit-4',
    number: 4,
    title: 'Compliance & Safety',
    description: 'The modules that keep the license on the wall and children safe.',
    moduleIds: ['M14', 'M15', 'M16', 'M17'],
    roles: ['teacher', 'admin', 'owner'],
  },
  {
    id: 'unit-5',
    number: 5,
    title: 'Scheduling & Staff Management',
    description: 'Where labor costs meet operational reality. Scheduling, HR, payroll, and onboarding.',
    moduleIds: ['M18', 'M19', 'M20', 'M21'],
    roles: ['admin', 'owner'],
  },
  {
    id: 'unit-6',
    number: 6,
    title: 'Growth & Enrollment',
    description: 'Filling seats and keeping them filled. Pipeline, tours, authorizations, and marketing.',
    moduleIds: ['M22', 'M23', 'M24', 'M25'],
    roles: ['admin', 'owner'],
  },
  {
    id: 'unit-7',
    number: 7,
    title: 'Financial Intelligence',
    description: 'Making money decisions with data instead of gut feeling.',
    moduleIds: ['M26', 'M27', 'M28'],
    roles: ['owner'],
  },
  {
    id: 'unit-8',
    number: 8,
    title: 'Strategic Leadership',
    description: 'Running the business, not just the building.',
    moduleIds: ['M29', 'M30'],
    roles: ['owner'],
  },
];

export function getUnitById(unitId: string): TrainingUnit | undefined {
  return trainingUnits.find(u => u.id === unitId);
}

export function getUnitsForRole(role: string): TrainingUnit[] {
  return trainingUnits.filter(u => u.roles.includes(role as TrainingUnit['roles'][number]));
}
