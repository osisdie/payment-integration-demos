import { NextResponse } from "next/server";
import { queryTradeInfo } from "@/lib/opay/aio-client";

export const runtime = "nodejs";

/**
 * POST /api/query/trade
 *
 * Query AIO trade status from OPay.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { merchantTradeNo } = body;

    if (!merchantTradeNo) {
      return NextResponse.json({ error: "Missing merchantTradeNo" }, { status: 400 });
    }

    const result = await queryTradeInfo(merchantTradeNo);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[query/trade] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
