import { getRecibosCollections } from "../lib/mongo.js";

export const reciboRepository = {
  /**
   * @param {string} claveApa - normalized 9-digit clave_apa
   * @returns {Promise<object[]>}
   */
  async findManyByClaveApa(claveApa) {
    if (!claveApa) return [];

    const colls = await getRecibosCollections();
    if (!Array.isArray(colls) || colls.length === 0) return [];

    const batches = await Promise.all(
      colls.map((coll) =>
        coll.find({ clave_apa: claveApa }).sort({ fec_recibo: -1, _id: -1 }).toArray()
      )
    );
    const merged = batches.flat();
    merged.sort((a, b) => {
      const aDate = a?.fec_recibo ? new Date(a.fec_recibo).getTime() : 0;
      const bDate = b?.fec_recibo ? new Date(b.fec_recibo).getTime() : 0;
      if (aDate !== bDate) return bDate - aDate;
      return String(b?._id || "").localeCompare(String(a?._id || ""));
    });
    return merged;
  },
};
