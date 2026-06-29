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
 * After a Supabase credential is established (password or Google OAuth),
 * exchange the Supabase access token for the app's signed HttpOnly session
 * cookie. The server verifies the token and DERIVES the role from the
 * database. The client never asserts a role. Returns the server-resolved role.
 */
export async function establishServerSession(): Promise<{
  success: boolean;
  role?: 'superadmin' | 'admin' | 'teacher' | 'parent';
  error?: string;
  notInvited?: boolean;
}> {
  if (!supabaseAuth) return { success: false, error: 'Supabase is not configured' };

  const {
    data: { session },
  } = await supabaseAuth.auth.getSession();

  if (!session?.access_token) {
    return { success: false, error: 'No active session' };
  }

  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: session.access_token }),
    });

    if (res.status === 403) {
      await supabaseAuth.auth.signOut();
      return {
        success: false,
        notInvited: true,
        error: 'This account is not on the invite list. Ask the director to add you.',
      };
    }
    if (res.status === 429) {
      return { success: false, error: 'Too many attempts. Please wait and try again.' };
    }
    if (!res.ok) {
      return { success: false, error: 'Could not establish a session.' };
    }

    const data = await res.json();
    return { success: true, role: data.user?.role };
  } catch {
    return { success: false, error: 'Connection error. Please try again.' };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (supabaseAuth) {
    await supabaseAuth.auth.signOut();
  }

  // Clear the server-side HttpOnly session cookie via the session API.
  // document.cookie cannot clear HttpOnly cookies; this must go through the server.
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch {
    // Best effort — the cookie will expire naturally if this fails
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

  // No Supabase: the auth_session cookie is HttpOnly and cannot be read by client JS.
  // Session validity is enforced in middleware. Client-side components that need
  // the current user should call GET /api/auth/session instead.
  if (typeof window === 'undefined') return null;

  try {
    const res = await fetch('/api/auth/session', { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.user) return null;
    return {
      user: data.user,
      access_token: 'no-supabase',
      expires_at: data.expires_at ?? 0,
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
  superadmin: 5,
  owner: 4,
  admin: 3,
  teacher: 2,
  parent: 1,
};

// Superadmin emails: hardcoded for security. These users get superadmin role on
// every login path (Google OAuth + staff PIN, enforced at mint time).
// J (builder) + the owners (Christina, Ophelia, Stephen, Garjuhan). Lowercase only.
export const SUPERADMIN_EMAILS = [
  'fraserjt@gmail.com',
  'c.fraser@chriskids2.org',
  'ophelia@chriskidstoo.org',
  'sbzeogar@chriskids2.org',
  'garjuhan94@gmail.com',
];

/**
 * Sign in with Google OAuth via Supabase
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabaseAuth) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { error } = await supabaseAuth.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // OAuth redirects away from the page, so this return is only hit on error
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Determine role for an OAuth user based on their email
 */
export function getRoleForEmail(email: string): UserRole {
  if (SUPERADMIN_EMAILS.includes(email.toLowerCase())) {
    return 'superadmin';
  }
  return 'parent';
}

/**
 * Check if user has at least the specified role level
 */
export function hasRoleLevel(user: AuthUser | null, minRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}
