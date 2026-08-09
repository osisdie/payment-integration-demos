import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { doAction } from "@/lib/opay/aio-client";
import { aioConfig } from "@/lib/opay/config";

export const runtime = "nodejs";

/**
 * POST /api/refund/credit
 *
 * Credit card refund via OPay DoAction API (Action=R).
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { orderId, totalAmount } = body;

    if (!orderId || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, totalAmount" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!order.tradeNo) {
      return NextResponse.json({ error: "Order has no TradeNo (not yet paid?)" }, { status: 400 });
    }

    const config = aioConfig();
    const result = await doAction({
      MerchantID: config.merchantId,
      MerchantTradeNo: order.merchantTradeNo,
      TradeNo: order.tradeNo,
      Action: "R",
      TotalAmount: Math.round(Number(totalAmount)),
    });

    // Save refund record
    await prisma.refund.create({
      data: {
        orderId: order.id,
        merchantTradeNo: order.merchantTradeNo,
        tradeNo: order.tradeNo,
        action: "R",
        totalAmount: Math.round(Number(totalAmount)),
        status: result.RtnCode === "1" ? "success" : "failed",
        rtnCode: parseInt(result.RtnCode ?? "0", 10),
        rtnMsg: result.RtnMsg ?? "",
      },
    });

    // Update order status if full refund
    if (result.RtnCode === "1") {
      const refundAmt = Math.round(Number(totalAmount));
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: refundAmt >= order.totalAmount ? "refunded" : "paid",
        },
      });
    }

    return NextResponse.json({
      success: result.RtnCode === "1",
      rtnCode: result.RtnCode,
      rtnMsg: result.RtnMsg,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[refund/credit] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
