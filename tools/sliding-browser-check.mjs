import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const click = (a) => page.locator(`[data-action="${a}"]`).first().click();
const field = (scope, key) =>
  page.locator(`[data-scope="${scope}"][data-key="${key}"]`);
async function change(scope, key, value) {
  await field(scope, key).fill(String(value));
  await field(scope, key).press("Tab");
}
try {
  await page.goto("http://127.0.0.1:5173");
  await click("add-item");
  await page.locator('[data-template="corner-mixed"]').click();
  await click("add-sliding");
  await change("sliding", "count", 3);
  assert.equal(await page.locator('.drawing-stage [data-face="0"]').count(), 3);
  await page.locator('.drawing-stage [data-face="1"]').first().click();
  await change("sliding", "count", 4);
  await change("sliding", "meetingWidth", 25);
  assert.equal(await page.locator('.drawing-stage [data-face="1"]').count(), 4);
  await page.locator(".sliding-settings summary").click();
  await change("edge", "left.width", 35);
  await field("edge", "left.joint").selectOption("butt");
  await field("design", "cornerSide").selectOption("right");
  assert.equal(
    await page
      .locator('.drawing-stage [data-face-elevation][transform^="matrix"]')
      .count(),
    2,
  );
  await page.screenshot({
    path: "screenshots/sliding-corner.png",
    fullPage: true,
  });
  await field("design", "cornerView").selectOption("elevation");
  assert.equal(await page.locator(".corner-plan").count(), 1);
  await page.reload();
  assert.equal(await page.locator(".drawing-stage [data-panel]").count(), 7);
  assert.deepEqual(errors, []);
  console.log(
    "Sliding UI: both faces, counts, profiles, edge overrides, perspective, mirror and persistence passed.",
  );
} finally {
  await browser.close();
}
