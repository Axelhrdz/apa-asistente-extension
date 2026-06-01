/**
 * Content script entry — reads clave from DOM, asks background for account + recibos,
 * and ALWAYS renders both tabs (each with its own empty state if data is missing).
 */
(function () {
  var MSG_LOOKUP = "apa/lookup_account";
  var MSG_LOOKUP_RECIBOS = "apa/lookup_recibos";
  var LOOKUP_TIMEOUT_MS = 7000;
  var LOOKUP_INTERVAL_MS = 350;
  var hasRunLookup = false;

  function isLocalCuentaView() {
    return document.documentElement.getAttribute("data-page") === "informacion-cuenta";
  }

  function isExternalConsultaView() {
    if (window.location.origin !== "http://172.31.11.87:8080" && window.location.origin !== "http://172.16.71.43:8080") return false;
    if (window.location.pathname !== "/main.php") return false;
    var params = new URLSearchParams(window.location.search);
    return params.get("m") === "2" && params.get("a") === "2" && params.get("ac") === "consulta";
  }

  if (!isLocalCuentaView() && !isExternalConsultaView()) return;

  function getClaveFromPage() {
    var el = document.querySelector("[data-account-clave]");
    var fromDom = el && el.textContent ? el.textContent.trim() : "";
    if (fromDom) return fromDom;

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

  function sendMsg(type, clave, cb) {
    chrome.runtime.sendMessage({ type: type, clave: clave }, function (resp) {
      if (chrome.runtime.lastError) return cb(null);
      cb(resp);
    });
  }

  function runLookup(clave) {
    if (hasRunLookup) return;
    if (!clave) return;
    hasRunLookup = true;

    var accountData = null;
    var recibosData = null;
    var done = 0;

    function tryRender() {
      done++;
      if (done < 2) return;

      var record = {};
      if (accountData && accountData.ok && accountData.body && accountData.body.data) {
        record = accountData.body.data;
      } else {
        record.accountFound = false;
      }

      record.clave_apa = record.clave_apa || clave;

      if (!Array.isArray(record.recibos)) {
        record.recibos = [];
      }

      if (recibosData && recibosData.ok && recibosData.body && recibosData.body.data) {
        var reciboArr = recibosData.body.data.recibos;
        if (Array.isArray(reciboArr) && reciboArr.length > 0) {
          record.recibos = reciboArr;
        }
      }

      ApaHintUI.showSuccess(clave, record);
    }

    sendMsg(MSG_LOOKUP, clave, function (resp) {
      accountData = resp;
      tryRender();
    });

    sendMsg(MSG_LOOKUP_RECIBOS, clave, function (resp) {
      recibosData = resp;
      tryRender();
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
