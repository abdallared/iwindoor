import test from "node:test";
import assert from "node:assert/strict";
import { createItem, validateItem, calculateItem } from "../src/core.js";
import {
  createDesignTemplate,
  getDesignGeometry,
  updatePanel,
} from "../src/design.js";
import { drawing } from "../src/drawing.js";
test("top and bottom opening tilt sashes place the catch on the free edge", () => {
  const i = { ...createItem(), ...createDesignTemplate("balcony") };
  for (const [mode, placement] of [
    ["tilt", "top"],
    ["awning", "bottom"],
  ]) {
    i.design = updatePanel(i, getDesignGeometry(i).panels[0].id, {
      mode,
      handle: { type: "catch", side: "auto" },
    });
    assert.deepEqual(validateItem(i), []);
    assert(
      drawing(i).includes(`data-handle="catch" data-placement="${placement}"`),
    );
    assert(calculateItem(i).openingCount > 0);
  }
});
test("arched transom moves independently, curved panes subdivide and rectangular sliding survives", () => {
  const i = { ...createItem(), ...createDesignTemplate("arched") };
  for (const offset of [-120, 0, 180]) {
    i.design.archOffset = offset;
    i.design.archHeadCount = 2;
    i.design.archHeadRatio = 0.4;
    assert.deepEqual(validateItem(i), []);
    const g = getDesignGeometry(i),
      r = calculateItem(i);
    assert.equal(g.faces[0].arch.bottom, i.design.archRise + offset);
    assert.equal(g.panels[0].y, i.design.archRise + offset + i.profile);
    assert.equal(g.faces[0].arch.panes.length, 2);
    assert.equal(g.groups.length, 1);
    assert(r.cuts.every((c) => Number.isFinite(c.length) && c.length > 0));
    assert(r.glassPieces.every((p) => p.area > 0));
    assert(!drawing(i).includes("NaN"));
    assert.deepEqual(validateItem(JSON.parse(JSON.stringify(i))), []);
  }
  i.design.archOffset = -300;
  assert(validateItem(i).length > 0);
});
