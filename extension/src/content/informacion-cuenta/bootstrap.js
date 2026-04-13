/**
 * Content script entry for cuenta.html — reads clave from DOM and asks the
 * background worker to call the API. Message type must match
 * extension/src/lib/messages.js (MESSAGE_TYPES.LOOKUP_ACCOUNT).
 */
(function () {
  var MSG_LOOKUP = "apa/lookup_account";

  /** Only the cuenta view (see frontend/cuenta.html); avoids running on the ingreso form page. */
  if (document.documentElement.getAttribute("data-page") !== "informacion-cuenta") {
    return;
  }

  function getClaveFromPage() {
    var el = document.querySelector("[data-account-clave]");
    var fromDom = el && el.textContent ? el.textContent.trim() : "";
    if (fromDom) return fromDom;
    var q = new URLSearchParams(window.location.search).get("clave");
    return q ? String(q).trim() : "";
  }

  function run() {
    var clave = getClaveFromPage();
    if (!clave) return;

    chrome.runtime.sendMessage({ type: MSG_LOOKUP, clave: clave }, function (response) {
      if (chrome.runtime.lastError) {
        ApaHintUI.showError(clave, 0, chrome.runtime.lastError.message, null);
        return;
      }
      if (!response) {
        ApaHintUI.showError(
          clave,
          0,
          "No response from the extension background. Reload the extension and this page.",
          null
        );
        return;
      }

      if (response.ok && response.body && response.body.data) {
        ApaHintUI.showSuccess(clave, response.body.data);
        return;
      }

      ApaHintUI.showError(
        clave,
        response.status || 0,
        response.message || "Error",
        response.data || null
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
