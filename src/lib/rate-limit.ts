/**
 * Sliding-window rate limiter behind an interface, same pattern as the
 * data providers: in-memory implementation now, Upstash/Redis later
 * without changing call sites.
 */

export interface RateLimiter {
  /** Returns true if the request is allowed. */
  check(key: string): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
}

interface Options {
  windowMs: number;
  max: number;
}

class MemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(private opts: Options) {}

  async check(key: string) {
    const now = Date.now();
    const windowStart = now - this.opts.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= this.opts.max) {
      const oldest = timestamps[0];
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((oldest + this.opts.windowMs - now) / 1000),
      };
    }
    timestamps.push(now);
    this.hits.set(key, timestamps);

    // Opportunistic cleanup to bound memory.
    if (this.hits.size > 10_000) {
      for (const [k, v] of this.hits) {
        if (v.every((t) => t <= windowStart)) this.hits.delete(k);
      }
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/** Named limiters for the endpoints that need protection. */
export const rateLimiters = {
  chat: new MemoryRateLimiter({ windowMs: 60_000, max: 20 }),
  search: new MemoryRateLimiter({ windowMs: 60_000, max: 60 }),
  auth: new MemoryRateLimiter({ windowMs: 300_000, max: 10 }),
} satisfies Record<string, RateLimiter>;

/** Extract a stable client key from a Request (IP behind proxy headers). */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? "local";
}
