/*import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageStatePath = path.resolve(__dirname, "..", "auth.json");


async function clickFirstVisibleLocator(candidates, timeout = 5000) {
  for (const candidate of candidates) {
    try {
      await candidate.locator.first().waitFor({ state: "visible", timeout });
      await candidate.locator.first().click();
      return candidate.label;
    } catch (err) {
      // Keep trying. LinkedIn changes labels and structure frequently.
    }
  }

  throw new Error(
    `Could not find a LinkedIn post composer trigger. Tried: ${candidates
      .map((candidate) => candidate.label)
      .join(", ")}`
  );
}

async function ensureLoggedIn(page) {
  const loginField = page.locator('input[name="session_key"]').first();

  if (page.url().includes("/login")) {
    throw new Error("LinkedIn session expired. Run backend/login.js again to refresh auth.json.");
  }

  try {
    await loginField.waitFor({ state: "visible", timeout: 2000 });
    throw new Error("LinkedIn session expired. Run backend/login.js again to refresh auth.json.");
  } catch (err) {
    if (err.message.includes("session expired")) {
      throw err;
    }
  }
}

async function waitForLinkedInReady(page) {
  const readinessCandidates = [
    page.locator("body").first(),
    page.locator('input[name="session_key"]').first(),
    page.locator("#global-nav").first(),
    page.locator("main").first()
  ];

  for (const locator of readinessCandidates) {
    try {
      await locator.waitFor({ state: "visible", timeout: 4000 });
      return;
    } catch (err) {
      // Try the next readiness signal.
    }
  }
}

async function openComposer(page) {
  await page.goto("https://www.linkedin.com/feed/", {
    waitUntil: "domcontentloaded"
  });
  await waitForLinkedInReady(page);
  await ensureLoggedIn(page);

  const composerCandidates = [
    {
      label: 'button:has-text("Start a post")',
      locator: page.locator('button:has-text("Start a post")')
    },
    {
      label: 'button:has-text("Create a post")',
      locator: page.locator('button:has-text("Create a post")')
    },
    {
      label: 'role=button[name~/Start a post|Create a post|Share a post/i]',
      locator: page.getByRole("button", {
        name: /start a post|create a post|share a post/i
      })
    },
    {
      label: 'role=link[name~/Start a post|Create a post|Share a post/i]',
      locator: page.getByRole("link", {
        name: /start a post|create a post|share a post/i
      })
    },
    {
      label: '[aria-label*=post]',
      locator: page.locator(
        '[aria-label*="Start a post"], [aria-label*="Create a post"], [aria-label*="Share a post"]'
      )
    },
    {
      label: 'div[role="button"]:has-text("Start a post")',
      locator: page.locator('div[role="button"]:has-text("Start a post")')
    },
    {
      label: 'div[role="button"]:has-text("Create a post")',
      locator: page.locator('div[role="button"]:has-text("Create a post")')
    },
    {
      label: 'button, a, div[role="button"] text match',
      locator: page
        .locator('button, a, div[role="button"]')
        .filter({ hasText: /start a post|create a post|share a post|start writing/i })
    },
    {
      label: '[data-control-name="share.post"]',
      locator: page.locator('[data-control-name="share.post"]')
    },
    {
      label: '.share-box-feed-entry__trigger',
      locator: page.locator(".share-box-feed-entry__trigger")
    },
    {
      label: '.share-box-feed-entry__top-bar button',
      locator: page.locator(".share-box-feed-entry__top-bar button")
    },
    {
      label: '.share-box-feed-entry',
      locator: page.locator(".share-box-feed-entry")
    }
  ];

  return clickFirstVisibleLocator(composerCandidates, 3500);
}

async function fillComposer(page, content) {
  const textboxSelectors = [
    'div[role="textbox"]',
    '.ql-editor[contenteditable="true"]',
    '[contenteditable="true"][role="textbox"]'
  ];

  for (const selector of textboxSelectors) {
    const locator = page.locator(selector).first();

    try {
      await locator.waitFor({ state: "visible", timeout: 6000 });
      await locator.fill(content);
      return selector;
    } catch (err) {
      // Try the next composer textbox shape.
    }
  }

  throw new Error("LinkedIn composer opened, but no editable textbox was found.");
}

async function submitPost(page) {
  const submitCandidates = [
    {
      label: 'button:has-text("Post")',
      locator: page.locator('button:has-text("Post")')
    },
    {
      label: 'role=button[name="Post"]',
      locator: page.getByRole("button", { name: /^post$/i })
    },
    {
      label: '[aria-label="Post"]',
      locator: page.locator('[aria-label="Post"]')
    },
    {
      label: 'div.share-actions__primary-action button',
      locator: page.locator("div.share-actions__primary-action button")
    }
  ];

  return clickFirstVisibleLocator(submitCandidates, 6000);
}

export async function postToLinkedIn(content) {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    storageState: storageStatePath
  });

  const page = await context.newPage();

  try {
    const triggerUsed = await openComposer(page);
    await page.waitForTimeout(1500);

    const textboxUsed = await fillComposer(page, content);
    await page.waitForTimeout(1000);

    const submitUsed = await submitPost(page);
    await page.waitForTimeout(5000);

    console.log("LinkedIn page URL:", page.url());
    console.log("LinkedIn composer trigger:", triggerUsed);
    console.log("LinkedIn textbox:", textboxUsed);
    console.log("LinkedIn submit control:", submitUsed);
    console.log("Posted successfully");
  } catch (err) {
    console.error("LinkedIn page URL:", page.url());
    console.error("LinkedIn posting failed:", err);
    throw err;
  } finally {
    await browser.close();
  }
}*/

// backend/services/linkedin.js

/**
 * Simulated LinkedIn posting service
 * Safe for cloud deployment (Render)
 * Replace later with real automation if needed
 */

export async function postToLinkedIn(content) {
  try {
    if (!content || content.trim() === "") {
      throw new Error("Post content is empty");
    }

    // Simulate posting delay (for realistic UX)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log post content (acts as "posting")
    console.log("\n📢 ===== LINKEDIN POST (SIMULATION) =====");
    console.log(content);
    console.log("========================================\n");

    return {
      success: true,
      message: "Post successfully simulated",
      data: {
        content,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("❌ LinkedIn posting error:", error.message);

    return {
      success: false,
      error: error.message
    };
  }
}
