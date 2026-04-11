import { getQueryParam } from "../lib/url-params.js";

const PAGE_TITLE = "Informacion de cuenta";

/**
 * Renders the account view from the `clave` query string (set by the ingreso form).
 */
export function mountInformacionCuenta() {
  document.title = PAGE_TITLE;

  const clave = getQueryParam("clave").trim();
  const el = document.getElementById("account-clave-display");
  if (el) {
    el.textContent = clave;
  }
}
