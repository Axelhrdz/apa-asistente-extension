import "./bootstrap-env.js";
import { config } from "./config/env.js";
import { createApp } from "./app.js";
import { ensureIndexes } from "./lib/ensure-indexes.js";

ensureIndexes().catch((err) => {
  console.error("[mongo] ensureIndexes failed:", err?.message || err);
});

const app = createApp();

app.listen(config.port, "0.0.0.0", () => {
  console.log(
    `APA extension API listening on: http://0.0.0.0:${config.port} (docker / LAN)`
  );
});
