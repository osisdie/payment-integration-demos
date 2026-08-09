import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/query/orders
 *
 * List the 50 most recent payment intents from the local database.
 */
export async function GET() {
  const orders = await prisma.paymentIntent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { refunds: true },
  });

  return NextResponse.json(orders);
}
