import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/types/database';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// IMPORTANT: this project uses a `src/` directory, so Next.js reads middleware
// from `src/middleware.ts`. A root-level `middleware.ts` is IGNORED here and
// never ran — every protected page was open. This file is the real gate.

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
  '/set-password',
  '/access-denied',
  '/auth/callback',
  '/demo',
  '/_next',
  '/favicon',
  '/images',
  '/fonts',
];

// Backstop limit for UNAUTHENTICATED public API routes only (e.g. the
// password login endpoint). Session-gated operational routes are exempt
// below: they are on shared room iPads where one IP is many staff, and the
// in-route requireSession is the real control. 5/min was crippling that
// real workflow (frozen Daily Report, vanishing roster, duplicate logs).
const API_RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60 * 1000,
};

/**
 * Verify an HMAC-signed cookie value in Edge Runtime (Web Crypto API).
 * The cookie format is: <JSON payload>.<hex signature>
 *
 * This is the single source of truth for session validity. The session cookie
 * is only ever minted by /api/auth/session AFTER a real credential (Supabase
 * Auth token or families password) is verified server-side, and the role it
 * carries is derived server-side from the database. So verifying this signed
 * cookie here is sufficient and the role inside it is trustworthy.
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
    // Exempt routes that are either self-limiting or session-gated. The
    // operational app routes (employee/parent/admin/reports/pulse and the
    // per-child entry + staff roster) all enforce requireSession in-route,
    // so the session is the control, not the IP. On a shared room iPad one
    // IP is the whole team; an IP cap there breaks normal use (the Daily
    // Report freeze, vanishing roster, and duplicate entries were all this).
    if (
      pathname.startsWith('/api/kiosk') ||
      pathname.startsWith('/api/auth/staff-pin') ||
      pathname.startsWith('/api/employee/') ||
      pathname.startsWith('/api/parent/') ||
      pathname.startsWith('/api/staff/') ||
      pathname.startsWith('/api/admin/') ||
      pathname.startsWith('/api/child-entries') ||
      pathname.startsWith('/api/reports/') ||
      pathname.startsWith('/api/pulse/')
    ) {
      return NextResponse.next();
    }

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

  // Enforce the signed session cookie. It is minted only after a real
  // credential is verified server-side; the role inside is server-derived.
  const sessionCookie = request.cookies.get('auth_session')?.value;

  if (!sessionCookie) {
    return redirectToLogin(request, pathname);
  }

  const session = await verifySignedCookieEdge(decodeURIComponent(sessionCookie));

  if (!session) {
    return redirectToLogin(request, pathname);
  }

  // Enforce role-based access
  const userRole = ((session?.user as { role?: string })?.role ?? 'parent') as UserRole;

  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
      break;
    }
  }

  return NextResponse.next();
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
