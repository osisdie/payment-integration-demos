import { NextResponse } from "next/server";
import { getFundingRecon } from "@/lib/opay/aio-client";
import { aioConfig } from "@/lib/opay/config";

export const runtime = "nodejs";

/**
 * POST /api/report/funding
 *
 * Download funding reconciliation report from OPay.
 * Returns CSV data for the specified date range.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { startDate, endDate, paymentType } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate" },
        { status: 400 },
      );
    }

    const config = aioConfig();
    const csvData = await getFundingRecon({
      MerchantID: config.merchantId,
      PaymentDateS: startDate,
      PaymentDateE: endDate,
      PaymentType: paymentType,
    });

    // Return as downloadable CSV
    return new Response(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="funding-report-${startDate}-${endDate}.csv"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[report/funding] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
