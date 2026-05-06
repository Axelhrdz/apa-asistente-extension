/**
 * Central place for environment-derived settings.
 * Add validation here as the API surface grows.
 */
function parseAllowedOrigins(raw) {
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCollectionNames(raw, fallback) {
  const names = (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return names.length > 0 ? names : [fallback];
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),

  mongoUri: process.env.MONGODB_URI || null,
  mongoDbName: process.env.MONGO_DB_NAME || "apa_asistente_extension",
  mongoDbNameWeb: process.env.MONGO_DB_NAME_WEB || "apa_db",

  mongoCollectionAccounts:
    process.env.MONGO_COLLECTION_ACCOUNTS || "accounts_rec_banios",
  mongoCollectionRecibos:
    process.env.MONGO_COLLECTION_RECIBOS || "recibos_agua_2025",
  mongoCollectionRecibosList: parseCollectionNames(
    process.env.MONGO_COLLECTION_RECIBOS,
    "recibos_agua_2025"
  ),

  //Mongo collections for web app
  // NOTE: MongoDB internally converts "apa-db" to "apa_db" but we must use the original name
  mongoDbNamePadron: process.env.MONGO_DB_NAME_PADRON || "apa-db",
  mongoCollectionPadronOld: process.env.MONGO_COLLECTION_PADRON_OLD || "padron_old",
  mongoCollectionUsers: process.env.MONGO_COLLECTION_USERS || "users",
};
