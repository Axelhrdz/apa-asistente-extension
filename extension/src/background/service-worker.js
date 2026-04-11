import { getHealth } from "../lib/api-client.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[APA Asistente] Extension installed");
});

/**
 * Optional: ping API on startup to verify connectivity during development.
 */
getHealth()
  .then((body) => console.log("[APA Asistente] API health:", body))
  .catch((err) => console.warn("[APA Asistente] API unreachable:", err.message));
