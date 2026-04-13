#!/usr/bin/env node
/**
 * Loads excel-files/accounts_rec_banios.xlsx into MongoDB.
 *
 * Usage (from repo root or backend/):
 *   cd backend && npm run import:excel
 *
 * Requires backend/.env with MONGODB_URI (Atlas connection string).
 * Options:
 *   --drop   Drop the target collection before import (full refresh)
 *
 * `clave_apa` is normalized to 9 digits with leading zeros (Excel often drops them).
 *
 * Env:
 *   MONGODB_URI
 *   MONGO_DB_NAME          (default: apa_asistente)
 *   MONGO_COLLECTION_ACCOUNTS (default: accounts_rec_banios)
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import XLSX from "xlsx";
import { normalizeClaveApa } from "../src/lib/claveApa.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const EXCEL_REL = path.join(__dirname, "../../excel-files/accounts_rec_banios.xlsx");

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME || "apa_asistente";
const collectionName =
  process.env.MONGO_COLLECTION_ACCOUNTS || "accounts_rec_banios";

const BATCH = 4000;

function normalizeRow(row) {
  const clave = normalizeClaveApa(row.clave_apa);
  if (!clave) return null;
  return {
    clave_apa: clave,
    tipo_tarifa_old: row.tipo_tarifa_old ?? null,
    tipo_tarifa_new: row.tipo_tarifa_new ?? null,
    rec_old: row.rec_old ?? null,
    rec_new: row.rec_new ?? null,
    banios_old: row.banios_old ?? null,
    banios_new: row.banios_new ?? null,
    importedAt: new Date(),
  };
}

async function main() {
  const dropFirst = process.argv.includes("--drop");

  if (!mongoUri) {
    console.error("Missing MONGODB_URI in environment (set it in backend/.env).");
    process.exit(1);
  }

  const wb = XLSX.readFile(EXCEL_REL);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const docs = [];
  for (const row of rows) {
    const doc = normalizeRow(row);
    if (doc) docs.push(doc);
  }

  console.log(`Parsed ${docs.length} documents from Excel (${rows.length} rows).`);

  const client = new MongoClient(mongoUri);
  await client.connect();
  const coll = client.db(dbName).collection(collectionName);

  try {
    if (dropFirst) {
      await coll.drop().catch(() => {});
      console.log(`Dropped collection ${dbName}.${collectionName}`);
    }

    for (let i = 0; i < docs.length; i += BATCH) {
      const chunk = docs.slice(i, i + BATCH);
      await coll.insertMany(chunk, { ordered: false });
      console.log(`Inserted ${Math.min(i + BATCH, docs.length)} / ${docs.length}`);
    }

    await coll.createIndex({ clave_apa: 1 }, { unique: true });
    console.log("Created unique index on clave_apa.");
  } finally {
    await client.close();
  }

  console.log("Import finished.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
