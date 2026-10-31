import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultSettings,
  createItem,
  createProject,
  validateItem,
  validateProject,
  calculateItem,
  calculateProject,
  optimizeCuts,
} from "../src/core.js";

test("all templates have valid geometry and finite totals", () => {
  for (const name of [
    "casement",
    "sliding",
    "door",
    "fixed",
    "tilt-turn",
    "triple",
    "transom",
  ]) {
    const item = createItem(name);
    assert.deepEqual(validateItem(item), []);
    assert.ok(Number.isFinite(calculateItem(item).totalPrice));
  }
});
test("fixed frame uses outer lengths and clear glass dimensions", () => {
  const item = {
    ...createItem("fixed"),
    width: 1000,
    height: 1000,
    profile: 50,
  };
  const result = calculateItem(item);
  assert.equal(result.profileLength, 4);
  assert.equal(result.glassArea, 0.81);
  assert.equal(result.openingCount, 0);
  assert.deepEqual(result.glassPieces, [
    { width: 900, height: 900, quantity: 1 },
  ]);
});
test("quantity multiplies physical quantities and costs once", () => {
  const item = createItem();
  const one = calculateItem(item),
    three = calculateItem({ ...item, quantity: 3 });
  for (const key of [
    "area",
    "glassArea",
    "profileLength",
    "openingCount",
    "baseCost",
    "totalPrice",
  ])
    assert.ok(Math.abs(three[key] - one[key] * 3) < 1e-8, key);
  assert.ok(Math.abs(one.unitPrice - three.unitPrice) < 1e-8);
});
test("discount precedes tax and empty projects total zero", () => {
  const project = createProject();
  project.settings = { ...defaultSettings(), discount: 10, tax: 20 };
  const result = calculateProject(project);
  assert.ok(Math.abs(result.discount - result.subtotal * 0.1) < 1e-8);
  assert.ok(Math.abs(result.total - result.subtotal * 0.9 * 1.2) < 1e-8);
  assert.equal(calculateProject({ ...project, items: [] }).total, 0);
});
test("malformed imports and impossible dimensions are rejected without validator exceptions", () => {
  for (const value of [null, [], 1, {}, { items: [null], settings: {} }])
    assert.ok(validateProject(value).length);
  for (const change of [
    { width: NaN },
    { quantity: Infinity },
    { quantity: 1.5 },
    { panels: ["bogus"] },
    { width: 200, cols: 6, panels: Array(6).fill("fixed") },
  ])
    assert.ok(validateItem({ ...createItem(), ...change }).length);
  const project = createProject();
  project.settings.tax = "20";
  assert.ok(validateProject(project).length);
  assert.throws(() => calculateProject(project), RangeError);
});
test("cutting respects material, profile, finish, kerf and preserves piece counts", () => {
  const cuts = [
    {
      type: "Frame",
      material: "UPVC",
      finish: "white",
      length: 2000,
      quantity: 3,
    },
    {
      type: "Frame",
      material: "UPVC",
      finish: "oak",
      length: 2000,
      quantity: 1,
    },
    {
      type: "Sash",
      material: "UPVC",
      finish: "white",
      length: 2000,
      quantity: 1,
    },
    { type: "Frame", material: "Aluminium", length: 2000, quantity: 1 },
    { type: "Frame", material: "UPVC", length: 6000, quantity: 2 },
  ];
  const result = optimizeCuts(cuts, 6000, 3);
  assert.equal(result.bars.length, 5);
  assert.equal(
    result.bars.reduce((n, bar) => n + bar.cuts.length, 0),
    6,
  );
  assert.equal(result.unfit[0].quantity, 2);
  for (const bar of result.bars) {
    assert.ok(bar.used <= 6000);
    assert.equal(
      bar.used,
      bar.cuts.reduce((n, length) => n + length + 3, 0),
    );
    assert.equal(bar.used + bar.remainder, 6000);
  }
  assert.ok(result.wastePercent > 0);
  assert.equal(optimizeCuts([], 6000, 3).wastePercent, 0);
});
test("exact-fit stock works with zero kerf; malicious quantities rejected", () => {
  const cut = { type: "Frame", material: "UPVC", length: 6000, quantity: 1 };
  assert.equal(optimizeCuts([cut], 6000, 0).bars[0].remainder, 0);
  assert.throws(
    () => optimizeCuts([{ ...cut, quantity: Infinity }]),
    RangeError,
  );
});

test("solid infill uses clear cell dimensions, quantity and material waste in pricing", () => {
  const item = {
    ...createItem("fixed"),
    width: 1000,
    height: 1000,
    profile: 50,
    quantity: 2,
    panels: ["solid"],
  };
  const settings = {
    ...defaultSettings(),
    waste: 10,
    markup: 20,
    labor: 0,
    rates: { UPVC: 0, PVC: 0, Aluminium: 0 },
    infillRate: 50,
  };
  const result = calculateItem(item, settings);
  assert.equal(result.glassArea, 0);
  assert.equal(result.infillArea, 1.62);
  assert.deepEqual(result.infillPieces, [
    { width: 900, height: 900, quantity: 2 },
  ]);
  assert.ok(Math.abs(result.baseCost - 1.62 * 50 * 1.1) < 1e-8);
  assert.ok(Math.abs(result.totalPrice - result.baseCost * 1.2) < 1e-8);
  assert.ok(result.cuts.every((cut) => cut.type === "frame"));
  assert.equal(
    calculateProject({ ...createProject(), items: [item], settings })
      .infillArea,
    1.62,
  );
  assert.throws(
    () => calculateItem(item, { ...settings, infillRate: NaN }),
    RangeError,
  );
});

test("project import limit is 100 items and new project dates use local calendar", () => {
  const project = createProject();
  project.items = Array.from({ length: 101 }, () => createItem());
  assert.ok(
    validateProject(project).some((error) => error.includes("100 items")),
  );
  project.items.pop();
  assert.deepEqual(validateProject(project), []);
  const now = new Date();
  assert.equal(
    project.date,
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
});
