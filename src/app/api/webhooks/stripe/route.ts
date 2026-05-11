import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function persistPaymentSession(session: Stripe.Checkout.Session): Promise<void> {
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";
  const customerEmail =
    typeof session.customer_details?.email === "string"
      ? session.customer_details.email
      : typeof session.customer_email === "string"
        ? session.customer_email
        : null;

  await prisma.checkoutPayment.upsert({
    where: { stripeCheckoutSessionId: session.id },
    create: {
      stripeCheckoutSessionId: session.id,
      paymentStatus: session.payment_status,
      amountTotal,
      currency,
      customerEmail,
    },
    update: {
      paymentStatus: session.payment_status,
      amountTotal,
      currency,
      customerEmail,
    },
  });
}

async function persistSubscriptionSnapshot(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? "";
  if (!customerId) return;

  const firstItem = sub.items?.data?.[0];
  const periodEndUnix = firstItem?.current_period_end;
  const currentPeriodEnd =
    typeof periodEndUnix === "number" ? new Date(periodEndUnix * 1000) : null;

  await prisma.subscriptionRecord.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId: customerId,
      status: sub.status,
      currentPeriodEnd,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret?.startsWith("whsec_")) {
    console.error("[webhook] Missing STRIPE_WEBHOOK_SECRET (must start with whsec_)");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
    }
    event = Stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    // Tip: Stripe may deliver the same event more than once. Rows here are keyed by Stripe ids via upserts.
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await persistPaymentSession(session);
          break;
        }
        if (session.mode === "subscription") {
          const subRef = session.subscription;
          const subId = typeof subRef === "string" ? subRef : subRef?.id;
          if (!subId) break;
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(subId);
          await persistSubscriptionSnapshot(sub);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await persistSubscriptionSnapshot(event.data.object as Stripe.Subscription);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
