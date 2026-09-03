/**
 * Dev helper: close/capture then refund a credit card order.
 *
 * Credit card flow: Authorization → Close/Capture (Action="C") → Refund (Action="R")
 * Without closing first, refund returns 10000002 更新失敗.
 *
 * Usage:
 *   npx tsx scripts/opay-dev-close-and-refund.ts                # latest paid credit card order
 *   npx tsx scripts/opay-dev-close-and-refund.ts <orderId>      # specific order
 *   npx tsx scripts/opay-dev-close-and-refund.ts --close-only   # only close, don't refund
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { doAction, queryTradeInfo } from "../src/lib/opay/aio-client";
import { aioConfig } from "../src/lib/opay/config";

async function main() {
  const prisma = new PrismaClient();
  const args = process.argv.slice(2);
  const closeOnly = args.includes("--close-only");
  const orderId = args.find((a) => !a.startsWith("--"));

  let order;
  if (orderId) {
    order = await prisma.order.findUnique({ where: { id: orderId } });
  } else {
    order = await prisma.order.findFirst({
      where: { paymentStatus: "paid", paymentMethod: { not: "TWQR" } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!order) {
    console.error("No paid credit card order found.");
    process.exit(1);
  }
  if (!order.tradeNo) {
    console.error(`Order ${order.merchantTradeNo} has no TradeNo.`);
    process.exit(1);
  }

  const config = aioConfig();
  console.log(`\nOrder: ${order.merchantTradeNo}`);
  console.log(`TradeNo: ${order.tradeNo}`);
  console.log(`Amount: NT$${order.totalAmount}`);
  console.log(`Method: ${order.paymentMethod}`);

  // Step 1: Query current trade status
  console.log("\n--- Step 1: Query Trade Info ---");
  const tradeInfo = await queryTradeInfo(order.merchantTradeNo);
  console.log(`TradeStatus: ${tradeInfo.TradeStatus}`);
  console.log(`PaymentType: ${tradeInfo.PaymentType}`);
  console.log(`TradeAmt: ${tradeInfo.TradeAmt}`);

  // Step 2: Close/Capture (Action="C")
  console.log("\n--- Step 2: Close/Capture (Action=C) ---");
  const closeResult = await doAction({
    MerchantID: config.merchantId,
    MerchantTradeNo: order.merchantTradeNo,
    TradeNo: order.tradeNo,
    Action: "C",
    TotalAmount: order.totalAmount,
  });
  console.log("Close result:", JSON.stringify(closeResult, null, 2));

  if (closeResult.RtnCode !== "1") {
    console.error(`\n❌ Close failed: [${closeResult.RtnCode}] ${closeResult.RtnMsg}`);
    if (closeOnly) {
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log("\nAttempting refund anyway (in case already closed)...");
  } else {
    console.log("\n✅ Close/Capture succeeded");
  }

  if (closeOnly) {
    console.log("\n--close-only flag set. Stopping here.");
    console.log("Run without --close-only after PM 11:59 to attempt refund.");
    await prisma.$disconnect();
    return;
  }

  // Step 3: Refund (Action="R")
  console.log("\n--- Step 3: Refund (Action=R) ---");
  const refundResult = await doAction({
    MerchantID: config.merchantId,
    MerchantTradeNo: order.merchantTradeNo,
    TradeNo: order.tradeNo,
    Action: "R",
    TotalAmount: order.totalAmount,
  });
  console.log("Refund result:", JSON.stringify(refundResult, null, 2));

  if (refundResult.RtnCode === "1") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "refunded" },
    });
    console.log("\n✅ Refund succeeded — order status updated to refunded");
  } else {
    console.error(`\n❌ Refund failed: [${refundResult.RtnCode}] ${refundResult.RtnMsg}`);
    console.log("Note: Close/Capture may take until PM 11:59 to process.");
    console.log("Try refunding again after the capture is confirmed.");
  }

  // Step 4: Query final status
  console.log("\n--- Step 4: Final Trade Status ---");
  const finalInfo = await queryTradeInfo(order.merchantTradeNo);
  console.log(`TradeStatus: ${finalInfo.TradeStatus}`);

  await prisma.$disconnect();
}

main().catch(console.error);
