import { normalizeClaveApa } from "../lib/claveApa.js";
import { accountRepository } from "../repositories/account.repository.js";

function parseAccountNumber(accountNumber) {
  if (accountNumber == null) {
    const err = new Error("accountNumber is required");
    err.status = 400;
    throw err;
  }
  const raw =
    typeof accountNumber === "number" && Number.isFinite(accountNumber)
      ? String(Math.trunc(accountNumber))
      : String(accountNumber).trim();
  if (!raw) {
    const err = new Error("accountNumber is required");
    err.status = 400;
    throw err;
  }
  const normalized = normalizeClaveApa(raw);
  if (!normalized) {
    const err = new Error("accountNumber must contain digits");
    err.status = 400;
    throw err;
  }
  return { raw, normalized };
}

export const accountService = {
  /**
   * @param {unknown} accountNumber
   * @returns {Promise<{ normalized: string, record: object | null }>}
   */
  async lookupAccount(accountNumber) {
    const { normalized } = parseAccountNumber(accountNumber);
    const record = await accountRepository.findByClaveApa(normalized);
    return { normalized, record };
  },
};
