import { getRecibosCollection } from "../lib/mongo.js";

export const reciboRepository = {
  /**
   * @param {string} claveApa - normalized 9-digit clave_apa
   * @returns {Promise<object[]>}
   */
  async findManyByClaveApa(claveApa) {
    if (!claveApa) return [];

    const coll = await getRecibosCollection();
    if (!coll) return [];

    return coll.find({ clave_apa: claveApa }).sort({ fec_recibo: -1, _id: -1 }).toArray();
  },
};
