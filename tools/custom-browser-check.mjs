import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const click = (a) => page.locator(`[data-action="${a}"]`).first().click();
const field = (scope, key) =>
  page.locator(`[data-scope="${scope}"][data-key="${key}"]`);
const change = async (scope, key, value) => {
  const f = field(scope, key);
  await f.fill(String(value));
  await f.press("Tab");
};
const select = (scope, key, value) => field(scope, key).selectOption(value);
const state = async () => {
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("frame-workshop-v1")),
  );
  const p = s.projects.find((p) => p.id === s.active);
  return p.items.find((i) => i.id === s.item) || p.items[0];
};
const add = async (key) => {
  await click("add-item");
  await page.locator(`[data-template="${key}"]`).click();
};
await fs.mkdir("screenshots", { recursive: true });
try {
  await page.goto("http://127.0.0.1:5173");
  await page.getByRole("heading", { name: "Window & door designer" }).waitFor();
  await add("corner-mixed");
  assert.equal(
    await page.locator(".drawing-stage [data-face-elevation]").count(),
    2,
  );
  assert.equal(await page.locator(".drawing-stage [data-panel]").count(), 3);
  assert.equal(await page.locator(".drawing-stage [transform^=matrix]").count(), 2);
  await change("design", "returnWidth", 2000);
  await select("selection", "selected", "1");
  await click("inspector-hardware");
  await select("handle", "type", "pull");
  await select("handle", "color", "black");
  await change("handle", "height", 600);
  await change("handle", "extraCost", 25);
  assert.equal(
    await page
      .locator('.drawing-stage [data-panel="1"] [data-handle="pull"]')
      .count(),
    1,
  );
  await click("inspector-fabrication");
  await select("design", "frameJoint", "mitre");
  await select("design", "sashJoint", "butt");
  await change("design", "systemName", "Workshop system 45-90");
  await change("design", "frameAllowance", 3);
  await change("design", "sashAllowance", 2);
  await change("design", "glassGap", 4);
  await click("save-system");
  await page
    .getByRole("status")
    .filter({ hasText: "System preset saved" })
    .waitFor();
  assert.equal((await state()).design.sashJoint, "butt");
  await click("inspector-design");
  await select("selection", "selected", "0");
  await click("split-horizontal");
  assert.equal(await page.locator(".drawing-stage [data-panel]").count(), 4);
  await page.locator(".division-details summary").click();
  const ratio = page.locator('[data-scope="split"]').first();
  await ratio.fill("35");
  await ratio.press("Tab");
  assert.equal((await state()).design.layouts[0].ratio, 0.35);
  const mm = page.locator('[data-scope="split-mm"]').first();
  await mm.fill("500");
  await mm.press("Tab");
  assert(Math.abs((await state()).design.layouts[0].ratio - 500 / 1220) < 1e-8);
  await click("merge-panel");
  assert.equal(await page.locator(".drawing-stage [data-panel]").count(), 3);
  await click("undo");
  assert.equal(await page.locator(".drawing-stage [data-panel]").count(), 4);
  await page.locator("#language").selectOption("ar");
  await page.screenshot({
    path: "screenshots/corner-custom-ar.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.locator("#language").selectOption("en");
  await click("nav-reports");
  await click("report-bill");
  assert(
    (await page.locator(".manufacturing-details").innerText()).includes(
      "45° / 45°",
    ),
  );
  assert(
    (await page.locator(".manufacturing-details").innerText()).includes(
      "90° / 90°",
    ),
  );
  const dl = page.waitForEvent("download");
  await click("csv");
  const download = await dl;
  await download.saveAs("screenshots/custom-bill.csv");
  const csv = await fs.readFile("screenshots/custom-bill.csv", "utf8");
  assert(csv.includes("Start angle"));
  assert(csv.includes("NOT PRICED"));
  assert(csv.includes("Workshop system 45-90"));
  await click("nav-studio");
  const backup = page.waitForEvent("download");
  await click("export");
  await (await backup).saveAs("screenshots/custom-project.json");
  await page
    .locator("#import-file")
    .setInputFiles("screenshots/custom-project.json");
  await page
    .getByRole("status")
    .filter({ hasText: "Project imported" })
    .waitFor();
  await page.locator(".item-tab").last().click();
  assert.equal((await state()).design.shape, "corner");
  await page.reload();
  assert.equal((await state()).design.returnWidth, 2000);
  await add("balcony");
  await click("inspector-fabrication");
  await select("preset", "preset", "0");
  assert.equal((await state()).design.systemName, "Workshop system 45-90");
  await click("inspector-design");
  await add("arched");
  assert.equal(await page.locator(".drawing-stage .arched-glass").count(), 1);
  await change("design", "archRise", 500);
  await page.screenshot({
    path: "screenshots/arched-custom.png",
    fullPage: true,
    animations: "disabled",
  });
  await click("nav-reports");
  await click("report-bill");
  await page
    .getByText("Curved profiles · separate fabrication", { exact: true })
    .waitFor();
  await click("report-cutting");
  await page
    .getByText(
      "Curved lengths are priced, but excluded from straight-stock cutting. See the bill of materials.",
      { exact: true },
    )
    .waitFor();
  await click("nav-studio");
  await page.locator("#language").selectOption("ar");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "screenshots/custom-mobile-ar.png",
    fullPage: true,
    animations: "disabled",
  });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: custom corner faces, nested/unequal split+merge, handle styles, independent 45/90 joints, profile presets, CSV angles, archive roundtrip, arch, separate curved reporting, Arabic RTL and mobile.",
  );
} finally {
  await browser.close();
}
