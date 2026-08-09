import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { voidInvoice } from "@/lib/opay/invoice-client";

export const runtime = "nodejs";

/**
 * POST /api/invoice/void
 *
 * Void (invalidate) an existing e-invoice.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { invoiceId, reason } = body;

    if (!invoiceId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: invoiceId, reason" },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (!invoice.invoiceNo || !invoice.invoiceDate) {
      return NextResponse.json({ error: "Invoice not yet issued" }, { status: 400 });
    }

    const result = await voidInvoice({
      MerchantID: invoice.merchantId,
      InvoiceNo: invoice.invoiceNo,
      InvoiceDate: invoice.invoiceDate,
      Reason: reason,
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "voided",
        voidReason: reason,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceNo: result.InvoiceNo,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[invoice/void] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
