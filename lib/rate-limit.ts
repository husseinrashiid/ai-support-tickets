import { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

// In-memory, per-process counter - fine for a single dev/npm-start instance,
// but resets on restart and won't be shared across multiple server instances
// behind a load balancer. Good enough to slow down scripted brute-forcing at
// this project's scale; a real deployment would move this to Redis (e.g.
// Upstash) so limits are enforced consistently across instances.
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) {
    return true;
  }

  bucket.count += 1;
  return false;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
