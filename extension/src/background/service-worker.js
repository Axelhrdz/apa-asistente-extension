import { getAccountRecibos, getHealth, getPadronOld, getResolvedBase, postAccountLookup } from "../lib/api-client.js";
import { MESSAGE_TYPES } from "../lib/messages.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[APA Asistente] Extension installed");
});

console.log("testing auto update script locally");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGE_TYPES.LOOKUP_ACCOUNT && message.clave) {
    const clave = String(message.clave).trim();
    Promise.all([postAccountLookup(clave), getResolvedBase()])
      .then(([body, apiBase]) => {
        sendResponse({ ok: true, body, apiBase });
      })
      .catch((err) => {
        getResolvedBase()
          .then((apiBase) => {
            sendResponse({
              ok: false,
              message: err.message,
              status: err.status,
              data: err.data,
              apiBase,
            });
          })
          .catch(() => {
            sendResponse({
              ok: false,
              message: err.message,
              status: err.status,
              data: err.data,
            });
          });
      });
    return true;
  }

  if (message?.type === MESSAGE_TYPES.LOOKUP_RECIBOS && message.clave) {
    const clave = String(message.clave).trim();
    Promise.all([getAccountRecibos(clave), getResolvedBase()])
      .then(([body, apiBase]) => {
        sendResponse({ ok: true, body, apiBase });
      })
      .catch((err) => {
        getResolvedBase()
          .then((apiBase) => {
            sendResponse({
              ok: false,
              message: err.message,
              status: err.status,
              data: err.data,
              apiBase,
            });
          })
          .catch(() => {
            sendResponse({
              ok: false,
              message: err.message,
              status: err.status,
              data: err.data,
            });
          });
      });
    return true;
  }

  if (message?.type === MESSAGE_TYPES.LOOKUP_PADRON_OLD && message.clave) {
    const clave = String(message.clave).trim();
    Promise.all([getPadronOld(clave), getResolvedBase()])
      .then(([body, apiBase]) => {
        sendResponse({ ok: true, body, apiBase });
      })
      .catch((err) => {
        getResolvedBase()
          .then((apiBase) => {
            sendResponse({
              ok: false,
              message: err.message,
              status: err.status,
              data: err.data,
              apiBase,
            });
          })
          .catch(() => {
            sendResponse({
              ok: false,
              message: err.message,
              status: err.status,
              data: err.data,
            });
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
