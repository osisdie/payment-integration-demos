/**
 * HMAC-SHA256 CheckMacValue generation for OPay APIs (AIO, TWQR, E-Invoice).
 *
 * Algorithm (from OPay TWQR spec Appendix 1):
 * 1. Sort all parameters alphabetically by key (A→Z)
 * 2. Join as "key=value" with "&"
 * 3. Prepend "HashKey={hashKey}&"
 * 4. Append "&HashIV={hashIV}"
 * 5. URL-encode entire string (using .NET-compatible encoding)
 * 6. Lowercase everything
 * 7. SHA256 hash
 * 8. Uppercase the hex result
 */
import { createHash } from "crypto";
import { dotnetUrlEncode } from "./url-encode";

export function generateCheckMacValue(
  params: Record<string, string | number>,
  hashKey: string,
  hashIV: string,
): string {
  // 1. Sort alphabetically by key
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  // 2-3. Prepend HashKey, append HashIV
  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;

  // 4. URL-encode (OPay/.NET compatible)
  const encoded = dotnetUrlEncode(raw);

  // 5. Lowercase
  const lowered = encoded.toLowerCase();

  // 6. SHA256 hash → uppercase hex
  return createHash("sha256").update(lowered, "utf8").digest("hex").toUpperCase();
}

/**
 * Verify a CheckMacValue received from OPay (callbacks, responses).
 * Extracts CheckMacValue from params, computes expected value, and compares.
 */
export function verifyCheckMacValue(
  params: Record<string, string | number>,
  hashKey: string,
  hashIV: string,
): boolean {
  const received = String(params.CheckMacValue ?? "");
  if (!received) return false;

  // Compute without the CheckMacValue field itself
  const paramsWithout: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== "CheckMacValue") {
      paramsWithout[key] = value;
    }
  }

  const expected = generateCheckMacValue(paramsWithout, hashKey, hashIV);
  return expected === received;
}
