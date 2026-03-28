import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Supabase client for auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

// Create client only if configured
export const supabaseAuth = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth user type
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

// Session type
export interface AuthSession {
  user: AuthUser;
  access_token: string;
  expires_at: number;
}

// Auth result types
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Sign up a new user (admin-created accounts)
 */
export async function signUp(
  email: string,
  password: string,
  metadata: { full_name: string; role: UserRole }
): Promise<AuthResult> {
  if (!supabaseAuth) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'User creation failed' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        full_name: metadata.full_name,
        role: metadata.role,
      },
    };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign in with email and password.
 * When Supabase is configured, delegates to Supabase Auth.
 * When Supabase is NOT configured, login is blocked entirely.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!supabaseAuth) {
    return {
      success: false,
      error: 'Database not connected. Contact administrator.',
    };
  }

  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Sign in failed' };
    }

    const metadata = data.user.user_metadata;

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        full_name: metadata?.full_name || email.split('@')[0],
        role: metadata?.role || 'parent',
      },
    };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (supabaseAuth) {
    await supabaseAuth.auth.signOut();
  }

  // Clear the auth_session cookie (used when Supabase is not configured)
  if (typeof window !== 'undefined') {
    document.cookie = 'auth_session=; Max-Age=0; path=/; SameSite=Lax';
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<AuthSession | null> {
  if (supabaseAuth) {
    const { data: { session } } = await supabaseAuth.auth.getSession();

    if (!session) return null;

    const metadata = session.user.user_metadata;
    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        full_name: metadata?.full_name || session.user.email!.split('@')[0],
        role: metadata?.role || 'parent',
      },
      access_token: session.access_token,
      expires_at: session.expires_at || 0,
    };
  }

  // No Supabase: read the auth_session cookie set by the login page.
  // This path only runs in the browser (server-side checks are in middleware).
  if (typeof window === 'undefined') return null;

  // Read cookie value by name
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_session='))
    ?.split('=')
    .slice(1)
    .join('=');

  if (!cookieValue) return null;

  try {
    const session = JSON.parse(decodeURIComponent(cookieValue));

    if (session.expires_at && session.expires_at < Date.now()) {
      return null;
    }

    return {
      user: session.user,
      access_token: 'no-supabase',
      expires_at: session.expires_at,
    };
  } catch {
    return null;
  }
}

/**
 * Get current user
 */
export async function getUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAuth) {
    return { success: false, error: 'Password reset requires Supabase configuration' };
  }

  try {
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAuth) {
    return { success: false, error: 'Password update requires Supabase configuration' };
  }

  try {
    const { error } = await supabaseAuth.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  teacher: 2,
  parent: 1,
};

/**
 * Check if user has at least the specified role level
 */
export function hasRoleLevel(user: AuthUser | null, minRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}
