// AI Rate Limiter wrapper
// Wraps the shared rate-limit store with AI-specific buckets per feature.

import { checkRateLimit, getClientIdentifier } from './rate-limit';

export type AIFeatureKey =
  | 'newsletter'
  | 'research'
  | 'recommendations'
  | 'lessons'
  | 'learning';

interface Bucket {
  maxRequests: number;
  windowMs: number;
}

// Per-feature caps (per session/IP, per hour)
const BUCKETS: Record<AIFeatureKey, Bucket> = {
  newsletter: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  research: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  recommendations: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  lessons: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  learning: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
};

export interface AIRateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  featureKey: AIFeatureKey;
}

/**
 * Check if the caller has exhausted their per-feature rate budget.
 * Scoped by IP so spam from a single client is contained.
 */
export function checkAIRateLimit(
  request: Request,
  feature: AIFeatureKey
): AIRateLimitResult {
  const clientId = getClientIdentifier(request);
  const bucket = BUCKETS[feature];
  const key = `ai:${feature}:${clientId}`;
  const result = checkRateLimit(key, bucket);

  return {
    success: result.success,
    remaining: result.remaining,
    retryAfterSeconds: result.retryAfterSeconds,
    featureKey: feature,
  };
}

export function rateLimitedResponse(result: AIRateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: `Too many ${result.featureKey} requests. Please wait ${result.retryAfterSeconds || 60} seconds.`,
      retryAfter: result.retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds || 60),
      },
    }
  );
}
