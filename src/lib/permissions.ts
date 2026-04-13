import type { Employee, EmployeePermissions } from '@/types/employee';

export type PermissionKey = keyof EmployeePermissions;

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  canEditSchedules: 'Edit Schedules',
  canApproveTimeOff: 'Approve Time Off',
  canPostPhotos: 'Post Photos',
  canAccessFinancials: 'Access Financials',
  canManageFamilies: 'Manage Families',
  canAccessIntelligence: 'Access Intelligence',
  canManageStaff: 'Manage Staff',
  canManageSubs: 'Manage Subs',
};

export const ROUTE_ACCESS_OPTIONS: { prefix: string; label: string }[] = [
  { prefix: '/admin/financial', label: 'Financial' },
  { prefix: '/admin/incidents', label: 'Incidents' },
  { prefix: '/admin/intelligence', label: 'Intelligence' },
  { prefix: '/admin/staff', label: 'Staff Directory' },
  { prefix: '/admin/subs', label: 'Subs' },
  { prefix: '/admin/scheduling', label: 'Scheduling' },
  { prefix: '/admin/families', label: 'Families' },
  { prefix: '/admin/reports', label: 'Reports' },
];

export function hasPermission(employee: Employee | null | undefined, key: PermissionKey): boolean {
  if (!employee) return false;
  // Owners/directors default to full access unless explicitly denied
  const title = (employee.job_title || '').toLowerCase();
  const isOwnerish = title.includes('owner') || title.includes('director');
  if (isOwnerish && employee.permissions?.[key] !== false) return true;
  return !!employee.permissions?.[key];
}

export function hasPageAccess(employee: Employee | null | undefined, pathname: string): boolean {
  if (!employee) return false;
  const access = employee.pageAccess;
  if (!access || access.length === 0) return true; // no whitelist = default allow
  return access.some((prefix) => pathname.startsWith(prefix));
}
