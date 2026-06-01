/**
 * Production API endpoint.
 */
export const PRODUCTION_API_BASE = "https://www.apa-asistente.site/extension-api";

/**
 * Local: extension API only via Caddy (port must match stack/.env CADDY_HTTP_PORT, default 8080).
 */
export const LOCAL_API_BASE = "http://127.0.0.1:8080/extension-api";
