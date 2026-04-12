import { TrainingRole } from '@/types/training';

// Role Access Matrix from curriculum-guide.md
// Maps each role to the module IDs they can access

export const pathwayModules: Record<TrainingRole, string[]> = {
  parent: ['M01', 'M02', 'M03', 'M04', 'M09', 'M10', 'M12', 'M13'],
  teacher: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M13', 'M15', 'M16', 'M17'],
  admin: [
    'M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10',
    'M11', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M21', 'M22', 'M23', 'M24',
  ],
  owner: [
    'M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10',
    'M11', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22',
    'M23', 'M24', 'M25', 'M26', 'M27', 'M28', 'M29', 'M30',
  ],
};

export const pathwayInfo: Record<TrainingRole, { name: string; totalHours: number; totalWeeks: number }> = {
  parent: { name: 'Parent/Family', totalHours: 1.5, totalWeeks: 2 },
  teacher: { name: 'Employee/Staff', totalHours: 7, totalWeeks: 4 },
  admin: { name: 'Director/Lead Teacher', totalHours: 15.5, totalWeeks: 6 },
  owner: { name: 'Owner/Admin', totalHours: 23.5, totalWeeks: 8 },
};

export function getModulesForRole(role: TrainingRole): string[] {
  return pathwayModules[role] || [];
}

export function isModuleAccessible(moduleId: string, role: TrainingRole): boolean {
  return pathwayModules[role]?.includes(moduleId) ?? false;
}
