import test from "node:test";
import assert from "node:assert/strict";
import {
  createItem,
  validateItem,
  calculateItem,
  defaultSettings,
} from "../src/core.js";
import {
  createDesignTemplate,
  getDesignGeometry,
  setSlidingGroup,
  updateSlidingGroup,
  updatePanel,
} from "../src/design.js";
import { drawing } from "../src/drawing.js";
test("sliding overlap, thin meeting profiles and stationary sash frames", () => {
  const i = { ...createItem(), ...createDesignTemplate("sliding-4") };
  assert.deepEqual(validateItem(i), []);
  let g = getDesignGeometry(i);
  assert.equal(g.panels.length, 4);
  assert.equal(g.faces[0].dividers.length, 0);
  assert.equal(g.panels[0].x + g.panels[0].width - g.panels[1].x, 20);
  let r = calculateItem(i, defaultSettings());
  assert.equal(r.cuts.filter((c) => c.type === "meeting").length, 6);
  assert(
    r.cuts
      .filter((c) => c.type === "meeting")
      .every((c) => c.profileFace === 20 && c.angleStart === 90),
  );
  i.design = updatePanel(i, g.panels[0].id, { mode: "fixed" });
  assert.equal(calculateItem(i, defaultSettings()).cuts.length, r.cuts.length);
  i.design = updatePanel(i, g.panels[0].id, {
    edgeOverrides: { left: { width: 35, joint: "butt" } },
  });
  r = calculateItem(i, defaultSettings());
  assert.equal(r.cuts.find((c) => c.part === "panel 1 left").profileFace, 35);
  assert.throws(() => updateSlidingGroup(i, g.groups[0].id, "count", 17));
});
test("both corner faces accept independently sized sliding assemblies in perspective", () => {
  const i = { ...createItem(), ...createDesignTemplate("corner-mixed") };
  i.design = setSlidingGroup(i, getDesignGeometry(i).panels[0].id, 3);
  let g = getDesignGeometry(i);
  i.design = updateSlidingGroup(i, g.groups[1].id, "count", 4);
  g = getDesignGeometry(i);
  assert.deepEqual(
    g.faces.map((f) => f.panels.length),
    [3, 4],
  );
  assert.deepEqual(validateItem(i), []);
  const svg = drawing(i, { interactive: true });
  assert.equal((svg.match(/transform="matrix/g) || []).length, 2);
  assert(!svg.includes("NaN"));
  i.design.cornerSide = "right";
  assert(!drawing(i).includes("NaN"));
  assert.deepEqual(validateItem(JSON.parse(JSON.stringify(i))), []);
});
