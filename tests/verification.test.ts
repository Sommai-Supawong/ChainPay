import { describe, it, expect } from "vitest";
import {
  encodeFunctionData,
  encodeEventTopics,
  encodeAbiParameters,
  parseEther,
  type Transaction,
  type TransactionReceipt,
} from "viem";
import { chain, chainPayAbi } from "@/lib/blockchain/config";
import {
  assertTransaction,
  assertPaymentEvent,
} from "@/lib/blockchain/verification";
const from = "0x1111111111111111111111111111111111111111",
  to = "0x2222222222222222222222222222222222222222",
  contract = "0x3333333333333333333333333333333333333333",
  paymentId = `0x${"ab".repeat(32)}` as const;
const expected = { fromAddress: from, toAddress: to, amount: "0.1", paymentId };
const tx = {
  from,
  to: contract,
  chainId: chain.id,
  value: parseEther("0.1"),
  input: encodeFunctionData({
    abi: chainPayAbi,
    functionName: "pay",
    args: [paymentId, to],
  }),
} satisfies Pick<Transaction, "from" | "to" | "chainId" | "value" | "input">;
const log = {
  address: contract,
  topics: encodeEventTopics({
    abi: chainPayAbi,
    eventName: "PaymentCompleted",
    args: { paymentId, payer: from, merchant: to },
  }),
  data: encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }],
    [parseEther("0.1"), BigInt(1700000000)],
  ),
};
const receipt = (logs: unknown[]) =>
  ({ logs }) as Pick<TransactionReceipt, "logs">;
describe("server settlement verification", () => {
  it("accepts an exact ChainPay call and event", () => {
    expect(() => assertTransaction(tx, expected, contract)).not.toThrow();
    expect(() =>
      assertPaymentEvent(receipt([log]), expected, contract),
    ).not.toThrow();
  });
  it.each([
    { chainId: 1 },
    { to },
    { from: to },
    { value: BigInt(1) },
    { input: "0x" as const },
  ] as const)("rejects transaction substitution %o", (change) =>
    expect(() =>
      assertTransaction({ ...tx, ...change }, expected, contract),
    ).toThrow(),
  );
  it("rejects a different payment identifier", () =>
    expect(() =>
      assertTransaction(
        tx,
        { ...expected, paymentId: `0x${"cd".repeat(32)}` },
        contract,
      ),
    ).toThrow());
  it("rejects an event spoofed by another contract", () =>
    expect(() =>
      assertPaymentEvent(
        receipt([{ ...log, address: to }]),
        expected,
        contract,
      ),
    ).toThrow());
  it("rejects missing and duplicate events", () => {
    expect(() => assertPaymentEvent(receipt([]), expected, contract)).toThrow();
    expect(() =>
      assertPaymentEvent(receipt([log, log]), expected, contract),
    ).toThrow();
  });
  it("rejects wrong event value and recipient", () => {
    expect(() =>
      assertPaymentEvent(
        receipt([log]),
        { ...expected, amount: "1" },
        contract,
      ),
    ).toThrow();
    expect(() =>
      assertPaymentEvent(
        receipt([log]),
        { ...expected, toAddress: from },
        contract,
      ),
    ).toThrow();
  });
});
