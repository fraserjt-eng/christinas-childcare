/**
 * Simple in-memory rate limiter for API routes
 *
 * For production, consider using:
 * - Vercel KV
 * - Upstash Redis
 * - Edge middleware with @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (works for single serverless instance)
// For production with multiple instances, use Redis/KV store
const store = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(store.entries());
  for (const [key, entry] of entries) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean every minute

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfterSeconds?: number;
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let entry = store.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store.set(key, entry);

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfterSeconds,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Preset configurations
export const RATE_LIMITS = {
  // Login attempts: 5 per minute
  login: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // AI generation: 10 per hour
  aiGeneration: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // General API: 100 per minute
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Password reset: 3 per hour
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Get client identifier from request
 * Uses IP address or forwarded header
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    ...(result.retryAfterSeconds && {
      'Retry-After': result.retryAfterSeconds.toString(),
    }),
  };
}

/**
 * Helper to apply rate limiting in API routes
 *
 * Usage in API route:
 * ```
 * import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
 *
 * export async function POST(request: Request) {
 *   const rateLimitResult = applyRateLimit(request, 'login', RATE_LIMITS.login);
 *   if (!rateLimitResult.success) {
 *     return new Response('Too many requests', {
 *       status: 429,
 *       headers: rateLimitResult.headers
 *     });
 *   }
 *   // Continue with request...
 * }
 * ```
 */
export function applyRateLimit(
  request: Request,
  prefix: string,
  config: RateLimitConfig
): { success: boolean; headers: Record<string, string> } {
  const clientId = getClientIdentifier(request);
  const identifier = `${prefix}:${clientId}`;

  const result = checkRateLimit(identifier, config);
  const headers = createRateLimitHeaders(result);

  return {
    success: result.success,
    headers,
  };
}
