import { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

// In-memory, per-process counter
// resets on restart and won't be shared across multiple server instances
// behind a load balancer. Good enough to slow down scripted brute-forcing at
// this project's scale
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

type FailureBucket = { count: number; lockedUntil: number };
// Same in-memory/per-process caveat as `buckets` above.
const failureBuckets = new Map<string, FailureBucket>();
/** Records a failed attempt and locks the key out once `maxAttempts` is reached. */
export function recordFailure(key: string, maxAttempts: number, lockoutMs: number): void {
  const now = Date.now();
  const bucket = failureBuckets.get(key);

  // A concurrent request that resolves after the lockout was just set must not
  // clear it - otherwise parallel failed attempts can bypass the lockout entirely.
  if (bucket && bucket.lockedUntil > now) return;

  const count = (bucket?.count ?? 0) + 1;

  if (count >= maxAttempts) {
    failureBuckets.set(key, { count: 0, lockedUntil: now + lockoutMs });
    return;
  }

  failureBuckets.set(key, { count, lockedUntil: 0 });
}

/** Returns remaining lockout time in ms, or 0 if the key isn't locked out. */
export function getLockoutRemaining(key: string): number {
  const bucket = failureBuckets.get(key);
  if (!bucket || bucket.lockedUntil <= Date.now()) return 0;
  return bucket.lockedUntil - Date.now();
}

export function clearFailures(key: string): void {
  failureBuckets.delete(key);
}
