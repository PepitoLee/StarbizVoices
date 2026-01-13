/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowInSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check rate limit for a given identifier (usually IP or user ID)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowInSeconds * 1000;
  const entry = rateLimitMap.get(identifier);

  // No existing entry or window expired
  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowInSeconds,
    };
  }

  // Existing entry within window
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback
  return `ip:unknown`;
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  };
}

// Preset configurations
export const RATE_LIMITS = {
  /** Standard API: 100 requests per minute */
  standard: { limit: 100, windowInSeconds: 60 },
  /** Strict: 10 requests per minute (for sensitive operations) */
  strict: { limit: 10, windowInSeconds: 60 },
  /** Auth: 5 requests per minute (for login/register) */
  auth: { limit: 5, windowInSeconds: 60 },
  /** Webhook: 50 requests per second */
  webhook: { limit: 50, windowInSeconds: 1 },
} as const;
