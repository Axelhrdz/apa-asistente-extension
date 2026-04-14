import { normalizeClaveApa } from "../lib/claveApa.js";
import { reciboRepository } from "../repositories/recibo.repository.js";

function normalizeAccountNumber(accountNumber) {
  const normalized = normalizeClaveApa(accountNumber);
  if (!normalized) {
    const err = new Error("accountNumber must contain digits");
    err.status = 400;
    throw err;
  }
  return normalized;
}

/** Convert BSON Decimal128 wrappers to plain numbers for JSON serialization. */
function sanitizeRecibo(doc) {
  const out = { ...doc };
  for (const [key, val] of Object.entries(out)) {
    if (val && typeof val === "object" && val.constructor?.name === "Decimal128") {
      out[key] = parseFloat(val.toString());
    }
  }
  return out;
}

export const reciboService = {
  /**
   * @param {unknown} accountNumber
   * @returns {Promise<{ normalized: string, recibos: object[] }>}
   */
  async lookupRecibosByAccountNumber(accountNumber) {
    const normalized = normalizeAccountNumber(accountNumber);
    const recibos = (await reciboRepository.findManyByClaveApa(normalized)).map(sanitizeRecibo);
    return { normalized, recibos };
  },

  /**
   * @param {string} claveApa
   * @returns {Promise<object[]>}
   */
  async lookupRecibosByClaveApa(claveApa) {
    if (!claveApa) return [];
    return (await reciboRepository.findManyByClaveApa(claveApa)).map(sanitizeRecibo);
  },
};
