import { test, expect } from "@playwright/test";

test("homepage mobile glass navigation retains marketing destinations", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 780 });
    const nav = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(nav).toBeVisible();
    await expect(nav.locator(".mobile-nav-item")).toHaveCount(5);
    await expect(nav.locator(".mobile-nav-lens")).toBeVisible();
    await expect(nav.locator(".mobile-nav-reflection")).toBeVisible();
    for (const [label, href] of [
      ["Home", "#"],
      ["Features", "#features"],
      ["How", "#how-it-works"],
      ["Trust", "#built-for-trust"],
    ]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
    }
    const bounds = await nav.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(8);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  for (const [label, hash, id] of [
    ["Features", "#features", "features"],
    ["How", "#how-it-works", "how-it-works"],
    ["Trust", "#built-for-trust", "built-for-trust"],
  ]) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect.poll(() => page.locator(`#${id}`).evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeLessThan(350);
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "location");
  }
  await nav.getByRole("link", { name: "Home", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.goBack();
  await expect(page).toHaveURL(/#built-for-trust$/);
  await page.goForward();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => {
    const footerBottom = await page.locator(".cp-footer").evaluate((node) => node.getBoundingClientRect().bottom);
    const navTop = (await nav.boundingBox())!.y;
    return footerBottom - navTop;
  }).toBeLessThan(0);
  await nav.getByRole("button", { name: "More" }).click();
  const sheet = page.getByRole("dialog", { name: "More" });
  await expect(sheet.getByRole("link", { name: "Open ChainPay" })).toHaveAttribute("href", "/login");
  await sheet.getByRole("button", { name: "Scan QR Code" }).click();
  const scanner = page.locator(".scan-modal");
  await expect(scanner).toBeVisible();
  await scanner.getByRole("button", { name: "Close scanner" }).click();
});

test("homepage glass navigation keeps Thai marketing labels and hides on desktop", async ({ page }) => {
  await page.context().addCookies([{ name: "chainpay-language", value: "th", url: "http://localhost:3100" }]);
  await page.goto("/");
  await page.setViewportSize({ width: 320, height: 780 });
  const nav = page.locator(".marketing-bottom-nav");
  await expect(nav).toBeVisible();
  for (const [href, label] of [
    ["#", "หน้าแรก"],
    ["#features", "ฟีเจอร์"],
    ["#how-it-works", "วิธีใช้"],
    ["#built-for-trust", "ปลอดภัย"],
  ])
    await expect(nav.locator(`a[href="${href}"]`)).toHaveText(label);
  await expect(nav.getByRole("button", { name: "เพิ่มเติม" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 900, height: 780 });
  await expect(nav).toBeHidden();
  await expect(page.locator(".cp-desktop-nav")).toBeVisible();
});

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
  const theme = await request.patch("/api/settings/theme", {
    headers: { Origin: "http://localhost:3100" },
    data: { theme: "light" },
  });
  expect([401, 403]).toContain(theme.status());
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
  await page.getByRole("button", { name: "Recover Transaction" }).click();
  await expect(page).toHaveURL(new RegExp(`/tx/${hash}$`));
  expect(submitted).toEqual(submission);
  expect(posts).toBe(1);
});

test("Thai status badges and portaled toast stay readable across themes", async ({
  page,
}) => {
  const slug = "CP-abcdefghijklmnopqrst";
  let status = "paid";
  await page
    .context()
    .addCookies([
      { name: "chainpay-language", value: "th", url: "http://localhost:3100" },
    ]);
  await page.route(`**/api/public/${slug}`, (route) =>
    route.fulfill({
      json: {
        slug,
        title: "Design milestone",
        description: "",
        amount: "0.025",
        merchant: "Merchant",
        receiver: "0x2222222222222222222222222222222222222222",
        status,
        expiresAt: null,
      },
    }),
  );
  await page.goto(`/p/${slug}`);
  const badge = page.locator(".status-badge");
  await expect(badge).toContainText("ชำระแล้ว");
  await expect(badge.locator("svg")).toBeVisible();
  await expect(badge).toHaveAttribute("data-tone", "paid");
  const darkColor = await badge.evaluate(
    (node) => getComputedStyle(node).color,
  );
  await page
    .locator(".public-page")
    .evaluate((node) => node.setAttribute("data-theme", "light"));
  const lightColor = await badge.evaluate(
    (node) => getComputedStyle(node).color,
  );
  expect(lightColor).not.toBe(darkColor);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  status = "pending";
  await page.reload();
  await expect(badge).toContainText("รอดำเนินการ");
  await page.getByRole("button", { name: "กู้คืนธุรกรรม" }).click();
  const toaster = page.locator(".chainpay-toaster");
  await expect(toaster).toContainText("ไม่พบธุรกรรม");
  expect(
    await toaster.evaluate((node) => getComputedStyle(node).fontFamily),
  ).toContain("Kanit");
});
