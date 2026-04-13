import "./bootstrap-env.js";
import { config } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`APA asistente extension listening on: http://localhost:${config.port}`);
});
