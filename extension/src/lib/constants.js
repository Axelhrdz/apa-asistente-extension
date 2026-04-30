/**
 * Remote fallback when the local Caddy probe fails (api-client.js).
 * Use the same path layout as production Caddy: .../extension-api (no trailing slash).
 * Examples:
 *   https://apa-asistente.site/extension-api
 *   https://xxxx.ngrok-free.app/extension-api
 * Bare host APIs (no /extension-api prefix) — use the full origin only if your deploy matches.
 */
// export const PRODUCTION_API_BASE = "https://express-deploy-test-kbkd.onrender.com";
export const PRODUCTION_API_BASE = "https://jalapeno-spout-backrest.ngrok-free.dev/extension-api";

/**
 * Local: extension API only via Caddy (port must match stack/.env CADDY_HTTP_PORT, default 8080).
 */
export const LOCAL_API_BASE = "http://127.0.0.1:8080/extension-api";
