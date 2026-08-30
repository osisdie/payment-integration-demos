/**
 * E-Invoice (電子發票) API client.
 *
 * Uses separate HashKey/HashIV from payment.
 * All requests use AES-encrypted Data envelope with:
 * { MerchantID, RqHeader: { Timestamp }, Data }
 *
 * B2B VAT logic: when CustomerIdentifier (統一編號) is provided,
 * Print must be "1", Donation must be "0", CarrierType must be empty.
 */
import { generateCheckMacValue } from "./check-mac-value";
import { aesEncrypt, aesDecrypt } from "./aes-encrypt";
import { invoiceConfig, invoiceBaseUrl, INVOICE_ENDPOINTS } from "./config";
import type {
  InvoiceIssueData,
  InvoiceIssueResponseData,
  InvoiceVoidData,
  InvoiceVoidResponseData,
  InvoiceApiRequest,
  InvoiceApiResponse,
} from "./types";

/**
 * Build an E-Invoice API request with encrypted Data.
 */
function buildInvoiceRequest(
  data: Record<string, unknown>,
  config: ReturnType<typeof invoiceConfig>,
): InvoiceApiRequest {
  const encrypted = aesEncrypt(data, config.hashKey, config.hashIV, { invoiceMode: true });

  return {
    MerchantID: config.merchantId,
    RqHeader: {
      Timestamp: Math.floor(Date.now() / 1000),
    },
    Data: encrypted,
  };
}

function formatInvoiceItems(items: InvoiceIssueData["Items"]) {
  return items.map((item, idx) => ({
    ItemSeq: idx + 1,
    ItemName: item.ItemName,
    ItemCount: item.ItemCount,
    ItemWord: item.ItemWord,
    ItemPrice: item.ItemPrice,
    ItemAmount: item.ItemAmount,
    ...(item.ItemTaxType ? { ItemTaxType: item.ItemTaxType } : {}),
    ...(item.ItemRemark ? { ItemRemark: item.ItemRemark } : {}),
  }));
}

/**
 * Issue an e-invoice.
 *
 * When CustomerIdentifier (VAT number) is provided, enforces B2B rules:
 * - Print = "1" (physical print required by law)
 * - Donation = "0"
 * - CarrierType = "" (empty)
 */
export async function issueInvoice(
  invoiceData: InvoiceIssueData,
): Promise<InvoiceIssueResponseData> {
  const config = invoiceConfig();

  // Enforce B2B VAT rules
  if (invoiceData.CustomerIdentifier) {
    invoiceData.Print = "1";
    invoiceData.Donation = "0";
    invoiceData.CarrierType = "";
    invoiceData.CarrierNum = "";
  }

  const data: Record<string, unknown> = {
    MerchantID: config.merchantId,
    RelateNumber: invoiceData.RelateNumber,
    CustomerID: invoiceData.CustomerID ?? "",
    CustomerIdentifier: invoiceData.CustomerIdentifier ?? "",
    CustomerName: invoiceData.CustomerName ?? "",
    CustomerAddr: invoiceData.CustomerAddr ?? "",
    CustomerPhone: invoiceData.CustomerPhone ?? "",
    CustomerEmail: invoiceData.CustomerEmail ?? "",
    Print: invoiceData.Print,
    Donation: invoiceData.Donation,
    LoveCode: invoiceData.LoveCode ?? "",
    CarrierType: invoiceData.CarrierType ?? "",
    CarrierNum: invoiceData.CarrierNum ?? "",
    TaxType: invoiceData.TaxType,
    SalesAmount: invoiceData.SalesAmount,
    InvoiceRemark: invoiceData.InvoiceRemark ?? "",
    InvType: invoiceData.InvType,
    vat: invoiceData.vat ?? "1",
    Items: formatInvoiceItems(invoiceData.Items),
  };

  if (invoiceData.ClearanceMark) data.ClearanceMark = invoiceData.ClearanceMark;

  const request = buildInvoiceRequest(data, config);

  const url = `${invoiceBaseUrl()}${INVOICE_ENDPOINTS.issue}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = (await res.text()).slice(0, 200);
    throw new Error(`OPay Invoice API returned non-JSON (HTTP ${res.status}): ${text}`);
  }

  const envelope = (await res.json()) as InvoiceApiResponse;
  if (envelope.TransCode !== 1) {
    throw new Error(`Invoice Issue transport failed: [${envelope.TransCode}] ${envelope.TransMsg}`);
  }

  const responseData = aesDecrypt<InvoiceIssueResponseData>(
    envelope.Data,
    config.hashKey,
    config.hashIV,
    { invoiceMode: true },
  );

  if (responseData.RtnCode !== 1) {
    throw new Error(`Invoice Issue failed: [${responseData.RtnCode}] ${responseData.RtnMsg}`);
  }

  return responseData;
}

/**
 * Void (invalidate) an existing e-invoice.
 */
export async function voidInvoice(
  voidData: InvoiceVoidData,
): Promise<InvoiceVoidResponseData> {
  const config = invoiceConfig();

  const data: Record<string, unknown> = {
    MerchantID: config.merchantId,
    InvoiceNo: voidData.InvoiceNo,
    InvoiceDate: voidData.InvoiceDate,
    Reason: voidData.Reason,
  };

  const request = buildInvoiceRequest(data, config);

  const url = `${invoiceBaseUrl()}${INVOICE_ENDPOINTS.invalid}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const voidContentType = res.headers.get("content-type") ?? "";
  if (!voidContentType.includes("application/json")) {
    const text = (await res.text()).slice(0, 200);
    throw new Error(`OPay Invoice API returned non-JSON (HTTP ${res.status}): ${text}`);
  }

  const envelope = (await res.json()) as InvoiceApiResponse;
  if (envelope.TransCode !== 1) {
    throw new Error(`Invoice Void transport failed: [${envelope.TransCode}] ${envelope.TransMsg}`);
  }

  const responseData = aesDecrypt<InvoiceVoidResponseData>(
    envelope.Data,
    config.hashKey,
    config.hashIV,
    { invoiceMode: true },
  );

  if (responseData.RtnCode !== 1) {
    throw new Error(`Invoice Void failed: [${responseData.RtnCode}] ${responseData.RtnMsg}`);
  }

  return responseData;
}
