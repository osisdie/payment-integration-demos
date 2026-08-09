// ---------------------------------------------------------------------------
// Airwallex REST API type definitions
// ---------------------------------------------------------------------------

/** POST /authentication/login response */
export interface AccessTokenResponse {
  token: string;
  expires_at: string;
}

// ── Payment Intents ────────────────────────────────────────────────────────

export interface CreatePaymentIntentParams {
  amount: number; // Major unit (e.g. 9.99)
  currency: string; // "USD", "HKD", "SGD", etc.
  descriptor?: string; // Short description (max 32 chars)
  merchantOrderId?: string; // Merchant-side order reference
  returnUrl: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

/** Subset of the Airwallex payment_intent object we care about */
export interface PaymentIntentResponse {
  id: string;
  request_id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  merchant_order_id?: string;
  descriptor?: string;
  metadata?: Record<string, string>;
  latest_payment_attempt?: {
    payment_method?: {
      type?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// ── Refunds ────────────────────────────────────────────────────────────────

export interface CreateRefundParams {
  paymentIntentId: string; // Airwallex payment_intent ID
  amount?: number; // Partial refund; omit for full
  reason?: string;
}

export interface RefundResponse {
  id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  created_at: string;
}

// ── Webhooks ───────────────────────────────────────────────────────────────

export interface AirwallexWebhookEvent {
  id?: string;
  name?: string; // e.g. "payment_intent.succeeded", "refund.succeeded"
  account_id?: string;
  data?: {
    object?: {
      id?: string;
      status?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, string>;
      latest_payment_attempt?: {
        payment_method?: {
          type?: string;
        };
      };
    };
  };
  created_at?: string;
}
