import { test, expect } from "@playwright/test";

test("marketing homepage stays dark with a remembered light choice", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("chainpay-theme", "light"),
  );
  await page.goto("/");
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe("rgb(7, 10, 15)");
  await expect(page.locator(".app-shell")).toHaveCount(0);
});

test("homepage preview, navigation and help remain usable", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Pay with blockchain,without the complexity.",
  );
  if (testInfo.project.name === "mobile") {
    const mobileNav = page.locator(".marketing-bottom-nav");
    const more = mobileNav.getByRole("button", {
      name: "More",
      includeHidden: true,
    });
    await expect(mobileNav.getByRole("link")).toHaveCount(4);
    await more.click();
    await expect(more).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("dialog", { name: "More" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(more).toBeFocused();
    await mobileNav
      .getByRole("link", { name: "Features", exact: true })
      .click();
    await expect(page).toHaveURL(/#features$/);
  }
  const request = page.getByRole("tab", { name: "Request", exact: true });
  await request.click();
  await expect(page.getByRole("tabpanel")).toContainText("Set an amount.");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Activity", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText(
    "A home for your payment history",
  );
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "Send", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("link", { name: "Open send payment" }),
  ).toHaveAttribute("href", "/pay");
  await page.getByText("Can I use real ETH?", { exact: true }).click();
  await expect(
    page.getByText(/Mainnet, fiat payments, and tokens are not supported/),
  ).toBeVisible();
  await expect(
    page.getByText("Sommai Devcodejeng", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("responsive navigation stays usable across requested widths and languages", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 812 });
    const mobile = page.locator(".marketing-bottom-nav");
    if (width <= 800) await expect(mobile).toBeVisible();
    else await expect(mobile).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 320) {
      await mobile.getByRole("button", { name: "More" }).click();
      const sheet = page.getByRole("dialog", { name: "More" });
      await expect(sheet).toBeVisible();
      await sheet.getByRole("button", { name: "Switch to Thai" }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", "th");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Escape");
    }
  }
});

test("reduced motion is readable at mobile, tablet and desktop widths", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".cp-text-line").first()).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator(".cp-text-line").first()).toHaveCSS(
      "transform",
      "none",
    );
    await page.screenshot({
      path: `artifacts/homepage-${width}-${testInfo.project.name}.png`,
      fullPage: true,
    });
    if (width === 1440 || width === 360) {
      await page.screenshot({
        path: `artifacts/hero-${width}-${testInfo.project.name}.png`,
      });
    }
  }
  // Reduced-motion canvas draws a static frame and does not respond to the cursor.
  const canvas = page.locator(".cp-arc");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(canvas).toBeVisible();
  const before = await canvas.evaluate((el) =>
    (el as HTMLCanvasElement).toDataURL(),
  );
  await page.mouse.move(300, 300);
  await page.mouse.move(1000, 500);
  await expect
    .poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL()))
    .toBe(before);
  expect(errors).toEqual([]);
});

test("homepage content is available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3100/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".cp-text-line").first()).toHaveCSS("opacity", "1");
  await page
    .getByRole("link", { name: "Get Started", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await context.close();
});
