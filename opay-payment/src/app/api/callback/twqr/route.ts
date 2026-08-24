import { prisma } from "@/lib/prisma";
import { aesDecrypt } from "@/lib/opay/aes-encrypt";
import { twqrConfig } from "@/lib/opay/config";
import type { TwqrCallbackData } from "@/lib/opay/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface TwqrCallbackEnvelope {
  PlatformID?: string;
  MerchantID: string;
  Version?: number;
  Data: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const config = twqrConfig();
    const envelope = (await request.json()) as TwqrCallbackEnvelope;

    if (!envelope.Data) {
      console.warn("[callback/twqr] No Data field in envelope");
      return NextResponse.json({ PlatformID: config.platformId, MerchantID: config.merchantId, RtnCode: 0 });
    }

    // AES-128-CBC decryption guarantees data integrity (wrong key = decrypt failure)
    const data = aesDecrypt<TwqrCallbackData>(envelope.Data, config.hashKey, config.hashIV);

    const statusMap: Record<string, string> = {
      "1": "paid",
      "2": "refunded",
      "3": "refunded",
      "4": "failed",
    };

    const status = String(data.Status);
    await prisma.order.update({
      where: { merchantTradeNo: data.MerchantTradeNo },
      data: {
        tradeNo: data.TradeNo,
        paymentStatus: statusMap[status] ?? "failed",
        paymentDate: data.TradeDate,
      },
    });

    console.log(
      `[callback/twqr] ${data.MerchantTradeNo}: Status=${status} Amt=${data.TradeAmt}`,
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
