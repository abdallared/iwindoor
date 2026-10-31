import { applySellingPrice, quoteDefaults } from "./quotation.js";
import { finishNames } from "./finishes.js";
import { validateDesign } from "./design.js";
import { calculateDesignItem } from "./advanced-calc.js";
// Generic estimating geometry only; verify all deductions with the profile supplier.
const MATERIALS = ["UPVC", "PVC", "Aluminium"];
const OPENINGS = [
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
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const finite = (value, min, max) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function defaultSettings() {
  return {
    currency: "USD",
    rates: { UPVC: 14, PVC: 11, Aluminium: 18 },
    glassRates: { single: 28, double: 52, triple: 78 },
    infillRate: 45,
    hardware: 24,
    labor: 35,
    waste: 8,
    markup: 25,
    discount: 0,
    tax: 0,
    stockLength: 6000,
    kerf: 3,
  };
}

export function createItem(template = "casement") {
  const templates = {
    casement: { cols: 2, panels: ["left", "right"] },
    sliding: { cols: 2, panels: ["slide-left", "slide-right"] },
    door: { width: 900, height: 2100, cols: 1, panels: ["right"] },
    fixed: { cols: 1, panels: ["fixed"] },
    "tilt-turn": { cols: 1, panels: ["tilt-turn"] },
    triple: { width: 1800, cols: 3, panels: ["left", "fixed", "right"] },
    transom: {
      height: 1600,
      cols: 2,
      rows: 2,
      panels: ["fixed", "fixed", "left", "right"],
    },
  };
  return {
    id: id(),
    name: `${template.charAt(0).toUpperCase() + template.slice(1)} window`,
    width: 1200,
    height: 1400,
    quantity: 1,
    material: "UPVC",
    finish: "white",
    glass: "double",
    cols: 2,
    rows: 1,
    panels: ["left", "right"],
    profile: 60,
    sash: 50,
    ...(templates[template] || templates.casement),
  };
}

export function createProject() {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return {
    id: id(),
    name: "My window project",
    customer: "",
    email: "",
    reference: "FW-001",
    date,
    notes: "",
    items: [createItem()],
    settings: defaultSettings(),
  };
}

function settingsErrors(settings) {
  if (!object(settings)) return ["Settings must be an object."];
  const errors = [];
  if (
    typeof settings.currency !== "string" ||
    !/^[A-Z]{3}$/.test(settings.currency)
  )
    errors.push("Currency must be a three-letter code.");
  for (const key of MATERIALS)
    if (!finite(settings.rates?.[key], 0, 1e6))
      errors.push(`Invalid ${key} profile rate.`);
  for (const key of ["single", "double", "triple"])
    if (!finite(settings.glassRates?.[key], 0, 1e6))
      errors.push(`Invalid ${key} glass rate.`);
  for (const key of ["hardware", "labor", "infillRate"])
    if (!finite(settings[key], 0, 1e6)) errors.push(`Invalid ${key} cost.`);
  for (const key of ["waste", "discount", "tax"])
    if (!finite(settings[key], 0, 100))
      errors.push(`${key} must be between 0 and 100 percent.`);
  if (!finite(settings.markup, 0, 1000))
    errors.push("Markup must be between 0 and 1000 percent.");
  if (!finite(settings.stockLength, 100, 20000))
    errors.push("Stock length must be between 100 and 20000 mm.");
  if (!finite(settings.kerf, 0, 20))
    errors.push("Saw kerf must be between 0 and 20 mm.");
  return errors;
}

export function validateItem(item) {
  if (!object(item)) return ["Item must be an object."];
  const errors = [];
  if (typeof item.id !== "string" || !item.id || item.id.length > 200)
    errors.push("Item must have a valid ID.");
  if (typeof item.name !== "string" || item.name.length > 200)
    errors.push("Item name must be text up to 200 characters.");
  for (const key of ["width", "height"])
    if (!finite(item[key], 200, 6000))
      errors.push(`${key} must be between 200 and 6000 mm.`);
  if (!Number.isInteger(item.quantity) || !finite(item.quantity, 1, 100))
    errors.push("Quantity must be a whole number from 1 to 100.");
  for (const key of ["cols", "rows"])
    if (!Number.isInteger(item[key]) || !finite(item[key], 1, 6))
      errors.push(`${key} must be a whole number from 1 to 6.`);
  for (const key of ["profile", "sash"])
    if (!finite(item[key], 10, 200))
      errors.push(`${key} must be between 10 and 200 mm.`);
  if (!MATERIALS.includes(item.material))
    errors.push("Unknown profile material.");
  if (
    item.pricing !== undefined &&
    (!object(item.pricing) ||
      !["auto", "unit", "area"].includes(item.pricing.mode) ||
      !finite(item.pricing.rate, 0, 1e9))
  )
    errors.push("Invalid selling price.");
  if (!finishNames.includes(item.finish)) errors.push("Unknown finish.");
  if (!["single", "double", "triple"].includes(item.glass))
    errors.push("Unknown glazing.");
  if (
    !Array.isArray(item.panels) ||
    item.panels.length !== item.cols * item.rows ||
    item.panels.some((p) => !OPENINGS.includes(p))
  )
    errors.push("Panels must match the grid and use supported opening styles.");
  if (Object.hasOwn(item, "design") && !errors.length)
    return validateDesign(item);
  if (!errors.length) {
    const { cellWidth, cellHeight } = geometry(item);
    if (cellWidth <= 0 || cellHeight <= 0)
      errors.push("The frame and dividers leave no panel space.");
    if (
      item.panels.some((p) => p !== "fixed" && p !== "solid") &&
      (cellWidth <= 2 * item.sash || cellHeight <= 2 * item.sash)
    )
      errors.push(
        "The sash leaves no glass space; increase dimensions or reduce the grid.",
      );
  }
  return errors;
}

export function validateProject(project) {
  if (!object(project)) return ["Project must be an object."];
  const errors = [];
  for (const key of [
    "id",
    "name",
    "customer",
    "email",
    "reference",
    "date",
    "notes",
  ])
    if (
      typeof project[key] !== "string" ||
      project[key].length > (key === "notes" ? 10000 : 300)
    )
      errors.push(`${key} must be text of a supported length.`);
  if (project.quotation !== undefined) {
    if (!object(project.quotation)) errors.push("Invalid quotation details.");
    else {
      const q = { ...quoteDefaults, ...project.quotation };
      for (const key of [
        "business",
        "phone",
        "address",
        "validUntil",
        "depositLabel",
        "deliveryLabel",
        "balanceLabel",
      ])
        if (typeof q[key] !== "string" || q[key].length > 500)
          errors.push("Invalid quotation text.");
      if (
        !finite(q.depositPercent, 0, 100) ||
        !finite(q.deliveryPercent, 0, 100) ||
        q.depositPercent + q.deliveryPercent > 100
      )
        errors.push(
          "Payment percentages must total at most 100% before the final balance.",
        );
    }
  }
  errors.push(...settingsErrors(project.settings));
  if (!Array.isArray(project.items) || project.items.length > 100)
    errors.push("Project must contain an array of up to 100 items.");
  else {
    const ids = new Set();
    project.items.forEach((item, index) => {
      errors.push(
        ...validateItem(item).map((error) => `Item ${index + 1}: ${error}`),
      );
      if (item && ids.has(item.id))
        errors.push(`Item ${index + 1}: duplicate ID.`);
      if (item) ids.add(item.id);
    });
  }
  return errors;
}

function geometry(item) {
  const innerWidth = item.width - 2 * item.profile;
  const innerHeight = item.height - 2 * item.profile;
  return {
    innerWidth,
    innerHeight,
    cellWidth: (innerWidth - (item.cols - 1) * item.profile) / item.cols,
    cellHeight: (innerHeight - (item.rows - 1) * item.profile) / item.rows,
  };
}

export function calculateItem(item, settings = defaultSettings()) {
  return applySellingPrice(item, calculateEstimatedItem(item, settings));
}
function calculateEstimatedItem(item, settings = defaultSettings()) {
  const errors = [...validateItem(item), ...settingsErrors(settings)];
  if (errors.length) throw new RangeError(errors.join(" "));
  if (item.design) return calculateDesignItem(item, settings);
  const { innerHeight, cellWidth, cellHeight } = geometry(item);
  const cuts = [];
  const add = (type, length, quantity) => {
    if (quantity)
      cuts.push({
        type,
        length,
        quantity: quantity * item.quantity,
        material: item.material,
        finish: item.finish,
        system: "Generic",
        profileFace: type === "sash" ? item.sash : item.profile,
        angleStart: type === "divider" ? 90 : 45,
        angleEnd: type === "divider" ? 90 : 45,
      });
  };
  add("frame", item.width, 2);
  add("frame", item.height, 2);
  add("divider", innerHeight, item.cols - 1);
  add("divider", cellWidth, (item.rows - 1) * item.cols);
  const glassPieces = [];
  const infillPieces = [];
  let openingCount = 0;
  for (const panel of item.panels) {
    const opening = panel !== "fixed" && panel !== "solid";
    if (opening) {
      openingCount++;
      add("sash", cellWidth, 2);
      add("sash", cellHeight, 2);
    }
    if (panel !== "solid")
      glassPieces.push({
        width: cellWidth - (opening ? 2 * item.sash : 0),
        height: cellHeight - (opening ? 2 * item.sash : 0),
        quantity: item.quantity,
      });
    else
      infillPieces.push({
        width: cellWidth,
        height: cellHeight,
        quantity: item.quantity,
      });
  }
  const area = ((item.width * item.height) / 1e6) * item.quantity;
  const glassArea = glassPieces.reduce(
    (sum, p) => sum + (p.width * p.height * p.quantity) / 1e6,
    0,
  );
  const infillArea = infillPieces.reduce(
    (sum, p) => sum + (p.width * p.height * p.quantity) / 1e6,
    0,
  );
  const profileLength = cuts.reduce(
    (sum, c) => sum + (c.length * c.quantity) / 1000,
    0,
  );
  const materialCost =
    (profileLength * settings.rates[item.material] +
      glassArea * settings.glassRates[item.glass] +
      infillArea * settings.infillRate) *
    (1 + settings.waste / 100);
  const baseCost =
    materialCost +
    openingCount * item.quantity * settings.hardware +
    settings.labor * item.quantity;
  const totalPrice = baseCost * (1 + settings.markup / 100);
  const warnings = [
    "Generic deductions: confirm manufacturing sizes with your profile supplier.",
  ];
  return {
    area,
    glassArea,
    infillArea,
    profileLength,
    openingCount: openingCount * item.quantity,
    cuts,
    glassPieces,
    infillPieces,
    baseCost,
    unitPrice: totalPrice / item.quantity,
    totalPrice,
    warnings,
  };
}

export function calculateProject(project) {
  const errors = validateProject(project);
  if (errors.length) throw new RangeError(errors.join(" "));
  const items = project.items.map((item) =>
    calculateItem(item, project.settings),
  );
  const sum = (key) => items.reduce((total, item) => total + item[key], 0);
  const subtotal = sum("totalPrice");
  const discount = (subtotal * project.settings.discount) / 100;
  const tax = ((subtotal - discount) * project.settings.tax) / 100;
  return {
    items,
    quantity: project.items.reduce((sum, i) => sum + i.quantity, 0),
    area: sum("area"),
    glassArea: sum("glassArea"),
    infillArea: sum("infillArea"),
    profileLength: sum("profileLength"),
    subtotal,
    discount,
    tax,
    total: subtotal - discount + tax,
    baseCost: sum("baseCost"),
    warnings: [...new Set(items.flatMap((i) => i.warnings))],
  };
}

// Best-fit decreasing heuristic, not a globally optimal cutting solver. One kerf per cut.
export function optimizeCuts(cuts, stockLength = 6000, kerf = 3) {
  if (
    !Array.isArray(cuts) ||
    !finite(stockLength, 100, 20000) ||
    !finite(kerf, 0, 20)
  )
    throw new RangeError("Invalid cutting inputs.");
  const bars = [],
    unfit = [],
    pieces = [];
  let pieceCount = 0;
  for (const cut of cuts) {
    if (
      !object(cut) ||
      !finite(cut.length, Number.MIN_VALUE, 20000) ||
      !Number.isInteger(cut.quantity) ||
      !finite(cut.quantity, 1, 100000) ||
      typeof cut.type !== "string" ||
      typeof cut.material !== "string"
    )
      throw new RangeError("Invalid cut.");
    pieceCount += cut.quantity;
    if (pieceCount > 100000)
      throw new RangeError("Cutting plan exceeds 100000 pieces.");
    if (cut.length + kerf > stockLength) {
      unfit.push({ ...cut });
      continue;
    }
    for (let i = 0; i < cut.quantity; i++) pieces.push(cut);
  }
  pieces.sort((a, b) => b.length - a.length);
  const groups = new Map();
  for (const cut of pieces) {
    const key = JSON.stringify([
      cut.material,
      cut.type,
      cut.finish || "",
      cut.system || "Generic",
      cut.profileFace ?? null,
    ]);
    if (!groups.has(key)) groups.set(key, []);
    const group = groups.get(key);
    const cost = cut.length + kerf;
    let best;
    for (const bar of group)
      if (
        bar.remainder + 1e-8 >= cost &&
        (!best || bar.remainder < best.remainder)
      )
        best = bar;
    if (!best) {
      best = {
        type: cut.type,
        material: cut.material,
        finish: cut.finish || "",
        cuts: [],
        pieces: [],
        system: cut.system || "Generic",
        profileFace: cut.profileFace,
        used: 0,
        remainder: stockLength,
      };
      group.push(best);
      bars.push(best);
    }
    best.cuts.push(cut.length);
    best.pieces.push({ ...cut, quantity: 1 });
    best.used += cost;
    best.remainder = Math.max(0, stockLength - best.used);
  }
  const useful = bars.reduce(
    (sum, bar) => sum + bar.cuts.reduce((n, length) => n + length, 0),
    0,
  );
  return {
    bars,
    unfit,
    wastePercent: bars.length
      ? (1 - useful / (bars.length * stockLength)) * 100
      : 0,
  };
}
