/**
 * OPay SDK — custom Node.js implementation.
 *
 * OPay only provides official SDKs for C#/PHP/Java.
 * This module is a complete TypeScript implementation for Node.js.
 */

// Crypto utilities
export { generateCheckMacValue, verifyCheckMacValue } from "./check-mac-value";
export { aesEncrypt, aesDecrypt } from "./aes-encrypt";
export { dotnetUrlEncode, dotnetUrlDecode } from "./url-encode";

// API clients
export { buildAioFormData, queryTradeInfo, doAction, getFundingRecon, generateTradeNo, formatTradeDate } from "./aio-client";
export { createTwqrOrder, queryTwqrTrade, twqrChargeback, generateTwqrTradeNo } from "./twqr-client";
export { issueInvoice, voidInvoice } from "./invoice-client";

// Config
export { aioConfig, twqrConfig, invoiceConfig, appUrl, paymentBaseUrl, invoiceBaseUrl } from "./config";

// Types
export type * from "./types";
