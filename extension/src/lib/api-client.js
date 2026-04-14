import { LOCAL_API_BASE, PRODUCTION_API_BASE } from "./constants.js";

/** Resolved once — stores the base URL chosen for this session. */
let _resolvedBase = null;
let _resolvePromise = null;

/**
 * Probe localhost; if healthy use it, otherwise fall back to production.
 * The result is cached for the lifetime of the service worker.
 */
function resolveBase() {
  if (_resolvedBase) return Promise.resolve(_resolvedBase);
  if (_resolvePromise) return _resolvePromise;

  _resolvePromise = fetch(`${LOCAL_API_BASE}/health`, { method: "GET" })
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
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
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
