'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser, getSession, signIn, signOut, hasRole, isSupabaseConfigured } from '@/lib/auth';
import { UserRole } from '@/types/database';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/programs',
  '/enroll',
  '/scope-sequence',
  '/training',
  '/login',
  '/admin-login',
  '/employee-login',
  '/access-denied',
  '/auth/callback',
];

// Route protection config
const routeProtection: Record<string, UserRole[]> = {
  '/admin': ['superadmin', 'owner', 'admin'],
  '/employee': ['superadmin', 'owner', 'admin', 'teacher'],
  '/dashboard': ['superadmin', 'owner', 'admin', 'teacher', 'parent'],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check session on mount and route changes
  const checkSession = useCallback(async () => {
    try {
      const session = await getSession();
      setUser(session?.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    // Check if route is public
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );

    if (isPublicRoute) return;

    // User not authenticated
    if (!user) {
      // Determine appropriate login page
      if (pathname.startsWith('/admin')) {
        router.push('/admin-login');
      } else if (pathname.startsWith('/employee')) {
        router.push('/employee-login');
      } else {
        router.push('/login');
      }
      return;
    }

    // Check route-specific role requirements
    for (const [route, roles] of Object.entries(routeProtection)) {
      if (pathname.startsWith(route)) {
        if (!hasRole(user, roles)) {
          router.push('/access-denied');
          return;
        }
        break;
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await signIn(email, password);

    if (result.success && result.user) {
      setUser(result.user);
    }

    return { success: result.success, error: result.error };
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push('/');
  };

  const checkRole = (allowedRoles: UserRole[]): boolean => {
    return hasRole(user, allowedRoles);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isSupabaseConfigured,
        login,
        logout,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, checkRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
      } else if (!isLoading && allowedRoles && !checkRole(allowedRoles)) {
        router.push('/access-denied');
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && !checkRole(allowedRoles)) {
      return null;
    }

    return <Component {...props} />;
  };
}
