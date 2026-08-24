/**
 * TypeScript interfaces for all OPay API request/response shapes.
 */

// ─── AIO (All-In-One) Payment ─────────────────────────────────────

export interface AioCheckoutParams {
  MerchantID: string;
  MerchantTradeNo: string;
  MerchantTradeDate: string; // yyyy/MM/dd HH:mm:ss
  PaymentType: "aio";
  TotalAmount: number; // integer TWD
  TradeDesc: string;
  ItemName: string; // multiple items separated by "#"
  ReturnURL: string; // server callback URL
  ChoosePayment: "Credit" | "WebATM" | "ATM" | "CVS" | "Barcode" | "TWQR" | "BNPL" | "ALL";
  EncryptType: 1;
  // Optional
  OrderResultURL?: string; // client redirect after payment
  ClientBackURL?: string;
  PlatformID?: string;
  CustomField1?: string;
  CustomField2?: string;
  CustomField3?: string;
  CustomField4?: string;
  // Credit card specific
  CreditInstallment?: string; // "3,6,12,18,24,30"
  BindingCard?: 0 | 1;
  MerchantMemberID?: string;
  Language?: "ENG" | "KOR" | "JPN" | "CHI";
  Redeem?: "Y" | "N";
  UnionPay?: 0 | 1 | 2;
}

export interface AioCallbackPayload {
  MerchantID: string;
  MerchantTradeNo: string;
  RtnCode: string; // "1" = success
  RtnMsg: string;
  TradeNo: string;
  TradeAmt: string;
  PaymentDate: string;
  PaymentType: string;
  TradeDate: string;
  SimulatePaid: string; // "0" = real, "1" = simulated
  CheckMacValue: string;
  CustomField1?: string;
  CustomField2?: string;
  CustomField3?: string;
  CustomField4?: string;
}

export interface QueryTradeParams {
  MerchantID: string;
  MerchantTradeNo: string;
  TimeStamp: number; // unix timestamp
  PlatformID?: string;
}

export interface QueryTradeResponse {
  MerchantID: string;
  MerchantTradeNo: string;
  TradeNo: string;
  TradeAmt: string;
  PaymentDate: string;
  PaymentType: string;
  HandlingCharge: string;
  PaymentTypeChargeFee: string;
  TradeDate: string;
  TradeStatus: string; // "1" = paid
  CheckMacValue: string;
}

// ─── DoAction (Refund / Capture / Void) ─────────────────────────

export type DoActionType = "C" | "R" | "E" | "N";
// C = Close/Capture (請款)
// R = Refund (退款)
// E = Cancel Authorization (取消授權)
// N = Void Capture (放棄請款)

export interface DoActionParams {
  MerchantID: string;
  MerchantTradeNo: string;
  TradeNo: string;
  Action: DoActionType;
  TotalAmount: number;
  PlatformID?: string;
}

export interface DoActionResponse {
  MerchantID: string;
  MerchantTradeNo: string;
  TradeNo: string;
  RtnCode: string;
  RtnMsg: string;
}

// ─── TWQR (Dynamic QR Code) ────────────────────────────────────

export interface TwqrCreateParams {
  MerchantID: string;
  MerchantTradeNo: string; // max 64 chars
  TradeAmt: number;
  StoreID?: string;
  ReturnURL?: string;
  ExpireTime?: number; // minutes, max 30
  CheckMacValue?: string;
}

export interface TwqrCreateResponseData {
  RtnCode: number;
  RtnMsg: string;
  MerchantID: string;
  MerchantTradeNo: string;
  TradeNo: string;
  TradeAmt: number;
  TWQRCode: string; // QR code content
  ExpireDate: string; // yyyy/MM/dd HH:mm:ss
  CheckMacValue: string;
}

export interface TwqrCallbackData {
  MerchantID: string;
  PlatformID?: string;
  StoreID?: string;
  TradeNo: string;
  MerchantTradeNo: string;
  RefundNo?: string;
  CreateDate: string;
  IssCode?: string;
  IssName?: string;
  Status: string; // "1"=paid, "2"=full refund, "3"=partial refund, "4"=failed
  TradeDate: string;
  TradeAmt: number;
  RefundAmt?: number;
  CheckMacValue: string;
}

export interface TwqrQueryResponseData {
  MerchantID: string;
  TradeNo: string;
  MerchantTradeNo: string;
  TradeStatus: string; // "0"=unpaid, "1"=paid, "2"=full refund, "3"=partial refund, "4"=failed
  TradeAmt: number;
  TradeDate: string | null;
  ExpireDate: string;
  CheckMacValue: string;
}

export interface TwqrChargebackParams {
  MerchantID: string;
  TradeNo: string;
  MerchantTradeNo: string;
  RefundAmt: number;
  CheckMacValue?: string;
}

// ─── TWQR API Envelope ─────────────────────────────────────────

export interface TwqrApiRequest {
  PlatformID?: string;
  MerchantID: string;
  Version: 1;
  Data: string; // AES-encrypted JSON
}

export interface TwqrApiResponse {
  PlatformID?: string;
  MerchantID: string;
  RtnCode: number;
  RtnMsg: string;
  Data: string; // AES-encrypted JSON (only when RtnCode=1)
}

// ─── E-Invoice ──────────────────────────────────────────────────

export interface InvoiceItem {
  ItemSeq?: number;
  ItemName: string;
  ItemCount: number;
  ItemWord: string; // unit (e.g. "個", "件")
  ItemPrice: number;
  ItemTaxType?: string;
  ItemAmount: number;
  ItemRemark?: string;
}

export interface InvoiceIssueData {
  MerchantID: string;
  RelateNumber: string; // unique, max 30 chars
  CustomerID?: string;
  CustomerIdentifier?: string; // 8-digit VAT number (統一編號) for B2B
  CustomerName?: string;
  CustomerAddr?: string;
  CustomerPhone?: string;
  CustomerEmail?: string;
  ClearanceMark?: "1" | "2";
  Print: "0" | "1"; // 1 = required when CustomerIdentifier is set
  Donation: "0" | "1";
  LoveCode?: string;
  CarrierType?: "" | "1" | "2" | "3";
  CarrierNum?: string;
  TaxType: "1" | "2" | "3" | "9"; // 1=taxed, 2=zero-rate, 3=tax-free, 9=mixed
  SalesAmount: number;
  InvoiceRemark?: string;
  Items: InvoiceItem[];
  InvType: "07" | "08"; // 07=general, 08=special
  vat?: "1" | "0"; // 1=tax-included (default)
}

export interface InvoiceIssueResponseData {
  RtnCode: number;
  RtnMsg: string;
  InvoiceNo: string; // e.g. "UV11100012"
  InvoiceDate: string; // yyyy-MM-dd HH:mm:ss
  RandomNumber: string; // 4 digits
}

export interface InvoiceVoidData {
  MerchantID: string;
  InvoiceNo: string;
  InvoiceDate: string;
  Reason: string;
}

export interface InvoiceVoidResponseData {
  RtnCode: number;
  RtnMsg: string;
  InvoiceNo: string;
}

export interface InvoiceApiRequest {
  MerchantID: string;
  RqHeader: { Timestamp: number };
  Data: string; // AES-encrypted JSON
}

export interface InvoiceApiResponse {
  MerchantID: string;
  RpHeader: { Timestamp: number };
  TransCode: number; // 1 = success
  TransMsg: string;
  Data: string; // AES-encrypted JSON
}

// ─── Report ─────────────────────────────────────────────────────

export interface FundingReconParams {
  MerchantID: string;
  PaymentDateS: string; // start date yyyy-MM-dd
  PaymentDateE: string; // end date yyyy-MM-dd
  PaymentType?: string;
  MediaFormated?: string;
  PlatformID?: string;
}
