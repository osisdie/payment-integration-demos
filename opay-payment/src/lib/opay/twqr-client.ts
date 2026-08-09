/**
 * TWQR (Taiwan QR Code) payment API client.
 *
 * All TWQR APIs use an AES-encrypted Data envelope + CheckMacValue inside.
 * The outer request is JSON with { PlatformID?, MerchantID, Version, Data }.
 */
import { generateCheckMacValue } from "./check-mac-value";
import { aesEncrypt, aesDecrypt } from "./aes-encrypt";
import { twqrConfig, appUrl, paymentBaseUrl, TWQR_ENDPOINTS } from "./config";
import type {
  TwqrCreateParams,
  TwqrCreateResponseData,
  TwqrQueryResponseData,
  TwqrChargebackParams,
  TwqrApiRequest,
  TwqrApiResponse,
} from "./types";

/**
 * Generate a TWQR MerchantTradeNo (max 64 chars per TWQR spec).
 * Format: store code + yyyyMMddHHmmss + random
 */
export function generateTwqrTradeNo(storeId: string = "WEB"): string {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 10);
  return `${storeId}${ts}${rand}`.substring(0, 64);
}

/**
 * Build an encrypted TWQR API request body.
 */
function buildTwqrRequest(
  data: Record<string, string | number>,
  config: ReturnType<typeof twqrConfig>,
): TwqrApiRequest {
  // Add CheckMacValue to the data before encryption
  const checkMacValue = generateCheckMacValue(data, config.hashKey, config.hashIV);
  const dataWithMac = { ...data, CheckMacValue: checkMacValue };

  const encrypted = aesEncrypt(dataWithMac, config.hashKey, config.hashIV);

  const request: TwqrApiRequest = {
    MerchantID: config.merchantId,
    Version: 1,
    Data: encrypted,
  };

  if (config.platformId) {
    request.PlatformID = config.platformId;
  }

  return request;
}

/**
 * Create a TWQR dynamic QR code order.
 * Returns the QR code content and expiry date.
 */
export async function createTwqrOrder(opts: {
  tradeAmt: number;
  merchantTradeNo?: string;
  storeId?: string;
  expireTime?: number; // minutes, max 30
}): Promise<TwqrCreateResponseData & { merchantTradeNo: string }> {
  const config = twqrConfig();
  const merchantTradeNo = opts.merchantTradeNo ?? generateTwqrTradeNo(opts.storeId);

  const data: Record<string, string | number> = {
    MerchantID: config.merchantId,
    MerchantTradeNo: merchantTradeNo,
    TradeAmt: opts.tradeAmt,
  };

  if (opts.storeId) data.StoreID = opts.storeId;
  if (opts.expireTime) data.ExpireTime = opts.expireTime;

  const callbackUrl = `${appUrl()}/api/callback/twqr`;
  data.ReturnURL = callbackUrl;

  const request = buildTwqrRequest(data, config);

  const url = `${paymentBaseUrl()}${TWQR_ENDPOINTS.createTrade}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const envelope = (await res.json()) as TwqrApiResponse;
  if (envelope.RtnCode !== 1) {
    throw new Error(`TWQR CreateTrade failed: [${envelope.RtnCode}] ${envelope.RtnMsg}`);
  }

  const responseData = aesDecrypt<TwqrCreateResponseData>(
    envelope.Data,
    config.hashKey,
    config.hashIV,
  );

  return { ...responseData, merchantTradeNo };
}

/**
 * Query a TWQR trade status.
 */
export async function queryTwqrTrade(tradeNo: string): Promise<TwqrQueryResponseData> {
  const config = twqrConfig();

  const data: Record<string, string | number> = {
    MerchantID: config.merchantId,
    TradeNo: tradeNo,
  };

  const request = buildTwqrRequest(data, config);

  const url = `${paymentBaseUrl()}${TWQR_ENDPOINTS.queryTrade}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const envelope = (await res.json()) as TwqrApiResponse;
  if (envelope.RtnCode !== 1) {
    throw new Error(`TWQR QueryTrade failed: [${envelope.RtnCode}] ${envelope.RtnMsg}`);
  }

  return aesDecrypt<TwqrQueryResponseData>(
    envelope.Data,
    config.hashKey,
    config.hashIV,
  );
}

/**
 * Process a TWQR chargeback (refund).
 */
export async function twqrChargeback(opts: {
  tradeNo: string;
  merchantTradeNo: string;
  refundAmt: number;
}): Promise<{ rtnCode: number; rtnMsg: string }> {
  const config = twqrConfig();

  const data: Record<string, string | number> = {
    MerchantID: config.merchantId,
    TradeNo: opts.tradeNo,
    MerchantTradeNo: opts.merchantTradeNo,
    RefundAmt: opts.refundAmt,
  };

  const request = buildTwqrRequest(data, config);

  const url = `${paymentBaseUrl()}${TWQR_ENDPOINTS.chargeback}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const envelope = (await res.json()) as TwqrApiResponse;
  if (envelope.RtnCode !== 1 && envelope.Data) {
    const responseData = aesDecrypt<{ RtnCode: number; RtnMsg: string }>(
      envelope.Data,
      config.hashKey,
      config.hashIV,
    );
    return { rtnCode: responseData.RtnCode, rtnMsg: responseData.RtnMsg };
  }

  return { rtnCode: envelope.RtnCode, rtnMsg: envelope.RtnMsg };
}
