/**
 * Dev helper: refund the latest paid order.
 *
 * Usage:
 *   pnpm opay:refund                    # refund latest paid order (full amount)
 *   pnpm opay:refund -- <orderId>       # refund a specific order
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { doAction } from "../src/lib/opay/aio-client";
import { aioConfig } from "../src/lib/opay/config";

async function main() {
  const prisma = new PrismaClient();
  const arg = process.argv[2];

  let order;
  if (arg) {
    order = await prisma.order.findUnique({ where: { id: arg } });
  } else {
    order = await prisma.order.findFirst({
      where: { paymentStatus: "paid", paymentMethod: { not: "TWQR" } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!order) {
    console.error("No paid credit card order found. Pay for something first.");
    process.exit(1);
  }

  if (!order.tradeNo) {
    console.error(`Order ${order.merchantTradeNo} has no TradeNo (callback not received yet).`);
    process.exit(1);
  }

  console.log(`Refunding order: ${order.merchantTradeNo} (${order.tradeNo}) — NT$${order.totalAmount}`);

  const config = aioConfig();
  const result = await doAction({
    MerchantID: config.merchantId,
    MerchantTradeNo: order.merchantTradeNo,
    TradeNo: order.tradeNo,
    Action: "R",
    TotalAmount: order.totalAmount,
  });

  console.log("Refund result:", JSON.stringify(result, null, 2));

  if (result.RtnCode === "1") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "refunded" },
    });
    console.log("✅ Order status updated to refunded");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
