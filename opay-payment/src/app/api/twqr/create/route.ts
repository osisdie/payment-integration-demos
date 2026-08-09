import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTwqrOrder } from "@/lib/opay/twqr-client";
import { twqrConfig } from "@/lib/opay/config";

export const runtime = "nodejs";

/**
 * POST /api/twqr/create
 *
 * Creates a TWQR dynamic QR code order.
 * Returns the QR code content for the frontend to display.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { tradeAmt, storeId, expireTime } = body;

    if (!tradeAmt || tradeAmt <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid tradeAmt" },
        { status: 400 },
      );
    }

    const config = twqrConfig();
    const result = await createTwqrOrder({
      tradeAmt: Math.round(Number(tradeAmt)),
      storeId,
      expireTime: expireTime ?? 10, // default 10 min
    });

    // Save order to DB
    await prisma.order.create({
      data: {
        merchantId: config.merchantId,
        merchantTradeNo: result.merchantTradeNo,
        tradeNo: result.TradeNo,
        paymentMethod: "TWQR",
        totalAmount: Math.round(Number(tradeAmt)),
        tradeDesc: `TWQR Payment`,
        itemName: `QR Payment #${result.merchantTradeNo}`,
        twqrCode: result.TWQRCode,
        twqrExpireDate: result.ExpireDate,
        platformId: config.platformId || null,
      },
    });

    return NextResponse.json({
      merchantTradeNo: result.merchantTradeNo,
      tradeNo: result.TradeNo,
      twqrCode: result.TWQRCode,
      expireDate: result.ExpireDate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[twqr/create] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
