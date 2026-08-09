/**
 * CLI helper: refund the latest succeeded payment intent.
 *
 * Usage:
 *   pnpm airwallex:refund                    # refund latest succeeded order
 *   pnpm airwallex:refund -- <localId>       # refund a specific order by DB ID
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const localId = process.argv[2];

  const order = localId
    ? await prisma.paymentIntent.findUnique({ where: { id: localId } })
    : await prisma.paymentIntent.findFirst({
        where: { paymentStatus: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
      });

  if (!order) {
    console.log("No succeeded payment intent found.");
    return;
  }

  console.log(
    `Refunding: ${order.airwallexIntentId} — ${order.amount} ${order.currency}`,
  );

  const { createRefund } = await import("../src/lib/airwallex/client");

  const refund = await createRefund({
    paymentIntentId: order.airwallexIntentId,
    reason: "Dev CLI refund",
  });

  // Persist locally.
  await prisma.refund.create({
    data: {
      airwallexRefundId: refund.id,
      paymentIntentId: order.id,
      amount: refund.amount,
      currency: refund.currency,
      reason: "Dev CLI refund",
      status: refund.status ?? "CREATED",
    },
  });

  console.log("Refund created:", JSON.stringify(refund, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
