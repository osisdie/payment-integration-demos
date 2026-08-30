import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/query/invoices
 *
 * Query invoices from local DB.
 * Filters: ?invoiceNo=, ?relateNumber=, ?storeId=, ?status=
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const invoiceNo = searchParams.get("invoiceNo");
  const relateNumber = searchParams.get("relateNumber");
  const storeId = searchParams.get("storeId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (invoiceNo) where.invoiceNo = invoiceNo;
  if (relateNumber) where.relateNumber = relateNumber;
  if (storeId) where.storeId = storeId;
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(invoices);
}
