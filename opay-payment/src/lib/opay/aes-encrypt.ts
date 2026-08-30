/**
 * AES-128-CBC encryption with PKCS7 padding for OPay APIs.
 *
 * TWQR and E-Invoice use different URL-encoding sequences:
 *
 * TWQR (default):
 *   Encrypt: JSON → AES → Base64 → URL encode
 *   Decrypt: URL decode → Base64 → AES → JSON parse
 *
 * E-Invoice (invoiceMode):
 *   Encrypt: JSON → URL encode → AES → Base64
 *   Decrypt: Base64 → AES → URL decode → JSON parse
 */
import { createCipheriv, createDecipheriv } from "crypto";
import { dotnetUrlDecode } from "./url-encode";

const ALGORITHM = "aes-128-cbc";

/**
 * Encrypt a JSON-serializable object for OPay API requests.
 *
 * Default (TWQR): JSON → AES → Base64 → URL encode
 * invoiceMode:    JSON → URL encode → AES → Base64
 */
export function aesEncrypt(
  data: unknown,
  hashKey: string,
  hashIV: string,
  options?: { invoiceMode?: boolean },
): string {
  const json = typeof data === "string" ? data : JSON.stringify(data);
  const plaintext = options?.invoiceMode ? encodeURIComponent(json) : json;

  const key = Buffer.from(hashKey, "utf8");
  const iv = Buffer.from(hashIV, "utf8");

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  return options?.invoiceMode ? encrypted : encodeURIComponent(encrypted);
}

/**
 * Decrypt an OPay API response "Data" field.
 *
 * Default (TWQR): URL decode → Base64 → AES → JSON parse
 * invoiceMode:    Base64 → AES → URL decode → JSON parse
 */
export function aesDecrypt<T = unknown>(
  encrypted: string,
  hashKey: string,
  hashIV: string,
  options?: { invoiceMode?: boolean },
): T {
  const base64 = options?.invoiceMode ? encrypted : dotnetUrlDecode(encrypted);

  const key = Buffer.from(hashKey, "utf8");
  const iv = Buffer.from(hashIV, "utf8");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(base64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  const text = options?.invoiceMode ? decodeURIComponent(decrypted) : decrypted;
  return JSON.parse(text) as T;
}
