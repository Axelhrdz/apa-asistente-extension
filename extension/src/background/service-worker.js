import { getAccountRecibos, getHealth, getResolvedBase, postAccountLookup } from "../lib/api-client.js";
import { MESSAGE_TYPES } from "../lib/messages.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[APA Asistente] Extension installed");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGE_TYPES.LOOKUP_ACCOUNT && message.clave) {
    postAccountLookup(String(message.clave).trim())
      .then((body) => {
        sendResponse({ ok: true, body });
      })
      .catch((err) => {
        sendResponse({
          ok: false,
          message: err.message,
          status: err.status,
          data: err.data,
        });
      });
    return true;
  }

  if (message?.type === MESSAGE_TYPES.LOOKUP_RECIBOS && message.clave) {
    getAccountRecibos(String(message.clave).trim())
      .then((body) => {
        sendResponse({ ok: true, body });
      })
      .catch((err) => {
        sendResponse({
          ok: false,
          message: err.message,
          status: err.status,
          data: err.data,
        });
      });
    return true;
  }
  return undefined;
});

getResolvedBase()
  .then((base) => {
    console.log(`[APA Asistente] Using backend → ${base}`);
    return getHealth();
  })
  .then((body) => console.log("[APA Asistente] API health:", body))
  .catch((err) => console.warn("[APA Asistente] API unreachable:", err.message));
