import { quoteDefaults, paymentSchedule } from "./quotation.js";
import { glassBounds } from "./vent.js";
import { finishColors } from "./finishes.js";
import "./style.css";
import "./refinements.css";
import "./custom.css";
import {
  setSashJoint,
  mirrorDesign,
  setMeetingPreset,
  setSlidingGroup,
  updateSlidingGroup,
  removeSlidingGroup,
  getDesign,
  getDesignGeometry,
  splitPanel,
  splitPanelCount,
  mergePanel,
  updatePanel,
  updateSplit,
  listSplits,
  createDesignTemplate,
} from "./design.js";
import {
  customText,
  customInspector,
  designNotes,
  manufacturingDetails,
} from "./custom-ui.js";
import {
  defaultSettings,
  createItem,
  createProject,
  validateItem,
  validateProject,
  calculateItem,
  calculateProject,
  optimizeCuts,
} from "./core.js";
import { drawing, escapeHtml as esc } from "./drawing.js";
import { languages, translate } from "./i18n.js";

const icons = {
  window:
    '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 11h16"/>',
  folder:
    '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  sliders:
    '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
  report:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 12h8M8 16h8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  undo: '<path d="M3 10h10a7 7 0 0 1 0 14M3 10l6-6M3 10l6 6" transform="translate(0 -3)"/>',
  redo: '<path d="M21 10H11a7 7 0 0 0 0 14M21 10l-6-6M21 10l-6 6" transform="translate(0 -3)"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  minus: '<path d="M5 12h14"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5m0 2v1"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  print: '<path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6Z"/>',
  ruler: '<path d="m3 16 13-13 5 5L8 21ZM8 11l3 3m1-7 3 3"/>',
  glass:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 14 6-7m-3 10 5-6"/>',
  money:
    '<circle cx="12" cy="12" r="9"/><path d="M15 8H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9m3-11v14"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};
const icon = (name) =>
  `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.window}</svg>`;
const STORE = "frame-workshop-v1";
let lang = localStorageSafe("frame-workshop-language") || "en",
  page = "studio",
  reportTab = "quote",
  selectedPanel = 0,
  zoom = 1,
  modal = null,
  mobileNav = false,
  saveError = false,
  corrupt = false,
  expandedProfiles = false,
  expandedProject = false;
const t = (key) => customText(lang, key) ?? translate(lang, key);
let inspectorTab = "design",
  expandedDivisions = false,
  expandedEdges = false;
const systemKeys = [
  "systemName",
  "frameJoint",
  "sashJoint",
  "frameAllowance",
  "sashAllowance",
  "glassGap",
];
const itemSize = (i) =>
  i.design?.shape === "corner"
    ? `${i.width} + ${i.design.returnWidth} × ${i.height}`
    : `${i.width} × ${i.height}`;
let systemPresets = [];
try {
  const saved = JSON.parse(localStorageSafe("frame-workshop-systems") || "[]");
  if (Array.isArray(saved))
    systemPresets = saved
      .filter((p) => p && typeof p.systemName === "string")
      .slice(0, 30);
} catch {}
function localStorageSafe(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function initial() {
  const p = createProject();
  p.name = t("sampleName");
  p.customer = t("sampleCustomer");
  p.notes = t("sampleNotes");
  p.reference = "FW-001";
  const i = createItem("casement");
  i.name = t("sampleItem");
  i.quantity = 2;
  p.items = [i];
  return { projects: [p], active: p.id, item: i.id };
}
let data;
try {
  const saved = localStorageSafe(STORE);
  if (saved) {
    const d = JSON.parse(saved);
    if (
      !Array.isArray(d.projects) ||
      !d.projects.length ||
      d.projects.length > 50 ||
      d.projects.some((p) => validateProject(p).length)
    )
      throw Error("Invalid saved data");
    data = d;
  } else data = initial();
} catch {
  corrupt = true;
  data = initial();
}
let history = [],
  future = [];
const project = () =>
  data.projects.find((p) => p.id === data.active) || data.projects[0];
const item = () =>
  project()?.items.find((i) => i.id === data.item) || project()?.items[0];
const money = (n) => {
  try {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: project().settings.currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${Number(n).toFixed(2)} ${project().settings.currency}`;
  }
};
const num = (n, d = 2) =>
  new Intl.NumberFormat(lang, { maximumFractionDigits: d }).format(n);
const uid = () => crypto.randomUUID();
function persist() {
  if (corrupt) {
    saveError = true;
    return;
  }
  try {
    localStorage.setItem(STORE, JSON.stringify(data));
    saveError = false;
  } catch {
    saveError = true;
    toast(t("storageError"));
  }
}
function commit(fn) {
  const before = JSON.stringify(data);
  fn();
  if (JSON.stringify(data) !== before) {
    history.push(before);
    if (history.length > 50) history.shift();
    future = [];
    persist();
  }
  render();
}
function toast(text) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("visible"), 5000);
}
const btn = (action, label, ico = "", cls = "", extra = "") =>
  `<button type="button" data-action="${action}" class="button ${cls}" ${extra}>${ico ? icon(ico) : ""}<span>${esc(label)}</span></button>`;
const iconBtn = (action, key, ico, extra = "") =>
  `<button type="button" data-action="${action}" class="icon-button" title="${esc(t(key))}" aria-label="${esc(t(key))}" ${extra}>${icon(ico)}</button>`;
const option = (value, label, current) =>
  `<option value="${esc(value)}" ${value === current ? "selected" : ""}>${esc(label)}</option>`;
function input(
  label,
  key,
  value,
  {
    type = "text",
    min,
    max,
    step,
    scope = "item",
    unit = "",
    placeholder = "",
  } = {},
) {
  return `<label class="field"><span>${esc(t(label))}</span><div class="input-wrap"><input type="${type}" data-scope="${scope}" data-key="${esc(key)}" value="${esc(value)}" ${type === "number" ? `min="${min ?? 0}" max="${max ?? 1000000}" step="${step ?? 1}"` : 'maxlength="200"'} placeholder="${esc(placeholder)}" aria-label="${esc(t(label))}" ${unit ? 'class="has-unit"' : ""}/>${unit ? `<small>${esc(unit)}</small>` : ""}</div></label>`;
}
function select(label, key, current, entries, scope = "item") {
  return `<label class="field"><span>${esc(t(label))}</span><select data-scope="${scope}" data-key="${esc(key)}" aria-label="${esc(t(label))}">${entries.map(([v, l]) => option(v, l, current)).join("")}</select></label>`;
}
function sidebar() {
  return `<aside class="sidebar ${mobileNav ? "mobile-open" : ""}"><a class="brand" href="#" data-action="nav-studio"><span class="brand-icon">${icon("window")}</span><span>frame<span class="brand-light">workshop</span><small>WINDOW & DOOR STUDIO</small></span></a><div class="nav-label">${t("workspace")}</div><nav>${[
    ["studio", "window"],
    ["projects", "folder"],
    ["materials", "sliders"],
    ["reports", "report"],
  ]
    .map(
      ([p, i]) =>
        `<button class="nav-item ${page === p ? "active" : ""}" data-action="nav-${p}">${icon(i)}<span>${t(p)}</span>${page === p ? '<span class="nav-dot"></span>' : ""}</button>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-project"><div class="nav-label">${t("project")}</div><select aria-label="${t("chooseProject")}" id="project-select">${data.projects.map((p) => option(p.id, p.name, p.id === project()?.id ? p.id : "")).join("")}</select><button class="text-button" data-action="new-project">${icon("plus")}${t("newProject")}</button></div><div class="sidebar-bottom"><div class="local-badge"><span class="status-dot"></span>${t("local")}</div><p>${t("localHint")}</p>${btn("export", t("backup"), "download", "sidebar-export")}${btn("import", t("import"), "upload", "sidebar-import")}<div class="sidebar-footer"><button data-action="help" class="text-button">${icon("help")}${t("help")}</button><span>v1.0</span></div></div></aside>`;
}
function header() {
  return `<header class="topbar"><div class="breadcrumbs">${iconBtn("toggle-nav", "workspace", "menu", 'class="mobile-toggle"')}<span>${t("workspace").toLocaleLowerCase()}</span>${icon("chevron")}<strong>${esc(project().name)}</strong></div><div class="topbar-right"><span class="saved ${saveError ? "save-warning" : ""}">${icon(saveError ? "help" : "check")}<span>${t(saveError ? "unsaved" : "saved")}</span></span><select id="language" aria-label="${t("language")}">${languages.map((l) => option(l.code, l.label, lang)).join("")}</select><span class="avatar">FW</span></div></header>`;
}
function pageHeading(title, subtitle, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">FRAME WORKSHOP / ${t(page).toLocaleUpperCase()}</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${action}</div>`;
}
function emptyItems() {
  return `<div class="empty-state">${icon("window")}<h2>${t("noItems")}</h2><p>${t("startItem")}</p>${btn("add-item", t("addItem"), "plus", "primary")}${history.length ? btn("undo", t("undo"), "undo") : ""}</div>`;
}
function studio() {
  const p = project(),
    i = item();
  return `${pageHeading(t("designer"), t("designSub"), btn("add-item", t("addItem"), "plus", "primary"))}<div class="studio-layout"><section class="design-column"><div class="item-strip"><div class="strip-label">${t("items")} <span>${p.items.length.toString().padStart(2, "0")}</span></div><div class="item-tabs">${p.items.map((it, idx) => `<button data-action="select-item" data-id="${esc(it.id)}" class="item-tab ${it.id === i?.id ? "selected" : ""}"><span class="item-number">${String(idx + 1).padStart(2, "0")}</span><span>${esc(it.name)}<small>${itemSize(it)} ${t("mm")}</small></span></button>`).join("")}${iconBtn("add-item", "addItem", "plus")}</div></div>${i ? canvas(i) : emptyItems()}${i ? designNotes(i, t) + stats(i) : ""}<div class="estimate-footnote">${icon("help")}<span>${t("estimateNote")}</span></div></section>${i ? inspector(i) : ""}</div>`;
}
function canvas(i) {
  return `<section class="canvas-card"><div class="canvas-toolbar"><div><span class="small-dot"></span><strong>${esc(i.name)}</strong><span class="pill">${esc(i.material)}</span></div><div class="toolbar-actions">${iconBtn("undo", "undo", "undo", history.length ? "" : "disabled")}${iconBtn("redo", "redo", "redo", future.length ? "" : "disabled")}<span class="toolbar-divider"></span>${iconBtn("duplicate", "duplicate", "copy")}${iconBtn("remove-item", "remove", "trash")}${iconBtn("svg", "exportSvg", "download")}</div></div><div class="drawing-area"><div class="canvas-meta"><span>${t("frontView")}</span><span>${t("mm")} · ${getDesignGeometry(i).panels.length} ${t("panel").toLowerCase()}</span></div><div class="drawing-stage" style="--zoom:${zoom}">${drawing(i, { interactive: true, selected: selectedPanel, id: "main" })}</div><div class="canvas-bottom"><span class="drawing-caption">${t("panelHint")}</span><div class="zoom-controls">${iconBtn("zoom-out", "zoomOut", "minus")}<span>${Math.round(zoom * 100)}%</span>${iconBtn("zoom-in", "zoomIn", "plus")}${iconBtn("zoom-reset", "resetZoom", "expand")}</div></div></div><div class="canvas-legend"><span><i class="legend-glass"></i>${t(i.glass)}</span><span><i class="legend-frame" style="background:${finishColors[i.finish]}"></i>${t(i.finish)}</span><span class="legend-right">${itemSize(i)} ${t("mm")}<span> / </span>${i.quantity} ${t("units")}</span></div></section>`;
}
function stats(i) {
  const c = calculateItem(i, project().settings),
    total = calculateProject(project());
  return `<div class="stats-grid"><div class="stat"><span class="stat-icon">${icon("ruler")}</span><div><span>${t("profileLength")}</span><strong>${num(c.profileLength)} <small>m</small></strong></div></div><div class="stat"><span class="stat-icon">${icon("glass")}</span><div><span>${t("glassArea")}</span><strong>${num(c.glassArea)} <small>m²</small></strong></div></div><div class="stat"><span class="stat-icon">${icon("money")}</span><div><span>${t("itemEstimate")}</span><strong>${money(c.totalPrice)}</strong></div></div></div><div class="project-summary"><div><span>${t("estimated")}</span><strong>${money(total.total)}</strong><small>${total.quantity} ${t("units")} · ${num(total.glassArea)} m² ${t("glass").toLowerCase()}</small></div>${btn("nav-reports", t("viewQuote"), "arrow", "summary-button")}</div>`;
}
const modes = [
  "fixed",
  "left",
  "right",
  "tilt",
  "awning",
  "tilt-turn",
  "slide-left",
  "slide-right",
  "solid",
];
function modeIcon(mode) {
  const paths = {
    fixed: '<rect x="7" y="5" width="22" height="24"/>',
    left: '<rect x="7" y="5" width="22" height="24"/><path d="m7 5 22 12-22 12"/>',
    right:
      '<rect x="7" y="5" width="22" height="24"/><path d="m29 5-22 12 22 12"/>',
    tilt: '<rect x="7" y="5" width="22" height="24"/><path d="m7 29 11-24 11 24"/>',
    awning:
      '<rect x="7" y="5" width="22" height="24"/><path d="m7 5 11 24 11-24"/>',
    "tilt-turn":
      '<rect x="7" y="5" width="22" height="24"/><path d="m7 5 22 12-22 12m0 0 11-24 11 24"/>',
    "slide-left":
      '<rect x="4" y="5" width="28" height="24"/><path d="M18 5v24M28 17H8m5-4-5 4 5 4"/>',
    "slide-right":
      '<rect x="4" y="5" width="28" height="24"/><path d="M18 5v24M8 17h20m-5-4 5 4-5 4"/>',
    solid:
      '<rect x="7" y="5" width="22" height="24" fill="currentColor" opacity=".2"/><rect x="7" y="5" width="22" height="24"/>',
  };
  return `<svg width="36" height="34" viewBox="0 0 36 34" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">${paths[mode]}</svg>`;
}
function inspector(i) {
  const panels = getDesignGeometry(i).panels;
  selectedPanel = Math.max(0, Math.min(selectedPanel, panels.length - 1));
  return customInspector(i, {
    t,
    input,
    select,
    btn,
    icon,
    selectedPanel,
    tab: inspectorTab,
    modes,
    modeIcon,
    presets: systemPresets,
    expandedDivisions,
    expandedEdges,
  });
}
function currentPanel() {
  const panels = getDesignGeometry(item()).panels;
  return panels[Math.max(0, Math.min(selectedPanel, panels.length - 1))];
}
function applyDesign(fn) {
  try {
    updateItem("design", fn());
  } catch (error) {
    toast(lang === "ar" ? t("invalidDesign") : error.message);
    render();
  }
}
function makeTemplate(key) {
  const base = createItem(key);
  return [
    "custom",
    "sliding",
    "sliding-3",
    "sliding-4",
    "sliding-6",
    "corner-mixed",
    "balcony",
    "arched",
    "arched-sides",
    "fanlight",
    "mixed",
  ].includes(key)
    ? Object.assign(base, createDesignTemplate(key))
    : base;
}

function projectsPage() {
  return `${pageHeading(t("allProjects"), t("projectsSub"), btn("new-project", t("newProject"), "plus", "primary"))}<div class="project-grid">${data.projects
    .map((p) => {
      const c = calculateProject(p);
      return `<article class="project-card"><div class="project-card-preview">${p.items[0] ? drawing(p.items[0], { dimensions: false, id: `p${p.id.replace(/[^a-zA-Z0-9_-]/g, "")}` }) : icon("window")}<span class="project-card-count">${p.items.length} ${t("items")}</span></div><div class="project-card-body"><div class="project-card-heading"><h2>${esc(p.name)}</h2>${iconBtn(`delete-project:${p.id}`, "deleteProject", "trash")}</div><p>${esc(p.customer || t("noCustomer"))}</p><div class="project-card-meta"><span>${esc(p.reference)}</span><span>${esc(p.date)}</span></div>${btn(`open-project:${p.id}`, t("openProject"), "arrow", "full-width")}</div></article>`;
    })
    .join(
      "",
    )}<button class="project-card new-project-card" data-action="new-project">${icon("plus")}<strong>${t("newProject")}</strong><span>${t("newProjectHint")}</span></button></div>`;
}
function materialsPage() {
  const s = project().settings;
  return `${pageHeading(t("ratesTitle"), t("ratesSub"))}<div class="notice">${icon("help")}${t("materialsNote")}</div><div class="settings-layout"><section class="settings-card"><div class="card-heading">${icon("ruler")}<h2>${t("material")}</h2></div>${select(
    "currency",
    "currency",
    s.currency,
    ["EGP", "USD", "EUR", "GBP", "AED", "SAR", "TRY", "RUB", "IRR"].map((v) => [
      v,
      v,
    ]),
    "settings",
  )}<div class="rates-grid">${["UPVC", "PVC", "Aluminium"]
    .map((k) => [k, s.rates[k]])
    .map(
      ([k, v]) =>
        `<div class="rate-row"><span class="material-tile ${k.toLowerCase()}">${icon("window")}</span><div><strong>${k}</strong><small>${t("rateProfile")}</small></div>${input("rateProfile", `rates.${k}`, v, { type: "number", step: 0.01, scope: "settings", unit: s.currency })}</div>`,
    )
    .join("")}</div><h3 class="settings-subtitle">${t("glazing")}</h3>${[
    "single",
    "double",
    "triple",
  ]
    .map((k) => [k, s.glassRates[k]])
    .map(
      ([k, v]) =>
        `<div class="rate-row"><span class="material-tile glass-tile">${icon("glass")}</span><div><strong>${t(k)}</strong><small>${t("rateGlass")}</small></div>${input("rateGlass", `glassRates.${k}`, v, { type: "number", step: 0.01, scope: "settings", unit: s.currency })}</div>`,
    )
    .join(
      "",
    )}</section><div><section class="settings-card"><div class="card-heading">${icon("money")}<h2>${t("costSettings")}</h2></div><div class="field-grid">${["hardware", "labor", "infillRate", "waste", "markup", "discount", "tax"].map((k) => input(k, k, s[k], { type: "number", max: ["discount", "tax", "waste"].includes(k) ? 100 : k === "markup" ? 1000 : 100000, step: 0.01, scope: "settings", unit: ["hardware", "labor", "infillRate"].includes(k) ? s.currency : "%" })).join("")}</div></section><section class="settings-card"><div class="card-heading">${icon("ruler")}<h2>${t("cuttingSettings")}</h2></div><div class="field-grid">${input("stockLength", "stockLength", s.stockLength, { type: "number", min: 1000, max: 12000, scope: "settings", unit: "mm" })}${input("kerf", "kerf", s.kerf, { type: "number", min: 0, max: 20, step: 0.1, scope: "settings", unit: "mm" })}</div><p class="muted small">${t("stockNote")}</p>${project().items.some((i) => i.design?.shape === "arched") ? `<div class="notice">${t("curvedExclude")}</div>` : ""}</section></div></div>`;
}
function detailsForm() {
  const p = project();
  return `<details class="project-details" ${expandedProject ? "open" : ""}><summary>${icon("folder")}${t("projectDetails")}<span>${esc(p.customer || t("noCustomer"))}</span></summary><div class="details-content"><div class="field-grid three">${input("projectName", "name", p.name, { scope: "project" })}${input("customer", "customer", p.customer, { scope: "project" })}${input("email", "email", p.email, { scope: "project" })}${input("reference", "reference", p.reference, { scope: "project" })}${input("date", "date", p.date, { scope: "project", type: "date" })}</div><label class="field"><span>${t("notes")}</span><textarea data-scope="project" data-key="notes" maxlength="5000" rows="3">${esc(p.notes)}</textarea></label></div></details>`;
}
function reportsPage() {
  return `${pageHeading(t("reports"), t("reportsSub"), `<div class="heading-actions">${btn("csv", t("exportCsv"), "download")}${btn("print", t("print"), "print", "primary")}</div>`)}${detailsForm()}${reportTab === "quote" ? quotationEditor() : ""}<div class="report-tabs" role="tablist">${["quote", "bill", "cutting"].map((r) => `<button role="tab" aria-selected="${reportTab === r}" class="${reportTab === r ? "active" : ""}" data-action="report-${r}">${t(r)}</button>`).join("")}</div>${project().items.length ? `<div id="print-content">${reportTab === "quote" ? quoteView() : reportTab === "bill" ? billView() : cuttingView()}</div>` : `<div class="empty-state"><h2>${t("noItemsReport")}</h2>${btn("nav-studio", t("studio"), "arrow", "primary")}</div>`}`;
}
function quotationEditor() {
  const p = project(),
    q = { ...quoteDefaults, ...p.quotation };
  return `<section class="quote-editor settings-card"><h3>${t("quoteSetup")}</h3><div class="field-grid three">${input("businessName", "business", q.business, { scope: "quotation" })}${input("businessPhone", "phone", q.phone, { scope: "quotation" })}${input("businessAddress", "address", q.address, { scope: "quotation" })}${input("validUntil", "validUntil", q.validUntil, { scope: "quotation", type: "date" })}${input("discount", "discount", p.settings.discount, { scope: "settings", type: "number", min: 0, max: 100, unit: "%" })}${input("tax", "tax", p.settings.tax, { scope: "settings", type: "number", min: 0, max: 100, unit: "%" })}${select(
    "currency",
    "currency",
    p.settings.currency,
    ["EGP", "USD", "EUR", "GBP", "AED", "SAR", "TRY", "RUB", "IRR"].map((v) => [
      v,
      v,
    ]),
    "settings",
  )}</div><h4>${t("sellingPrices")}</h4>${p.items
    .map(
      (i) =>
        `<div class="quote-price-editor" data-pricing-item="${esc(i.id)}"><strong>${esc(i.name)}</strong><div class="field-grid">${select(
          "pricingMode",
          "mode",
          i.pricing?.mode || "auto",
          ["auto", "unit", "area"].map((v) => [v, t("price" + v)]),
          "pricing",
        )}${input("sellingRate", "rate", i.pricing?.rate || 0, { scope: "pricing", type: "number", min: 0, max: 1e9, step: 0.01, unit: p.settings.currency })}</div></div>`,
    )
    .join(
      "",
    )}<p class="custom-note">${t("sellingHint")}</p><h4>${t("paymentSchedule")}</h4><div class="field-grid three">${input("depositLabel", "depositLabel", q.depositLabel, { scope: "quotation" })}${input("depositPercent", "depositPercent", q.depositPercent, { scope: "quotation", type: "number", min: 0, max: 100, unit: "%" })}${input("deliveryLabel", "deliveryLabel", q.deliveryLabel, { scope: "quotation" })}${input("deliveryPercent", "deliveryPercent", q.deliveryPercent, { scope: "quotation", type: "number", min: 0, max: 100, unit: "%" })}${input("balanceLabel", "balanceLabel", q.balanceLabel, { scope: "quotation" })}</div><p class="custom-note">${t("pdfHint")}</p></section>`;
}
function quoteView() {
  const p = project(),
    c = calculateProject(p),
    q = { ...quoteDefaults, ...p.quotation };
  return `<article class="quote-sheet"><div class="quote-header"><div><div class="quote-brand">${esc(q.business)}</div><p>${esc(q.phone)} · ${esc(q.address)}</p><h2>${t("quote")}</h2><p>${esc(p.name)}</p></div><div class="quote-ref"><strong>${esc(p.reference)}</strong><span>${esc(p.date)}</span>${q.validUntil ? `<span>${t("validUntil")}: ${esc(q.validUntil)}</span>` : ""}</div></div><div class="quote-client"><span>${t("preparedFor")}</span><h3>${esc(p.customer || "—")}</h3><p>${esc(p.email)}</p></div>${p.items
    .map((i, n) => {
      const r = c.items[n];
      return `<section class="quote-line"><h3>${n + 1}. ${esc(i.name)}</h3><div class="quote-line-content"><div class="quote-drawing">${drawing(i, { dimensions: true, id: `q${n}` })}</div><div class="quote-spec"><p>${t("width")}: ${i.width} mm · ${t("height")}: ${i.height} mm${i.design?.shape === "corner" ? ` · ${t("returnWidth")}: ${i.design.returnWidth} mm` : ""}</p><p>${esc(i.material)} · ${t(i.finish)} · ${t(i.glass)}</p><p>${t("billingArea")}: ${num(r.billableArea, 3)} m²</p><p>${t("pricingMode")}: ${t("price" + (i.pricing?.mode || "auto"))}${i.pricing?.mode && i.pricing.mode !== "auto" ? ` · ${money(i.pricing.rate)}${i.pricing.mode === "area" ? " / m²" : ""}` : ""}</p><table><thead><tr><th>${t("quantity")}</th><th>${t("unitPrice")}</th><th>${t("amount")}</th></tr></thead><tbody><tr><td>${i.quantity}</td><td>${money(r.unitPrice)}</td><td><strong>${money(r.totalPrice)}</strong></td></tr></tbody></table></div></div></section>`;
    })
    .join(
      "",
    )}<section class="quote-final"><div class="quote-notes"><h4>${t("terms")}</h4><p>${esc(p.notes || t("noNotes"))}</p></div><h4>${t("paymentSchedule")}</h4><table class="payment-table"><thead><tr><th>${t("paymentStage")}</th><th>%</th><th>${t("amount")}</th></tr></thead><tbody>${paymentSchedule(
    c.total,
    q,
  )
    .map(
      (v, n) =>
        `<tr><td>${esc(v.label || t(["depositDefault", "deliveryDefault", "balanceDefault"][n]))}</td><td>${num(v.percent)}</td><td>${money(v.amount)}</td></tr>`,
    )
    .join(
      "",
    )}</tbody></table><div class="totals"><div><span>${t("subtotal")}</span><strong>${money(c.subtotal)}</strong></div><div><span>${t("discountAmount")} (${p.settings.discount}%)</span><span>−${money(c.discount)}</span></div><div><span>${t("taxAmount")} (${p.settings.tax}%)</span><span>${money(c.tax)}</span></div><div class="grand-total"><span>${t("netTotal")}</span><strong>${money(c.total)}</strong></div></div></section></article>`;
}
function billView() {
  const p = project(),
    c = calculateProject(p);
  return `<section class="report-card"><div class="report-title"><div><h2>${t("bill")}</h2><p>${esc(p.name)}</p></div><span class="pill">${c.quantity} ${t("units")}</span></div><div class="bill-metrics"><div><small>${t("profileLength")}</small><strong>${num(c.profileLength)} m</strong></div><div><small>${t("glassArea")}</small><strong>${num(c.glassArea)} m²</strong></div><div><small>${t("totalArea")}</small><strong>${num(c.area)} m²</strong></div></div>${p.items
    .map((i, n) => {
      const r = c.items[n];
      return `<div class="bill-item"><h3>${String(n + 1).padStart(2, "0")} / ${esc(i.name)} <span>${i.quantity} × ${itemSize(i)} mm</span></h3><h4>${t("profileParts")} · ${esc(i.material)}</h4><div class="table-scroll"><table><thead><tr><th>${t("type")}</th><th>${t("length")} (mm)</th><th>${t("pieces")}</th><th>${t("totalLength")} (m)</th></tr></thead><tbody>${r.cuts.map((cut) => `<tr><td>${t(cut.type === "sash" ? "sashType" : cut.type)}</td><td>${num(cut.length)}</td><td>${cut.quantity}</td><td>${num((cut.length * cut.quantity) / 1000)}</td></tr>`).join("")}</tbody></table></div><h4>${t("glassPieces")} · ${t(i.glass)}</h4><div class="glass-pieces">${r.glassPieces.map((g) => `<span>${num(g.width)} × ${num(g.height)} mm <strong>× ${g.quantity}</strong></span>`).join("") || "—"}<span>${t("hardwareLabel")}: <strong>${r.openingCount}</strong></span>${r.infillPieces.map((g) => `<span>${t("solid")}: ${num(g.width)} × ${num(g.height)} mm <strong>× ${g.quantity}</strong></span>`).join("")}</div>${manufacturingDetails(i, r, t)}</div>`;
    })
    .join("")}<p class="report-note">${t("estimateNote")}</p></section>`;
}
function cuttingResult() {
  const p = project();
  return optimizeCuts(
    p.items.flatMap((i) => calculateItem(i, p.settings).cuts),
    p.settings.stockLength,
    p.settings.kerf,
  );
}
function cuttingView() {
  const p = project();
  let c;
  try {
    c = cuttingResult();
  } catch {
    return `<section class="report-card"><div class="notice warning">${t("cutLimit")}</div></section>`;
  }
  return `<section class="report-card"><div class="report-title"><div><h2>${t("cutting")}</h2><p>${p.settings.stockLength} mm / ${t("kerf")}: ${p.settings.kerf} mm</p></div><span class="pill">${c.bars.length} ${t("stockBars")}</span></div>${c.unfit.length ? `<div class="notice warning">${t("oversized")} (${c.unfit.map((x) => `${x.length} mm`).join(", ")})</div>` : ""}<div class="bill-metrics"><div><small>${t("stockBars")}</small><strong>${c.bars.length}</strong></div><div><small>${t("utilization")}</small><strong>${num(100 - c.wastePercent, 1)}%</strong></div><div><small>${t("offcut")}</small><strong>${num(c.bars.reduce((a, b) => a + b.remainder, 0) / 1000)} m</strong></div></div><p class="muted small">${t("stockNote")}</p>${project().items.some((i) => i.design?.shape === "arched") ? `<div class="notice">${t("curvedExclude")}</div>` : ""}${c.bars.map((b, n) => `<div class="cut-row"><div class="cut-row-title"><strong>${t("bar")} ${n + 1} <span>${esc(b.material)} / ${t(b.type === "sash" ? "sashType" : b.type)} / ${t(b.finish)} · ${esc(b.system || "Generic")}${b.profileFace ? ` / ${b.profileFace} mm` : ""}</span></strong><small>${t("offcut")} ${num(b.remainder)} mm</small></div><div class="cut-bar">${b.cuts.map((l, i) => `<span style="width:${(l / p.settings.stockLength) * 100}%;--tone:${i % 3}" title="${num(l)} mm">${num(l)}${b.pieces?.[i]?.angleStart ? ` · ${b.pieces[i].angleStart}°/${b.pieces[i].angleEnd}°` : ""}</span>`).join("")}<i style="flex:1" title="${t("offcut")}: ${num(b.remainder)} mm"></i></div></div>`).join("")}<p class="report-note">${t("estimateNote")}</p></section>`;
}
const templates = [
  ["custom", "customTemplate"],
  ["casement", "casement"],
  ["sliding", "sliding"],

  ["door", "door"],
  ["fixed", "fixedTemplate"],
  ["tilt-turn", "tiltTemplate"],
  ["triple", "tripleTemplate"],
  ["transom", "transom"],
  ["corner-mixed", "cornerMixed"],
  ["balcony", "balcony"],
  ["arched", "archedTemplate"],
  ["arched-sides", "archedSidesTemplate"],
  ["fanlight", "fanlight"],
  ["mixed", "mixed"],
];
function modalView() {
  if (!modal) return "";
  let content = "";
  if (modal.type === "template") {
    content = `<h2 id="modal-title">${t("template")}</h2><p>${t("templateSub")}</p><div class="template-grid">${templates.map(([key, label]) => `<button class="template-card" data-action="template" data-template="${key}">${drawing(makeTemplate(key), { dimensions: false, id: `t${key}` })}<strong>${t(label)}</strong><span>${icon("plus")}</span></button>`).join("")}</div>`;
  } else if (modal.type === "new") {
    content = `<h2 id="modal-title">${t("newProject")}</h2><p>${t("newProjectHint")}</p><form id="new-project-form"><label class="field"><span>${t("projectName")}</span><input name="name" maxlength="200" placeholder="${t("projectPlaceholder")}" required autofocus/></label><label class="field"><span>${t("customer")}</span><input name="customer" maxlength="200" placeholder="${t("customerPlaceholder")}"/></label><div class="modal-actions">${btn("close", t("cancel"))}<button type="submit" class="button primary">${t("create")}${icon("arrow")}</button></div></form>`;
  } else if (modal.type === "delete") {
    content = `<h2 id="modal-title">${t("deleteTitle")}</h2><p>${t("deleteHint")}</p><strong>${esc(data.projects.find((p) => p.id === modal.id)?.name)}</strong><div class="modal-actions">${btn("close", t("cancel"))}${btn("confirm-delete", t("delete"), "trash", "danger")}</div>`;
  } else {
    content = `<h2 id="modal-title">${t("helpTitle")}</h2>${[1, 2, 3, 4].map((n) => `<div class="help-step"><h3>${t(`step${n}`)}</h3><p>${t(`step${n}Text`)}</p></div>`).join("")}<div class="notice"><div><strong>${t("coverage")}</strong><p>${t("coverageText")}</p></div></div>`;
  }
  return `<div class="modal-overlay" data-action="overlay-close"><section class="modal ${modal.type === "template" ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${iconBtn("close", "close", "close")}${content}</section></div>`;
}
function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir =
    languages.find((l) => l.code === lang)?.dir || "ltr";
  if (!project()) return;
  document.querySelector("#app").innerHTML =
    `${sidebar()}<main class="main">${header()}<div class="page-content">${page === "studio" ? studio() : page === "projects" ? projectsPage() : page === "materials" ? materialsPage() : reportsPage()}</div></main>${modalView()}`;
  if (modal)
    requestAnimationFrame(() =>
      document
        .querySelector(".modal input, .modal .template-card, .modal button")
        ?.focus(),
    );
}
function updateItem(key, value) {
  const i = item(),
    next = structuredClone(i);
  next[key] = value;
  if (key === "rows" || key === "cols") {
    const old = i;
    next.panels = Array.from({ length: next.rows * next.cols }, (_, index) => {
      const r = Math.floor(index / next.cols),
        c = index % next.cols;
      return r < old.rows && c < old.cols
        ? old.panels[r * old.cols + c]
        : "fixed";
    });
  }
  const errors = validateItem(next);
  if (errors.length) {
    toast(lang === "ar" && next.design ? t("invalidDesign") : errors[0]);
    render();
    return;
  }
  commit(() => Object.assign(i, next));
}
document.addEventListener(
  "toggle",
  (e) => {
    if (!e.target.isConnected) return;
    if (e.target.matches(".division-details"))
      expandedDivisions = e.target.open;
    if (e.target.matches(".sash-edge-details")) expandedEdges = e.target.open;
    if (e.target.matches(".profile-details")) expandedProfiles = e.target.open;
    if (e.target.matches(".project-details")) expandedProject = e.target.open;
  },
  true,
);
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "language") {
    lang = el.value;
    try {
      localStorage.setItem("frame-workshop-language", lang);
    } catch {}
    render();
    return;
  }
  if (el.id === "project-select") {
    data.active = el.value;
    data.item = project().items[0]?.id;
    selectedPanel = 0;
    zoom = 1;
    persist();
    render();
    return;
  }
  if (!el.dataset.scope) return;
  if (el.validity && !el.validity.valid) {
    toast(t("invalidNumber"));
    render();
    return;
  }
  let value = el.type === "number" ? Number(el.value) : el.value;
  if (["cols", "rows"].includes(el.dataset.key)) value = Number(value);
  if (el.type === "number" && (!el.value || !Number.isFinite(value))) {
    toast(t("invalidNumber"));
    render();
    return;
  }
  const { scope, key } = el.dataset;
  if (scope === "selection") {
    selectedPanel = Number(value);
    render();
    return;
  }
  if (scope === "sliding") {
    applyDesign(() =>
      updateSlidingGroup(item(), currentPanel().groupId, key, value),
    );
    return;
  }
  if (scope === "pricing") {
    const id =
      el.closest("[data-pricing-item]")?.dataset.pricingItem || item().id;
    const target = project().items.find((i) => i.id === id),
      next = structuredClone(target);
    next.pricing = { mode: "auto", rate: 0, ...next.pricing, [key]: value };
    if (validateItem(next).length) {
      toast(t("invalidNumber"));
      render();
      return;
    }
    commit(() => Object.assign(target, next));
    return;
  }
  if (scope === "quotation") {
    const next = structuredClone(project());
    next.quotation = { ...quoteDefaults, ...next.quotation, [key]: value };
    if (validateProject(next).length) {
      toast(t("invalidPayments"));
      render();
      return;
    }
    commit(() => Object.assign(project(), next));
    return;
  }
  if (scope === "vent") {
    applyDesign(() =>
      updatePanel(item(), currentPanel().id, {
        vent: { ...currentPanel().vent, [key]: value },
      }),
    );
    return;
  }
  if (scope === "edge") {
    const p = currentPanel(),
      [side, prop] = key.split(".");
    const edgeOverrides = structuredClone(p.edgeOverrides);
    edgeOverrides[side] = { ...p.edges[side], [prop]: value };
    applyDesign(() => updatePanel(item(), p.id, { edgeOverrides }));
    return;
  }
  if (scope === "design" && key === "sashJoint") {
    applyDesign(() => setSashJoint(item(), value));
    return;
  }
  if (scope === "design") {
    applyDesign(() => {
      const d = getDesign(item());
      d[key] = value;
      if (key === "shape") {
        if (value === "corner" && d.layouts.length === 1)
          d.layouts.push(
            createDesignTemplate("corner-mixed").design.layouts[1],
          );
        if (value !== "corner") d.layouts = d.layouts.slice(0, 1);
        if (value === "arched")
          d.archRise = Math.min(d.archRise, item().width / 2);
      }
      return d;
    });
    return;
  }
  if (scope === "handle") {
    applyDesign(() =>
      updatePanel(item(), currentPanel().id, {
        handle: {
          [key]: value,
          ...(key === "type" ? { side: "auto", height: 0 } : {}),
        },
      }),
    );
    return;
  }
  if (scope === "split-mm") {
    const part = listSplits(item()).find((s) => s.id === key);
    if (part)
      applyDesign(() =>
        updateSplit(item(), key, Number(value) / part.available),
      );
    return;
  }
  if (scope === "split") {
    applyDesign(() => updateSplit(item(), key, Number(value) / 100));
    return;
  }
  if (scope === "preset") {
    if (value !== "" && systemPresets[Number(value)]) {
      const preset = systemPresets[Number(value)],
        next = structuredClone(item());
      next.design = {
        ...getDesign(item()),
        ...Object.fromEntries(systemKeys.map((k) => [k, preset[k]])),
      };
      next.profile = preset.profileFace ?? next.profile;
      next.sash = preset.sashFace ?? next.sash;
      if (validateItem(next).length) {
        toast(t("presetError"));
        render();
        return;
      }
      commit(() => Object.assign(item(), next));
    }
    return;
  }
  if (scope === "item") updateItem(key, value);
  else {
    const p = structuredClone(project());
    if (scope === "project") p[key] = value;
    else {
      const parts = key.split(".");
      if (parts.length === 2) p.settings[parts[0]][parts[1]] = value;
      else p.settings[key] = value;
    }
    const errors = validateProject(p);
    if (errors.length) {
      toast(errors[0]);
      render();
      return;
    }
    commit(() => Object.assign(project(), p));
  }
});
document.addEventListener("click", (e) => {
  const panel = e.target.closest("[data-panel]");
  if (panel) {
    selectedPanel = Number(panel.dataset.panel);
    render();
    return;
  }
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const action = b.dataset.action;
  if (b.tagName === "A") e.preventDefault();
  if (action === "overlay-close" && e.target !== b) return;
  handle(action, b);
});
function handle(action, b) {
  if (action === "vent-add" || action === "vent-remove") {
    const p = currentPanel(),
      box = glassBounds(item(), p, getDesign(item()));
    const vent =
      action === "vent-remove"
        ? null
        : {
            diameter: Math.min(
              150,
              Math.floor(Math.min(box.width, box.height) - 20),
            ),
            x: box.width / 2,
            y: box.height / 2,
          };
    applyDesign(() => updatePanel(item(), p.id, { vent }));
    return;
  }
  if (action.startsWith("divide3-")) {
    applyDesign(() =>
      splitPanelCount(item(), currentPanel().id, action.slice(8), 3),
    );
    return;
  }

  if (action === "front-right" || action === "front-left") {
    applyDesign(() => ({
      ...getDesign(item()),
      slidingFront: action.slice(6),
    }));
    return;
  }

  if (action === "mirror-design") {
    applyDesign(() => mirrorDesign(item()));
    return;
  }
  if (action === "sash-add" || action === "sash-remove") {
    const group = getDesignGeometry(item()).groups.find(
      (g) => g.id === currentPanel().groupId,
    );
    if (group)
      applyDesign(() =>
        updateSlidingGroup(
          item(),
          group.id,
          "count",
          group.count + (action === "sash-add" ? 1 : -1),
        ),
      );
    return;
  }
  if (action === "meeting-thin" || action === "meeting-thick") {
    applyDesign(() =>
      setMeetingPreset(item(), currentPanel().groupId, action.slice(8)),
    );
    return;
  }

  if (action === "add-sliding") {
    applyDesign(() => setSlidingGroup(item(), currentPanel().id, 2));
    return;
  }
  if (action === "remove-sliding") {
    applyDesign(() => removeSlidingGroup(item(), currentPanel().groupId));
    return;
  }
  if (action === "reset-edges") {
    applyDesign(() =>
      updatePanel(item(), currentPanel().id, { edgeOverrides: {} }),
    );
    return;
  }

  if (action.startsWith("inspector-")) {
    inspectorTab = action.slice(10);
    render();
    return;
  }
  if (action.startsWith("split-")) {
    applyDesign(() =>
      splitPanelCount(item(), currentPanel().id, action.slice(6), 2),
    );
    return;
  }
  if (action === "merge-panel") {
    applyDesign(() => mergePanel(item(), currentPanel().id));
    return;
  }
  if (action === "save-system") {
    const d = getDesign(item());
    if (!d.systemName.trim()) return toast(t("presetNameRequired"));
    const preset = {
      ...Object.fromEntries(systemKeys.map((k) => [k, d[k]])),
      profileFace: item().profile,
      sashFace: item().sash,
    };
    const next = [
      preset,
      ...systemPresets.filter((p) => p.systemName !== preset.systemName),
    ].slice(0, 30);
    try {
      localStorage.setItem("frame-workshop-systems", JSON.stringify(next));
      systemPresets = next;
      toast(t("savedPreset"));
      render();
    } catch {
      toast(t("presetError"));
    }
    return;
  }

  if (action.startsWith("nav-")) {
    page = action.slice(4);
    mobileNav = false;
    render();
    return;
  }
  if (action === "toggle-nav") {
    mobileNav = !mobileNav;
    render();
    return;
  }
  if (action === "add-item") {
    if (project().items.length >= 100) return toast(t("itemLimit"));
    modal = { type: "template" };
    render();
    return;
  }
  if (action === "new-project") {
    if (data.projects.length >= 50) return toast(t("projectLimit"));
    modal = { type: "new" };
    render();
    return;
  }
  if (action === "close" || action === "overlay-close") {
    modal = null;
    render();
    return;
  }
  if (action === "help") {
    modal = { type: "help" };
    render();
    return;
  }
  if (action === "template") {
    const i = makeTemplate(b.dataset.template);
    inspectorTab = "design";
    i.name = t(templates.find(([k]) => k === b.dataset.template)[1]);
    modal = null;
    selectedPanel = 0;
    zoom = 1;
    commit(() => {
      project().items.push(i);
      data.item = i.id;
      page = "studio";
    });
    toast(t("addedToast"));
    return;
  }
  if (action === "select-item") {
    data.item = b.dataset.id;
    selectedPanel = 0;
    zoom = 1;
    persist();
    render();
    return;
  }
  if (action === "mode" && ["tilt", "awning"].includes(b.dataset.mode)) {
    applyDesign(() =>
      updatePanel(item(), currentPanel().id, {
        mode: b.dataset.mode,
        handle: { type: "catch", side: "auto" },
      }),
    );
    return;
  }
  if (action === "mode" && item().design) {
    applyDesign(() =>
      updatePanel(item(), currentPanel().id, { mode: b.dataset.mode }),
    );
    return;
  }
  if (action === "mode") {
    const panels = [...item().panels];
    panels[selectedPanel] = b.dataset.mode;
    updateItem("panels", panels);
    return;
  }
  if (action === "finish") {
    updateItem("finish", b.dataset.finish);
    return;
  }
  if (action === "duplicate") {
    if (project().items.length >= 100) return toast(t("itemLimit"));
    commit(() => {
      const i = structuredClone(item());
      i.id = uid();
      i.name = `${i.name} (${t("copy")})`.slice(0, 200);
      project().items.push(i);
      data.item = i.id;
    });
    return;
  }
  if (action === "remove-item") {
    commit(() => {
      const id = item().id;
      project().items = project().items.filter((i) => i.id !== id);
      data.item = project().items[0]?.id;
      selectedPanel = 0;
    });
    toast(t("removedToast"));
    return;
  }
  if (action === "undo" || action === "redo") {
    const from = action === "undo" ? history : future,
      to = action === "undo" ? future : history;
    if (from.length) {
      to.push(JSON.stringify(data));
      data = JSON.parse(from.pop());
      selectedPanel = 0;
      persist();
      render();
    }
    return;
  }
  if (action.startsWith("zoom-")) {
    zoom =
      action === "zoom-in"
        ? Math.min(1.6, zoom + 0.1)
        : action === "zoom-out"
          ? Math.max(0.5, zoom - 0.1)
          : 1;
    render();
    return;
  }
  if (action.startsWith("open-project:")) {
    data.active = action.split(":")[1];
    data.item = project().items[0]?.id;
    page = "studio";
    selectedPanel = 0;
    persist();
    render();
    return;
  }
  if (action.startsWith("delete-project:")) {
    modal = { type: "delete", id: action.split(":")[1] };
    render();
    return;
  }
  if (action === "confirm-delete") {
    const id = modal.id;
    modal = null;
    commit(() => {
      data.projects = data.projects.filter((p) => p.id !== id);
      if (!data.projects.length) {
        const p = createProject();
        p.name = t("unnamed");
        p.items = [];
        data.projects.push(p);
      }
      if (data.active === id) {
        data.active = data.projects[0].id;
        data.item = project().items[0]?.id;
      }
    });
    return;
  }
  if (action.startsWith("report-")) {
    reportTab = action.slice(7);
    render();
    return;
  }
  if (action === "export") {
    download(
      JSON.stringify(
        { format: "frame-workshop", version: 1, project: project() },
        null,
        2,
      ),
      `${safeName(project().name)}.json`,
      "application/json",
    );
    toast(t("exportToast"));
    return;
  }
  if (action === "import") {
    document.querySelector("#import-file").click();
    return;
  }
  if (action === "csv") {
    exportCsv();
    return;
  }
  if (action === "print") {
    window.print();
    return;
  }
  if (action === "svg" && item()) {
    download(
      drawing(item(), { id: "export" }),
      `${safeName(item().name)}.svg`,
      "image/svg+xml",
    );
    return;
  }
}
function safeName(s) {
  return s.replace(/[^\p{L}\p{N}_-]/gu, "-").slice(0, 80) || "project";
}
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(v) {
  let s = String(v ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}
function exportCsv() {
  const p = project(),
    c = calculateProject(p);
  let rows = [];
  if (reportTab === "quote") {
    rows = [
      [
        "Item",
        "Width (mm)",
        "Height (mm)",
        "Quantity",
        "Material",
        "Glazing",
        "Unit price",
        "Amount",
        "Currency",
      ],
      ...p.items.map((i, n) => [
        i.name,
        i.design?.shape === "corner"
          ? `${i.width} + ${i.design.returnWidth}`
          : i.width,
        i.height,
        i.quantity,
        i.material,
        i.glass,
        c.items[n].unitPrice.toFixed(2),
        c.items[n].totalPrice.toFixed(2),
        p.settings.currency,
      ]),
      [
        "Subtotal",
        "",
        "",
        "",
        "",
        "",
        "",
        c.subtotal.toFixed(2),
        p.settings.currency,
      ],
      [
        "Discount",
        "",
        "",
        "",
        "",
        "",
        "",
        c.discount.toFixed(2),
        p.settings.currency,
      ],
      ["Tax", "", "", "", "", "", "", c.tax.toFixed(2), p.settings.currency],
      [
        "Total",
        "",
        "",
        "",
        "",
        "",
        "",
        c.total.toFixed(2),
        p.settings.currency,
      ],
    ];
  } else if (reportTab === "bill") {
    rows = [
      [
        "Item",
        "Component",
        "Material",
        "Length / width (mm)",
        "Height (mm)",
        "Quantity",
        "Face",
        "Part / shape",
        "Start angle",
        "End angle",
        "Area each (m2)",
        "System",
        "Handle upgrade per unit",
      ],
    ];
    p.items.forEach((i, n) => {
      const r = c.items[n];
      for (const x of r.cuts)
        rows.push([
          i.name,
          x.type,
          i.material,
          x.length,
          "",
          x.quantity,
          (x.face ?? 0) + 1,
          x.part || "",
          x.angleStart ?? "",
          x.angleEnd ?? "",
          "",
          i.design?.systemName || "Generic",
        ]);
      for (const x of r.curvedParts || [])
        rows.push([
          i.name,
          "curved profile",
          i.material,
          x.length,
          "",
          x.quantity,
          x.face + 1,
          "Separate bending; no straight cut angles",
          "",
          "",
          "",
          i.design.systemName,
        ]);
      for (const x of r.glassPieces)
        rows.push([
          i.name,
          "glass",
          i.glass,
          x.width,
          x.height,
          x.quantity,
          (x.face ?? 0) + 1,
          x.shape || "rectangle",
          "",
          "",
          x.area ?? (x.width * x.height) / 1e6,
          "",
        ]);
      for (const x of r.glassPieces.filter((x) => x.vent))
        rows.push([
          i.name,
          "circular fan hole",
          i.glass,
          x.vent.diameter,
          "",
          x.quantity,
          (x.face ?? 0) + 1,
          `panel ${x.panel}; centre x=${x.vent.x} y=${x.vent.y} mm from glass top-left; fan and drilling not priced`,
        ]);
      for (const x of r.infillPieces)
        rows.push([
          i.name,
          "solid infill",
          "",
          x.width,
          x.height,
          x.quantity,
          (x.face ?? 0) + 1,
          "rectangle",
          "",
          "",
          x.area ?? (x.width * x.height) / 1e6,
          "",
        ]);
      rows.push([i.name, "hardware", "", "", "", r.openingCount]);
      if (i.design)
        for (const panel of getDesignGeometry(i).panels.filter(
          (p) => !["fixed", "solid"].includes(p.mode),
        ))
          rows.push([
            i.name,
            "handle",
            panel.handle.color,
            "",
            panel.handle.height,
            i.quantity,
            panel.face + 1,
            panel.handle.type,
            "",
            "",
            "",
            panel.handle.type === "none" ? 0 : panel.handle.extraCost,
          ]);
      if (i.design?.shape === "corner")
        rows.push([i.name, "NOTE: corner connector and covers NOT PRICED"]);
    });
  } else {
    let cuts;
    try {
      cuts = cuttingResult();
    } catch {
      return toast(t("cutLimit"));
    }
    rows = [
      [
        "Bar",
        "Material",
        "Profile",
        "Finish",
        "Cuts (mm)",
        "Offcut (mm)",
        "Cut angles in matching order",
        "System",
      ],
      ...cuts.bars.map((b, n) => [
        n + 1,
        b.material,
        b.type,
        b.finish,
        b.cuts.join(" + "),
        b.remainder,
        b.pieces
          .map((x) => `${x.angleStart ?? "—"}/${x.angleEnd ?? "—"}`)
          .join("; "),
        b.system,
      ]),
      ...cuts.unfit.map((x) => [
        "UNFIT",
        x.material,
        x.type,
        x.finish,
        `${x.length} x ${x.quantity}`,
        "",
      ]),
    ];
  }
  download(
    "\ufeff" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n"),
    `${safeName(p.name)}-${reportTab}.csv`,
    "text/csv;charset=utf-8",
  );
}
document.querySelector("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  if (data.projects.length >= 50) return toast(t("projectLimit"));
  try {
    if (file.size > 2_000_000) throw Error();
    const d = JSON.parse(await file.text());
    if (
      d.format !== "frame-workshop" ||
      d.version !== 1 ||
      !d.project ||
      validateProject(d.project).length
    )
      throw Error();
    const p = structuredClone(d.project);
    p.id = uid();
    p.items.forEach((i) => (i.id = uid()));
    commit(() => {
      data.projects.push(p);
      data.active = p.id;
      data.item = p.items[0]?.id;
      page = "studio";
      selectedPanel = 0;
    });
    toast(t("importedToast"));
  } catch {
    toast(t("invalidFile"));
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id !== "new-project-form") return;
  e.preventDefault();
  const f = new FormData(e.target),
    name = String(f.get("name")).trim();
  if (!name) return;
  const p = createProject();
  p.name = name;
  p.customer = String(f.get("customer")).trim();
  p.items = [];
  modal = null;
  commit(() => {
    data.projects.push(p);
    data.active = p.id;
    data.item = null;
    page = "studio";
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal) {
    modal = null;
    render();
    return;
  }
  if (modal && e.key === "Tab") {
    const elements = [
      ...document.querySelectorAll(
        ".modal button,.modal input,.modal select,.modal textarea",
      ),
    ].filter((el) => !el.disabled);
    const first = elements[0],
      last = elements.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
    return;
  }
  if (e.target.closest("[data-panel]") && ["Enter", " "].includes(e.key)) {
    e.preventDefault();
    selectedPanel = Number(e.target.closest("[data-panel]").dataset.panel);
    render();
    return;
  }
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key.toLowerCase() === "z" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
  ) {
    e.preventDefault();
    handle(e.shiftKey ? "redo" : "undo");
  }
});
render();
if (corrupt) toast(t("restoreError"));
else persist();
