/**
 * AIO (All-In-One) payment API client.
 *
 * Key difference from Stripe: AIO is a form-POST flow.
 * The server generates a self-submitting HTML form that redirects the browser
 * to OPay's hosted payment page — NOT a JSON API that returns a redirect URL.
 */
import { generateCheckMacValue } from "./check-mac-value";
import { aioConfig, appUrl, paymentBaseUrl, AIO_ENDPOINTS } from "./config";
import type {
  AioCheckoutParams,
  QueryTradeParams,
  DoActionParams,
  FundingReconParams,
} from "./types";

/**
 * Generate a unique MerchantTradeNo (max 20 chars).
 * Format: yyyyMMddHHmmss + 6 random chars = 20 chars
 */
export function generateTradeNo(): string {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8);
  return (ts + rand).substring(0, 20);
}

/**
 * Get current date in OPay format: yyyy/MM/dd HH:mm:ss
 */
export function formatTradeDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}:${s}`;
}

/**
 * Build structured form data for AIO checkout.
 *
 * Returns the OPay action URL and a key-value map of form fields.
 * The frontend constructs a hidden <form> via safe DOM APIs (createElement /
 * appendChild) and submits it — no innerHTML or document.write needed.
 */
export function buildAioFormData(opts: {
  totalAmount: number;
  tradeDesc: string;
  itemName: string;
  merchantTradeNo?: string;
  choosePayment?: AioCheckoutParams["ChoosePayment"];
  creditInstallment?: string;
  platformId?: string;
  customField1?: string;
  customField2?: string;
}): { actionUrl: string; fields: Record<string, string>; merchantTradeNo: string } {
  const config = aioConfig();
  const merchantTradeNo = opts.merchantTradeNo ?? generateTradeNo();

  const params: Record<string, string | number> = {
    MerchantID: config.merchantId,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: formatTradeDate(),
    PaymentType: "aio",
    TotalAmount: opts.totalAmount,
    TradeDesc: opts.tradeDesc,
    ItemName: opts.itemName,
    ReturnURL: `${appUrl()}/api/callback/opay`,
    OrderResultURL: `${appUrl()}/api/callback/client-return`,
    ChoosePayment: opts.choosePayment ?? "ALL",
    EncryptType: 1,
  };

  // Optional fields
  if (opts.platformId || config.platformId) {
    params.PlatformID = opts.platformId || config.platformId;
  }
  if (opts.creditInstallment) params.CreditInstallment = opts.creditInstallment;
  if (opts.customField1) params.CustomField1 = opts.customField1;
  if (opts.customField2) params.CustomField2 = opts.customField2;

  // Compute CheckMacValue
  params.CheckMacValue = generateCheckMacValue(params, config.hashKey, config.hashIV);

  const actionUrl = `${paymentBaseUrl()}${AIO_ENDPOINTS.checkout}`;

  // Convert all values to strings for the form fields
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    fields[k] = String(v);
  }

  return { actionUrl, fields, merchantTradeNo };
}

/**
 * Query trade info from OPay.
 */
export async function queryTradeInfo(merchantTradeNo: string): Promise<Record<string, string>> {
  const config = aioConfig();
  const params: Record<string, string | number> = {
    MerchantID: config.merchantId,
    MerchantTradeNo: merchantTradeNo,
    TimeStamp: Math.floor(Date.now() / 1000),
  };
  if (config.platformId) params.PlatformID = config.platformId;

  params.CheckMacValue = generateCheckMacValue(params, config.hashKey, config.hashIV);

  const url = `${paymentBaseUrl()}${AIO_ENDPOINTS.queryTrade}`;
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    body.set(k, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await res.text();
  // Response is URL-encoded key=value pairs separated by &
  const result: Record<string, string> = {};
  for (const pair of text.split("&")) {
    const [key, ...rest] = pair.split("=");
    result[key] = rest.join("=");
  }
  return result;
}

/**
 * Execute a credit card action (refund, capture, void, cancel auth).
 */
export async function doAction(params: DoActionParams): Promise<Record<string, string>> {
  const config = aioConfig();
  const allParams: Record<string, string | number> = {
    MerchantID: params.MerchantID || config.merchantId,
    MerchantTradeNo: params.MerchantTradeNo,
    TradeNo: params.TradeNo,
    Action: params.Action,
    TotalAmount: params.TotalAmount,
  };
  if (params.PlatformID || config.platformId) {
    allParams.PlatformID = params.PlatformID || config.platformId;
  }

  allParams.CheckMacValue = generateCheckMacValue(allParams, config.hashKey, config.hashIV);

  const url = `${paymentBaseUrl()}${AIO_ENDPOINTS.doAction}`;
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(allParams)) {
    body.set(k, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await res.text();
  const result: Record<string, string> = {};
  for (const pair of text.split("&")) {
    const [key, ...rest] = pair.split("=");
    result[key] = rest.join("=");
  }
  return result;
}

/**
 * Download funding reconciliation report.
 */
export async function getFundingRecon(params: FundingReconParams): Promise<string> {
  const config = aioConfig();
  const allParams: Record<string, string | number> = {
    MerchantID: params.MerchantID || config.merchantId,
    PaymentDateS: params.PaymentDateS,
    PaymentDateE: params.PaymentDateE,
  };
  if (params.PaymentType) allParams.PaymentType = params.PaymentType;
  if (params.MediaFormated) allParams.MediaFormated = params.MediaFormated;
  if (params.PlatformID || config.platformId) {
    allParams.PlatformID = params.PlatformID || config.platformId;
  }

  allParams.CheckMacValue = generateCheckMacValue(allParams, config.hashKey, config.hashIV);

  const url = `${paymentBaseUrl()}${AIO_ENDPOINTS.fundingRecon}`;
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(allParams)) {
    body.set(k, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  return res.text();
}
