// ---------------------------------------------------------------------------
// Airwallex REST API client wrappers
// ---------------------------------------------------------------------------
// All methods use raw `fetch()` with a bearer token — no unofficial SDK.
// Ported from aistyle-webapp/supabase/functions/airwallex-credit-checkout.
// ---------------------------------------------------------------------------

import type {
  CreatePaymentIntentParams,
  CreateRefundParams,
  PaymentIntentResponse,
  RefundResponse,
} from "./types";
import { airwallexBaseUrl, ENDPOINTS } from "./config";
import { getAccessToken } from "./auth";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Generate a unique merchant order ID (timestamp + random suffix). */
export function generateOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `demo-${ts}-${rand}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── Payment Intents ────────────────────────────────────────────────────────

/**
 * Create a one-time payment intent.
 *
 * Airwallex amounts are in the currency's **major unit** (e.g. 9.99 = $9.99),
 * unlike Stripe which uses minor units (999 cents).
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
): Promise<PaymentIntentResponse> {
  const merchantOrderId = params.merchantOrderId ?? generateOrderId();
  const requestId = `${merchantOrderId}:${Date.now()}`;

  const res = await fetch(
    `${airwallexBaseUrl()}${ENDPOINTS.createIntent}`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        request_id: requestId,
        amount: params.amount,
        currency: params.currency,
        merchant_order_id: merchantOrderId,
        descriptor: params.descriptor?.slice(0, 32),
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl ?? params.returnUrl,
        metadata: params.metadata,
      }),
    },
  );

  if (!res.ok) {
    const errBody = (await res.text()).slice(0, 300);
    throw new Error(`Airwallex create intent error (${res.status}): ${errBody}`);
  }

  return (await res.json()) as PaymentIntentResponse;
}

/** Retrieve the current state of a payment intent. */
export async function getPaymentIntent(
  intentId: string,
): Promise<PaymentIntentResponse> {
  const res = await fetch(
    `${airwallexBaseUrl()}${ENDPOINTS.getIntent(intentId)}`,
    {
      method: "GET",
      headers: await authHeaders(),
    },
  );

  if (!res.ok) {
    const errBody = (await res.text()).slice(0, 300);
    throw new Error(`Airwallex get intent error (${res.status}): ${errBody}`);
  }

  return (await res.json()) as PaymentIntentResponse;
}

// ── Refunds ────────────────────────────────────────────────────────────────

/** Create a refund (full or partial) against a payment intent. */
export async function createRefund(
  params: CreateRefundParams,
): Promise<RefundResponse> {
  const body: Record<string, unknown> = {
    payment_intent_id: params.paymentIntentId,
    reason: params.reason ?? "Refund requested via demo",
  };

  // Omit amount for a full refund.
  if (params.amount !== undefined) {
    body.amount = params.amount;
  }

  const res = await fetch(
    `${airwallexBaseUrl()}${ENDPOINTS.createRefund}`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errBody = (await res.text()).slice(0, 300);
    throw new Error(`Airwallex create refund error (${res.status}): ${errBody}`);
  }

  return (await res.json()) as RefundResponse;
}
