/**
 * Local test helper: full refund for the most recent one-time Checkout in DB (test mode).
 */
import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_test")) {
    console.error("STRIPE_SECRET_KEY must be a test secret key (sk_test…).");
    process.exit(1);
  }
  return new Stripe(key, { typescript: true });
}

async function main(): Promise<void> {
  const stripe = getStripe();
  const row = await prisma.checkoutPayment.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (!row) {
    console.error("No CheckoutPayment rows in DB. Run a one-time checkout first.");
    process.exit(1);
  }

  const session = await stripe.checkout.sessions.retrieve(row.stripeCheckoutSessionId, {
    expand: ["payment_intent"],
  });

  if (session.mode !== "payment") {
    console.error("Latest row is not a payment-mode session. Pass a different flow or clear DB.");
    process.exit(1);
  }

  const pi = session.payment_intent;
  const piId = typeof pi === "string" ? pi : pi?.id;
  if (!piId) {
    console.error("Session has no payment_intent to refund.");
    process.exit(1);
  }

  const refund = await stripe.refunds.create({ payment_intent: piId });
  console.log("Refund created:", refund.id, refund.status, "for PI", piId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
