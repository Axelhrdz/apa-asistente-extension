import { MongoClient } from "mongodb";
import { config } from "../config/env.js";

let client;

export async function getMongoClient() {
  if (!config.mongoUri) return null;
  if (!client) {
    client = new MongoClient(config.mongoUri);
    await client.connect();
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
