import { LOCAL_API_BASE, PRODUCTION_API_BASE } from "./constants.js";

/** Resolved once — stores the base URL chosen for this session. */
let _resolvedBase = null;
let _resolvePromise = null;

const LOCAL_HEALTH_MS = 2500;

function fetchLocalHealth() {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), LOCAL_HEALTH_MS);
  return fetch(`${LOCAL_API_BASE}/health`, { method: "GET", signal: ctrl.signal }).finally(
    () => clearTimeout(id)
  );
}

/** Ngrok free tier may return an HTML warning page unless this header is set. */
function headersForApiUrl(url, initHeaders) {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return { ...initHeaders };
  }
  const base = { ...initHeaders };
  if (/ngrok/i.test(host)) {
    base["ngrok-skip-browser-warning"] = "1";
  }
  return base;
}

/**
 * Probe localhost (short timeout); if healthy use it, otherwise fall back to production.
 * The result is cached for the lifetime of the service worker.
 */
function resolveBase() {
  if (_resolvedBase) return Promise.resolve(_resolvedBase);
  if (_resolvePromise) return _resolvePromise;

  _resolvePromise = fetchLocalHealth()
    .then((res) => {
      if (res.ok) {
        _resolvedBase = LOCAL_API_BASE;
      } else {
        _resolvedBase = PRODUCTION_API_BASE;
      }
      return _resolvedBase;
    })
    .catch(() => {
      _resolvedBase = PRODUCTION_API_BASE;
      return _resolvedBase;
    });

  return _resolvePromise;
}

/**
 * @param {string} path - e.g. "/health"
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init) {
  const base = (await resolveBase()).replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: headersForApiUrl(url, {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    }),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Exposed so the service worker can log which base was chosen. */
export async function getResolvedBase() {
  return resolveBase();
}

export function getHealth() {
  return apiFetch("/health");
}

export function postAccountLookup(accountNumber) {
  return apiFetch("/api/accounts/lookup", {
    method: "POST",
    body: JSON.stringify({ accountNumber }),
  });
}

export function getAccountRecibos(accountNumber) {
  const safe = encodeURIComponent(String(accountNumber || "").trim());
  return apiFetch(`/api/accounts/${safe}/recibos`);
}
