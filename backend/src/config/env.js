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

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  mongoUri: process.env.MONGODB_URI || null,
  mongoDbName: process.env.MONGO_DB_NAME || "apa_asistente_extension",
  mongoCollectionAccounts:
    process.env.MONGO_COLLECTION_ACCOUNTS || "accounts_rec_banios",
};
