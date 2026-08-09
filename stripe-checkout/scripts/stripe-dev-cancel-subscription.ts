/**
 * Local test helper: cancel a subscription in Stripe test mode.
 * Uses DB row if no argument, else: pnpm stripe:cancel-sub -- sub_xxx
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
  const argv = process.argv.slice(2).filter((a) => a !== "--");
  const argId = argv[0];
  const stripe = getStripe();

  let subId = argId;
  if (!subId) {
    const row = await prisma.subscriptionRecord.findFirst({
      where: {
        status: { in: ["active", "trialing", "past_due", "unpaid", "paused"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (!row) {
      console.error(
        "No open subscription in SQLite. Complete a subscription checkout first, or pass: pnpm stripe:cancel-sub -- sub_xxx",
      );
      process.exit(1);
    }
    subId = row.stripeSubscriptionId;
    console.log(`Using latest DB subscription: ${subId} (status was ${row.status})`);
  }

  const sub = await stripe.subscriptions.cancel(subId);
  console.log("Stripe subscription canceled:", sub.id, "→", sub.status);
  console.log("Expect webhook customer.subscription.deleted / updated → DB row updates.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
