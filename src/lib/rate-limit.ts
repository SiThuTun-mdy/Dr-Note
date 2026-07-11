import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 10 requests per 10 seconds
// by default. This can be customized per-route.

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Global rate limiter - 10 requests per 10 seconds
 * Used for general API endpoints
 */
export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

/**
 * Auth rate limiter - 5 requests per minute
 * Used for login, register, password reset
 */
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
});

/**
 * Strict rate limiter - 3 requests per minute
 * Used for sensitive operations like password changes
 */
export const strictRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  analytics: true,
});

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limiter - Rate limiter to use (default: globalRatelimit)
 * @returns Object with success status and rate limit info
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = globalRatelimit
) {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
}
