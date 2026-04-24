import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.linkedin.com/login");

  console.log("👉 Login manually within 60 seconds...");
  await page.waitForTimeout(60000); // 1 minute

  // Save session
  await context.storageState({ path: "auth.json" });

  console.log("✅ auth.json created successfully");

  await browser.close();
})();