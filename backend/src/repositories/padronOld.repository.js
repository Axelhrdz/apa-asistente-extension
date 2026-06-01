import { getPadronOldCollection } from "../lib/mongo.js";

export const padronOldRepository = {
  /**
   * @param {string} claveApa - normalized 9-digit clave_apa
   * @returns {Promise<object | null>} - returns the record with saldo and other fields
   */
  async findByClaveApa(claveApa) {
    if (!claveApa) return null;

    const coll = await getPadronOldCollection();
    if (!coll) return null;

    return coll.findOne({ clave_apa: claveApa });
  },
};
