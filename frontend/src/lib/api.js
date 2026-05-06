/**
 * Talks to the extension API (Docker/Caddy), not the Vite dev server.
 */
function getExtensionApiBase() {
  const raw = import.meta.env.VITE_EXTENSION_API_BASE;
  if (typeof raw === "string" && raw.trim()) {
    return raw.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8080/extension-api";
}

/**
 * @param {string} accountNumber
 * @returns {Promise<object>} API JSON body (expects `{ data: record }`)
 */
export async function postAccountLookup(accountNumber) {
  const base = getExtensionApiBase();
  const res = await fetch(`${base}/api/accounts/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ accountNumber }),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg =
      body?.message ||
      body?.error ||
      `Error ${res.status} al consultar la cuenta`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export function getConfiguredApiBase() {
  return getExtensionApiBase();
}

/**
 * @param {string} accountNumber
 * @returns {Promise<object>} API JSON body (expects `{ data: record }`)
 */
export async function getPadronOld(accountNumber) {
  const base = getExtensionApiBase();
  const safe = encodeURIComponent(String(accountNumber || "").trim());
  const res = await fetch(`${base}/api/accounts/${safe}/padron-old`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg =
      body?.message ||
      body?.error ||
      `Error ${res.status} al consultar el padrón`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
