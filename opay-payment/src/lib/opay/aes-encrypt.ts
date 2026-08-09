/**
 * AES-128-CBC encryption with PKCS7 padding for OPay TWQR and E-Invoice APIs.
 *
 * Algorithm (from OPay TWQR spec Appendix 2):
 * Encrypt:
 *   1. Take JSON string as plaintext
 *   2. AES-128-CBC encrypt (key = HashKey as UTF-8 16 bytes, IV = HashIV as UTF-8 16 bytes)
 *   3. PKCS7 padding (default for Node.js crypto aes-128-cbc)
 *   4. Base64 encode the ciphertext
 *   5. URL-encode the Base64 string
 *
 * Decrypt (for parsing responses):
 *   1. URL-decode
 *   2. Base64 decode
 *   3. AES-128-CBC decrypt
 *   4. Parse JSON
 */
import { createCipheriv, createDecipheriv } from "crypto";
import { dotnetUrlDecode } from "./url-encode";

const ALGORITHM = "aes-128-cbc";

/**
 * Encrypt a JSON-serializable object for OPay API requests.
 * Returns a URL-encoded Base64 string ready to use as the "Data" field.
 */
export function aesEncrypt(data: unknown, hashKey: string, hashIV: string): string {
  const json = typeof data === "string" ? data : JSON.stringify(data);
  const key = Buffer.from(hashKey, "utf8");
  const iv = Buffer.from(hashIV, "utf8");

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(json, "utf8", "base64");
  encrypted += cipher.final("base64");

  // URL-encode the Base64 string
  return encodeURIComponent(encrypted);
}

/**
 * Decrypt an OPay API response "Data" field.
 * Input is URL-encoded Base64; returns the parsed JSON object.
 */
export function aesDecrypt<T = unknown>(encrypted: string, hashKey: string, hashIV: string): T {
  // URL-decode first
  const base64 = dotnetUrlDecode(encrypted);
  const key = Buffer.from(hashKey, "utf8");
  const iv = Buffer.from(hashIV, "utf8");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(base64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted) as T;
}
