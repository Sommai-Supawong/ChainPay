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
  const back = page.getByRole("link", { name: "Back to Dashboard" });
  await expect(back).toBeVisible();
  expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await back.click();
  await expect(page).toHaveURL(/\/login$/);
});
test("confirmed and pending receipts keep the dashboard return visible", async ({
  page,
}) => {
  for (const [index, status] of ["confirmed", "pending"].entries()) {
    const hash = `0x${String(index + 1).repeat(64)}`;
    await page.route(`**/api/transactions/${hash}`, (route) =>
      route.fulfill({
        json: {
          txHash: hash,
          status,
          amount: "0.025",
          asset: "ETH",
          fromAddress: "0x1111111111111111111111111111111111111111",
          toAddress: "0x2222222222222222222222222222222222222222",
          blockNumber: status === "confirmed" ? "100" : null,
          confirmedAt: status === "confirmed" ? "2026-01-01T00:00:00Z" : null,
          submittedAt: "2026-01-01T00:00:00Z",
          title: "ChainPay payment",
          note: null,
        },
      }),
    );
    if (status === "pending")
      await page.route(`**/api/transactions/${hash}/verify`, (route) =>
        route.fulfill({ json: { hash, status: "pending" } }),
      );
    await page.goto(`/tx/${hash}`);
    await expect(
      page.getByRole("heading", {
        name: status === "confirmed" ? "Payment confirmed." : "On its way.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to Dashboard" }),
    ).toBeVisible();
  }
  await page
    .context()
    .addCookies([
      { name: "chainpay-language", value: "th", url: "http://localhost:3100" },
    ]);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "กลับไปแดชบอร์ด" }),
  ).toBeVisible();
});
test("recovery retries the original intent and hash without offering another payment", async ({
  page,
}) => {
  const slug = "CP-abcdefghijklmnopqrst";
  const hash = `0x${"a".repeat(64)}`;
  const submission = {
    intentId: "00000000-0000-4000-8000-000000000111",
    token: "t".repeat(43),
    hash,
  };
  let submitted: unknown;
  let posts = 0;
  await page.route(`**/api/public/${slug}`, (route) =>
    route.fulfill({
      json: {
        slug,
        title: "Existing request",
        description: "",
        amount: "0.01",
        merchant: "Merchant",
        receiver: "0x2222222222222222222222222222222222222222",
        status: "pending",
        expiresAt: null,
      },
    }),
  );
  await page.route("**/api/transactions", (route) => {
    posts++;
    submitted = route.request().postDataJSON();
    return route.fulfill({ json: { hash, status: "pending" } });
  });
  await page.route(`**/api/transactions/${hash}`, (route) =>
    route.fulfill({
      json: {
        txHash: hash,
        status: "pending",
        amount: "0.01",
        asset: "ETH",
        fromAddress: "0x1111111111111111111111111111111111111111",
        toAddress: "0x2222222222222222222222222222222222222222",
        blockNumber: null,
        confirmedAt: null,
        submittedAt: "2026-01-01T00:00:00Z",
        title: "Existing request",
        note: null,
      },
    }),
  );
  await page.route(`**/api/transactions/${hash}/verify`, (route) =>
    route.fulfill({
      json: { hash, status: "pending", reason: "awaiting_confirmations" },
    }),
  );
  await page.goto("/");
  await page.evaluate(
    (value) =>
      sessionStorage.setItem("chainpay-submission", JSON.stringify(value)),
    submission,
  );
  await page.goto(`/p/${slug}`);
  await expect(page.getByRole("button", { name: "Confirm & pay" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Recover my submitted payment" })
    .click();
  await expect(page).toHaveURL(new RegExp(`/tx/${hash}$`));
  expect(submitted).toEqual(submission);
  expect(posts).toBe(1);
});
