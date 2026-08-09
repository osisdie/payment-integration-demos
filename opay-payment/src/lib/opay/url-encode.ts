/**
 * OPay-specific URL encoding compatible with .NET's HttpUtility.UrlEncode.
 *
 * Key differences from JavaScript's encodeURIComponent:
 * - Space → "+" (not "%20")
 * - "~" is NOT encoded (encodeURIComponent doesn't encode it either, but just to be safe)
 * - Hex digits are lowercase: "%2f" (not "%2F")
 * - "!" → "%21", "*" → "%2a", "(" → "%28", ")" → "%29"
 *
 * Reference: OPay E-Invoice spec Appendix 2 (page 143).
 */
export function dotnetUrlEncode(value: string): string {
  // Start with encodeURIComponent which encodes everything except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
  let encoded = encodeURIComponent(value);

  // encodeURIComponent does NOT encode: ! ' ( ) * ~
  // .NET's UrlEncode DOES encode: ! ( ) *
  // .NET's UrlEncode does NOT encode: ~ ' (apostrophe → left as-is in most .NET versions)
  encoded = encoded
    .replace(/!/g, "%21")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2a");

  // encodeURIComponent encodes space as %20; .NET encodes space as +
  encoded = encoded.replace(/%20/g, "+");

  // .NET uses lowercase hex digits
  encoded = encoded.replace(/%[0-9A-F]{2}/g, (match) => match.toLowerCase());

  return encoded;
}

/**
 * Decode OPay's URL-encoded values back to plain text.
 * Reverses dotnetUrlEncode: "+" → space, then standard decodeURIComponent.
 */
export function dotnetUrlDecode(value: string): string {
  const withSpaces = value.replace(/\+/g, " ");
  return decodeURIComponent(withSpaces);
}
