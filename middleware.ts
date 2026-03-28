import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Route protection configuration
const protectedRoutes: Record<string, UserRole[]> = {
  '/admin': ['owner', 'admin'],
  '/employee': ['owner', 'admin', 'teacher'],
  '/dashboard': ['owner', 'admin', 'teacher', 'parent'],
};

// Public routes that don't need authentication
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
  '/api',
  '/_next',
  '/favicon',
  '/images',
  '/fonts',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and static files
  if (publicRoutes.some(route => pathname.startsWith(route) || pathname === route)) {
    return NextResponse.next();
  }

  // Skip for static files
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Check for Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, use demo mode (client-side auth)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    // In demo mode, we rely on client-side auth context
    // Still allow the request but let client handle auth
    return NextResponse.next();
  }

  // Create Supabase client for server-side auth check
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get session from cookie
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    // No session - redirect to appropriate login
    return redirectToLogin(request, pathname);
  }

  try {
    // Verify session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return redirectToLogin(request, pathname);
    }

    // Check role-based access
    const userRole = (user.user_metadata?.role || 'parent') as UserRole;

    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/access-denied', request.url));
        }
        break;
      }
    }

    return NextResponse.next();
  } catch {
    // On any error, redirect to login
    return redirectToLogin(request, pathname);
  }
}

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  let loginPath = '/login';

  if (pathname.startsWith('/admin')) {
    loginPath = '/admin-login';
  } else if (pathname.startsWith('/employee')) {
    loginPath = '/employee-login';
  }

  const url = new URL(loginPath, request.url);
  url.searchParams.set('redirect', pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
