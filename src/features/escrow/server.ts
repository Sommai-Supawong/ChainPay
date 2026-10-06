import "server-only";
import { desc, eq, or, inArray } from "drizzle-orm";
import { z } from "zod";
import { Hex, TransactionReceiptNotFoundError, parseEther } from "viem";
import {
  escrows,
  escrowMilestones,
  escrowTransactions,
  wallets,
  users,
  escrowSubmissions,
} from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { CONFIRMATIONS } from "@/lib/blockchain/config";
import { ethereum } from "@/lib/blockchain/server";
import { assertSepoliaRpc, rpcResult } from "@/lib/blockchain/rpc";

import { escrowDraftSchema } from "@/lib/validation";

export async function createEscrowDraft(userId: string, input: z.output<typeof escrowDraftSchema>) {
  return withDb(async (db) => {
    let total = BigInt(0);
    for (const m of input.milestones) {
      total += parseEther(m.amount);
    }
    
    // Attempt to find freelancer by address if they are registered
    const [freelancerWallet] = await db.select().from(wallets).where(eq(wallets.address, input.freelancerAddress));

    return db.transaction(async (tx) => {
      const [escrow] = await tx.insert(escrows).values({
        clientId: userId,
        freelancerAddress: input.freelancerAddress,
        freelancerId: freelancerWallet?.userId ?? null,
        title: input.title,
        description: input.description,
        totalAmount: total.toString(),
      }).returning();

      for (let i = 0; i < input.milestones.length; i++) {
        const m = input.milestones[i];
        await tx.insert(escrowMilestones).values({
          escrowId: escrow.id,
          milestoneIndex: i,
          title: m.title,
          description: m.description,
          amount: parseEther(m.amount).toString(), // amount stored in Wei
        });
      }
      return escrow;
    });
  });
}

export async function getEscrow(id: string) {
  return withDb(async (db) => {
    const [escrow] = await db.select().from(escrows).where(eq(escrows.id, id));
    if (!escrow) throw new AppError(404, "Escrow not found.");
    const milestonesList = await db.select().from(escrowMilestones).where(eq(escrowMilestones.escrowId, id)).orderBy(escrowMilestones.milestoneIndex);
    
    // fetch submissions for these milestones
    const milestoneIds = milestonesList.map(m => m.id);
    const submissions = milestoneIds.length > 0 
      ? await db.select().from(escrowSubmissions).where(inArray(escrowSubmissions.milestoneId, milestoneIds))
      : [];

    const milestonesWithSubmissions = milestonesList.map(m => ({
      ...m,
      submission: submissions.find(s => s.milestoneId === m.id) || null
    }));

    const [clientUser] = await db.select({
      displayName: users.displayName,
    }).from(users).where(eq(users.id, escrow.clientId));

    const [clientWallet] = await db.select().from(wallets).where(eq(wallets.userId, escrow.clientId)).orderBy(desc(wallets.isPrimary));

    return { 
      ...escrow, 
      milestones: milestonesWithSubmissions,
      clientName: clientUser?.displayName ?? null,
      clientAddress: clientWallet?.address ?? null
    };
  });
}

export async function listEscrows(userId: string) {
  return withDb(async (db) => {
    const ownedWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
    const addresses = ownedWallets.map(w => w.address);
    const conditions = [eq(escrows.clientId, userId)];
    if (addresses.length > 0) {
      conditions.push(inArray(escrows.freelancerAddress, addresses));
    }
    return db.select().from(escrows).where(or(...conditions)).orderBy(desc(escrows.createdAt));
  });
}

export async function submitMilestone(userId: string, escrowId: string, milestoneId: string, input: { title: string, description: string, evidenceUrl?: string }) {
  return withDb(async (db) => {
    const escrowInfo = await getEscrow(escrowId);
    
    // Check if user is the freelancer
    const ownedWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
    const isFreelancer = ownedWallets.some(w => w.address.toLowerCase() === escrowInfo.freelancerAddress.toLowerCase()) || escrowInfo.freelancerId === userId;
    if (!isFreelancer) throw new AppError(403, "Only the freelancer can submit milestones.");

    if (escrowInfo.status !== "funded" && escrowInfo.status !== "disputed") {
        throw new AppError(400, "Escrow must be funded before submitting work.");
    }

    const [milestone] = escrowInfo.milestones.filter(m => m.id === milestoneId);
    if (!milestone) throw new AppError(404, "Milestone not found.");
    if (milestone.status !== "pending") throw new AppError(400, "Milestone is not pending.");

    await db.transaction(async (tx) => {
      await tx.insert(escrowSubmissions).values({
        milestoneId,
        title: input.title,
        description: input.description,
        evidenceUrl: input.evidenceUrl ?? null,
      });

      await tx.update(escrowMilestones)
        .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
        .where(eq(escrowMilestones.id, milestoneId));
    });
    return { success: true };
  });
}

export async function approveMilestone(userId: string, escrowId: string, milestoneId: string) {
  return withDb(async (db) => {
    const escrowInfo = await getEscrow(escrowId);
    
    // Only client can approve
    if (escrowInfo.clientId !== userId) {
      throw new AppError(403, "Only the client can approve work.");
    }

    if (escrowInfo.status !== "funded") {
        throw new AppError(400, "Escrow must be funded to approve work.");
    }

    const [milestone] = escrowInfo.milestones.filter(m => m.id === milestoneId);
    if (!milestone) throw new AppError(404, "Milestone not found.");
    if (milestone.status !== "submitted") throw new AppError(400, "Milestone is not in a submittable state."); // Using 'submittable' to loosely map to expected error, or just specific error

    await db.update(escrowMilestones)
      .set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() })
      .where(eq(escrowMilestones.id, milestoneId));
    return { success: true };
  });
}

export async function markDisputed(userId: string, escrowId: string) {
  return withDb(async (db) => {
    const escrowInfo = await getEscrow(escrowId);
    const ownedWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
    const isFreelancer = ownedWallets.some(w => w.address === escrowInfo.freelancerAddress);
    const isClient = escrowInfo.clientId === userId;
    
    if (!isClient && !isFreelancer) throw new AppError(403, "Not authorized to dispute.");
    if (escrowInfo.status === "refunded" || escrowInfo.status === "released") throw new AppError(400, "Cannot dispute closed escrow.");

    await db.update(escrows).set({ status: "disputed", updatedAt: new Date() }).where(eq(escrows.id, escrowId));
    return { success: true };
  });
}

import { escrowTransactionSchema } from "@/lib/validation";
import { escrowContractAddress } from "@/lib/blockchain/config";
import { chainPayEscrowAbi } from "@/lib/blockchain/chainpay-escrow-abi";
import { decodeEventLog, keccak256, toHex } from "viem";

export async function submitEscrowTransaction(input: z.output<typeof escrowTransactionSchema>) {
  return withDb(async (db) => {
    // Check if tx already exists
    const [existing] = await db.select().from(escrowTransactions).where(eq(escrowTransactions.txHash, input.hash));
    if (existing) {
      if (existing.escrowId !== input.escrowId) throw new AppError(409, "Transaction already recorded for a different escrow.");
      return { hash: existing.txHash, status: existing.status };
    }

    const [escrow] = await db.select().from(escrows).where(eq(escrows.id, input.escrowId));
    if (!escrow) throw new AppError(404, "Escrow not found.");

    let amount = "0";
    if (input.type === "deposit") amount = escrow.totalAmount;
    if (input.type === "release" && input.milestoneId) {
      const [m] = await db.select().from(escrowMilestones).where(eq(escrowMilestones.id, input.milestoneId));
      if (m) amount = m.amount;
    }

    const [row] = await db.insert(escrowTransactions).values({
      escrowId: input.escrowId,
      milestoneId: input.milestoneId ?? null,
      txHash: input.hash,
      type: input.type,
      amount,
    }).returning();

    return { hash: row.txHash, status: row.status };
  });
}

export async function verifyEscrowTransaction(hash: Hex) {
  const [row] = await withDb(db => db.select().from(escrowTransactions).where(eq(escrowTransactions.txHash, hash)));
  if (!row) throw new AppError(404, "Transaction not found.");
  if (row.status !== "pending") return { hash, status: row.status };

  const client = ethereum();
  await assertSepoliaRpc(client);

  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash });
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError) return { hash, status: "pending", reason: "awaiting_receipt" };
    throw new AppError(503, "Ethereum Sepolia RPC is unavailable.");
  }

  const [latest, block] = await rpcResult(() =>
    Promise.all([client.getBlockNumber(), client.getBlock({ blockNumber: receipt.blockNumber })])
  );

  if (block.hash !== receipt.blockHash || latest - receipt.blockNumber + BigInt(1) < BigInt(CONFIRMATIONS)) {
    return { hash, status: "pending", reason: "awaiting_confirmations" };
  }

  const status = receipt.status === "success" ? "confirmed" : "failed";

  const onChainEscrowId = keccak256(toHex(row.escrowId));
  const contract = escrowContractAddress();

  if (status === "confirmed") {
    // Verify Event
    const events = receipt.logs.flatMap((log) => {
      if (log.address.toLowerCase() !== contract.toLowerCase()) return [];
      try {
        const event = decodeEventLog({
          abi: chainPayEscrowAbi,
          data: log.data,
          topics: log.topics as [Hex, ...Hex[]],
          strict: false,
        });
        return [event];
      } catch {
        return [];
      }
    });

    if (row.type === "deposit") {
      const e = events.find(e => e.eventName === "EscrowFunded" && e.args.escrowId === onChainEscrowId);
      if (!e) throw new AppError(400, "Ethereum did not emit the expected EscrowFunded event.");
    } else if (row.type === "release") {
      const e = events.find(e => e.eventName === "PaymentReleased" && e.args.escrowId === onChainEscrowId);
      if (!e) throw new AppError(400, "Ethereum did not emit the expected PaymentReleased event.");
    } else if (row.type === "refund") {
      const e = events.find(e => e.eventName === "RefundIssued" && e.args.escrowId === onChainEscrowId);
      if (!e) throw new AppError(400, "Ethereum did not emit the expected RefundIssued event.");
    }
  }

  // Update DB states
  const settledStatus = await withDb((db) => db.transaction(async (tx) => {
    const [current] = await tx.select().from(escrowTransactions).where(eq(escrowTransactions.id, row.id)).for("update");
    if (current.status !== "pending") return current.status;

    await tx.update(escrowTransactions)
      .set({
        status,
        blockNumber: receipt.blockNumber,
        confirmedAt: status === "confirmed" ? new Date(Number(block.timestamp) * 1000) : null,
        updatedAt: new Date()
      })
      .where(eq(escrowTransactions.id, row.id));

    if (status === "confirmed") {
      if (row.type === "deposit") {
        await tx.update(escrows).set({ status: "funded" }).where(eq(escrows.id, row.escrowId));
      } else if (row.type === "release" && row.milestoneId) {
        await tx.update(escrowMilestones).set({ status: "released", releasedAt: new Date() }).where(eq(escrowMilestones.id, row.milestoneId));
        // Check if all released
        const allM = await tx.select().from(escrowMilestones).where(eq(escrowMilestones.escrowId, row.escrowId));
        const allReleased = allM.every(m => m.status === "released");
        if (allReleased) {
          await tx.update(escrows).set({ status: "released" }).where(eq(escrows.id, row.escrowId));
        }
      } else if (row.type === "refund") {
        await tx.update(escrows).set({ status: "refunded" }).where(eq(escrows.id, row.escrowId));
      } else if (row.type === "dispute_resolved") {
        await tx.update(escrows).set({ status: "refunded" }).where(eq(escrows.id, row.escrowId));
      }
    }
    return status;
  }));

  return { hash, status: settledStatus };
}
