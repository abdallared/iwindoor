import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { calculateProject, createProject, createItem } from "../src/core.js";
await fs.mkdir("screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const click = (action) =>
  page.locator(`[data-action="${action}"]`).first().click();
const change = async (key, value) => {
  const field = page.locator(`[data-key="${key}"]`).first();
  await field.fill(String(value));
  await field.press("Tab");
};
try {
  await page.goto("http://127.0.0.1:5173");
  await page.getByRole("heading", { name: "Window & door designer" }).waitFor();
  await page.screenshot({
    path: "screenshots/desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  assert.equal(await page.locator("[data-panel]").count(), 2);
  await change("width", 1600);
  await change("quantity", 3);
  await page.locator('[data-panel="1"]').click();
  await page.locator('[data-mode="tilt"]').click();
  assert.equal(
    await page.locator('[data-mode="tilt"]').getAttribute("aria-pressed"),
    "true",
  );
  await change("width", 100);
  assert.equal(await page.locator('[data-key="width"]').inputValue(), "1600");
  await click("duplicate");
  assert.equal(await page.locator(".item-tab").count(), 2);
  await click("remove-item");
  assert.equal(await page.locator(".item-tab").count(), 1);
  await click("undo");
  assert.equal(await page.locator(".item-tab").count(), 2);
  await click("redo");
  assert.equal(await page.locator(".item-tab").count(), 1);
  await click("add-item");
  await page.locator('[data-template="door"]').click();
  assert.equal(await page.locator(".item-tab").count(), 2);
  await click("nav-materials");
  await change("infillRate", 60);
  await change("discount", 10);
  await change("tax", 14);
  await click("nav-reports");
  await page.locator(".project-details summary").click();
  await change("customer", "Browser test customer");
  const state = JSON.parse(
    await page.evaluate(() => localStorage.getItem("frame-workshop-v1")),
  );
  const p = state.projects.find((p) => p.id === state.active);
  const calc = calculateProject(p);
  assert(calc.total > 0);
  assert.equal(p.items[0].quantity, 3);
  assert.equal(p.items[0].width, 1600);
  await page.getByRole("heading", { name: "Browser test customer" }).waitFor();
  await click("report-bill");
  assert(
    (await page.locator(".glass-pieces").first().innerText()).includes(
      "Hardware sets: 6",
    ),
  );
  await click("report-cutting");
  assert((await page.locator(".cut-row").count()) > 0);
  await click("report-quote");
  await page.screenshot({ path: "screenshots/quotation.png", fullPage: true });
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".sidebar").isVisible(), false);
  await page.pdf({
    path: "screenshots/quotation.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  const csvPromise = page.waitForEvent("download");
  await click("csv");
  const csv = await csvPromise;
  assert(csv.suggestedFilename().endsWith(".csv"));
  await csv.saveAs("screenshots/quotation.csv");
  const backupPromise = page.waitForEvent("download");
  await click("export");
  const backup = await backupPromise;
  await backup.saveAs("screenshots/project.json");
  const stored = JSON.parse(
    await fs.readFile("screenshots/project.json", "utf8"),
  );
  assert.equal(stored.project.customer, "Browser test customer");
  await page
    .locator("#import-file")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"project":{"name":"bad"}}'),
    });
  await page.getByRole("status").filter({ hasText: "not a valid" }).waitFor();
  await page.locator("#import-file").setInputFiles("screenshots/project.json");
  await page
    .getByRole("status")
    .filter({ hasText: "Project imported" })
    .waitFor();
  assert.equal(await page.locator("#project-select option").count(), 2);
  await page.reload();
  assert.equal(await page.locator(".item-tab").count(), 2);
  assert.equal(await page.locator('[data-key="width"]').inputValue(), "1600");
  const svgPromise = page.waitForEvent("download");
  await click("svg");
  const svg = await svgPromise;
  assert(svg.suggestedFilename().endsWith(".svg"));
  await click("new-project");
  await page
    .locator('#new-project-form input[name="name"]')
    .fill("New test project");
  await page.locator('#new-project-form button[type="submit"]').click();
  await page
    .getByRole("heading", { name: "Your project starts with one frame." })
    .waitFor();
  await click("add-item");
  await page.locator('[data-template="fixed"]').click();
  await page.locator("#language").selectOption("ar");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.screenshot({ path: "screenshots/arabic.png", fullPage: true });
  for (const lang of ["tr", "ru", "fr", "fa", "es", "en"]) {
    await page.locator("#language").selectOption(lang);
    await page.locator(".inspector").waitFor();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "screenshots/mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    "Mobile horizontal overflow",
  );
  await click("toggle-nav");
  await click("nav-projects");
  assert.equal(await page.locator(".project-card").count(), 4);
  const hostile = createProject();
  hostile.settings.rates['<img src=x onerror="window.importXss=1">'] = 1;
  hostile.items[0].cols = 6;
  hostile.items[0].width = 6000;
  hostile.items[0].panels = Array(6).fill("fixed");
  await page
    .locator("#import-file")
    .setInputFiles({
      name: "hostile.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          format: "frame-workshop",
          version: 1,
          project: hostile,
        }),
      ),
    });
  await page
    .getByRole("status")
    .filter({ hasText: "Project imported" })
    .waitFor();
  assert.equal(await page.locator('[data-key="cols"]').inputValue(), "6");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await click("nav-materials");
  assert.equal(await page.locator(".rates-grid img").count(), 0);
  assert.equal(await page.evaluate(() => window.importXss), undefined);
  const huge = createProject();
  huge.items = Array.from({ length: 100 }, () => ({
    ...createItem("triple"),
    quantity: 100,
  }));
  await page
    .locator("#import-file")
    .setInputFiles({
      name: "large.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({ format: "frame-workshop", version: 1, project: huge }),
      ),
    });
  await page
    .getByRole("status")
    .filter({ hasText: "Project imported" })
    .waitFor();
  await click("nav-reports");
  await click("report-cutting");
  await page
    .getByText(
      "This cutting estimate exceeds 100,000 pieces. Split the project into smaller batches.",
    )
    .waitFor();
  assert.deepEqual(errors, [], "Browser JS errors");
  console.log(
    "PASS: designer, panel editing, validation, undo/redo, rates, quote, BOM quantities, cutting, CSV/SVG/JSON exports, import, persistence, new project, seven locales, RTL, mobile layout.",
  );
} finally {
  await browser.close();
}
