import { expect, test } from "@playwright/test";

// Supply a signed-in browser state; the Dashboard deliberately redirects guests.
const authState = process.env.CHAINPAY_E2E_AUTH_STATE;
test.use({ storageState: authState });
test.skip(!authState, "Set CHAINPAY_E2E_AUTH_STATE to a signed-in storage state");

test("Dashboard tap slides before route change and Back follows the pathname", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto("/dashboard");
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  const bubble = nav.locator(".mobile-nav-bubble");
  await expect(bubble).toBeVisible();

  const homeX = (await bubble.boundingBox())!.x;
  const pay = (await nav.getByRole("link", { name: "Pay", exact: true }).boundingBox())!;
  await page.mouse.move(pay.x + pay.width / 2, pay.y + pay.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(50);
  const movingX = (await bubble.boundingBox())!.x;
  expect(movingX).toBeGreaterThan(homeX);
  expect(movingX).toBeLessThan(pay.x + 1);
  await expect(page).toHaveURL(/\/pay$/);
  await expect(nav.getByRole("link", { name: "Pay", exact: true })).toHaveAttribute("aria-current", "page");

  for (const [label, route] of [["Request", "/requests"]] as const) {
    const start = (await bubble.boundingBox())!.x;
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    expect((await bubble.boundingBox())!.x).toBeGreaterThan(start + 20);
  }

  await page.goBack();
  await expect(page).toHaveURL(/\/pay$/);
  await expect(nav.getByRole("link", { name: "Pay", exact: true })).toHaveAttribute("aria-current", "page");
  await expect.poll(async () => (await bubble.boundingBox())!.x).toBeLessThan(
    (await nav.getByRole("link", { name: "Request", exact: true }).boundingBox())!.x,
  );
});

test("Dashboard hold, drag, release, and More sheet work at mobile widths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto("/dashboard");
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  const bubble = nav.locator(".mobile-nav-bubble");
  const home = (await nav.getByRole("link", { name: "Home", exact: true }).boundingBox())!;
  const activity = (await nav.getByRole("link", { name: "Activity", exact: true }).boundingBox())!;
  const initialWidth = (await bubble.boundingBox())!.width;
  await page.mouse.move(home.x + home.width / 2, home.y + home.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(240);
  expect((await bubble.boundingBox())!.width).toBeGreaterThan(initialWidth);
  await page.mouse.move(activity.x + activity.width / 2, activity.y + activity.height / 2, { steps: 8 });
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(nav.getByRole("link", { name: "Activity", exact: true })).toHaveAttribute("data-highlight", "true");
  await page.mouse.up();
  await expect(page).toHaveURL(/\/activity$/);

  const active = (await nav.getByRole("link", { name: "Activity", exact: true }).boundingBox())!;
  const more = (await nav.getByRole("button", { name: "More" }).boundingBox())!;
  await page.mouse.move(active.x + active.width / 2, active.y + active.height / 2);
  await page.mouse.down();
  await page.mouse.move(more.x + more.width / 2, more.y + more.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByRole("dialog", { name: "More" })).toBeVisible();
  await expect(page).toHaveURL(/\/activity$/);
  await page.getByRole("button", { name: "Close navigation" }).click();
  await nav.getByRole("button", { name: "More" }).click();
  await expect(page.getByRole("dialog", { name: "More" })).toBeVisible();

  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 780 });
    const bounds = (await nav.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(8);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 8);
  }
});
