import { MongoClient } from "mongodb";
import { config } from "../config/env.js";

let client;

export async function getMongoClient() {
  if (!config.mongoUri) return null;
  if (!client) {
    const next = new MongoClient(config.mongoUri);
    await next.connect();
    client = next;
  }
  return client;
}

export async function getAccountsCollection() {
  const cli = await getMongoClient();
  if (!cli) return null;
  const db = cli.db(config.mongoDbName);
  return db.collection(config.mongoCollectionAccounts);
}

export async function getRecibosCollection() {
  const cli = await getMongoClient();
  if (!cli) return null;
  const db = cli.db(config.mongoDbName);
  return db.collection(config.mongoCollectionRecibos);
}

export async function getRecibosCollections() {
  const cli = await getMongoClient();
  if (!cli) return [];
  const db = cli.db(config.mongoDbName);
  return (config.mongoCollectionRecibosList || []).map((name) => db.collection(name));
}

export async function getPadronOldCollection() {
  const cli = await getMongoClient();
  if (!cli) return null;
  console.log("[mongo] Connecting to db:", config.mongoDbNameWeb, "collection:", config.mongoCollectionPadronOld);
  const db = cli.db(config.mongoDbNameWeb);
  console.log("[mongo] Actual db name:", db.databaseName);
  return db.collection(config.mongoCollectionPadronOld);
}
