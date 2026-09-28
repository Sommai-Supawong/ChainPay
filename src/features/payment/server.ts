import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  getAddress,
  keccak256,
  parseEther,
  toHex,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  type Hex,
} from "viem";
import {
  auditLogs,
  paymentIntents,
  paymentRequests,
  transactionMetadata,
  transactions,
  wallets,
} from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { intentSchema, submitSchema } from "@/lib/validation";
import { canPayRequest, effectiveRequestStatus } from "@/lib/utils";
import {
  chain,
  CONFIRMATIONS,
  contractAddress,
  ACTIVE_CONTRACT_VERSION,
} from "@/lib/blockchain/config";
import { contractForVersion } from "@/lib/blockchain/contracts";
import { ethereum } from "@/lib/blockchain/server";
import { assertSepoliaRpc, rpcResult } from "@/lib/blockchain/rpc";
import {
  assertPaymentEvent,
  assertTransaction,
} from "@/lib/blockchain/verification";

const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function createIntent(
  userId: string | null,
  input: z.output<typeof intentSchema>,
) {
  const activeContract = contractForVersion(ACTIVE_CONTRACT_VERSION);
  // Fail before asking MetaMask to broadcast when the server cannot verify Sepolia.
  await assertSepoliaRpc(ethereum());
  return withDb((db) =>
    db.transaction(async (tx) => {
      let toAddress = input.toAddress,
        amount = input.amount,
        title = input.title;
      let requestId: string | null = null;
      if (input.slug) {
        const [r] = await tx
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.slug, input.slug))
          .for("update");
        if (!r || !canPayRequest(r.status, r.expiresAt))
          throw new AppError(
            409,
            "This payment request is not available for payment.",
          );
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.id, r.receiverWalletId));
        toAddress = getAddress(wallet.address).toLowerCase() as Hex;
        amount = r.amount;
        title = r.title;
        requestId = r.id;
      } else {
        if (!userId) throw new AppError(401, "Sign in to send a payment.");
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.userId, userId),
              eq(wallets.address, input.fromAddress),
              eq(wallets.chainId, chain.id),
              isNull(wallets.removedAt),
            ),
          );
        if (!wallet)
          throw new AppError(
            403,
            "Verify this wallet before sending payments.",
          );
      }
      if (input.fromAddress === toAddress)
        throw new AppError(
          400,
          "Choose a recipient other than your sending wallet.",
        );
      if (toAddress === contractAddress().toLowerCase())
        throw new AppError(400, "The payment contract cannot be a recipient.");
      const token = randomBytes(32).toString("base64url");
      const paymentId = keccak256(toHex(randomBytes(32)));
      const expiresAt = new Date(Date.now() + 10 * 60_000);
      const [intent] = await tx
        .insert(paymentIntents)
        .values({
          userId,
          paymentRequestId: requestId,
          paymentId,
          contractAddress: activeContract.address,
          contractVersion: activeContract.version,
          tokenHash: digest(token),
          fromAddress: input.fromAddress,
          toAddress,
          amount,
          title,
          note: input.slug ? "" : input.note,
          expiresAt,
        })
        .returning();
      return {
        id: intent.id,
        token,
        paymentId,
        fromAddress: intent.fromAddress,
        toAddress,
        amount,
        title,
        expiresAt,
        contract: activeContract.address,
        contractVersion: activeContract.version,
        chainId: chain.id,
      };
    }),
  );
}
export async function submitTransaction(input: z.output<typeof submitSchema>) {
  const [intent] = await withDb((db) =>
    db
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.id, input.intentId)),
  );
  if (
    !intent ||
    !timingSafeEqual(
      Buffer.from(digest(input.token)),
      Buffer.from(intent.tokenHash),
    )
  )
    throw new AppError(403, "Invalid payment submission.");
  const [existing] = await withDb((db) =>
    db.select().from(transactions).where(eq(transactions.intentId, intent.id)),
  );
  if (existing) {
    if (existing.txHash !== input.hash)
      throw new AppError(
        409,
        "A different transaction is already recorded for this payment.",
      );
    return { hash: existing.txHash, status: existing.status };
  }
  const client = ethereum();
  await assertSepoliaRpc(client);
  let txData;
  try {
    txData = await client.getTransaction({ hash: input.hash });
  } catch (error) {
    if (error instanceof TransactionNotFoundError)
      throw new AppError(
        409,
        "Sepolia has not indexed this transaction yet. Keep the original hash and retry saving shortly.",
      );
    throw new AppError(
      503,
      "Ethereum Sepolia RPC is unavailable. Keep your transaction hash and retry shortly.",
    );
  }
  const intentContract = contractForVersion(
    intent.contractVersion ?? 1,
    intent.contractAddress,
  );
  assertTransaction(
    txData,
    intent,
    intentContract.address,
    intentContract.version,
  );
  // Expiry prevents a new UI signature, never recovery of an already broadcast payment.
  return withDb((db) =>
    db.transaction(async (tx) => {
      let requestId = intent.paymentRequestId;
      if (intent.paymentRequestId) {
        const [r] = await tx
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.id, intent.paymentRequestId))
          .for("update");
        if (canPayRequest(r.status, r.expiresAt)) {
          await tx
            .update(paymentRequests)
            .set({ status: "pending", updatedAt: new Date() })
            .where(eq(paymentRequests.id, r.id));
        } else {
          // The on-chain transfer cannot be undone by an off-chain cancellation or race.
          // Keep the payment in history without claiming a second request settlement.
          requestId = null;
          await tx.insert(auditLogs).values({
            userId: intent.userId,
            action: "payment.request_unavailable",
            entityType: "payment_request",
            entityId: r.id,
            metadata: {
              transactionHash: input.hash,
              requestStatus: r.status,
            },
          });
        }
      }
      const [row] = await tx
        .insert(transactions)
        .values({
          userId: intent.userId,
          intentId: intent.id,
          paymentRequestId: requestId,
          txHash: input.hash,
          paymentId: intent.paymentId,
          contractAddress: intentContract.address,
          contractVersion: intentContract.version,
          chainId: chain.id,
          fromAddress: intent.fromAddress,
          toAddress: intent.toAddress,
          amount: intent.amount,
        })
        .returning();
      await tx.insert(transactionMetadata).values({
        transactionId: row.id,
        title: intent.title,
        note: intent.note,
      });
      return { hash: row.txHash, status: row.status };
    }),
  );
}
export async function verifyTransaction(hash: Hex) {
  const [row] = await withDb((db) =>
    db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.txHash, hash), eq(transactions.chainId, chain.id)),
      ),
  );
  if (!row) throw new AppError(404, "Transaction not found.");
  if (row.status !== "pending") return { hash, status: row.status };
  const client = ethereum();
  await assertSepoliaRpc(client);
  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash });
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError)
      return { hash, status: "pending", reason: "awaiting_receipt" };
    throw new AppError(
      503,
      "Ethereum Sepolia RPC is unavailable. Keep your transaction hash and retry shortly.",
    );
  }
  let txData;
  try {
    txData = await client.getTransaction({ hash });
  } catch (error) {
    if (error instanceof TransactionNotFoundError)
      return { hash, status: "pending", reason: "awaiting_transaction" };
    throw new AppError(
      503,
      "Ethereum Sepolia RPC is unavailable. Keep your transaction hash and retry shortly.",
    );
  }
  const recordContract = contractForVersion(
    row.contractVersion ?? 1,
    row.contractAddress,
  );
  assertTransaction(
    txData,
    row,
    recordContract.address,
    recordContract.version,
  );
  const [latest, block] = await rpcResult(() =>
    Promise.all([
      client.getBlockNumber(),
      client.getBlock({ blockNumber: receipt.blockNumber }),
    ]),
  );
  if (
    block.hash !== receipt.blockHash ||
    latest - receipt.blockNumber + BigInt(1) < BigInt(CONFIRMATIONS)
  )
    return { hash, status: "pending", reason: "awaiting_confirmations" };
  const status = receipt.status === "success" ? "confirmed" : "failed";
  if (status === "confirmed")
    assertPaymentEvent(
      receipt,
      row,
      recordContract.address,
      recordContract.version,
      block.timestamp,
    );
  const settledStatus = await withDb((db) =>
    db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, row.id))
        .for("update");
      if (current.status !== "pending") return current.status;
      if (row.paymentRequestId) {
        const [r] = await tx
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.id, row.paymentRequestId))
          .for("update");
        if (status === "confirmed" && r.status === "paid") {
          const [settled] = await tx
            .select()
            .from(transactions)
            .where(
              and(
                eq(transactions.paymentRequestId, r.id),
                eq(transactions.status, "confirmed"),
              ),
            );
          if (settled?.id !== row.id)
            throw new AppError(
              409,
              "This request already has a settled payment.",
            );
        }
        await tx
          .update(paymentRequests)
          .set({
            status:
              status === "confirmed"
                ? "paid"
                : (effectiveRequestStatus("active", r.expiresAt) as
                    "active" | "expired"),
            paidAt:
              status === "confirmed"
                ? new Date(Number(block.timestamp) * 1000)
                : null,
            updatedAt: new Date(),
          })
          .where(eq(paymentRequests.id, r.id));
      }
      await tx
        .update(transactions)
        .set({
          status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          confirmedAt:
            status === "confirmed"
              ? new Date(Number(block.timestamp) * 1000)
              : null,
          updatedAt: new Date(),
        })
        .where(
          and(eq(transactions.id, row.id), eq(transactions.status, "pending")),
        );
      return status;
    }),
  );
  return { hash, status: settledStatus };
}
export async function listTransactions(userId: string) {
  return withDb(async (db) => {
    // Keep historic ownership even after unlinking a wallet.
    const owned = await db
      .select({ address: wallets.address })
      .from(wallets)
      .where(eq(wallets.userId, userId));
    const addresses = owned.map((w) => w.address);
    const rows = await db
      .select({ tx: transactions, title: transactionMetadata.title })
      .from(transactions)
      .leftJoin(
        transactionMetadata,
        eq(transactionMetadata.transactionId, transactions.id),
      )
      .where(
        or(
          eq(transactions.userId, userId),
          addresses.length
            ? inArray(transactions.toAddress, addresses)
            : sql`false`,
          addresses.length
            ? inArray(transactions.fromAddress, addresses)
            : sql`false`,
        ),
      )
      .orderBy(desc(transactions.submittedAt))
      .limit(500);
    return rows.map(({ tx, title }) => ({
      ...tx,
      title: title ?? "Payment",
      direction: addresses.includes(tx.toAddress) ? "received" : "sent",
    }));
  });
}
export async function receiptData(hash: Hex, userId: string | null) {
  return withDb(async (db) => {
    const [row] = await db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.txHash, hash), eq(transactions.chainId, chain.id)),
      );
    if (!row) throw new AppError(404, "Transaction not found.");
    let title = "ChainPay payment",
      note: string | null = null;
    if (userId) {
      const own = await db
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, userId),
            or(
              eq(wallets.address, row.fromAddress),
              eq(wallets.address, row.toAddress),
            ),
          ),
        );
      if (row.userId === userId || own.length) {
        const [metadata] = await db
          .select()
          .from(transactionMetadata)
          .where(eq(transactionMetadata.transactionId, row.id));
        title = metadata?.title || title;
        if (row.userId === userId) note = metadata?.note ?? null;
      }
    }
    // Explicit projection: never publish account IDs, intent tokens or private metadata.
    return {
      txHash: row.txHash,
      status: row.status,
      amount: row.amount,
      asset: row.asset,
      fromAddress: row.fromAddress,
      toAddress: row.toAddress,
      blockNumber: row.blockNumber?.toString() ?? null,
      confirmedAt: row.confirmedAt,
      submittedAt: row.submittedAt,
      title,
      note,
    };
  });
}
export function totalAmount(rows: { amount: string }[]) {
  return rows.reduce((sum, row) => sum + parseEther(row.amount), BigInt(0));
}
