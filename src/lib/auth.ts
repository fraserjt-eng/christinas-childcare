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
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!supabaseAuth) {
    // Demo mode - check against hardcoded credentials
    return demoSignIn(email, password);
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
 * Demo sign in for development without Supabase
 */
function demoSignIn(email: string, password: string): AuthResult {
  const demoUsers: Record<string, { password: string; user: AuthUser }> = {
    'admin@demo.com': {
      password: 'admin123',
      user: {
        id: 'demo-admin',
        email: 'admin@demo.com',
        full_name: 'Demo Admin',
        role: 'admin',
      },
    },
    'christina@childcare.com': {
      password: 'owner123',
      user: {
        id: 'demo-owner',
        email: 'christina@childcare.com',
        full_name: 'Christina Zeogar',
        role: 'owner',
      },
    },
    'teacher@demo.com': {
      password: 'teacher123',
      user: {
        id: 'demo-teacher',
        email: 'teacher@demo.com',
        full_name: 'Demo Teacher',
        role: 'teacher',
      },
    },
    'parent@demo.com': {
      password: 'parent123',
      user: {
        id: 'demo-parent',
        email: 'parent@demo.com',
        full_name: 'Demo Parent',
        role: 'parent',
      },
    },
  };

  const demoUser = demoUsers[email.toLowerCase()];

  if (!demoUser) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (demoUser.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Store demo session in localStorage
  if (typeof window !== 'undefined') {
    const session = {
      user: demoUser.user,
      expires_at: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };
    localStorage.setItem('auth_session', JSON.stringify(session));
  }

  return { success: true, user: demoUser.user };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (supabaseAuth) {
    await supabaseAuth.auth.signOut();
  }

  // Clear local session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_session');
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

  // Demo mode - check localStorage
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('auth_session');
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);

    // Check if expired
    if (session.expires_at && session.expires_at < Date.now()) {
      localStorage.removeItem('auth_session');
      return null;
    }

    return {
      user: session.user,
      access_token: 'demo-token',
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
