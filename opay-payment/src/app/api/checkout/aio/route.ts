import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAioFormData } from "@/lib/opay/aio-client";
import { aioConfig } from "@/lib/opay/config";

export const runtime = "nodejs";

/**
 * POST /api/checkout/aio
 *
 * Creates an AIO payment order and returns structured JSON with the
 * OPay action URL and form fields. The frontend builds a hidden form
 * via DOM APIs and submits it — no innerHTML or document.write needed.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const {
      totalAmount,
      tradeDesc,
      itemName,
      choosePayment,
      creditInstallment,
      platformId,
      customField1,
      customField2,
    } = body;

    if (!totalAmount || !tradeDesc || !itemName) {
      return NextResponse.json(
        { error: "Missing required fields: totalAmount, tradeDesc, itemName" },
        { status: 400 },
      );
    }

    const config = aioConfig();
    const { actionUrl, fields, merchantTradeNo } = buildAioFormData({
      totalAmount: Math.round(Number(totalAmount)),
      tradeDesc,
      itemName,
      choosePayment: choosePayment ?? "ALL",
      creditInstallment,
      platformId,
      customField1,
      customField2,
    });

    // Save order to DB
    await prisma.order.create({
      data: {
        merchantId: config.merchantId,
        merchantTradeNo,
        paymentMethod: choosePayment ?? "ALL",
        totalAmount: Math.round(Number(totalAmount)),
        tradeDesc,
        itemName,
        platformId: platformId || config.platformId || null,
        customField1: customField1 || null,
        customField2: customField2 || null,
      },
    });

    // Return structured data — frontend builds the form via safe DOM APIs
    return NextResponse.json({ actionUrl, fields, merchantTradeNo });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout/aio] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
