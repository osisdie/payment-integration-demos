import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueInvoice } from "@/lib/opay/invoice-client";
import { invoiceConfig } from "@/lib/opay/config";
import { sendInvoiceEmail } from "@/lib/email";
import type { InvoiceIssueData } from "@/lib/opay/types";

export const runtime = "nodejs";

/**
 * POST /api/invoice/issue
 *
 * Issue an e-invoice via OPay.
 * When CustomerIdentifier (VAT) is provided, B2B rules are enforced automatically.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const {
      relateNumber,
      orderId,
      customerIdentifier,
      customerName,
      customerEmail,
      customerPhone,
      customerAddr,
      print,
      donation,
      loveCode,
      carrierType,
      carrierNum,
      taxType,
      salesAmount,
      invType,
      items,
    } = body;

    if (!relateNumber || !salesAmount || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields: relateNumber, salesAmount, items" },
        { status: 400 },
      );
    }

    const config = invoiceConfig();
    const invoiceData: InvoiceIssueData = {
      MerchantID: config.merchantId,
      RelateNumber: relateNumber,
      CustomerIdentifier: customerIdentifier ?? "",
      CustomerName: customerName ?? "",
      CustomerEmail: customerEmail ?? "",
      CustomerPhone: customerPhone ?? "",
      CustomerAddr: customerAddr ?? "",
      Print: print ?? "0",
      Donation: donation ?? "0",
      LoveCode: loveCode ?? "",
      CarrierType: carrierType ?? "",
      CarrierNum: carrierNum ?? "",
      TaxType: taxType ?? "1",
      SalesAmount: Math.round(Number(salesAmount)),
      InvType: invType ?? "07",
      Items: items,
    };

    const result = await issueInvoice(invoiceData);

    // Save invoice record
    await prisma.invoice.create({
      data: {
        merchantId: config.merchantId,
        relateNumber,
        invoiceNo: result.InvoiceNo,
        invoiceDate: result.InvoiceDate,
        randomNumber: result.RandomNumber,
        customerIdentifier: customerIdentifier || null,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        customerAddr: customerAddr || null,
        print: customerIdentifier ? "1" : (print ?? "0"),
        donation: customerIdentifier ? "0" : (donation ?? "0"),
        loveCode: loveCode || null,
        carrierType: customerIdentifier ? null : (carrierType || null),
        carrierNum: carrierNum || null,
        taxType: taxType ?? "1",
        salesAmount: Math.round(Number(salesAmount)),
        invType: invType ?? "07",
        status: "issued",
        orderId: orderId || null,
      },
    });

    // Send email notification (never throws — best-effort)
    const emailResult = await sendInvoiceEmail(customerEmail, {
      invoiceNo: result.InvoiceNo,
      invoiceDate: result.InvoiceDate,
      randomNumber: result.RandomNumber,
      salesAmount: Math.round(Number(salesAmount)),
      itemName: items[0]?.ItemName ?? "",
      customerName: customerName,
      relateNumber,
    });

    return NextResponse.json({
      success: true,
      invoiceNo: result.InvoiceNo,
      invoiceDate: result.InvoiceDate,
      randomNumber: result.RandomNumber,
      email: emailResult,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[invoice/issue] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
