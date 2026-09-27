import { describe, expect, it } from "vitest";
import {
  addressSchema,
  amountSchema,
  contactSchema,
  hashSchema,
  requestSchema,
} from "@/lib/validation";
import {
  canPayRequest,
  effectiveRequestStatus,
  shortAddress,
} from "@/lib/utils";
import { parseEther } from "viem";
const address = "0x1111111111111111111111111111111111111111";
describe("payment validation", () => {
  it.each([
    "0",
    "-1",
    "1e3",
    "01",
    ".5",
    "1.",
    "NaN",
    "0.0000000000000000001",
    "1000000000000000000",
    "1,000",
  ])("rejects unsafe amount %s", (value) =>
    expect(amountSchema.safeParse(value).success).toBe(false),
  );
  it("preserves wei precision without floating point", () => {
    const value = amountSchema.parse("0.000000000000000001");
    expect(parseEther(value)).toBe(BigInt(1));
    expect(amountSchema.parse("123.456789012345678901")).toBe(
      "123.456789012345678901",
    );
  });
  it("rejects zero and malformed recipients", () => {
    expect(
      addressSchema.safeParse("0x0000000000000000000000000000000000000000")
        .success,
    ).toBe(false);
    expect(addressSchema.safeParse("0x123").success).toBe(false);
    expect(addressSchema.parse(address)).toBe(address);
  });
  it("validates a transaction hash rather than arbitrary path input", () => {
    expect(hashSchema.safeParse("../../secret").success).toBe(false);
    expect(hashSchema.parse(`0x${"A".repeat(64)}`)).toBe(`0x${"a".repeat(64)}`);
  });
  it("requires a verified-wallet identifier and nonempty request title", () => {
    expect(
      requestSchema.safeParse({
        title: "",
        description: "",
        amount: "1",
        receiverWalletId: "123",
        expiresIn: "week",
        status: "active",
      }).success,
    ).toBe(false);
  });
  it("validates contact names and addresses", () =>
    expect(
      contactSchema.safeParse({ name: " ", walletAddress: address, label: "" })
        .success,
    ).toBe(false));
});
describe("request lifecycle", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  it("expires at the exact deadline", () =>
    expect(canPayRequest("active", now, now)).toBe(false));
  it("permits active unexpired requests", () =>
    expect(canPayRequest("active", null, now)).toBe(true));
  it.each(["draft", "paid", "pending", "cancelled", "expired"])(
    "does not pay %s requests",
    (status) => expect(canPayRequest(status, null, now)).toBe(false),
  );
  it("preserves settled and in-flight state past expiry", () => {
    expect(effectiveRequestStatus("paid", now, now)).toBe("paid");
    expect(effectiveRequestStatus("pending", now, now)).toBe("pending");
  });
  it("formats an address without losing its ends", () =>
    expect(shortAddress(address)).toBe("0x1111…1111"));
});
