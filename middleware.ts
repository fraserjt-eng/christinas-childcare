import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Route protection: maps route prefix to which roles may access it
const protectedRoutes: Record<string, UserRole[]> = {
  '/admin': ['owner', 'admin'],
  '/employee': ['owner', 'admin', 'teacher'],
  '/dashboard': ['owner', 'admin', 'teacher', 'parent'],
};

// Public routes that never require a session check
const publicRoutes = [
  '/',
  '/about',
  '/programs',
  '/gallery',
  '/faq',
  '/enroll',
  '/schedule-tour',
  '/privacy',
  '/scope-sequence',
  '/training',
  '/login',
  '/admin-login',
  '/employee-login',
  '/access-denied',
  '/_next',
  '/favicon',
  '/images',
  '/fonts',
];

// Rate limit config for public API routes: 5 requests per minute per IP
const API_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files (anything with a file extension)
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Apply rate limiting to all /api/* routes
  if (pathname.startsWith('/api/')) {
    const clientId = getClientIdentifier(request);
    const result = checkRateLimit(`api:${clientId}`, API_RATE_LIMIT);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please wait before trying again.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfterSeconds?.toString() ?? '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          },
        }
      );
    }

    // API routes are otherwise unrestricted (they handle their own auth)
    return NextResponse.next();
  }

  // Allow all explicitly public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Determine whether this is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl!.includes('placeholder');

  if (supabaseConfigured) {
    // Supabase path: verify the session JWT with Supabase
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    // Supabase SSR stores the access token in a cookie named sb-<project-ref>-auth-token
    // or the legacy sb-access-token. Try both.
    const accessToken =
      request.cookies.get('sb-access-token')?.value ??
      findSupabaseCookie(request);

    if (!accessToken) {
      return redirectToLogin(request, pathname);
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        return redirectToLogin(request, pathname);
      }

      const userRole = (user.user_metadata?.role ?? 'parent') as UserRole;

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
      return redirectToLogin(request, pathname);
    }
  } else {
    // No Supabase: enforce cookie-based session set by the login page
    // The login page writes a signed JSON value into the `auth_session` cookie
    // when it cannot reach Supabase. Without that cookie, block access entirely.
    const sessionCookie = request.cookies.get('auth_session')?.value;

    if (!sessionCookie) {
      return redirectToLogin(request, pathname);
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie));

      // Reject expired sessions
      if (!session?.expires_at || session.expires_at < Date.now()) {
        return redirectToLogin(request, pathname);
      }

      // Enforce role-based access
      const userRole = (session?.user?.role ?? 'parent') as UserRole;

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
      // Malformed cookie
      return redirectToLogin(request, pathname);
    }
  }
}

/**
 * Scan all cookies for the Supabase SSR auth token (sb-*-auth-token pattern).
 * Supabase stores the full session JSON; extract the access_token field.
 */
function findSupabaseCookie(request: NextRequest): string | undefined {
  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        if (parsed?.access_token) return parsed.access_token as string;
      } catch {
        // Not JSON, skip
      }
    }
  }
  return undefined;
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
     * - _next/image (image optimization)
     * - favicon.ico
     * - files with extensions (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
