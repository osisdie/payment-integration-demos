import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/query/orders
 *
 * Returns recent orders for the refund page dropdown.
 */
export async function GET(): Promise<Response> {
  const orders = await prisma.order.findMany({
    where: { paymentStatus: { in: ["paid"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      merchantTradeNo: true,
      tradeNo: true,
      paymentMethod: true,
      totalAmount: true,
      paymentStatus: true,
    },
  });

  return NextResponse.json(orders);
}
