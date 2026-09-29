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
export function isDirectTransaction(
  tx: Pick<Transaction, "to">,
  contract: string,
) {
  return tx.to?.toLowerCase() === contract.toLowerCase();
}

export function assertSepoliaTransaction(tx: Pick<Transaction, "chainId">) {
  if (tx.chainId !== chain.id)
    throw new AppError(400, "The transaction is not on Ethereum Sepolia.");
}
export function assertTransaction(
  tx: Pick<Transaction, "from" | "to" | "value" | "input" | "chainId">,
  expected: ExpectedPayment,
  contract: string,
  version: 1 | 2 = 2,
) {
  assertSepoliaTransaction(tx);
  if (!isDirectTransaction(tx, contract))
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
  const events = receipt.logs.flatMap((log) => {
    if (log.address.toLowerCase() !== contract.toLowerCase()) return [];
    try {
      const event = decodeEventLog({
        abi: version === 1 ? chainPayV1Abi : chainPayV2Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
        eventName: "PaymentCompleted",
        strict: true,
      });
      return [event];
    } catch {
      return [];
    }
  });
  if (
    events.length !== 1 ||
    events[0].args.paymentId.toLowerCase() !==
      expected.paymentId.toLowerCase() ||
    events[0].args.payer.toLowerCase() !== expected.fromAddress.toLowerCase() ||
    events[0].args.merchant.toLowerCase() !==
      expected.toAddress.toLowerCase() ||
    events[0].args.amount !== parseEther(expected.amount) ||
    (blockTimestamp !== undefined &&
      events[0].args.timestamp !== blockTimestamp)
  )
    throw new AppError(
      400,
      "Ethereum did not emit the expected payment event.",
    );
}
