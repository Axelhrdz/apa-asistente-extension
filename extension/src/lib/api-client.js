import { DEFAULT_API_BASE } from "./constants.js";

/**
 * @param {string} path - e.g. "/health"
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init) {
  const base = DEFAULT_API_BASE.replace(/\/$/, "");
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

export function getHealth() {
  return apiFetch("/health");
}

export function postAccountLookup(accountNumber) {
  return apiFetch("/api/accounts/lookup", {
    method: "POST",
    body: JSON.stringify({ accountNumber }),
  });
}
