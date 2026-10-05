import "server-only";
import { and, desc, eq, or, inArray } from "drizzle-orm";
import { z } from "zod";
import { Hex, TransactionNotFoundError, TransactionReceiptNotFoundError, parseEther } from "viem";
import {
  escrows,
  escrowMilestones,
  escrowTransactions,
  wallets,
} from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { chain, CONFIRMATIONS } from "@/lib/blockchain/config";
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
          amount: m.amount, // amount in ether string representation
        });
      }
      return escrow;
    });
  });
}

export async function getEscrow(id: string) {
  return withDb(async (db) => {
    const [escrow] = await db.select().from(escrows).where(eq(escrows.id, id));
    if (!escrow) throw new AppError(404, "Escrow not found");
    const milestonesList = await db.select().from(escrowMilestones).where(eq(escrowMilestones.escrowId, id)).orderBy(escrowMilestones.milestoneIndex);
    return { ...escrow, milestones: milestonesList };
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

export async function submitMilestone(userId: string, escrowId: string, milestoneId: string) {
  return withDb(async (db) => {
    const escrowInfo = await getEscrow(escrowId);
    
    // Check if user is the freelancer
    const ownedWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
    const isFreelancer = ownedWallets.some(w => w.address === escrowInfo.freelancerAddress);
    if (!isFreelancer) throw new AppError(403, "Only the freelancer can submit milestones");

    const [milestone] = escrowInfo.milestones.filter(m => m.id === milestoneId);
    if (!milestone) throw new AppError(404, "Milestone not found");
    if (milestone.status !== "pending") throw new AppError(400, "Milestone is not pending");

    await db.update(escrowMilestones)
      .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(escrowMilestones.id, milestoneId));
  });
}

export async function markDisputed(userId: string, escrowId: string) {
  return withDb(async (db) => {
    const escrowInfo = await getEscrow(escrowId);
    const ownedWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
    const isFreelancer = ownedWallets.some(w => w.address === escrowInfo.freelancerAddress);
    const isClient = escrowInfo.clientId === userId;
    
    if (!isClient && !isFreelancer) throw new AppError(403, "Not authorized to dispute");
    if (escrowInfo.status === "refunded" || escrowInfo.status === "released") throw new AppError(400, "Cannot dispute closed escrow");

    await db.update(escrows).set({ status: "disputed", updatedAt: new Date() }).where(eq(escrows.id, escrowId));
  });
}
