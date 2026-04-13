import { getAccountsCollection } from "../lib/mongo.js";

export const accountRepository = {
  /**
   * @param {string} claveApa - already normalized 9-digit `clave_apa`
   * @returns {Promise<object | null>}
   */
  async findByClaveApa(claveApa) {
    if (!claveApa) return null;

    const coll = await getAccountsCollection();
    if (!coll) return null;

    return coll.findOne({ clave_apa: claveApa });
  },
};
