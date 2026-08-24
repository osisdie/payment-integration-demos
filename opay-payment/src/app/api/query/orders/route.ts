import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/query/orders
 *
 * Returns recent paid orders for the refund page dropdown.
 * Optional: ?search=<merchantTradeNo> to look up a specific order.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  if (search) {
    const order = await prisma.order.findFirst({
      where: { merchantTradeNo: search },
      select: {
        id: true,
        merchantTradeNo: true,
        tradeNo: true,
        paymentMethod: true,
        totalAmount: true,
        paymentStatus: true,
      },
    });
    return NextResponse.json(order ? [order] : []);
  }

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
