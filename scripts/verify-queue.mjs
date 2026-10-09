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
  viewport: { width: 1440, height: 900 },
});
const page = await desktop.newPage();
attachConsole(page, "desktop");
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator(".queue-nav-title").waitFor();
await page.locator(".queue-item-title").first().waitFor({ timeout: 15000 });
await page.getByRole("button", { name: "Add article" }).click();
await page.getByLabel("Article URL").waitFor();
await page.getByRole("button", { name: "Cancel" }).click();
await page.getByRole("button", { name: "Search" }).click();
await page.getByLabel("Search the queue").waitFor();
await page.getByRole("button", { name: "Home" }).click();
await page.waitForTimeout(400);
await page.screenshot({
  path: `${mediaDir}/queue-desktop.png`,
  fullPage: false,
});

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await mobile.newPage();
attachConsole(mobilePage, "mobile");
await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
await mobilePage.locator(".queue-nav-title").waitFor();
await mobilePage.locator(".queue-tabbar").waitFor();
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({
  path: `${mediaDir}/queue-mobile.png`,
  fullPage: false,
});

const desktopTitle = (await page.locator(".queue-nav-title").innerText()).trim();
const desktopWidth = await page.locator(".queue-frame").first().evaluate((el) => {
  return Math.round(el.getBoundingClientRect().width);
});
const desktopTab = await page.locator(".queue-tabbar").evaluate((el) => {
  const box = el.getBoundingClientRect();
  return {
    x: Math.round(box.x),
    width: Math.round(box.width),
    centered: Math.abs(box.x + box.width / 2 - 720) < 8,
  };
});
const mobileTab = await mobilePage.locator(".queue-tabbar").evaluate((el) => {
  const box = el.getBoundingClientRect();
  return {
    x: Math.round(box.x),
    width: Math.round(box.width),
    leftVisible: box.x >= 0,
    rightVisible: box.x + box.width <= 390,
  };
});
const hasPlus = await page.getByRole("button", { name: "Add article" }).isVisible();
const hasTabs = await mobilePage.locator(".queue-tabbar").isVisible();

await browser.close();
console.log(
      JSON.stringify(
    {
      desktopTitle,
      desktopWidth,
      desktopTab,
      mobileTab,
      hasPlus,
      hasTabs,
      errors,
      mediaDir,
    },
    null,
    2,
  ),
);
