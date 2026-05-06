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
    var R = "#" + ROOT_ID;
    style.textContent = [
      R + "{position:fixed;top:12px;right:12px;z-index:2147483646;",
      "font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}",

      R + " .apa-hint-flag{position:relative;z-index:2;",
      "display:flex;align-items:center;justify-content:center;",
      "width:40px;height:40px;padding:0;margin:0;",
      "border:1px solid rgba(0,0,0,.1);border-radius:10px;",
      "background:#fff;cursor:pointer;",
      "box-shadow:0 2px 8px rgba(0,0,0,.08);",
      "transition:transform .22s ease,box-shadow .22s ease,background .22s ease,color .22s ease;",
      "color:#2563eb;}",
      R + " .apa-hint-flag:hover{transform:scale(1.06);box-shadow:0 4px 14px rgba(37,99,235,.18);background:#f8fafc;}",
      R + " .apa-hint-flag:focus-visible{outline:2px solid #2563eb;outline-offset:2px;}",
      R + " .apa-hint-flag svg{display:block;}",

      R + " .apa-hint-panel{position:absolute;top:48px;right:0;",
      "width:min(22rem,calc(100vw - 24px));",
      "min-width:20rem;max-width:min(42rem,calc(100vw - 24px));",
      "min-height:12rem;max-height:min(80vh,44rem);",
      "margin:0;padding:14px 16px 16px;",
      "border-radius:12px;border:1px solid rgba(0,0,0,.1);",
      "background:#fff;color:#111827;",
      "box-shadow:0 8px 32px rgba(0,0,0,.1);",
      "font-size:13px;line-height:1.45;",
      "overflow:auto;resize:both;",
      "opacity:0;visibility:hidden;",
      "transform:translateY(-10px) scale(.98);",
      "transition:opacity .38s cubic-bezier(.4,0,.2,1),transform .38s cubic-bezier(.4,0,.2,1),visibility .38s;",
      "pointer-events:none;}",
      R + " .apa-hint-panel.apa-hint--success{border-top:3px solid #22c55e;}",
      R + " .apa-hint-panel.apa-hint--error{border-color:rgba(185,28,28,.2);background:#fffafa;border-top:3px solid #dc2626;}",
      R + " .apa-hint-panel.apa-hint-panel--open{opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto;}",

      R + " .apa-hint-panel-header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin:0 0 8px;}",
      R + " .apa-hint-panel .apa-hint-title{flex:1;font-weight:500;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;margin:0;padding-top:2px;}",

      R + " .apa-hint-close{flex-shrink:0;display:flex;align-items:center;justify-content:center;",
      "width:28px;height:28px;padding:0;margin:0;",
      "border:1px solid rgba(0,0,0,.12);border-radius:8px;",
      "background:#fff;color:#64748b;font-size:18px;line-height:1;cursor:pointer;",
      "transition:background .2s ease,color .2s ease,border-color .2s ease;}",
      R + " .apa-hint-close:hover{background:#f1f5f9;color:#0f172a;border-color:#cbd5e1;}",
      R + " .apa-hint-close:focus-visible{outline:2px solid #2563eb;outline-offset:2px;}",

      R + " .apa-hint-panel .apa-hint-lead{margin:0 0 10px;color:#334155;font-weight:400;}",

      R + " .apa-tabs{display:flex;gap:6px;margin:0 0 10px;flex-wrap:wrap;}",
      R + " .apa-tab-btn{appearance:none;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s ease;}",
      R + " .apa-tab-btn:hover{background:#eef2f7;color:#1e293b;}",
      R + " .apa-tab-btn[aria-selected='true']{background:#e2e8f0;border-color:#94a3b8;color:#0f172a;}",
      R + " .apa-tab-btn:focus-visible{outline:2px solid #2563eb;outline-offset:2px;}",
      R + " .apa-tab-panel{display:none;}",
      R + " .apa-tab-panel.apa-tab-panel--active{display:block;}",

      R + " .apa-hint-clave{margin:0 0 8px;padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;}",
      R + " .apa-hint-clave dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:baseline;}",
      R + " .apa-hint-clave dt{font-size:11px;font-weight:500;color:#64748b;margin:0;}",
      R + " .apa-hint-clave dd{margin:0;font-size:14px;font-weight:500;color:#0f172a;}",

      R + " .apa-hint-block{margin-top:8px;padding:12px;border-radius:10px;}",
      R + " .apa-hint-block h3{margin:0 0 10px;font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;}",
      R + " .apa-hint-block dl{margin:0;}",
      R + " .apa-hint-block dt{margin:10px 0 3px;font-size:11px;font-weight:500;}",
      R + " .apa-hint-block dt:first-of-type{margin-top:0;}",
      R + " .apa-hint-block dd{margin:0 0 2px;font-size:13px;font-weight:400;}",
      R + " .apa-hint-block--anterior{background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;}",
      R + " .apa-hint-block--anterior h3{color:#475569;}",
      R + " .apa-hint-block--anterior dt{color:#64748b;}",
      R + " .apa-hint-block--anterior dd{color:#0f172a;}",
      R + " .apa-hint-block--nuevo{background:#fffbeb;border:1px solid #fcd34d;color:#78350f;}",
      R + " .apa-hint-block--nuevo h3{color:#92400e;}",
      R + " .apa-hint-block--nuevo dt{color:#b45309;}",
      R + " .apa-hint-block--nuevo dd{color:#78350f;}",

      R + " .apa-caracteristicas-empty{padding:10px 12px;border-radius:10px;background:#fff7ed;border:1px dashed #fdba74;color:#7c2d12;font-size:12px;font-weight:400;}",

      R + " .apa-recibos-list{display:grid;grid-template-columns:1fr;gap:8px;}",
      R + " .apa-recibos-empty{padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px dashed #cbd5e1;color:#475569;font-size:12px;font-weight:400;}",

      R + " .apa-recibo-group{border:1px solid #e2e8f0;border-radius:10px;background:#fff;overflow:hidden;}",
      R + " .apa-recibo-group summary{list-style:none;padding:10px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;",
      "font-size:12px;font-weight:400;color:#334155;transition:background .15s ease;user-select:none;}",
      R + " .apa-recibo-group summary::-webkit-details-marker{display:none;}",
      R + " .apa-recibo-group summary:hover{background:#f8fafc;}",
      R + " .apa-recibo-group summary .apa-chevron{flex-shrink:0;width:14px;height:14px;transition:transform .2s ease;color:#94a3b8;}",
      R + " .apa-recibo-group[open] summary .apa-chevron{transform:rotate(90deg);}",
      R + " .apa-recibo-group-meta{display:flex;flex-wrap:wrap;gap:4px 12px;margin-left:auto;font-size:11px;color:#64748b;font-weight:400;align-items:center;}",
      R + " .apa-estado-pagado{color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;padding:1px 6px;border-radius:4px;font-size:10px;letter-spacing:.03em;}",
      R + " .apa-recibo-group-body{padding:0 12px 10px;border-top:1px solid #f1f5f9;}",

      R + " .apa-recibo-info{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;padding:8px 0 6px;font-size:12px;}",
      R + " .apa-recibo-info-label{color:#64748b;font-weight:400;}",
      R + " .apa-recibo-info-value{color:#0f172a;font-weight:400;}",

      R + " .apa-concepto-list{display:grid;gap:4px;}",
      R + " .apa-concepto-item{display:flex;justify-content:space-between;align-items:baseline;gap:8px;",
      "padding:6px 8px;border-radius:6px;background:#f8fafc;font-size:12px;}",
      R + " .apa-concepto-desc{color:#334155;font-weight:400;flex:1;min-width:0;}",
      R + " .apa-concepto-total{color:#0f172a;font-weight:500;white-space:nowrap;}",

      R + " .apa-hint-panel .apa-hint-meta{font-size:11px;color:#64748b;margin:8px 0 0;font-weight:400;}",
      R + " .apa-hint-build{font-size:10px;font-weight:600;color:#64748b;margin:0 0 6px;letter-spacing:.03em;}",
      R + " .apa-hint-local-pill{display:inline-block;margin:0 0 8px;padding:4px 8px;border-radius:6px;",
      "font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;",
      "background:#ecfdf5;color:#047857;border:1px solid #6ee7b7;}",
      R + " .apa-hint-ngrok-pill{display:inline-block;margin:0 0 8px;padding:4px 8px;border-radius:6px;",
      "font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;",
      "background:#eff6ff;color:#1d4ed8;border:1px solid #93c5fd;}",
      R + " .apa-hint-api-pill{display:inline-block;margin:0 0 8px;padding:4px 8px;border-radius:6px;",
      "font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;",
      "background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;}",
      "@media (prefers-reduced-motion:reduce){",
      R + " .apa-hint-flag," + R + " .apa-hint-panel{transition-duration:.01ms;}}",
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

  var onOutsideDismiss = null;

  function formatValue(v) {
    if (v === null || v === undefined) return "—";
    return String(v);
  }

  function formatCurrency(value) {
    if (value === null || value === undefined || value === "") return "—";
    var num = typeof value === "number" ? value
      : (typeof value === "object" && value.$numberDecimal != null) ? parseFloat(value.$numberDecimal)
      : parseFloat(value);
    if (isNaN(num)) return String(value);
    return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 2 });
  }

  function formatDate(value) {
    if (!value) return "—";
    try {
      var d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
    } catch (_) {
      return String(value);
    }
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
    var found = record && record.accountFound !== false;
    if (!found) {
      var empty = document.createElement("div");
      empty.className = "apa-caracteristicas-empty";
      empty.textContent =
        "No hay datos de caracteristicas para esta cuenta en el catalogo, pero puedes revisar la pestaña de Recibos.";
      frag.appendChild(empty);
      return frag;
    }
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

  function createTabButton(label, tabId, selected) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "apa-tab-btn";
    btn.textContent = label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-controls", tabId);
    btn.setAttribute("aria-selected", selected ? "true" : "false");
    return btn;
  }

  function createTabPanel(tabId, active) {
    var panel = document.createElement("section");
    panel.id = tabId;
    panel.className = "apa-tab-panel" + (active ? " apa-tab-panel--active" : "");
    panel.setAttribute("role", "tabpanel");
    return panel;
  }

  /* ── Recibos: group flat rows by `recibo` field, render as collapsible dropdowns ── */

  function normalizeRecibos(record) {
    if (!record) return [];
    if (Array.isArray(record.recibos)) return record.recibos;
    return [];
  }

  function groupByRecibo(rows) {
    var map = {};
    var order = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var key = r.recibo || r.recibo_id || ("sin-recibo-" + i);
      if (!map[key]) {
        map[key] = { key: key, rows: [], first: r };
        order.push(key);
      }
      map[key].rows.push(r);
    }
    return order.map(function (k) { return map[k]; });
  }

  function chevronSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "apa-chevron");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M6 3l5 5-5 5");
    svg.appendChild(path);
    return svg;
  }

  function addInfoRow(grid, label, value) {
    var dt = document.createElement("span");
    dt.className = "apa-recibo-info-label";
    dt.textContent = label;
    var dd = document.createElement("span");
    dd.className = "apa-recibo-info-value";
    dd.textContent = value;
    grid.appendChild(dt);
    grid.appendChild(dd);
  }

  function buildReciboGroup(group) {
    var details = document.createElement("details");
    details.className = "apa-recibo-group";

    var summary = document.createElement("summary");
    summary.appendChild(chevronSvg());

    var label = document.createElement("span");
    label.textContent = group.key;
    summary.appendChild(label);

    var meta = document.createElement("span");
    meta.className = "apa-recibo-group-meta";
    var first = group.first;
    if (first.estado) {
      var estado = document.createElement("span");
      estado.textContent = first.estado;
      if (String(first.estado).toUpperCase() === "PAGADO") {
        estado.className = "apa-estado-pagado";
      }
      meta.appendChild(estado);
    }
    if (first.fec_recibo) {
      var fecha = document.createElement("span");
      fecha.textContent = formatDate(first.fec_recibo);
      meta.appendChild(fecha);
    }
    summary.appendChild(meta);
    details.appendChild(summary);

    var body = document.createElement("div");
    body.className = "apa-recibo-group-body";

    var info = document.createElement("div");
    info.className = "apa-recibo-info";
    if (first.contribuyente) addInfoRow(info, "Contribuyente", first.contribuyente);
    if (first.fec_sesion) addInfoRow(info, "Fecha sesión", formatDate(first.fec_sesion));
    if (first.grupo_conceptos) addInfoRow(info, "Grupo", first.grupo_conceptos);
    body.appendChild(info);

    var conceptList = document.createElement("div");
    conceptList.className = "apa-concepto-list";
    for (var i = 0; i < group.rows.length; i++) {
      var row = group.rows[i];
      var item = document.createElement("div");
      item.className = "apa-concepto-item";

      var desc = document.createElement("span");
      desc.className = "apa-concepto-desc";
      desc.textContent = row.concepto_descripcion || "—";

      var total = document.createElement("span");
      total.className = "apa-concepto-total";
      total.textContent = formatCurrency(row.total);

      item.appendChild(desc);
      item.appendChild(total);
      conceptList.appendChild(item);
    }
    body.appendChild(conceptList);
    details.appendChild(body);

    return details;
  }

  function buildRecibosContent(record) {
    var recibos = normalizeRecibos(record);
    var wrap = document.createElement("div");
    wrap.className = "apa-recibos-list";

    if (recibos.length === 0) {
      var empty = document.createElement("div");
      empty.className = "apa-recibos-empty";
      empty.textContent = "No hay recibos registrados para esta cuenta.";
      wrap.appendChild(empty);
      return wrap;
    }

    var groups = groupByRecibo(recibos);
    for (var i = 0; i < groups.length; i++) {
      wrap.appendChild(buildReciboGroup(groups[i]));
    }
    return wrap;
  }


  function buildOldPadronContent() {
    var wrap = document.createElement("div");
    wrap.className = "apa-old-padron-placeholder";
    var p = document.createElement("p");
    p.textContent = "Contenido de padrón (muestra).";
    wrap.appendChild(p);
    return wrap;
  }

  /* ── Tabs ── */

  function buildTabbedContent(record) {
    var frag = document.createDocumentFragment();

    var tabs = document.createElement("div");
    tabs.className = "apa-tabs";
    tabs.setAttribute("role", "tablist");

    var caracteristicasId = "apa-tab-caracteristicas";
    var recibosId = "apa-tab-recibos";

    var oldPadronId = "apa-tab-old-padron";

    var caracteristicasBtn = createTabButton("Caracteristicas", caracteristicasId, true);
    var recibosBtn = createTabButton("Recibos", recibosId, false);
    var oldPadronBtn = createTabButton("Padron 12 de marzo", oldPadronId, false);

    tabs.appendChild(oldPadronBtn);
    tabs.appendChild(caracteristicasBtn);
    tabs.appendChild(recibosBtn);
    frag.appendChild(tabs);

    var caracteristicasPanel = createTabPanel(caracteristicasId, true);
    caracteristicasPanel.appendChild(buildSuccessDetails(record));

    var recibosPanel = createTabPanel(recibosId, false);
    recibosPanel.appendChild(buildRecibosContent(record));

    var oldPadronPanel = createTabPanel(oldPadronId, false);
    oldPadronPanel.appendChild(buildOldPadronContent());

    function setActiveTab(target) {
      var isC = target === "caracteristicas";
      var isR = target === "recibos";
      var isO = target === "old-padron";
      caracteristicasBtn.setAttribute("aria-selected", isC ? "true" : "false");
      recibosBtn.setAttribute("aria-selected", isR ? "true" : "false");
      oldPadronBtn.setAttribute("aria-selected", isO ? "true" : "false");
      caracteristicasPanel.classList.toggle("apa-tab-panel--active", isC);
      recibosPanel.classList.toggle("apa-tab-panel--active", isR);
      oldPadronPanel.classList.toggle("apa-tab-panel--active", isO);
    }

    caracteristicasBtn.addEventListener("click", function () {
      setActiveTab("caracteristicas");
    });
    recibosBtn.addEventListener("click", function () {
      setActiveTab("recibos");
    });
    oldPadronBtn.addEventListener("click", function () {
      setActiveTab("old-padron");
    });

    frag.appendChild(caracteristicasPanel);
    frag.appendChild(recibosPanel);
    frag.appendChild(oldPadronPanel);
    return frag;
  }

  /* ── Panel chrome ── */

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
    path.setAttribute("d", "M6 4v16h2V4H6zm2 0h9l1 2h4v8l-4 2H8V4z");
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
      openNow: function () { setOpen(true); },
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

  /* ── Public API ── */

  function buildApiPill(apiBase) {
    if (!apiBase || typeof apiBase !== "string") return null;
    var pill = document.createElement("p");
    pill.setAttribute("role", "status");
    var b = apiBase.toLowerCase();
    if (
      b.indexOf("127.0.0.1") !== -1 ||
      b.indexOf("localhost") !== -1 ||
      b.indexOf("0.0.0.0") !== -1
    ) {
      pill.className = "apa-hint-local-pill";
      pill.textContent = "API en este equipo · " + apiBase;
    } else if (b.indexOf("ngrok") !== -1) {
      pill.className = "apa-hint-ngrok-pill";
      pill.textContent = "API servidor Linux (ngrok) · " + apiBase;
    } else {
      pill.className = "apa-hint-api-pill";
      pill.textContent = "API · " + apiBase;
    }
    return pill;
  }

  function prependBuildAndApiStrip(panel, options) {
    var manifest =
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.getManifest
        ? chrome.runtime.getManifest()
        : null;
    var buildLine = document.createElement("p");
    buildLine.className = "apa-hint-build";
    buildLine.textContent = manifest
      ? "Extensión v" + manifest.version + " (build Linux / MV3)"
      : "APA Asistente";
    panel.appendChild(buildLine);

    var apiBase = options && options.apiBase ? String(options.apiBase) : "";
    var pill = buildApiPill(apiBase);
    if (pill) panel.appendChild(pill);
  }

  return {
    showSuccess: function (_clave, record, options) {
      mountRoot(function (panel) {
        prependPanelHeader(panel, "APA Asistente");
        prependBuildAndApiStrip(panel, options);

        var lead = document.createElement("p");
        lead.className = "apa-hint-lead";
        if (record && record.accountFound === false) {
          lead.textContent =
            "No se encontraron caracteristicas en catalogo. Puedes consultar los recibos.";
        } else {
          lead.textContent = "Datos encontrados para esta cuenta.";
        }

        panel.appendChild(lead);
        panel.appendChild(buildTabbedContent(record));
      }, "success");
    },

    showError: function (clave, status, message, data, options) {
      mountRoot(function (panel) {
        prependPanelHeader(panel, "APA Asistente");
        prependBuildAndApiStrip(panel, options || {});

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
