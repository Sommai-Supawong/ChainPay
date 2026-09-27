import { test, expect } from "@playwright/test";

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
    const toggle = page.getByRole("button", {
      name: /^(Open|Close) navigation$/,
    });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Product", exact: true })
      .click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
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
