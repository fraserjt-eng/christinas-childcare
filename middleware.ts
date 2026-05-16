import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Route protection: maps route prefix to which roles may access it
const protectedRoutes: Record<string, UserRole[]> = {
  '/admin': ['superadmin', 'owner', 'admin'],
  '/employee': ['superadmin', 'owner', 'admin', 'teacher'],
  '/dashboard': ['superadmin', 'owner', 'admin', 'teacher', 'parent'],
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
  '/auth/callback',
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

/**
 * Verify an HMAC-signed cookie value in Edge Runtime (Web Crypto API).
 * The cookie format is: <JSON payload>.<hex signature>
 */
async function verifySignedCookieEdge(cookieValue: string): Promise<Record<string, unknown> | null> {
  // Fail closed in production: no SESSION_SECRET means deny, not sign with a
  // publicly known key. Returning null makes the caller treat the request as
  // unauthenticated and redirect to login.
  const secret =
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-change-in-production');
  if (!secret) return null;
  const lastDot = cookieValue.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payload = cookieValue.substring(0, lastDot);
  const signature = cookieValue.substring(lastDot + 1);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (signature !== expected) return null;

  try {
    const data = JSON.parse(payload);
    if (data.expires_at && data.expires_at < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

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

    const session = await verifySignedCookieEdge(decodeURIComponent(sessionCookie));

    if (!session) {
      return redirectToLogin(request, pathname);
    }

    // Enforce role-based access
    const userRole = (session?.user as { role?: string })?.role ?? 'parent' as UserRole;

    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole as UserRole)) {
          return NextResponse.redirect(new URL('/access-denied', request.url));
        }
        break;
      }
    }

    return NextResponse.next();
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
