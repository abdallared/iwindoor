import test from "node:test";
import assert from "node:assert/strict";
import {
  createItem,
  defaultSettings,
  calculateItem,
  validateItem,
  createProject,
  validateProject,
  optimizeCuts,
} from "../src/core.js";
import {
  getDesign,
  getDesignGeometry,
  createDesignTemplate,
  splitPanel,
  mergePanel,
  updatePanel,
  updateSplit,
  listSplits,
} from "../src/design.js";
import { drawing } from "../src/drawing.js";
const make = (key) => ({ ...createItem(), ...createDesignTemplate(key) });
test("legacy grid migrates reproducibly with equal clear sizes and row-major modes", () => {
  const i = createItem("transom"),
    g = getDesignGeometry(i);
  assert.deepEqual(
    g.panels.map((p) => p.mode),
    i.panels,
  );
  assert.equal(g.panels.length, 4);
  assert(g.panels.every((p) => p.width === 510 && p.height === 710));
  assert.deepEqual(listSplits(i), listSplits(i));
  assert.deepEqual(validateItem({ ...i, design: getDesign(i) }), []);
});
test("advanced templates validate, roundtrip and produce positive finite quantities", () => {
  for (const key of [
    "corner-mixed",
    "balcony",
    "arched",
    "fanlight",
    "mixed",
  ]) {
    const i = make(key);
    assert.deepEqual(validateItem(i), [], key);
    const r = calculateItem(i, defaultSettings());
    assert(r.totalPrice > 0 && Number.isFinite(r.totalPrice));
    assert(
      r.cuts.every((c) => c.length > 0 && [45, 90].includes(c.angleStart)),
    );
    assert.deepEqual(validateItem(JSON.parse(JSON.stringify(i))), []);
    assert(!drawing(i).includes("NaN"));
  }
});
test("corner faces have independent dimensions and modes and quantities counted once", () => {
  const i = make("corner-mixed"),
    g = getDesignGeometry(i);
  assert.deepEqual(
    g.faces.map((f) => f.width),
    [1200, 1800],
  );
  assert.deepEqual(
    g.faces.map((f) => f.panels.map((p) => p.mode)),
    [["fixed"], ["slide-left", "slide-right"]],
  );
  const a = calculateItem(i),
    b = calculateItem({ ...i, quantity: 3 });
  assert.equal(a.area, 4.2);
  assert.equal(a.openingCount, 2);
  assert(Math.abs(b.totalPrice - 3 * a.totalPrice) < 1e-8);
  assert.equal(b.openingCount, 6);
  assert.equal(g.panels[0].face, 0);
  assert.equal(g.panels[2].face, 1);
  assert(a.warnings.some((x) => x.includes("connector")));
});
test("nested splits, ratio edits and merge affect only selected section", () => {
  let i = createItem("fixed");
  const root = getDesignGeometry(i).panels[0];
  i.design = splitPanel(i, root.id, "vertical", 0.3);
  let g = getDesignGeometry(i);
  assert.equal(g.panels[0].width, 306);
  assert.equal(g.panels[1].width, 714);
  const id = g.panels[1].id;
  i.design = splitPanel(i, id, "horizontal", 0.4);
  g = getDesignGeometry(i);
  assert.equal(g.panels.length, 3);
  assert.equal(g.panels[0].width, 306);
  const split = listSplits(i)[0];
  i.design = updateSplit(i, split.id, 0.5);
  g = getDesignGeometry(i);
  assert.equal(g.panels[0].width, 510);
  i.design = mergePanel(i, g.panels[1].id);
  assert.equal(getDesignGeometry(i).panels.length, 2);
});
test("mitre/butt dimensions, independent joins, allowances and glass gap", () => {
  const i = make("mixed");
  i.design = getDesign(createItem("fixed"));
  i.width = 1200;
  i.height = 1400;
  let r = calculateItem(i);
  assert.deepEqual(
    r.cuts.filter((c) => c.type === "frame").map((c) => c.length),
    [1400, 1200],
  );
  assert(
    r.cuts.filter((c) => c.type === "frame").every((c) => c.angleStart === 45),
  );
  i.design.frameJoint = "butt";
  i.design.frameAllowance = 3;
  r = calculateItem(i);
  assert.deepEqual(
    r.cuts.filter((c) => c.type === "frame").map((c) => c.length),
    [1403, 1083],
  );
  const id = getDesignGeometry(i).panels[0].id;
  i.design = updatePanel(i, id, { mode: "left" });
  i.design.sashJoint = "butt";
  i.design.sashAllowance = 2;
  i.design.glassGap = 5;
  r = calculateItem(i);
  assert.deepEqual(
    r.cuts.filter((c) => c.type === "sash").map((c) => c.length),
    [1282, 982],
  );
  assert.equal(r.glassPieces[0].width, 970);
  assert.equal(r.glassPieces[0].height, 1170);
  assert(
    r.cuts.filter((c) => c.type === "sash").every((c) => c.angleStart === 90),
  );
});
test("arched quantities use segment area and exclude curved stock from straight optimizer", () => {
  const i = make("arched"),
    r = calculateItem(i),
    g = getDesignGeometry(i);
  assert.equal(r.curvedParts.length, 1);
  assert(r.curvedParts[0].length > i.width);
  const arc = r.glassPieces.find((x) => x.shape === "arched");
  assert(arc.area > 0 && arc.area < (arc.width * arc.height) / 1e6);
  assert(r.area < (i.width * i.height) / 1e6);
  assert(g.faces[0].arch.glassArea > 0);
  const used = optimizeCuts(r.cuts)
    .bars.flatMap((b) => b.cuts)
    .reduce((a, b) => a + b, 0);
  assert(
    Math.abs(used + r.curvedParts[0].length - r.profileLength * 1000) < 1e-6,
  );
  assert(drawing(i).includes("arched-glass"));
});
test("hardware upgrade charged once per selected opening, no upgrade for none/fixed", () => {
  let i = make("balcony");
  const p = getDesignGeometry(i).panels[0];
  let before = calculateItem(i);
  i.design = updatePanel(i, p.id, {
    handle: { type: "pull", extraCost: 30, height: 1000 },
  });
  const after = calculateItem(i);
  assert.equal(after.baseCost - before.baseCost, 30);
  i.quantity = 4;
  assert.equal(calculateItem(i).handleExtra, 120);
  i.design = updatePanel(i, p.id, { handle: { type: "none" } });
  assert.equal(calculateItem(i).handleExtra, 0);
});
test("malformed designs and impossible geometry rejected without crashes", () => {
  const i = make("corner-mixed");
  for (const design of [
    null,
    false,
    {},
    { ...i.design, layouts: [null] },
    { ...i.design, returnWidth: NaN },
    { ...i.design, frameJoint: "<script>" },
  ])
    assert(validateItem({ ...i, design }).length);
  let bad = structuredClone(i);
  bad.design.layouts[0].handle = null;
  assert(validateItem(bad).length);
  bad = make("arched");
  bad.design.archRise = 20;
  assert(validateItem(bad).length);
  bad = make("mixed");
  bad.design.layouts[0].ratio = 1;
  assert(validateItem(bad).length);
  const project = createProject();
  project.items = [i];
  assert.deepEqual(validateProject(project), []);
});
test("cut optimizer retains end angles and separates profile systems", () => {
  const a = calculateItem(make("mixed")).cuts[0];
  const b = { ...a, system: "System B", angleStart: 90 };
  const result = optimizeCuts([a, b]);
  assert.equal(new Set(result.bars.map((x) => x.system)).size, 2);
  assert(
    result.bars
      .flatMap((b) => b.pieces)
      .every((c) => c.angleStart === 45 || c.angleStart === 90),
  );
  const differentWidth = { ...a, profileFace: a.profileFace + 10 };
  assert.equal(optimizeCuts([a, differentWidth]).bars.length, 2);
});
