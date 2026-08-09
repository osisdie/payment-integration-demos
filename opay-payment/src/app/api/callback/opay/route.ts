import { prisma } from "@/lib/prisma";
import { verifyCheckMacValue } from "@/lib/opay/check-mac-value";
import { aioConfig } from "@/lib/opay/config";
import type { AioCallbackPayload } from "@/lib/opay/types";

export const runtime = "nodejs";

/**
 * POST /api/callback/opay
 *
 * OPay AIO ReturnURL — receives server-side payment result notification.
 * Must verify CheckMacValue and respond with exactly "1|OK".
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    const payload = params as unknown as AioCallbackPayload;
    const config = aioConfig();

    // Verify CheckMacValue to prevent spoofing
    if (!verifyCheckMacValue(params, config.hashKey, config.hashIV)) {
      console.warn("[callback/opay] CheckMacValue verification failed");
      return new Response("0|CheckMacValue Error", { status: 400 });
    }

    // RtnCode "1" = payment success
    const isPaid = payload.RtnCode === "1";
    const isSimulated = payload.SimulatePaid === "1";

    // Update order in DB
    await prisma.order.update({
      where: { merchantTradeNo: payload.MerchantTradeNo },
      data: {
        tradeNo: payload.TradeNo,
        paymentStatus: isPaid ? "paid" : "failed",
        rtnCode: parseInt(payload.RtnCode, 10),
        rtnMsg: payload.RtnMsg,
        paymentDate: payload.PaymentDate,
        tradeDate: payload.TradeDate,
        customField1: payload.CustomField1 || null,
        customField2: payload.CustomField2 || null,
      },
    });

    if (isSimulated) {
      console.log(`[callback/opay] Simulated payment for ${payload.MerchantTradeNo}`);
    }

    console.log(
      `[callback/opay] ${payload.MerchantTradeNo}: ${isPaid ? "PAID" : "FAILED"} — ${payload.RtnMsg}`,
    );

    // OPay requires exactly "1|OK" as the response
    return new Response("1|OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[callback/opay] Error:", message);
    return new Response("0|Error", { status: 500 });
  }
}
