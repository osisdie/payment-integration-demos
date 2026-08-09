// ---------------------------------------------------------------------------
// Airwallex webhook signature verification
// ---------------------------------------------------------------------------
// Ported from aistyle-webapp/supabase/functions/_shared/airwallex.ts
// Deno `crypto.subtle` → Node.js `crypto` module (simpler + `timingSafeEqual`).
// ---------------------------------------------------------------------------

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify the HMAC-SHA256 signature on an Airwallex webhook request.
 *
 * Spec: HMAC-SHA256 of `timestamp + rawBody` (string concatenation, no
 * separator) using the webhook secret, hex-encoded. Headers: `x-timestamp`,
 * `x-signature`. Reject timestamps more than 10 minutes from now to
 * neutralize replay attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
): boolean {
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;
  if (!secret || !timestamp || !signature) return false;

  // Replay-window check: reject if timestamp differs by more than 10 minutes.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const skewSeconds = Math.abs(Date.now() - ts) / 1000;
  if (skewSeconds > 600) return false;

  // Compute expected signature.
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest("hex");

  // Constant-time comparison to prevent timing side-channels.
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
