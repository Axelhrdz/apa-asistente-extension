import { config } from "../config/env.js";
import { getMongoClient } from "./mongo.js";

/** Matches reciboRepository.findManyByClaveApa filter + sort. */
const RECIBOS_INDEX_KEYS = { clave_apa: 1, fec_recibo: -1 };

const ACCOUNTS_INDEX_KEYS = { clave_apa: 1 };

/**
 * Idempotent index setup after restore/migration (metadata indexes are easy to miss).
 * No fixed index `name`: Atlas/restores may use other names for the same key pattern.
 */
export async function ensureIndexes() {
  const cli = await getMongoClient();
  if (!cli) {
    console.warn("[mongo] ensureIndexes skipped: no MONGODB_URI");
    return;
  }

  const db = cli.db(config.mongoDbName);
  const reciboNames = config.mongoCollectionRecibosList || [];

  async function ensureIndex(coll, keys) {
    try {
      await coll.createIndex(keys);
    } catch (err) {
      const msg = String(err?.message || "");
      // Equivalent or auto-named index already present (Atlas / mongorestore / unique).
      if (
        msg.includes("already exists with a different name") ||
        msg.includes("An existing index has the same name as the requested index")
      ) {
        return;
      }
      throw err;
    }
  }

  for (const name of reciboNames) {
    await ensureIndex(db.collection(name), RECIBOS_INDEX_KEYS);
  }

  await ensureIndex(db.collection(config.mongoCollectionAccounts), ACCOUNTS_INDEX_KEYS);

  console.log(
    `[mongo] indexes ensured: ${reciboNames.length} recibo collection(s), accounts`
  );
}
