/**
 * Full-page cuenta view — same data shape as the MV3 hint panel (hint-ui.js).
 */
import { getPadronOld } from "./api.js";

const STYLE_ID = "apa-local-cuenta-styles";
const SCOPE = ".apa-local-cuenta";

const ANTERIOR_FIELDS = [
  { key: "tipo_tarifa_old", label: "Tipo tarifa" },
  { key: "rec_old", label: "Recámaras" },
  { key: "banios_old", label: "Baños" },
];
const NUEVO_FIELDS = [
  { key: "tipo_tarifa_new", label: "Tipo tarifa" },
  { key: "rec_new", label: "Recámaras" },
  { key: "banios_new", label: "Baños" },
];

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  const R = SCOPE;
  style.textContent = [
    R + "{font-size:13px;line-height:1.45;color:#111827;}",

    R + " .apa-tabs{display:flex;gap:6px;margin:0 0 10px;flex-wrap:wrap;}",
    R + " .apa-tab-btn{appearance:none;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;",
    "padding:6px 10px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s ease;}",
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
  ].join("");
  document.head.appendChild(style);
}

function formatValue(v) {
  if (v === null || v === undefined) return "—";
  return String(v);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num =
    typeof value === "number"
      ? value
      : typeof value === "object" && value.$numberDecimal != null
        ? parseFloat(value.$numberDecimal)
        : parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `$${num.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

/**
 * Formats YYYYMM period format (e.g., "202601") to "Enero 2026"
 * @param {string|number} value - YYYYMM format period
 * @returns {string} formatted period like "Enero 2026"
 */
function formatPeriodo(value) {
  if (value === null || value === undefined || value === "") return "—";
  const str = String(value).trim();
  if (str.length !== 6) return str;
  const year = str.substring(0, 4);
  const monthNum = parseInt(str.substring(4, 6), 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return str;
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return `${monthNames[monthNum - 1]} ${year}`;
}

function buildClaveRow(record) {
  const wrap = document.createElement("div");
  wrap.className = "apa-hint-clave";
  const dl = document.createElement("dl");
  const dt = document.createElement("dt");
  dt.textContent = "Clave APA";
  const dd = document.createElement("dd");
  dd.textContent = formatValue(record.clave_apa);
  dl.appendChild(dt);
  dl.appendChild(dd);
  wrap.appendChild(dl);
  return wrap;
}

function appendFieldRows(dl, fields, record) {
  for (const f of fields) {
    const dt = document.createElement("dt");
    dt.textContent = f.label;
    const dd = document.createElement("dd");
    dd.textContent = Object.prototype.hasOwnProperty.call(record, f.key)
      ? formatValue(record[f.key])
      : "—";
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
}

function buildSection(heading, modifierClass, fields, record) {
  const section = document.createElement("section");
  section.className = `apa-hint-block ${modifierClass}`;
  const h = document.createElement("h3");
  h.textContent = heading;
  section.appendChild(h);
  const dl = document.createElement("dl");
  appendFieldRows(dl, fields, record);
  section.appendChild(dl);
  return section;
}

function buildSuccessDetails(record) {
  const frag = document.createDocumentFragment();
  const found = record && record.accountFound !== false;
  if (!found) {
    const empty = document.createElement("div");
    empty.className = "apa-caracteristicas-empty";
    empty.textContent =
      "No hay datos de características para esta cuenta en el catálogo, pero puedes revisar la pestaña Recibos.";
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

function normalizeRecibos(record) {
  if (!record) return [];
  if (Array.isArray(record.recibos)) return record.recibos;
  return [];
}

function groupByRecibo(rows) {
  const map = {};
  const order = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const key = r.recibo || r.recibo_id || `sin-recibo-${i}`;
    if (!map[key]) {
      map[key] = { key, rows: [], first: r };
      order.push(key);
    }
    map[key].rows.push(r);
  }
  return order.map((k) => map[k]);
}

function chevronSvg() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "apa-chevron");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", "M6 3l5 5-5 5");
  svg.appendChild(path);
  return svg;
}

function addInfoRow(grid, label, value) {
  const dt = document.createElement("span");
  dt.className = "apa-recibo-info-label";
  dt.textContent = label;
  const dd = document.createElement("span");
  dd.className = "apa-recibo-info-value";
  dd.textContent = value;
  grid.appendChild(dt);
  grid.appendChild(dd);
}

function buildReciboGroup(group) {
  const details = document.createElement("details");
  details.className = "apa-recibo-group";

  const summary = document.createElement("summary");
  summary.appendChild(chevronSvg());

  const label = document.createElement("span");
  label.textContent = group.key;
  summary.appendChild(label);

  const meta = document.createElement("span");
  meta.className = "apa-recibo-group-meta";
  const first = group.first;
  if (first.estado) {
    const estado = document.createElement("span");
    estado.textContent = first.estado;
    if (String(first.estado).toUpperCase() === "PAGADO") {
      estado.className = "apa-estado-pagado";
    }
    meta.appendChild(estado);
  }
  if (first.fec_recibo) {
    const fecha = document.createElement("span");
    fecha.textContent = formatDate(first.fec_recibo);
    meta.appendChild(fecha);
  }
  summary.appendChild(meta);
  details.appendChild(summary);

  const body = document.createElement("div");
  body.className = "apa-recibo-group-body";

  const info = document.createElement("div");
  info.className = "apa-recibo-info";
  if (first.contribuyente) addInfoRow(info, "Contribuyente", first.contribuyente);
  if (first.fec_sesion) addInfoRow(info, "Fecha sesión", formatDate(first.fec_sesion));
  if (first.grupo_conceptos) addInfoRow(info, "Grupo", first.grupo_conceptos);
  body.appendChild(info);

  const conceptList = document.createElement("div");
  conceptList.className = "apa-concepto-list";
  for (let i = 0; i < group.rows.length; i++) {
    const row = group.rows[i];
    const item = document.createElement("div");
    item.className = "apa-concepto-item";

    const desc = document.createElement("span");
    desc.className = "apa-concepto-desc";
    desc.textContent = row.concepto_descripcion || "—";

    const total = document.createElement("span");
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
  const recibos = normalizeRecibos(record);
  const wrap = document.createElement("div");
  wrap.className = "apa-recibos-list";

  if (recibos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "apa-recibos-empty";
    empty.textContent = "No hay recibos registrados para esta cuenta.";
    wrap.appendChild(empty);
    return wrap;
  }

  const groups = groupByRecibo(recibos);
  for (let i = 0; i < groups.length; i++) {
    wrap.appendChild(buildReciboGroup(groups[i]));
  }
  return wrap;
}

function createTabButton(label, tabId, selected) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "apa-tab-btn";
  btn.textContent = label;
  btn.setAttribute("role", "tab");
  btn.setAttribute("aria-controls", tabId);
  btn.setAttribute("aria-selected", selected ? "true" : "false");
  return btn;
}

function createTabPanel(tabId, active) {
  const panel = document.createElement("section");
  panel.id = tabId;
  panel.className = `apa-tab-panel${active ? " apa-tab-panel--active" : ""}`;
  panel.setAttribute("role", "tabpanel");
  return panel;
}

function formatCurrencySimple(value) {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "object" && value?.$numberDecimal != null
        ? parseFloat(value.$numberDecimal)
        : parseFloat(value);
  if (Number.isNaN(num)) {
    return value === null || value === undefined || value === "" ? "—" : String(value);
  }
  return `$${num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildOldPadronContent(claveApa) {
  const wrap = document.createElement("div");
  wrap.className = "apa-padron-old";

  const loading = document.createElement("div");
  loading.className = "apa-caracteristicas-empty";
  loading.textContent = "Cargando datos del padrón…";
  wrap.appendChild(loading);

  getPadronOld(claveApa)
    .then((body) => {
      const record = body?.data;
      wrap.innerHTML = "";

      if (!record) {
        const empty = document.createElement("div");
        empty.className = "apa-recibos-empty";
        empty.textContent = "No se encontraron datos en el padrón para esta cuenta.";
        wrap.appendChild(empty);
        return;
      }

      const container = document.createElement("div");
      container.style.cssText = "padding:12px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;";

      const dl = document.createElement("dl");
      dl.style.cssText = "margin:0;display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;";

      const saldoDt = document.createElement("dt");
      saldoDt.textContent = "Saldo:";
      saldoDt.style.cssText = "font-size:13px;font-weight:500;color:#64748b;";

      const saldoDd = document.createElement("dd");
      saldoDd.textContent = formatCurrencySimple(record.saldo);
      saldoDd.style.cssText = "margin:0;font-size:18px;font-weight:600;color:#0f172a;";

      const periodoDesdeDt = document.createElement("dt");
      periodoDesdeDt.textContent = "Periodo desde:";
      periodoDesdeDt.style.cssText = "font-size:13px;font-weight:500;color:#64748b;";

      const periodoDesdeDd = document.createElement("dd");
      periodoDesdeDd.textContent = formatPeriodo(record.periodo_desde);
      periodoDesdeDd.style.cssText = "margin:0;font-size:14px;font-weight:500;color:#0f172a;";

      const periodoHastaDt = document.createElement("dt");
      periodoHastaDt.textContent = "Periodo hasta:";
      periodoHastaDt.style.cssText = "font-size:13px;font-weight:500;color:#64748b;";

      const periodoHastaDd = document.createElement("dd");
      periodoHastaDd.textContent = formatPeriodo(record.periodo_hasta);
      periodoHastaDd.style.cssText = "margin:0;font-size:14px;font-weight:500;color:#0f172a;";

      dl.appendChild(saldoDt);
      dl.appendChild(saldoDd);
      dl.appendChild(periodoDesdeDt);
      dl.appendChild(periodoDesdeDd);
      dl.appendChild(periodoHastaDt);
      dl.appendChild(periodoHastaDd);
      container.appendChild(dl);

      wrap.appendChild(container);
    })
    .catch((err) => {
      wrap.innerHTML = "";
      const error = document.createElement("div");
      error.className = "apa-caracteristicas-empty";
      error.style.cssText = "background:#fef2f2;border-color:#fecaca;color:#991b1b;";
      error.textContent = err?.message || "Error al cargar el padrón.";
      wrap.appendChild(error);
    });

  return wrap;
}

function buildTabbedContent(record) {
  const frag = document.createDocumentFragment();

  const tabs = document.createElement("div");
  tabs.className = "apa-tabs";
  tabs.setAttribute("role", "tablist");

  const caracteristicasId = "apa-local-tab-caracteristicas";
  const recibosId = "apa-local-tab-recibos";
  const oldPadronId = "apa-local-tab-old-padron";

  const caracteristicasBtn = createTabButton("Características", caracteristicasId, true);
  const recibosBtn = createTabButton("Recibos", recibosId, false);
  const oldPadronBtn = createTabButton("Padron 12 de marzo", oldPadronId, false);
  tabs.appendChild(oldPadronBtn);
  tabs.appendChild(caracteristicasBtn);
  tabs.appendChild(recibosBtn);
  frag.appendChild(tabs);

  const caracteristicasPanel = createTabPanel(caracteristicasId, true);
  caracteristicasPanel.appendChild(buildSuccessDetails(record));

  const recibosPanel = createTabPanel(recibosId, false);
  recibosPanel.appendChild(buildRecibosContent(record));

  const oldPadronPanel = createTabPanel(oldPadronId, false);
  const claveApa = record?.clave_apa || "";
  oldPadronPanel.appendChild(buildOldPadronContent(claveApa));

  function setActiveTab(target) {
    const isC = target === "caracteristicas";
    const isR = target === "recibos";
    const isO = target === "old-padron";
    caracteristicasBtn.setAttribute("aria-selected", isC ? "true" : "false");
    recibosBtn.setAttribute("aria-selected", isR ? "true" : "false");
    oldPadronBtn.setAttribute("aria-selected", isO ? "true" : "false");
    caracteristicasPanel.classList.toggle("apa-tab-panel--active", isC);
    recibosPanel.classList.toggle("apa-tab-panel--active", isR);
    oldPadronPanel.classList.toggle("apa-tab-panel--active", isO);
  }

  caracteristicasBtn.addEventListener("click", () => setActiveTab("caracteristicas"));
  recibosBtn.addEventListener("click", () => setActiveTab("recibos"));
  oldPadronBtn.addEventListener("click", () => setActiveTab("old-padron"));

  frag.appendChild(caracteristicasPanel);
  frag.appendChild(recibosPanel);
  frag.appendChild(oldPadronPanel);
  return frag;
}

/**
 * @param {HTMLElement} container
 * @param {object} record — `data` from POST /api/accounts/lookup
 */
export function renderCuentaRecord(container, record) {
  injectStyles();
  container.innerHTML = "";
  const root = document.createElement("div");
  root.className = "apa-local-cuenta";
  root.appendChild(buildTabbedContent(record));
  container.appendChild(root);
}
