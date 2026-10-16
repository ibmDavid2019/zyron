import { createHash, timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison for secrets (admin tokens, webhook
 * secrets) — a plain `===` returns as soon as it finds a differing
 * character, and an attacker who can measure response time can use that to
 * guess a secret one byte at a time. Hashing both sides first means we
 * always compare two fixed-length (32-byte) buffers, so a length mismatch
 * never short-circuits either.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
