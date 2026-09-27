import { test, expect } from "@playwright/test";
test("landing, login and protected navigation", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Pay with blockchain, without the complexity/,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `artifacts/landing-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /Get started/i })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/login-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});
test("private API denies anonymous reads and cross-origin mutations", async ({
  request,
}) => {
  const contacts = await request.get("/api/contacts");
  expect(contacts.status()).toBe(401);
  const forged = await request.post("/api/wallets/challenge", {
    headers: { Origin: "https://untrusted.example" },
    data: { address: "0x1111111111111111111111111111111111111111" },
  });
  expect(forged.status()).toBe(403);
});
test("invalid public identifiers show a safe not-found page", async ({
  page,
}) => {
  await page.goto("/p/invalid");
  await expect(
    page.getByRole("heading", { name: /doesn’t lead anywhere/ }),
  ).toBeVisible();
  await page.goto("/tx/invalid");
  await expect(
    page.getByRole("heading", { name: /doesn’t lead anywhere/ }),
  ).toBeVisible();
});
test("public payment page needs no login and renders a usable request", async ({
  page,
}) => {
  // UI-only fixture: no production bypass or fake blockchain confirmation.
  const slug = "CP-abcdefghijklmnopqrst";
  await page.route(`**/api/public/${slug}`, (route) =>
    route.fulfill({
      json: {
        slug,
        title: "Design milestone",
        description: "Public request details",
        amount: "0.025",
        merchant: "Test merchant",
        receiver: "0x2222222222222222222222222222222222222222",
        status: "active",
        expiresAt: null,
      },
    }),
  );
  await page.goto(`/p/${slug}`);
  await expect(
    page.getByRole("heading", { name: "Design milestone" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Connect MetaMask" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review payment" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("receipt reflects the server result without exposing private metadata", async ({
  page,
}) => {
  const hash = `0x${"a".repeat(64)}`;
  await page.route(`**/api/transactions/${hash}`, (route) =>
    route.fulfill({
      json: {
        txHash: hash,
        status: "failed",
        amount: "0.01",
        asset: "ETH",
        fromAddress: "0x1111111111111111111111111111111111111111",
        toAddress: "0x2222222222222222222222222222222222222222",
        blockNumber: "100",
        confirmedAt: null,
        submittedAt: "2026-01-01T00:00:00Z",
        title: "ChainPay payment",
        note: null,
      },
    }),
  );
  await page.goto(`/tx/${hash}`);
  await expect(
    page.getByRole("heading", { name: "Payment failed." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
