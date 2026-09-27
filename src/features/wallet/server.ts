import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getAddress, verifyMessage, type Hex } from "viem";
import { createSiweMessage } from "viem/siwe";
import { users, wallets, walletNonces, paymentRequests } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { appOrigin } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { chain } from "@/lib/blockchain/config";
import { rateLimit } from "@/lib/rate-limit";

export const listWallets = (userId: string) =>
  withDb((db) =>
    db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), isNull(wallets.removedAt))),
  );
export async function challenge(userId: string, address: string) {
  await rateLimit(`challenge:${userId}`, 10);
  const nonce = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60_000);
  const domain = new URL(appOrigin()).host;
  const message = createSiweMessage({
    address: getAddress(address),
    chainId: chain.id,
    domain,
    nonce,
    uri: appOrigin(),
    version: "1",
    issuedAt: new Date(),
    expirationTime: expiresAt,
    statement: `Verify your wallet for ChainPay account ${userId}. This signature does not move funds.`,
  });
  const [row] = await withDb((db) =>
    db
      .insert(walletNonces)
      .values({
        userId,
        walletAddress: address,
        nonce,
        expiresAt,
        message,
        domain,
      })
      .returning({ id: walletNonces.id }),
  );
  return { id: row.id, message };
}
export async function verifyWallet(userId: string, id: string, signature: Hex) {
  await rateLimit(`signature:${userId}`, 10);
  return withDb((db) =>
    db.transaction(async (tx) => {
      // Serialize wallet changes for one owner, including first-primary selection.
      await tx.select().from(users).where(eq(users.id, userId)).for("update");
      const [nonce] = await tx
        .select()
        .from(walletNonces)
        .where(
          and(
            eq(walletNonces.id, id),
            eq(walletNonces.userId, userId),
            isNull(walletNonces.usedAt),
            gt(walletNonces.expiresAt, new Date()),
          ),
        )
        .for("update");
      if (!nonce || nonce.domain !== new URL(appOrigin()).host)
        throw new AppError(
          400,
          "This challenge expired or was already used. Request a new signature.",
        );
      let valid = false;
      try {
        valid = await verifyMessage({
          address: getAddress(nonce.walletAddress),
          message: nonce.message,
          signature,
        });
      } catch {
        /* malformed signature */
      }
      if (!valid)
        throw new AppError(400, "The signature does not match this wallet.");
      const [existing] = await tx
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.address, nonce.walletAddress),
            eq(wallets.chainId, chain.id),
          ),
        );
      if (existing && existing.userId !== userId)
        throw new AppError(
          409,
          "This wallet is already linked to another account.",
        );
      const primary = await tx
        .select({ id: wallets.id })
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, userId),
            eq(wallets.isPrimary, true),
            isNull(wallets.removedAt),
          ),
        );
      const values = {
        userId,
        address: nonce.walletAddress,
        chainId: chain.id,
        verifiedAt: new Date(),
        removedAt: null,
        isPrimary: primary.length === 0 || existing?.isPrimary === true,
        updatedAt: new Date(),
      };
      const [wallet] = existing
        ? await tx
            .update(wallets)
            .set(values)
            .where(eq(wallets.id, existing.id))
            .returning()
        : await tx.insert(wallets).values(values).returning();
      await tx
        .update(walletNonces)
        .set({ usedAt: new Date() })
        .where(eq(walletNonces.id, id));
      return wallet;
    }),
  );
}
export async function changeWallet(
  userId: string,
  id: string,
  remove: boolean,
) {
  return withDb((db) =>
    db.transaction(async (tx) => {
      await tx.select().from(users).where(eq(users.id, userId)).for("update");
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.id, id),
            eq(wallets.userId, userId),
            isNull(wallets.removedAt),
          ),
        )
        .for("update");
      if (!wallet) throw new AppError(404, "Wallet not found.");
      if (remove) {
        const requests = await tx
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.receiverWalletId, id));
        if (
          requests.some((r) =>
            ["active", "pending", "draft"].includes(r.status),
          )
        )
          throw new AppError(
            409,
            "Cancel or resolve open requests for this wallet first.",
          );
        await tx
          .update(wallets)
          .set({
            removedAt: new Date(),
            isPrimary: false,
            updatedAt: new Date(),
          })
          .where(eq(wallets.id, id));
        if (wallet.isPrimary) {
          const [next] = await tx
            .select()
            .from(wallets)
            .where(and(eq(wallets.userId, userId), isNull(wallets.removedAt)))
            .limit(1);
          if (next)
            await tx
              .update(wallets)
              .set({ isPrimary: true })
              .where(eq(wallets.id, next.id));
        }
      } else {
        await tx
          .update(wallets)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(eq(wallets.userId, userId));
        await tx
          .update(wallets)
          .set({ isPrimary: true })
          .where(eq(wallets.id, id));
      }
      return { ok: true };
    }),
  );
}
