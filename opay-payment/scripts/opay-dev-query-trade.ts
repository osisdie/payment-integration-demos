/**
 * Dev helper: query the latest order's trade status from OPay.
 *
 * Usage:
 *   pnpm opay:query                    # query the latest order
 *   pnpm opay:query -- <tradeNo>       # query a specific trade
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { queryTradeInfo } from "../src/lib/opay/aio-client";

async function main() {
  const arg = process.argv[2];
  let merchantTradeNo = arg;

  if (!merchantTradeNo) {
    const prisma = new PrismaClient();
    const latest = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
    });
    await prisma.$disconnect();

    if (!latest) {
      console.error("No orders found in DB. Create one first.");
      process.exit(1);
    }
    merchantTradeNo = latest.merchantTradeNo;
    console.log(`Querying latest order: ${merchantTradeNo}`);
  }

  const result = await queryTradeInfo(merchantTradeNo);
  console.log("Trade Info:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
