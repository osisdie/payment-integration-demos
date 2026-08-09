import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { twqrChargeback } from "@/lib/opay/twqr-client";

export const runtime = "nodejs";

/**
 * POST /api/refund/twqr
 *
 * TWQR chargeback (refund).
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { orderId, refundAmt } = body;

    if (!orderId || !refundAmt) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, refundAmt" },
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

    const result = await twqrChargeback({
      tradeNo: order.tradeNo,
      merchantTradeNo: order.merchantTradeNo,
      refundAmt: Math.round(Number(refundAmt)),
    });

    // Save refund record
    await prisma.refund.create({
      data: {
        orderId: order.id,
        merchantTradeNo: order.merchantTradeNo,
        tradeNo: order.tradeNo,
        action: "R",
        totalAmount: Math.round(Number(refundAmt)),
        status: result.rtnCode === 1 ? "success" : "failed",
        rtnCode: result.rtnCode,
        rtnMsg: result.rtnMsg,
      },
    });

    if (result.rtnCode === 1) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "refunded" },
      });
    }

    return NextResponse.json({
      success: result.rtnCode === 1,
      rtnCode: result.rtnCode,
      rtnMsg: result.rtnMsg,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[refund/twqr] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
