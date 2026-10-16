interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory — resets on cold start and isn't shared across serverless
// instances, so this throttles bursts on a warm instance rather than
// enforcing a hard global cap. Good enough to slow down brute-force/abuse
// against low-traffic admin and webhook routes without needing a Redis/KV
// add-on; upgrade to Upstash or Vercel KV if these routes ever see real
// distributed-attack traffic.
const buckets = new Map<string, Bucket>();

function sweepExpired(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/** Fixed-window limiter: `limit` requests per `windowMs`, keyed however the caller likes (usually `${route}:${ip}`). */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Best-effort client IP from the headers Vercel's edge network sets — there's no raw socket to fall back to in a serverless route handler. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
