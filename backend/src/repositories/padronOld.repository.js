import { getPadronOldCollection } from "../lib/mongo.js";

export const padronOldRepository = {
  /**
   * @param {string} claveApa - normalized 9-digit clave_apa
   * @returns {Promise<object | null>} - returns the record with saldo and other fields
   */
  async findByClaveApa(claveApa) {
    if (!claveApa) {
      console.log("[padronOld] claveApa is empty/null");
      return null;
    }

    const coll = await getPadronOldCollection();
    if (!coll) {
      console.log("[padronOld] collection is null - check MongoDB connection");
      return null;
    }

    console.log("[padronOld] querying with clave_apa:", claveApa, "type:", typeof claveApa);
    console.log("[padronOld] collection name:", coll.collectionName);
    console.log("[padronOld] db name:", coll.db?.databaseName || coll.conn?.db?.databaseName);

    const query = {
      $or: [
        { clave_apa: claveApa },
        { clave_apa: parseInt(claveApa, 10) },
      ]
    };
    console.log("[padronOld] query:", JSON.stringify(query));

    const record = await coll.findOne(query);
    console.log("[padronOld] record found:", record ? "YES" : "NO");

    if (!record) {
      const count = await coll.countDocuments();
      console.log("[padronOld] total docs in collection:", count);
      const sample = await coll.findOne();
      console.log("[padronOld] sample doc:", sample ? JSON.stringify({ clave_apa: sample.clave_apa, type: typeof sample.clave_apa }) : "none");
    }

    return record;
  },
};
