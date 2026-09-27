import {
  decodeFunctionData,
  decodeEventLog,
  parseEther,
  type Hex,
  type Transaction,
  type TransactionReceipt,
} from "viem";
import { chain, chainPayAbi } from "./config";
import { AppError } from "@/lib/errors";

export type ExpectedPayment = {
  fromAddress: string;
  toAddress: string;
  amount: string;
  paymentId: string;
};
export function assertTransaction(
  tx: Pick<Transaction, "from" | "to" | "value" | "input" | "chainId">,
  expected: ExpectedPayment,
  contract: string,
) {
  if (
    tx.chainId !== chain.id ||
    tx.to?.toLowerCase() !== contract.toLowerCase() ||
    tx.from.toLowerCase() !== expected.fromAddress.toLowerCase() ||
    tx.value !== parseEther(expected.amount)
  )
    throw new AppError(400, "The transaction does not match this payment.");
  try {
    const call = decodeFunctionData({ abi: chainPayAbi, data: tx.input });
    if (
      call.functionName !== "pay" ||
      call.args[0].toLowerCase() !== expected.paymentId.toLowerCase() ||
      call.args[1].toLowerCase() !== expected.toAddress.toLowerCase()
    )
      throw new Error("mismatch");
  } catch {
    throw new AppError(400, "The contract payment details do not match.");
  }
}
export function assertPaymentEvent(
  receipt: Pick<TransactionReceipt, "logs">,
  expected: ExpectedPayment,
  contract: string,
) {
  const matches = receipt.logs.filter((log) => {
    if (log.address.toLowerCase() !== contract.toLowerCase()) return false;
    try {
      const event = decodeEventLog({
        abi: chainPayAbi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
        eventName: "PaymentCompleted",
        strict: true,
      });
      return (
        event.args.paymentId.toLowerCase() ===
          expected.paymentId.toLowerCase() &&
        event.args.payer.toLowerCase() === expected.fromAddress.toLowerCase() &&
        event.args.merchant.toLowerCase() ===
          expected.toAddress.toLowerCase() &&
        event.args.amount === parseEther(expected.amount)
      );
    } catch {
      return false;
    }
  });
  if (matches.length !== 1)
    throw new AppError(
      400,
      "Ethereum did not emit the expected payment event.",
    );
}
