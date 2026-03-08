// Role-based view configuration for Christina's Child Care Center

export type AppRole = 'owner_director' | 'lead_teacher' | 'assistant_teacher';

export interface RoleConfig {
  label: string;
  navGroups: string[];
  hiddenPages: string[];
  dashboardSections: string[];
}

export const ROLE_CONFIGS: Record<AppRole, RoleConfig> = {
  owner_director: {
    label: 'Owner / Director',
    navGroups: ['Today', 'People', 'Operations', 'Communications', 'Business'],
    hiddenPages: [],
    dashboardSections: ['snapshot', 'attention', 'quick_actions', 'coming_up'],
  },
  lead_teacher: {
    label: 'Lead Teacher',
    navGroups: ['Today', 'People', 'Operations', 'Communications'],
    hiddenPages: [
      '/admin/payroll',
      '/admin/financial',
      '/admin/budget',
      '/admin/strategic',
      '/admin/settings',
      '/admin/hr',
      '/admin/salaried-scheduling',
    ],
    dashboardSections: ['snapshot', 'attention', 'quick_actions'],
  },
  assistant_teacher: {
    label: 'Assistant Teacher',
    navGroups: ['Today', 'Operations', 'Communications'],
    hiddenPages: [
      '/admin/payroll',
      '/admin/financial',
      '/admin/budget',
      '/admin/strategic',
      '/admin/settings',
      '/admin/hr',
      '/admin/salaried-scheduling',
      '/admin/staff',
      '/admin/scheduling',
      '/admin/schedule-requests',
      '/admin/compliance',
      '/admin/pipeline',
      '/admin/inquiries',
    ],
    dashboardSections: ['snapshot', 'attention'],
  },
};

export function getRoleFromEmployee(role?: string, jobTitle?: string): AppRole {
  if (!role && !jobTitle) return 'owner_director';
  if (role === 'owner' || role === 'admin') return 'owner_director';
  if (jobTitle && jobTitle.toLowerCase().includes('director')) return 'owner_director';
  if (jobTitle && jobTitle.toLowerCase().includes('lead')) return 'lead_teacher';
  return 'assistant_teacher';
}
