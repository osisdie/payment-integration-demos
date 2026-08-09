import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/airwallex";
import type { AirwallexWebhookEvent } from "@/lib/airwallex";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/airwallex
 *
 * Receives Airwallex webhook events. Verifies the HMAC-SHA256 signature,
 * then processes `payment_intent.succeeded` and `refund.succeeded` events.
 * All other events are acknowledged with 200 so Airwallex stops retrying.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-timestamp");
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    console.warn("Airwallex webhook: signature verification failed");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 },
    );
  }

  let event: AirwallexWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event.name ?? "";
  const obj = event.data?.object;

  // ── payment_intent.succeeded ──────────────────────────────────────────
  if (eventName === "payment_intent.succeeded" && obj?.id) {
    const paymentMethod =
      obj.latest_payment_attempt?.payment_method?.type ?? null;

    await prisma.paymentIntent.updateMany({
      where: { airwallexIntentId: obj.id },
      data: {
        paymentStatus: "SUCCEEDED",
        ...(paymentMethod ? { paymentMethod } : {}),
      },
    });

    console.log(`Webhook: payment_intent.succeeded — ${obj.id}`);
    return NextResponse.json({ received: true });
  }

  // ── payment_intent.cancelled / payment_intent.expired ─────────────────
  if (
    (eventName === "payment_intent.cancelled" ||
      eventName === "payment_intent.expired") &&
    obj?.id
  ) {
    await prisma.paymentIntent.updateMany({
      where: { airwallexIntentId: obj.id },
      data: { paymentStatus: "CANCELLED" },
    });

    console.log(`Webhook: ${eventName} — ${obj.id}`);
    return NextResponse.json({ received: true });
  }

  // ── refund.succeeded ──────────────────────────────────────────────────
  if (eventName === "refund.succeeded" && obj?.id) {
    await prisma.refund.updateMany({
      where: { airwallexRefundId: obj.id },
      data: { status: "SUCCEEDED" },
    });

    console.log(`Webhook: refund.succeeded — ${obj.id}`);
    return NextResponse.json({ received: true });
  }

  // ── All other events: acknowledge ─────────────────────────────────────
  console.log(`Webhook: ${eventName} — acknowledged (no handler)`);
  return NextResponse.json({ received: true });
}
