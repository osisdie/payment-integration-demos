import { redirect } from "next/navigation";

export const runtime = "nodejs";

/**
 * GET /api/callback/client-return
 *
 * OPay OrderResultURL — browser redirect after payment.
 * Redirects the user to the success page with the trade number.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const merchantTradeNo = url.searchParams.get("MerchantTradeNo") ?? "";
  redirect(`/success?tradeNo=${encodeURIComponent(merchantTradeNo)}`);
}

/**
 * POST handler — OPay may POST back depending on configuration.
 */
export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const merchantTradeNo = formData.get("MerchantTradeNo")?.toString() ?? "";
  redirect(`/success?tradeNo=${encodeURIComponent(merchantTradeNo)}`);
}
