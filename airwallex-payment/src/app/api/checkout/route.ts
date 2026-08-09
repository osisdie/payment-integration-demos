import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPaymentIntent,
  generateOrderId,
  appUrl,
} from "@/lib/airwallex";

export const runtime = "nodejs";

/**
 * POST /api/checkout
 *
 * Create an Airwallex payment intent and persist it locally.
 * Returns { payment_intent_id, client_secret, amount, currency } for the
 * frontend to hand off to @airwallex/components-sdk redirectToCheckout().
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const currency = (body.currency as string)?.toUpperCase() || "USD";
    const description = (body.description as string) || "Demo payment";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    const merchantOrderId = generateOrderId();
    const base = appUrl();

    const intent = await createPaymentIntent({
      amount,
      currency,
      descriptor: description,
      merchantOrderId,
      returnUrl: `${base}/success?intent_id=INTENT_ID_PLACEHOLDER`,
      cancelUrl: `${base}/cancel`,
    });

    // Persist to local DB for tracking.
    await prisma.paymentIntent.create({
      data: {
        airwallexIntentId: intent.id,
        requestId: intent.request_id,
        amount: intent.amount,
        currency: intent.currency,
        descriptor: description,
        merchantOrderId,
        paymentStatus: intent.status ?? "INITIAL",
      },
    });

    return NextResponse.json({
      payment_intent_id: intent.id,
      client_secret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
    });
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
