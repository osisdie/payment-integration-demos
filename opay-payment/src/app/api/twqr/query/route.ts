import { NextResponse } from "next/server";
import { queryTwqrTrade } from "@/lib/opay/twqr-client";

export const runtime = "nodejs";

/**
 * POST /api/twqr/query
 *
 * Polls TWQR trade status. Used by the frontend to check if payment is complete.
 * Status: 0=unpaid, 1=paid, 2=full refund, 3=partial refund, 4=failed
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { tradeNo } = body;

    if (!tradeNo) {
      return NextResponse.json({ error: "Missing tradeNo" }, { status: 400 });
    }

    const result = await queryTwqrTrade(tradeNo);

    return NextResponse.json({
      status: parseInt(result.TradeStatus, 10),
      tradeAmt: result.TradeAmt,
      tradeDate: result.TradeDate,
      expireDate: result.ExpireDate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[twqr/query] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
