import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const mediaDir = "/cursor/stores/self/media";
await mkdir(mediaDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const errors = [];
function attachConsole(page, label) {
  page.on("pageerror", (error) => {
    errors.push(`[${label} pageerror] ${error.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`[${label} console] ${msg.text()}`);
    }
  });
}

const desktop = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await desktop.newPage();
attachConsole(page, "desktop");
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Queue" }).waitFor();
await page.screenshot({
  path: `${mediaDir}/queue-desktop.png`,
  fullPage: false,
});

await page.locator("main.queue-shell .queue-item-title", {
  hasText: "How to Get Startup Ideas",
}).click();
await page.waitForURL("**/read/**");
await page.locator("main.article-shell .article-title").waitFor();
await page.waitForTimeout(400);
await page.screenshot({
  path: `${mediaDir}/reader-desktop.png`,
  fullPage: false,
});

const readerTitle = (
  await page.locator("main.article-shell .article-title").innerText()
).trim();
const hasBody =
  (await page.locator("main.article-shell .article-body").innerText()).trim()
    .length > 80;

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await mobile.newPage();
attachConsole(mobilePage, "mobile");
await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
await mobilePage.locator("main.queue-shell").waitFor();
await mobilePage.screenshot({
  path: `${mediaDir}/queue-mobile.png`,
  fullPage: false,
});
await mobilePage
  .locator("main.queue-shell .queue-item-title", {
    hasText: "How to Get Startup Ideas",
  })
  .click();
await mobilePage.waitForURL("**/read/**");
await mobilePage.locator("main.article-shell .article-title").waitFor();
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({
  path: `${mediaDir}/reader-mobile.png`,
  fullPage: false,
});

await browser.close();
console.log(
  JSON.stringify({ readerTitle, hasBody, errors, mediaDir }, null, 2),
);
