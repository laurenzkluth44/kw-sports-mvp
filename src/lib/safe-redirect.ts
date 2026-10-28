/**
 * Returns `value` only if it is a same-site path like "/set-password".
 * Rejects absolute URLs, protocol-relative URLs ("//evil.com"), backslash tricks
 * ("/\\evil.com", which browsers treat like "//") and control characters,
 * so auth links can never forward users to another site.
 */
export function getSafeNextPath(value: string | null | undefined, fallback = "/set-password") {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
