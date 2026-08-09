// ---------------------------------------------------------------------------
// Airwallex bearer-token acquisition with in-memory caching
// ---------------------------------------------------------------------------
// Ported from aistyle-webapp/supabase/functions/_shared/airwallex.ts
// Deno `fetch` → Node.js native `fetch` (available in Node 18+).
// ---------------------------------------------------------------------------

import type { AccessTokenResponse } from "./types";
import { airwallexBaseUrl, airwallexConfig, ENDPOINTS } from "./config";

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Obtain a bearer token from Airwallex. Tokens are cached until 60 seconds
 * before expiry to avoid re-authenticating on every request.
 *
 * The cache lives at module scope — this works because Next.js API routes run
 * in a long-lived Node.js process (`export const runtime = "nodejs"`).
 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const { clientId, apiKey } = airwallexConfig();

  const res = await fetch(`${airwallexBaseUrl()}${ENDPOINTS.login}`, {
    method: "POST",
    headers: {
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    throw new Error(`Airwallex auth failed (${res.status}): ${body}`);
  }

  const { token, expires_at } = (await res.json()) as AccessTokenResponse;

  // Cache with a 60-second buffer so we never hand out a nearly-expired token.
  cachedToken = {
    value: token,
    expiresAt: Date.parse(expires_at) - 60_000,
  };

  return token;
}
