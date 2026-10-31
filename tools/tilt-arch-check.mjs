import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const click = (a) => p.locator(`[data-action="${a}"]`).first().click();
async function change(key, v) {
  const f = p.locator(`[data-scope="design"][data-key="${key}"]`);
  await f.fill(String(v));
  await f.press("Tab");
}
try {
  await p.goto("http://127.0.0.1:5173");
  await p.locator('[data-mode="awning"]').click();
  assert.equal(
    await p
      .locator('.drawing-stage [data-handle="catch"][data-placement="bottom"]')
      .count(),
    1,
  );
  await p.locator('[data-mode="tilt"]').click();
  assert.equal(
    await p
      .locator('.drawing-stage [data-handle="catch"][data-placement="top"]')
      .count(),
    1,
  );
  await click("inspector-hardware");
  await p
    .locator('[data-scope="handle"][data-key="side"]')
    .selectOption("bottom");
  assert.equal(
    await p
      .locator('.drawing-stage [data-handle="catch"][data-placement="bottom"]')
      .count(),
    1,
  );
  await p.screenshot({ path: "screenshots/tilt-catch.png", fullPage: true });
  await click("add-item");
  await p.locator('[data-template="arched"]').click();
  await click("inspector-design");
  await change("archHeadCount", 2);
  await change("archHeadRatio", 0.4);
  await change("archOffset", -120);
  assert.equal(await p.locator(".drawing-stage .arched-glass").count(), 2);
  await p.screenshot({ path: "screenshots/arch-raised.png", fullPage: true });
  await change("archOffset", 180);
  await p.screenshot({ path: "screenshots/arch-lowered.png", fullPage: true });
  await p.reload();
  assert.equal(await p.locator('[data-key="archOffset"]').inputValue(), "180");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: two tilt directions, catch automatic/manual position, arch offset above/below, head split and persistence.",
  );
} finally {
  await b.close();
}
