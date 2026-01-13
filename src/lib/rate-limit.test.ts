import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset the rate limit map by using different identifiers for each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow first request and return remaining = limit - 1', () => {
      const config: RateLimitConfig = { limit: 10, windowInSeconds: 60 };
      const result = checkRateLimit('test-first-request', config);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetIn).toBe(60);
    });

    it('should increment counter for subsequent requests within limit', () => {
      const config: RateLimitConfig = { limit: 10, windowInSeconds: 60 };
      const identifier = 'test-increment';

      // First request
      const result1 = checkRateLimit(identifier, config);
      expect(result1.remaining).toBe(9);

      // Second request
      const result2 = checkRateLimit(identifier, config);
      expect(result2.remaining).toBe(8);

      // Third request
      const result3 = checkRateLimit(identifier, config);
      expect(result3.remaining).toBe(7);
    });

    it('should block requests when limit is exceeded', () => {
      const config: RateLimitConfig = { limit: 3, windowInSeconds: 60 };
      const identifier = 'test-exceed-limit';

      // Make 3 requests (the limit)
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // Fourth request should be blocked
      const result = checkRateLimit(identifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset counter after window expires', () => {
      const config: RateLimitConfig = { limit: 2, windowInSeconds: 60 };
      const identifier = 'test-window-reset';

      // Use up the limit
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // Should be blocked
      const blockedResult = checkRateLimit(identifier, config);
      expect(blockedResult.success).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(61 * 1000);

      // Should be allowed again
      const resetResult = checkRateLimit(identifier, config);
      expect(resetResult.success).toBe(true);
      expect(resetResult.remaining).toBe(1);
    });

    it('should work with standard preset config', () => {
      const result = checkRateLimit('test-standard', RATE_LIMITS.standard);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should work with strict preset config', () => {
      const result = checkRateLimit('test-strict', RATE_LIMITS.strict);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should work with auth preset config', () => {
      const result = checkRateLimit('test-auth', RATE_LIMITS.auth);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should work with webhook preset config', () => {
      const result = checkRateLimit('test-webhook', RATE_LIMITS.webhook);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(49);
    });

    it('should return correct resetIn time', () => {
      const config: RateLimitConfig = { limit: 10, windowInSeconds: 30 };
      const identifier = 'test-reset-time';

      checkRateLimit(identifier, config);

      // Advance 10 seconds
      vi.advanceTimersByTime(10 * 1000);

      const result = checkRateLimit(identifier, config);
      // resetIn should be approximately 20 seconds
      expect(result.resetIn).toBeLessThanOrEqual(20);
      expect(result.resetIn).toBeGreaterThanOrEqual(19);
    });
  });

  describe('getClientIdentifier', () => {
    it('should return user identifier when userId is provided', () => {
      const request = new Request('http://localhost/api/test');
      const result = getClientIdentifier(request, 'user123');
      expect(result).toBe('user:user123');
    });

    it('should return IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });
      const result = getClientIdentifier(request);
      expect(result).toBe('ip:192.168.1.1');
    });

    it('should return IP from x-real-ip header when x-forwarded-for is not present', () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-real-ip': '10.0.0.5',
        },
      });
      const result = getClientIdentifier(request);
      expect(result).toBe('ip:10.0.0.5');
    });

    it('should return fallback when no IP headers are present', () => {
      const request = new Request('http://localhost/api/test');
      const result = getClientIdentifier(request);
      expect(result).toBe('ip:unknown');
    });

    it('should prefer userId over IP headers', () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });
      const result = getClientIdentifier(request, 'user456');
      expect(result).toBe('user:user456');
    });

    it('should trim whitespace from forwarded IP', () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '  192.168.1.100  , 10.0.0.1',
        },
      });
      const result = getClientIdentifier(request);
      expect(result).toBe('ip:192.168.1.100');
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should return correct headers format', () => {
      const result: RateLimitResult = {
        success: true,
        remaining: 5,
        resetIn: 30,
      };
      const headers = createRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Remaining': '5',
        'X-RateLimit-Reset': '30',
      });
    });

    it('should return zero remaining when blocked', () => {
      const result: RateLimitResult = {
        success: false,
        remaining: 0,
        resetIn: 45,
      };
      const headers = createRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '45',
      });
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have correct values for standard preset', () => {
      expect(RATE_LIMITS.standard).toEqual({
        limit: 100,
        windowInSeconds: 60,
      });
    });

    it('should have correct values for strict preset', () => {
      expect(RATE_LIMITS.strict).toEqual({
        limit: 10,
        windowInSeconds: 60,
      });
    });

    it('should have correct values for auth preset', () => {
      expect(RATE_LIMITS.auth).toEqual({
        limit: 5,
        windowInSeconds: 60,
      });
    });

    it('should have correct values for webhook preset', () => {
      expect(RATE_LIMITS.webhook).toEqual({
        limit: 50,
        windowInSeconds: 1,
      });
    });
  });
});
