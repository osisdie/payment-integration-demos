import { prisma } from "@/lib/prisma";
import { aesDecrypt } from "@/lib/opay/aes-encrypt";
import { verifyCheckMacValue } from "@/lib/opay/check-mac-value";
import { twqrConfig } from "@/lib/opay/config";
import type { TwqrCallbackData, TwqrApiResponse } from "@/lib/opay/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/callback/twqr
 *
 * TWQR ReturnURL — receives encrypted payment result from OPay.
 * Decrypts, verifies CheckMacValue, updates DB, responds with RtnCode: 1.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const envelope = (await request.json()) as TwqrApiResponse;
    const config = twqrConfig();

    if (envelope.RtnCode !== 1 || !envelope.Data) {
      console.warn("[callback/twqr] Envelope error:", envelope.RtnMsg);
      return NextResponse.json({ PlatformID: config.platformId, MerchantID: config.merchantId, RtnCode: 0 });
    }

    // Decrypt the Data payload
    const data = aesDecrypt<TwqrCallbackData>(envelope.Data, config.hashKey, config.hashIV);

    // Verify CheckMacValue
    const params: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key !== "CheckMacValue" && value !== undefined && value !== null) {
        params[key] = value as string | number;
      }
    }
    const macValid = verifyCheckMacValue(
      { ...params, CheckMacValue: data.CheckMacValue },
      config.hashKey,
      config.hashIV,
    );

    if (!macValid) {
      console.warn("[callback/twqr] CheckMacValue verification failed");
      return NextResponse.json({ PlatformID: config.platformId, MerchantID: config.merchantId, RtnCode: 0 });
    }

    // Status: 1=paid, 2=full refund, 3=partial refund, 4=failed
    const statusMap: Record<number, string> = {
      1: "paid",
      2: "refunded",
      3: "refunded",
      4: "failed",
    };

    await prisma.order.update({
      where: { merchantTradeNo: data.MerchantTradeNo },
      data: {
        tradeNo: data.TradeNo,
        paymentStatus: statusMap[data.Status] ?? "failed",
        paymentDate: data.TradeDate,
      },
    });

    console.log(
      `[callback/twqr] ${data.MerchantTradeNo}: Status=${data.Status} Amt=${data.TradeAmt}`,
    );

    return NextResponse.json({
      PlatformID: config.platformId || undefined,
      MerchantID: config.merchantId,
      RtnCode: 1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[callback/twqr] Error:", message);
    return NextResponse.json({ RtnCode: 0 }, { status: 500 });
  }
}
