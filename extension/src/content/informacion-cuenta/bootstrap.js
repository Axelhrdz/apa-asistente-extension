/**
 * Content script entry for cuenta.html — reads clave from DOM and asks the
 * background worker to call the API. Message type must match
 * extension/src/lib/messages.js (MESSAGE_TYPES.LOOKUP_ACCOUNT).
 */
(function () {
  var MSG_LOOKUP = "apa/lookup_account";
  var LOOKUP_TIMEOUT_MS = 7000;
  var LOOKUP_INTERVAL_MS = 350;
  var hasRunLookup = false;

  function isLocalCuentaView() {
    return document.documentElement.getAttribute("data-page") === "informacion-cuenta";
  }

  function isExternalConsultaView() {
    if (window.location.origin !== "http://172.31.11.87:8080") return false;
    if (window.location.pathname !== "/main.php") return false;
    var params = new URLSearchParams(window.location.search);
    return params.get("m") === "2" && params.get("a") === "2" && params.get("ac") === "consulta";
  }

  function isSupportedView() {
    return isLocalCuentaView() || isExternalConsultaView();
  }

  if (!isSupportedView()) {
    return;
  }

  function getClaveFromPage() {
    var el = document.querySelector("[data-account-clave]");
    var fromDom = el && el.textContent ? el.textContent.trim() : "";
    if (fromDom) return fromDom;

    // External system path: value is in <input name="clave_apa" ... readonly>.
    var input = document.querySelector("td.datoCampo input[name='clave_apa'], input[name='clave_apa']");
    var fromInput = input && input.value ? input.value.trim() : "";
    if (fromInput) return fromInput;

    var qs = new URLSearchParams(window.location.search);
    var fromClave = qs.get("clave");
    if (fromClave && String(fromClave).trim()) return String(fromClave).trim();
    var fromIdApa = qs.get("id_apa");
    if (fromIdApa && String(fromIdApa).trim()) return String(fromIdApa).trim();

    return "";
  }

  function runLookup(clave) {
    if (hasRunLookup) return;
    if (!clave) return;
    hasRunLookup = true;

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

  function tryLookupUntilFound() {
    var startedAt = Date.now();
    var timer = setInterval(function () {
      var clave = getClaveFromPage();
      if (clave) {
        clearInterval(timer);
        runLookup(clave);
        return;
      }
      if (Date.now() - startedAt > LOOKUP_TIMEOUT_MS) {
        clearInterval(timer);
      }
    }, LOOKUP_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryLookupUntilFound);
  } else {
    tryLookupUntilFound();
  }
})();
