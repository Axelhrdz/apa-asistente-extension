/** APA account key length in the Excel / MongoDB dataset */
export const CLAVE_APA_LENGTH = 9;

/**
 * Normalize a clave to exactly 9 digits, padding with leading zeros.
 * Excel often stores accounts as numbers, which drops leading zeros — this restores them.
 *
 * @param {unknown} value - cell value or API input
 * @returns {string | null} 9-digit string, or null if no digits
 */
export function normalizeClaveApa(value) {
  if (value == null || value === "") return null;

  let s =
    typeof value === "number" && Number.isFinite(value)
      ? String(Math.trunc(value))
      : String(value).trim();

  if (!s) return null;

  const digits = s.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length > CLAVE_APA_LENGTH) {
    return digits.slice(-CLAVE_APA_LENGTH);
  }
  return digits.padStart(CLAVE_APA_LENGTH, "0");
}
