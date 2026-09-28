import {
  decodeFunctionData,
  decodeEventLog,
  parseEther,
  type Hex,
  type Transaction,
  type TransactionReceipt,
} from "viem";
import { chain } from "./config";
import { chainPayV1Abi } from "./chainpay-v1-abi";
import { chainPayV2Abi } from "./chainpay-v2-abi";
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
  version: 1 | 2 = 2,
) {
  if (tx.chainId !== chain.id)
    throw new AppError(400, "The transaction is not on Ethereum Sepolia.");
  if (tx.to?.toLowerCase() !== contract.toLowerCase())
    throw new AppError(
      400,
      "The transaction targets a different ChainPay contract.",
    );
  if (
    tx.from.toLowerCase() !== expected.fromAddress.toLowerCase() ||
    tx.value !== parseEther(expected.amount)
  )
    throw new AppError(400, "The transaction does not match this payment.");
  let call;
  try {
    call = decodeFunctionData({
      abi: version === 1 ? chainPayV1Abi : chainPayV2Abi,
      data: tx.input,
    });
  } catch {
    throw new AppError(
      400,
      "The transaction has invalid ChainPay payment data.",
    );
  }
  if (
    call.functionName !== "pay" ||
    call.args[0].toLowerCase() !== expected.paymentId.toLowerCase()
  )
    throw new AppError(400, "The transaction payment ID does not match.");
  if (call.args[1].toLowerCase() !== expected.toAddress.toLowerCase())
    throw new AppError(400, "The transaction merchant does not match.");
}
export function assertPaymentEvent(
  receipt: Pick<TransactionReceipt, "logs">,
  expected: ExpectedPayment,
  contract: string,
  version: 1 | 2 = 2,
  blockTimestamp?: bigint,
) {
  const matches = receipt.logs.filter((log) => {
    if (log.address.toLowerCase() !== contract.toLowerCase()) return false;
    try {
      const event = decodeEventLog({
        abi: version === 1 ? chainPayV1Abi : chainPayV2Abi,
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
        event.args.amount === parseEther(expected.amount) &&
        (blockTimestamp === undefined ||
          event.args.timestamp === blockTimestamp)
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
