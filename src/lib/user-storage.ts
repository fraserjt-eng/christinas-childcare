// User Storage Module for Christina's Child Care Center
// Supabase-first with localStorage fallback
import { isDemoSeedEnabled } from '@/lib/demo-mode';
// Users and security settings are stored in the app_settings table (migration 007)
// Audit logs are stored in error_logs table (migration 004)

import { isSupabaseConfigured } from '@/lib/supabase/service';
import { supabaseUpsert, supabaseSelect } from '@/lib/supabase/guarded';
import { getSupabase } from '@/lib/supabase/client';
import { UserRole } from '@/types/database';

export interface AppUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
  phone?: string;
  child_ids?: string[]; // For parent role
  created_at: string;
  last_login?: string;
}

export interface SecuritySettings {
  password_min_length: number;
  require_uppercase: boolean;
  require_number: boolean;
  require_special_char: boolean;
  session_timeout_hours: number;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

const USERS_KEY = 'app_users';
const SECURITY_SETTINGS_KEY = 'security_settings';
const AUDIT_LOG_KEY = 'audit_log';

// Supabase app_settings keys
const SETTINGS_KEY_USERS = 'app_users';
const SETTINGS_KEY_SECURITY = 'security_settings';

// Default security settings
const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  password_min_length: 8,
  require_uppercase: false,
  require_number: false,
  require_special_char: false,
  session_timeout_hours: 8,
  max_failed_attempts: 5,
  lockout_duration_minutes: 15,
};

// Sample users for demo
const SAMPLE_USERS: AppUser[] = [
  {
    id: 'user-1',
    email: 'christina@childcare.com',
    first_name: 'Christina',
    last_name: 'Zeogar',
    role: 'owner',
    status: 'active',
    phone: '(612) 555-0100',
    created_at: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'user-2',
    email: 'admin@demo.com',
    first_name: 'Demo',
    last_name: 'Admin',
    role: 'admin',
    status: 'active',
    phone: '(612) 555-0101',
    created_at: '2024-01-15T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'maria.johnson@childcare.com',
    first_name: 'Maria',
    last_name: 'Johnson',
    role: 'teacher',
    status: 'active',
    phone: '(612) 555-0102',
    created_at: '2024-02-01T00:00:00Z',
    last_login: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'user-4',
    email: 'sarah.williams@childcare.com',
    first_name: 'Sarah',
    last_name: 'Williams',
    role: 'teacher',
    status: 'active',
    phone: '(612) 555-0103',
    created_at: '2024-02-15T00:00:00Z',
    last_login: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'user-5',
    email: 'parent@demo.com',
    first_name: 'Demo',
    last_name: 'Parent',
    role: 'parent',
    status: 'active',
    child_ids: ['child-1', 'child-2'],
    phone: '(612) 555-0104',
    created_at: '2024-03-01T00:00:00Z',
    last_login: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user-6',
    email: 'jennifer.lee@email.com',
    first_name: 'Jennifer',
    last_name: 'Lee',
    role: 'parent',
    status: 'pending',
    child_ids: ['child-3'],
    phone: '(612) 555-0105',
    created_at: '2024-06-01T00:00:00Z',
  },
];

// ============================================================================
// localStorage helpers (synchronous — user functions are sync by convention)
// ============================================================================

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
}

// ============================================================================
// Supabase settings sync helpers (fire-and-forget; never block UI)
// ============================================================================

async function syncSettingToSupabase(key: string, value: unknown): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabaseUpsert('app_settings', { key, value }, 'key');
  } catch (err) {
    console.error(`Failed to sync setting '${key}' to Supabase:`, err);
  }
}

async function fetchSettingFromSupabase<T>(key: string): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const rows = await supabaseSelect<{ key: string; value: T }>('app_settings', {
      filters: { key },
      limit: 1,
    });
    if (rows && rows.length > 0) return rows[0].value;
    return null;
  } catch (err) {
    console.error(`Failed to fetch setting '${key}' from Supabase:`, err);
    return null;
  }
}

// ============================================================================
// User Management Functions
// NOTE: These remain synchronous for backward compatibility with all callers.
// Supabase sync happens asynchronously (fire-and-forget) after localStorage writes.
// ============================================================================

// Demo identities that must never appear in a real User Management list.
const DEMO_USER_IDS = new Set([
  'user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6',
]);
const DEMO_USER_EMAILS = new Set([
  'christina@childcare.com',
  'admin@demo.com',
  'maria.johnson@childcare.com',
  'sarah.williams@childcare.com',
  'parent@demo.com',
  'jennifer.lee@email.com',
]);

export function getUsers(): AppUser[] {
  // No demo fallback in production: an empty store shows an empty list, not
  // the sample accounts. SAMPLE_USERS only seeds when demo mode is on.
  return getStorageItem<AppUser[]>(
    USERS_KEY,
    isDemoSeedEnabled() ? SAMPLE_USERS : []
  );
}

/**
 * Remove any cached demo/sample accounts from this browser and the cloud copy.
 * Safe: only removes the known sample identities; real users are kept.
 * Called by User Management on load so a previously-seeded browser comes clean.
 */
export function purgeDemoUsers(): void {
  if (typeof window === 'undefined') return;
  const users = getStorageItem<AppUser[]>(USERS_KEY, []);
  const cleaned = users.filter(
    (u) =>
      !DEMO_USER_IDS.has(u.id) &&
      !DEMO_USER_EMAILS.has((u.email || '').toLowerCase())
  );
  if (cleaned.length !== users.length) {
    setStorageItem(USERS_KEY, cleaned);
    syncSettingToSupabase(SETTINGS_KEY_USERS, cleaned).catch(() => {});
  }
}

export function getUserById(id: string): AppUser | undefined {
  const users = getUsers();
  return users.find(u => u.id === id);
}

export function getUserByEmail(email: string): AppUser | undefined {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(userData: Omit<AppUser, 'id' | 'created_at'>): AppUser {
  const users = getUsers();
  const newUser: AppUser = {
    ...userData,
    id: `user-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  setStorageItem(USERS_KEY, users);
  addAuditLog('create', 'user', newUser.id, `Created user: ${newUser.email}`);
  // Async sync to Supabase
  syncSettingToSupabase(SETTINGS_KEY_USERS, users).catch(() => {});
  return newUser;
}

export function updateUser(id: string, updates: Partial<AppUser>): AppUser | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  setStorageItem(USERS_KEY, users);
  addAuditLog('update', 'user', id, `Updated user: ${updatedUser.email}`);
  syncSettingToSupabase(SETTINGS_KEY_USERS, users).catch(() => {});
  return updatedUser;
}

export function deactivateUser(id: string): boolean {
  const result = updateUser(id, { status: 'inactive' });
  if (result) {
    addAuditLog('deactivate', 'user', id, `Deactivated user: ${result.email}`);
  }
  return result !== null;
}

export function activateUser(id: string): boolean {
  const result = updateUser(id, { status: 'active' });
  if (result) {
    addAuditLog('activate', 'user', id, `Activated user: ${result.email}`);
  }
  return result !== null;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return false;

  const filtered = users.filter(u => u.id !== id);
  setStorageItem(USERS_KEY, filtered);
  addAuditLog('delete', 'user', id, `Deleted user: ${user.email}`);
  syncSettingToSupabase(SETTINGS_KEY_USERS, filtered).catch(() => {});
  return true;
}

export function getUsersByRole(role: UserRole): AppUser[] {
  const users = getUsers();
  return users.filter(u => u.role === role);
}

export function searchUsers(query: string): AppUser[] {
  const users = getUsers();
  const lowerQuery = query.toLowerCase();
  return users.filter(u =>
    u.email.toLowerCase().includes(lowerQuery) ||
    u.first_name.toLowerCase().includes(lowerQuery) ||
    u.last_name.toLowerCase().includes(lowerQuery)
  );
}

// ============================================================================
// Security Settings Functions
// ============================================================================

export function getSecuritySettings(): SecuritySettings {
  return getStorageItem<SecuritySettings>(SECURITY_SETTINGS_KEY, DEFAULT_SECURITY_SETTINGS);
}

export function updateSecuritySettings(settings: Partial<SecuritySettings>): SecuritySettings {
  const current = getSecuritySettings();
  const updated = { ...current, ...settings };
  setStorageItem(SECURITY_SETTINGS_KEY, updated);
  addAuditLog('update', 'security_settings', undefined, 'Updated security settings');
  syncSettingToSupabase(SETTINGS_KEY_SECURITY, updated).catch(() => {});
  return updated;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const settings = getSecuritySettings();
  const errors: string[] = [];

  if (password.length < settings.password_min_length) {
    errors.push(`Password must be at least ${settings.password_min_length} characters`);
  }
  if (settings.require_uppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (settings.require_number && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (settings.require_special_char && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Audit Log Functions
// Audit entries are written to Supabase error_logs table when available.
// localStorage always gets a copy as fallback.
// ============================================================================

export function getAuditLog(): AuditLogEntry[] {
  return getStorageItem<AuditLogEntry[]>(AUDIT_LOG_KEY, []);
}

export function addAuditLog(
  action: string,
  resource_type: string,
  resource_id?: string,
  details?: string
): void {
  const logs = getAuditLog();
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    user_id: 'current-user', // Would be replaced with actual user from session
    user_email: 'admin@demo.com', // Would be replaced with actual user email
    action,
    resource_type,
    resource_id,
    details,
    timestamp: new Date().toISOString(),
  };

  // Keep last 1000 entries
  const updatedLogs = [entry, ...logs].slice(0, 1000);
  setStorageItem(AUDIT_LOG_KEY, updatedLogs);

  // Fire-and-forget write to Supabase error_logs (best-effort audit trail)
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(supabase.from('error_logs').insert({
        error_message: `[AUDIT] ${action} ${resource_type}${resource_id ? ` (${resource_id})` : ''}`,
        url: details || null,
        user_id: 'admin',
        created_at: entry.timestamp,
      })).then(() => {}).catch(() => {});
    }
  }
}

export function searchAuditLog(filters: {
  user_email?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}): AuditLogEntry[] {
  const logs = getAuditLog();

  return logs.filter(log => {
    if (filters.user_email && !log.user_email.toLowerCase().includes(filters.user_email.toLowerCase())) {
      return false;
    }
    if (filters.action && log.action !== filters.action) {
      return false;
    }
    if (filters.resource_type && log.resource_type !== filters.resource_type) {
      return false;
    }
    if (filters.start_date && log.timestamp < filters.start_date) {
      return false;
    }
    if (filters.end_date && log.timestamp > filters.end_date) {
      return false;
    }
    return true;
  });
}

// ============================================================================
// Async hydration from Supabase (call once on app init to sync Supabase -> localStorage)
// ============================================================================

export async function hydrateUsersFromSupabase(): Promise<void> {
  const remoteUsers = await fetchSettingFromSupabase<AppUser[]>(SETTINGS_KEY_USERS);
  if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
    setStorageItem(USERS_KEY, remoteUsers);
  }
  const remoteSettings = await fetchSettingFromSupabase<SecuritySettings>(SETTINGS_KEY_SECURITY);
  if (remoteSettings && typeof remoteSettings === 'object') {
    setStorageItem(SECURITY_SETTINGS_KEY, remoteSettings);
  }
}

// ============================================================================
// Initialize with sample data if empty
// ============================================================================
export function seedUserData(): void {
  if (!isDemoSeedEnabled()) return;
  const existingUsers = getStorageItem<AppUser[] | null>(USERS_KEY, null);
  if (!existingUsers || existingUsers.length === 0) {
    setStorageItem(USERS_KEY, SAMPLE_USERS);
    syncSettingToSupabase(SETTINGS_KEY_USERS, SAMPLE_USERS).catch(() => {});
  }
}

// ============================================================================
// Role definitions for display
// ============================================================================
export const ROLE_DEFINITIONS = {
  superadmin: {
    label: 'Superadmin',
    description: 'System-level access, Google OAuth, all settings',
    color: 'bg-red-100 text-red-800',
  },
  owner: {
    label: 'Owner',
    description: 'Full access to all features and settings',
    color: 'bg-purple-100 text-purple-800',
  },
  admin: {
    label: 'Admin',
    description: 'Manage operations, staff, and most settings',
    color: 'bg-blue-100 text-blue-800',
  },
  teacher: {
    label: 'Teacher',
    description: 'Access curriculum, attendance, and classroom features',
    color: 'bg-green-100 text-green-800',
  },
  parent: {
    label: 'Parent',
    description: 'View child information and communicate with staff',
    color: 'bg-yellow-100 text-yellow-800',
  },
};
