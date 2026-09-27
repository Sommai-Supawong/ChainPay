import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  set: vi.fn(),
  verifyIdToken: vi.fn(),
  verifySessionCookie: vi.fn(),
  createSessionCookie: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (mocks.cookie ? { value: mocks.cookie } : undefined),
    set: mocks.set,
  }),
}));
vi.mock("@/lib/auth/firebase-admin", () => ({
  adminAuth: () => ({
    verifyIdToken: mocks.verifyIdToken,
    verifySessionCookie: mocks.verifySessionCookie,
    createSessionCookie: mocks.createSessionCookie,
  }),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
  clientKey: () => "test",
}));
vi.mock("@/lib/db/client", () => ({
  withDb: (fn: (db: unknown) => unknown) =>
    fn({
      insert: () => ({
        values: (data: unknown) => ({
          onConflictDoUpdate: () => mocks.insert(data),
        }),
      }),
      select: () => ({
        from: () => ({ where: () => ({ limit: () => mocks.select() }) }),
      }),
    }),
}));
import { createSession, logout } from "@/features/auth/server";
import { requireUser, currentUser } from "@/lib/auth/session";
import { assertOrigin, body, endpoint } from "@/lib/api";
const token = () => ({
  uid: "verified-provider-uid",
  email: "verified@example.test",
  email_verified: true,
  firebase: { sign_in_provider: "google.com" },
  auth_time: Date.now() / 1000,
  name: "Verified Name",
});
const request = () =>
  new Request("http://localhost:3000/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
    body: JSON.stringify({
      idToken: "opaque-token",
      userId: "attacker",
      email: "attacker@example.test",
    }),
  });
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  mocks.cookie = undefined;
  mocks.verifyIdToken.mockResolvedValue(token());
  mocks.createSessionCookie.mockResolvedValue("server-session");
  mocks.insert.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());
describe("Firebase authentication boundary", () => {
  it("maps only verified identity and sets an HttpOnly same-site session", async () => {
    await createSession(request());
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("opaque-token", true);
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        firebaseUid: "verified-provider-uid",
        email: "verified@example.test",
      }),
    );
    expect(mocks.set).toHaveBeenCalledWith(
      "chainpay_session",
      "server-session",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: 432000,
        path: "/",
      }),
    );
  });
  it("rejects stale sign-in, unverified email, and another auth provider", async () => {
    for (const change of [
      { auth_time: 1 },
      { email_verified: false },
      { firebase: { sign_in_provider: "password" } },
    ]) {
      mocks.verifyIdToken.mockResolvedValue({ ...token(), ...change });
      await expect(createSession(request())).rejects.toMatchObject({
        status: 401,
      });
    }
  });
  it("denies missing, invalid and revoked sessions", async () => {
    expect(await currentUser()).toBeNull();
    await expect(requireUser()).rejects.toMatchObject({ status: 401 });
    mocks.cookie = "revoked";
    mocks.verifySessionCookie.mockRejectedValue(new Error("revoked"));
    expect(await currentUser()).toBeNull();
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith("revoked", true);
  });
  it("resolves a valid session to an internal account and clears logout", async () => {
    mocks.cookie = "valid";
    mocks.verifySessionCookie.mockResolvedValue({ uid: "provider-uid" });
    mocks.select.mockResolvedValue([{ id: "internal-uuid" }]);
    expect((await requireUser()).id).toBe("internal-uuid");
    await logout();
    expect(mocks.set).toHaveBeenCalledWith(
      "chainpay_session",
      "",
      expect.objectContaining({ maxAge: 0, httpOnly: true }),
    );
  });
});
describe("HTTP boundary", () => {
  it("rejects absent and cross-site origins", () => {
    expect(() =>
      assertOrigin(new Request("http://localhost:3000/api")),
    ).toThrow();
    expect(() =>
      assertOrigin(
        new Request("http://localhost:3000/api", {
          headers: { Origin: "https://evil.test" },
        }),
      ),
    ).toThrow();
    expect(() => assertOrigin(request())).not.toThrow();
  });
  it("rejects oversized streaming bodies and invalid JSON", async () => {
    await expect(
      body(
        new Request("http://localhost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "x".repeat(17000),
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
    await expect(
      body(
        new Request("http://localhost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        }),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("returns sanitized server errors without secrets or stack traces", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await endpoint(async () => {
      throw new Error("database password=secret");
    })(new Request("http://localhost:3000/api/test"));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret");
    log.mockRestore();
  });
});
