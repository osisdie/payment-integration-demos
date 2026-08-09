/**
 * OPay environment configuration.
 * Reads from environment variables; all keys have stage defaults for easy local dev.
 */

export type OpayEnv = "stage" | "production";

function getEnv(): OpayEnv {
  const env = process.env.OPAY_ENV ?? "stage";
  if (env !== "stage" && env !== "production") {
    throw new Error(`Invalid OPAY_ENV: "${env}" — must be "stage" or "production"`);
  }
  return env;
}

// --- Base URLs ---

const BASE_URLS: Record<OpayEnv, string> = {
  stage: "https://payment-stage.opay.tw",
  production: "https://payment.opay.tw",
};

const INVOICE_BASE_URLS: Record<OpayEnv, string> = {
  stage: "https://einvoice-stage.opay.tw",
  production: "https://einvoice.opay.tw",
};

export function paymentBaseUrl(): string {
  return BASE_URLS[getEnv()];
}

export function invoiceBaseUrl(): string {
  return INVOICE_BASE_URLS[getEnv()];
}

// --- AIO Payment credentials ---

export function aioConfig() {
  return {
    merchantId: process.env.OPAY_MERCHANT_ID ?? "2000132",
    hashKey: process.env.OPAY_HASH_KEY ?? "5294y06JbISpM5x9",
    hashIV: process.env.OPAY_HASH_IV ?? "v77hoKGq4kWxNNIS",
    platformId: process.env.OPAY_PLATFORM_ID ?? "",
  };
}

// --- TWQR credentials (separate test merchant) ---

export function twqrConfig() {
  return {
    merchantId: process.env.OPAY_TWQR_MERCHANT_ID ?? "2032990",
    hashKey: process.env.OPAY_TWQR_HASH_KEY ?? "zZ3TY0OnRvh1S1Sy",
    hashIV: process.env.OPAY_TWQR_HASH_IV ?? "IJpIyW5lGSISNPZv",
    platformId: process.env.OPAY_PLATFORM_ID ?? "",
  };
}

// --- E-Invoice credentials ---

export function invoiceConfig() {
  return {
    merchantId: process.env.OPAY_INVOICE_MERCHANT_ID ?? "2000132",
    hashKey: process.env.OPAY_INVOICE_HASH_KEY ?? "ejCk326UnaZWKisg",
    hashIV: process.env.OPAY_INVOICE_HASH_IV ?? "q9jcZX8Ib9LM8wYk",
    platformId: process.env.OPAY_PLATFORM_ID ?? "",
  };
}

// --- App URL (for callbacks) ---

export function appUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? "3001"}`;
  return url.replace(/\/+$/, "");
}

// --- API Endpoints ---

export const AIO_ENDPOINTS = {
  checkout: "/Cashier/AioCheckOut/V5",
  queryTrade: "/Cashier/QueryTradeInfo/V5",
  doAction: "/CreditDetail/DoAction",
  fundingRecon: "/CreditDetail/FundingReconDetail",
} as const;

export const TWQR_ENDPOINTS = {
  createTrade: "/TWQRCashier/CreateTrade",
  queryTrade: "/TWQRCashier/QueryTrade",
  chargeback: "/TWQRCashier/Chargeback",
} as const;

export const INVOICE_ENDPOINTS = {
  issue: "/B2CInvoice/Issue",
  invalid: "/B2CInvoice/IssueInvalid",
  allowance: "/B2CInvoice/AllowanceByCollegiate",
  query: "/B2CInvoice/Issue",
} as const;
