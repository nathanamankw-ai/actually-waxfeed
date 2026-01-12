/**
 * Simple in-memory rate limiter
 * Note: This resets on deploy. For production, use Redis or similar.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitMaps = new Map<string, Map<string, RateLimitRecord>>()

export interface RateLimitConfig {
  /** Unique identifier for this rate limit (e.g., "auth", "api", "messages") */
  name: string
  /** Time window in milliseconds */
  windowMs?: number
  /** Maximum requests per window */
  maxRequests?: number
}

const DEFAULT_WINDOW = 60 * 1000 // 1 minute
const DEFAULT_MAX = 60 // 60 requests per minute

/**
 * Check if request should be rate limited
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const { name, windowMs = DEFAULT_WINDOW, maxRequests = DEFAULT_MAX } = config
  const now = Date.now()

  // Get or create the map for this rate limit type
  if (!rateLimitMaps.has(name)) {
    rateLimitMaps.set(name, new Map())
  }
  const map = rateLimitMaps.get(name)!

  const record = map.get(identifier)

  // No record or expired - allow and create new record
  if (!record || now > record.resetAt) {
    map.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  // Check if over limit
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment and allow
  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown"
  return ip
}

/**
 * Common rate limit presets
 */
export const rateLimits = {
  /** Strict: 5 requests per hour (for auth) */
  strict: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  
  /** Normal: 60 requests per minute (for most APIs) */
  normal: { windowMs: 60 * 1000, maxRequests: 60 },
  
  /** Relaxed: 120 requests per minute (for read-heavy endpoints) */
  relaxed: { windowMs: 60 * 1000, maxRequests: 120 },
  
  /** Chat: 30 messages per minute */
  chat: { windowMs: 60 * 1000, maxRequests: 30 },
  
  /** Search: 30 searches per minute */
  search: { windowMs: 60 * 1000, maxRequests: 30 },
}

/**
 * Helper to create rate limit response
 */
export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": resetAt.toString(),
      },
    }
  )
}
