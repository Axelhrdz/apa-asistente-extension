import { getConfiguredApiBase, postAccountLookup } from "../lib/api.js";
import { renderCuentaRecord } from "../lib/render-cuenta.js";
import { getQueryParam } from "../lib/url-params.js";

const PAGE_TITLE = "Información de cuenta";

function setApiBaseLabel() {
  const el = document.getElementById("apa-dev-api-base");
  if (el) {
    el.textContent = getConfiguredApiBase();
  }
}

function setStatus(className, message) {
  const el = document.getElementById("cuenta-status");
  if (!el) return;
  if (!message && !className) {
    el.className = "cuenta-status";
    el.textContent = "";
    el.hidden = true;
    return;
  }
  el.className = `cuenta-status ${className}`;
  el.textContent = message;
  el.hidden = false;
}

/**
 * Renders the account view from the `clave` query string (set by the ingreso form).
 * Loads características + recibos from the extension API (Mongo on the Linux host).
 */
export function mountInformacionCuenta() {
  document.title = PAGE_TITLE;
  setApiBaseLabel();

  const clave = getQueryParam("clave").trim();
  const displayEl = document.getElementById("account-clave-display");
  if (displayEl) {
    displayEl.textContent = clave || "—";
  }

  const contentEl = document.getElementById("cuenta-content");
  if (!contentEl) return;

  if (!clave) {
    setStatus(
      "cuenta-status--error",
      "Falta la clave en la URL. Vuelve al inicio e ingresa una clave APA."
    );
    return;
  }

  setStatus("cuenta-status--loading", "Consultando el servidor local…");
  contentEl.innerHTML = "";

  postAccountLookup(clave)
    .then((body) => {
      const record = body?.data;
      if (!record) {
        setStatus("cuenta-status--error", "Respuesta vacía del servidor.");
        return;
      }
      setStatus(null, null);
      renderCuentaRecord(contentEl, record);
    })
    .catch((err) => {
      const hint =
        err.status === 501
          ? " Revisa MONGODB_URI en backend/.env y reinicia el contenedor del API."
          : "";
      setStatus(
        "cuenta-status--error",
        `${err.message || "No se pudo cargar la cuenta."}${hint}`
      );
    });
}
