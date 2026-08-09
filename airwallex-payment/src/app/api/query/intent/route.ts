import { NextResponse } from "next/server";
import { getPaymentIntent } from "@/lib/airwallex";

export const runtime = "nodejs";

/**
 * GET /api/query/intent?id=int_hkXXX
 *
 * Query the live status of a payment intent from the Airwallex API.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const intentId = searchParams.get("id");

  // Validate format: Airwallex intent IDs are "int_" + alphanumeric/underscores.
  // Reject anything else to prevent path traversal / SSRF via URL path injection.
  if (!intentId || !/^int_[A-Za-z0-9_]+$/.test(intentId)) {
    return NextResponse.json(
      { error: "Missing or invalid ?id= parameter (expected int_xxx format)" },
      { status: 400 },
    );
  }

  try {
    const intent = await getPaymentIntent(intentId);
    return NextResponse.json(intent);
  } catch (err) {
    console.error("GET /api/query/intent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
