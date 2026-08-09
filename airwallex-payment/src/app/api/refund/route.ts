import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRefund } from "@/lib/airwallex";

export const runtime = "nodejs";

/**
 * POST /api/refund
 *
 * Create a refund against a succeeded payment intent.
 * Body: { paymentIntentId: string (local DB ID), amount?: number, reason?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const localId = body.paymentIntentId as string;
    const amount = body.amount ? Number(body.amount) : undefined;
    const reason = (body.reason as string) || undefined;

    if (!localId) {
      return NextResponse.json(
        { error: "paymentIntentId is required" },
        { status: 400 },
      );
    }

    // Look up the Airwallex intent ID from our local DB.
    const order = await prisma.paymentIntent.findUnique({
      where: { id: localId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }

    if (order.paymentStatus !== "SUCCEEDED") {
      return NextResponse.json(
        { error: `Order status is ${order.paymentStatus}, not SUCCEEDED` },
        { status: 400 },
      );
    }

    const refund = await createRefund({
      paymentIntentId: order.airwallexIntentId,
      amount,
      reason,
    });

    // Persist the refund locally.
    await prisma.refund.create({
      data: {
        airwallexRefundId: refund.id,
        paymentIntentId: order.id,
        amount: refund.amount,
        currency: refund.currency,
        reason: reason ?? null,
        status: refund.status ?? "CREATED",
      },
    });

    return NextResponse.json({
      refund_id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
    });
  } catch (err) {
    console.error("POST /api/refund error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Refund failed" },
      { status: 500 },
    );
  }
}
