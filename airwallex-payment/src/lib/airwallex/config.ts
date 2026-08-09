// ---------------------------------------------------------------------------
// Airwallex configuration — env-driven, sandbox/production toggle
// ---------------------------------------------------------------------------

const SANDBOX_BASE = "https://api-demo.airwallex.com/api/v1";
const PROD_BASE = "https://api.airwallex.com/api/v1";

export type AirwallexEnv = "demo" | "prod";

/** Resolved environment: "demo" (sandbox) or "prod". */
export function getEnv(): AirwallexEnv {
  const raw = process.env.AIRWALLEX_ENV ?? "demo";
  if (raw === "production" || raw === "prod") return "prod";
  return "demo";
}

/** REST API base URL for the current environment (no trailing slash). */
export function airwallexBaseUrl(): string {
  return getEnv() === "prod" ? PROD_BASE : SANDBOX_BASE;
}

/** Read required credentials from env vars. Throws on missing values. */
export function airwallexConfig() {
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const webhookSecret = process.env.AIRWALLEX_WEBHOOK_SECRET;

  if (!clientId || !apiKey) {
    throw new Error(
      "Missing AIRWALLEX_CLIENT_ID or AIRWALLEX_API_KEY — check your .env file",
    );
  }

  return { clientId, apiKey, webhookSecret: webhookSecret ?? "" };
}

/** Application URL (used for return/cancel redirects). */
export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
}

/** API endpoint paths (appended to airwallexBaseUrl). */
export const ENDPOINTS = {
  login: "/authentication/login",
  createIntent: "/pa/payment_intents/create",
  getIntent: (id: string) => `/pa/payment_intents/${encodeURIComponent(id)}`,
  createRefund: "/pa/refunds/create",
} as const;
