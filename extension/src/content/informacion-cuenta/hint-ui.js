/**
 * In-page hint UI — classic script. Injects styles once; flag + panel with transitions.
 * First visit: panel auto-hides after 3s (flag stays). Reopen: stays until close, flag toggle, or outside click.
 */
var ApaHintUI = (function () {
  var STYLE_ID = "apa-asistente-hint-styles";
  var ROOT_ID = "apa-asistente-hint-root";
  var AUTO_HIDE_MS = 3000;

  var hideTimer = null;
  var outsideDismissAttached = false;

  /** Field rows inside each block (labels without “anterior/nuevo” — sections carry that). */
  var ANTERIOR_FIELDS = [
    { key: "tipo_tarifa_old", label: "Tipo tarifa" },
    { key: "rec_old", label: "Recámaras" },
    { key: "banios_old", label: "Baños" },
  ];
  var NUEVO_FIELDS = [
    { key: "tipo_tarifa_new", label: "Tipo tarifa" },
    { key: "rec_new", label: "Recámaras" },
    { key: "banios_new", label: "Baños" },
  ];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + ROOT_ID + "{",
      "position:fixed;top:12px;right:12px;z-index:2147483646;",
      "font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;",
      "}",
      "#" + ROOT_ID + " .apa-hint-flag{",
      "position:relative;z-index:2;",
      "display:flex;align-items:center;justify-content:center;",
      "width:40px;height:40px;padding:0;margin:0;",
      "border:1px solid rgba(0,0,0,.1);border-radius:10px;",
      "background:#fff;cursor:pointer;",
      "box-shadow:0 2px 8px rgba(0,0,0,.08);",
      "transition:transform .22s ease,box-shadow .22s ease,background .22s ease,color .22s ease;",
      "color:#2563eb;",
      "}",
      "#" + ROOT_ID + " .apa-hint-flag:hover{",
      "transform:scale(1.06);box-shadow:0 4px 14px rgba(37,99,235,.18);",
      "background:#f8fafc;",
      "}",
      "#" + ROOT_ID + " .apa-hint-flag:focus-visible{",
      "outline:2px solid #2563eb;outline-offset:2px;",
      "}",
      "#" + ROOT_ID + " .apa-hint-flag svg{display:block;}",
      "#" + ROOT_ID + " .apa-hint-panel{",
      "position:absolute;top:48px;right:0;",
      "width:min(22rem,calc(100vw - 24px));",
      "margin:0;padding:14px 16px 16px;",
      "border-radius:12px;border:1px solid rgba(0,0,0,.1);",
      "background:#fff;color:#111827;",
      "box-shadow:0 8px 32px rgba(0,0,0,.1);",
      "font-size:13px;line-height:1.45;",
      "opacity:0;visibility:hidden;",
      "transform:translateY(-10px) scale(.98);",
      "transition:opacity .38s cubic-bezier(.4,0,.2,1),transform .38s cubic-bezier(.4,0,.2,1),visibility .38s;",
      "pointer-events:none;",
      "}",
      "#" + ROOT_ID + " .apa-hint-panel.apa-hint--success{",
      "border-top:3px solid #22c55e;",
      "}",
      "#" + ROOT_ID + " .apa-hint-panel.apa-hint--error{",
      "border-color:rgba(185,28,28,.2);background:#fffafa;border-top:3px solid #dc2626;",
      "}",
      "#" + ROOT_ID + " .apa-hint-panel.apa-hint-panel--open{",
      "opacity:1;visibility:visible;",
      "transform:translateY(0) scale(1);",
      "pointer-events:auto;",
      "}",
      "#" + ROOT_ID + " .apa-hint-panel-header{",
      "display:flex;align-items:flex-start;justify-content:space-between;gap:10px;",
      "margin:0 0 8px;",
      "}",
      "#" + ROOT_ID + " .apa-hint-panel .apa-hint-title{",
      "flex:1;font-weight:600;font-size:12px;letter-spacing:.04em;",
      "text-transform:uppercase;color:#64748b;margin:0;padding-top:2px;",
      "}",
      "#" + ROOT_ID + " .apa-hint-close{",
      "flex-shrink:0;display:flex;align-items:center;justify-content:center;",
      "width:28px;height:28px;padding:0;margin:0;",
      "border:1px solid rgba(0,0,0,.12);border-radius:8px;",
      "background:#fff;color:#64748b;font-size:18px;line-height:1;cursor:pointer;",
      "transition:background .2s ease,color .2s ease,border-color .2s ease;",
      "}",
      "#" + ROOT_ID + " .apa-hint-close:hover{",
      "background:#f1f5f9;color:#0f172a;border-color:#cbd5e1;",
      "}",
      "#" + ROOT_ID + " .apa-hint-close:focus-visible{",
      "outline:2px solid #2563eb;outline-offset:2px;",
      "}",
      "#" + ROOT_ID + " .apa-hint-panel .apa-hint-lead{margin:0 0 10px;color:#334155;}",
      "#" + ROOT_ID + " .apa-hint-clave{",
      "margin:0 0 8px;padding:10px 12px;border-radius:10px;",
      "background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;",
      "}",
      "#" + ROOT_ID + " .apa-hint-clave dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:baseline;}",
      "#" + ROOT_ID + " .apa-hint-clave dt{font-size:11px;font-weight:600;color:#64748b;margin:0;}",
      "#" + ROOT_ID + " .apa-hint-clave dd{margin:0;font-size:14px;font-weight:700;color:#0f172a;}",
      "#" + ROOT_ID + " .apa-hint-block{",
      "margin-top:8px;padding:12px;border-radius:10px;",
      "}",
      "#" + ROOT_ID + " .apa-hint-block h3{",
      "margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;",
      "}",
      "#" + ROOT_ID + " .apa-hint-block dl{margin:0;}",
      "#" + ROOT_ID + " .apa-hint-block dt{",
      "margin:10px 0 3px;font-size:11px;font-weight:600;",
      "}",
      "#" + ROOT_ID + " .apa-hint-block dt:first-of-type{margin-top:0;}",
      "#" + ROOT_ID + " .apa-hint-block dd{margin:0 0 2px;font-size:13px;font-weight:600;}",
      "#" + ROOT_ID + " .apa-hint-block--anterior{",
      "background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;",
      "}",
      "#" + ROOT_ID + " .apa-hint-block--anterior h3{color:#475569;}",
      "#" + ROOT_ID + " .apa-hint-block--anterior dt{color:#64748b;}",
      "#" + ROOT_ID + " .apa-hint-block--anterior dd{color:#0f172a;}",
      "#" + ROOT_ID + " .apa-hint-block--nuevo{",
      "background:#ecfdf5;border:1px solid #bbf7d0;color:#14532d;",
      "}",
      "#" + ROOT_ID + " .apa-hint-block--nuevo h3{color:#166534;}",
      "#" + ROOT_ID + " .apa-hint-block--nuevo dt{color:#15803d;}",
      "#" + ROOT_ID + " .apa-hint-block--nuevo dd{color:#052e16;}",
      "#" + ROOT_ID + " .apa-hint-panel .apa-hint-meta{font-size:11px;color:#64748b;margin:8px 0 0;}",
      "@media (prefers-reduced-motion:reduce){",
      "#" + ROOT_ID + " .apa-hint-flag,",
      "#" + ROOT_ID + " .apa-hint-panel{transition-duration:.01ms;}",
      "}",
    ].join("");
    document.head.appendChild(style);
  }

  function removeExisting() {
    detachOutsideDismiss();
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    var el = document.getElementById(ROOT_ID);
    if (el) el.remove();
  }

  function detachOutsideDismiss() {
    if (!outsideDismissAttached) return;
    document.removeEventListener("pointerdown", onPointerDownOutside, true);
    outsideDismissAttached = false;
  }

  function onPointerDownOutside(ev) {
    var root = document.getElementById(ROOT_ID);
    if (!root || root.contains(ev.target)) return;
    if (typeof onOutsideDismiss === "function") {
      onOutsideDismiss();
    }
  }

  /** Set by active mount so outside handler can close the current panel. */
  var onOutsideDismiss = null;

  function formatValue(v) {
    if (v === null || v === undefined) return "—";
    return String(v);
  }

  function buildClaveRow(record) {
    var wrap = document.createElement("div");
    wrap.className = "apa-hint-clave";
    var dl = document.createElement("dl");
    var dt = document.createElement("dt");
    dt.textContent = "Clave APA";
    var dd = document.createElement("dd");
    dd.textContent = formatValue(record.clave_apa);
    dl.appendChild(dt);
    dl.appendChild(dd);
    wrap.appendChild(dl);
    return wrap;
  }

  function appendFieldRows(dl, fields, record) {
    fields.forEach(function (f) {
      var dt = document.createElement("dt");
      dt.textContent = f.label;
      var dd = document.createElement("dd");
      dd.textContent = Object.prototype.hasOwnProperty.call(record, f.key)
        ? formatValue(record[f.key])
        : "—";
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
  }

  function buildSection(heading, modifierClass, fields, record) {
    var section = document.createElement("section");
    section.className = "apa-hint-block " + modifierClass;
    var h = document.createElement("h3");
    h.textContent = heading;
    section.appendChild(h);
    var dl = document.createElement("dl");
    appendFieldRows(dl, fields, record);
    section.appendChild(dl);
    return section;
  }

  function buildSuccessDetails(record) {
    var frag = document.createDocumentFragment();
    if (Object.prototype.hasOwnProperty.call(record, "clave_apa")) {
      frag.appendChild(buildClaveRow(record));
    }
    frag.appendChild(
      buildSection("Anterior", "apa-hint-block--anterior", ANTERIOR_FIELDS, record)
    );
    frag.appendChild(
      buildSection("Nuevo", "apa-hint-block--nuevo", NUEVO_FIELDS, record)
    );
    return frag;
  }

  function prependPanelHeader(panel, titleText) {
    var header = document.createElement("div");
    header.className = "apa-hint-panel-header";
    var title = document.createElement("span");
    title.className = "apa-hint-title";
    title.textContent = titleText;
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "apa-hint-close";
    closeBtn.setAttribute("aria-label", "Cerrar panel");
    closeBtn.setAttribute("title", "Cerrar");
    closeBtn.innerHTML = "&times;";
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.insertBefore(header, panel.firstChild);
    return closeBtn;
  }

  function flagSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute(
      "d",
      "M6 4v16h2V4H6zm2 0h9l1 2h4v8l-4 2H8V4z"
    );
    svg.appendChild(path);
    return svg;
  }

  function wireFlagAndPanel(flagBtn, panel) {
    function setOpen(open) {
      if (open) {
        panel.classList.add("apa-hint-panel--open");
        flagBtn.setAttribute("aria-expanded", "true");
      } else {
        panel.classList.remove("apa-hint-panel--open");
        flagBtn.setAttribute("aria-expanded", "false");
      }
    }

    function userDismiss() {
      setOpen(false);
      detachOutsideDismiss();
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    onOutsideDismiss = userDismiss;

    function attachOutsideDismiss() {
      if (outsideDismissAttached) return;
      document.addEventListener("pointerdown", onPointerDownOutside, true);
      outsideDismissAttached = true;
    }

    flagBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var isOpen = panel.classList.contains("apa-hint-panel--open");
      if (isOpen) {
        userDismiss();
      } else {
        setOpen(true);
        attachOutsideDismiss();
      }
    });

    return {
      openNow: function () {
        setOpen(true);
      },
      scheduleInitialAutoHide: function () {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
          hideTimer = null;
          userDismiss();
        }, AUTO_HIDE_MS);
      },
      userDismiss: userDismiss,
    };
  }

  function mountRoot(panelInnerBuildFn, variant) {
    injectStyles();
    removeExisting();

    var root = document.createElement("div");
    root.id = ROOT_ID;

    var flagBtn = document.createElement("button");
    flagBtn.type = "button";
    flagBtn.className = "apa-hint-flag";
    flagBtn.setAttribute("aria-label", "Mostrar u ocultar datos de la cuenta");
    flagBtn.setAttribute("aria-expanded", "false");
    flagBtn.setAttribute("title", "Datos de cuenta");
    flagBtn.appendChild(flagSvg());

    var panel = document.createElement("aside");
    panel.className = "apa-hint-panel apa-hint--" + variant;
    panel.setAttribute("role", variant === "error" ? "alert" : "complementary");
    panel.setAttribute(
      "aria-label",
      variant === "error" ? "APA Asistente — aviso" : "APA Asistente — datos de cuenta"
    );

    panelInnerBuildFn(panel);

    root.appendChild(flagBtn);
    root.appendChild(panel);
    document.body.appendChild(root);

    var ctl = wireFlagAndPanel(flagBtn, panel);

    var closeBtn = panel.querySelector(".apa-hint-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        ctl.userDismiss();
      });
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ctl.openNow();
        ctl.scheduleInitialAutoHide();
      });
    });

    return ctl;
  }

  return {
    showSuccess: function (_clave, record) {
      mountRoot(function (panel) {
        prependPanelHeader(panel, "APA Asistente");

        var lead = document.createElement("p");
        lead.className = "apa-hint-lead";
        lead.textContent = "Datos encontrados para esta cuenta.";

        panel.appendChild(lead);
        panel.appendChild(buildSuccessDetails(record));
      }, "success");
    },

    showError: function (clave, status, message, data) {
      mountRoot(function (panel) {
        prependPanelHeader(panel, "APA Asistente");

        var p = document.createElement("p");
        p.className = "apa-hint-lead";
        if (status === 404) {
          p.textContent =
            "No hay datos en el catálogo para la cuenta " + clave + ".";
        } else if (status === 501) {
          p.textContent = message || "El servicio de consulta no está configurado.";
        } else {
          p.textContent = message || "No se pudo obtener la información.";
        }
        panel.appendChild(p);

        if (data && data.received) {
          var small = document.createElement("p");
          small.className = "apa-hint-meta";
          small.textContent = "Clave consultada: " + data.received;
          panel.appendChild(small);
        }
      }, "error");
    },
  };
})();
