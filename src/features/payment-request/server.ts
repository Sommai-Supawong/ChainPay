import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { paymentRequests, users, wallets } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { chain } from "@/lib/blockchain/config";
import { requestSchema } from "@/lib/validation";
import { effectiveRequestStatus } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export const listRequests = (userId: string) =>
  withDb(async (db) =>
    (
      await db
        .select()
        .from(paymentRequests)
        .where(eq(paymentRequests.userId, userId))
        .orderBy(desc(paymentRequests.createdAt))
    ).map((r) => ({
      ...r,
      status: effectiveRequestStatus(r.status, r.expiresAt),
    })),
  );
export async function getRequest(id: string, userId: string) {
  const [row] = await withDb((db) =>
    db
      .select()
      .from(paymentRequests)
      .where(
        and(eq(paymentRequests.id, id), eq(paymentRequests.userId, userId)),
      ),
  );
  if (!row) throw new AppError(404, "Payment request not found.");
  return { ...row, status: effectiveRequestStatus(row.status, row.expiresAt) };
}
export async function publicRequest(slug: string) {
  const [row] = await withDb((db) =>
    db
      .select({
        id: paymentRequests.id,
        slug: paymentRequests.slug,
        title: paymentRequests.title,
        description: paymentRequests.description,
        amount: paymentRequests.amount,
        status: paymentRequests.status,
        expiresAt: paymentRequests.expiresAt,
        receiver: wallets.address,
        merchant: users.displayName,
      })
      .from(paymentRequests)
      .innerJoin(wallets, eq(wallets.id, paymentRequests.receiverWalletId))
      .innerJoin(users, eq(users.id, paymentRequests.userId))
      .where(eq(paymentRequests.slug, slug)),
  );
  if (!row || row.status === "draft")
    throw new AppError(404, "Payment request not found.");
  return { ...row, status: effectiveRequestStatus(row.status, row.expiresAt) };
}
export async function createRequest(
  userId: string,
  input: z.output<typeof requestSchema>,
) {
  await rateLimit(`request:${userId}`, 20);
  return withDb((db) =>
    db.transaction(async (tx) => {
      await tx.select().from(users).where(eq(users.id, userId)).for("update");
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.id, input.receiverWalletId),
            eq(wallets.userId, userId),
            isNull(wallets.removedAt),
          ),
        );
      if (!wallet)
        throw new AppError(400, "Choose one of your verified wallets.");
      const duration = {
        never: 0,
        hour: 3600000,
        day: 86400000,
        week: 604800000,
      }[input.expiresIn];
      const [row] = await tx
        .insert(paymentRequests)
        .values({
          userId,
          receiverWalletId: wallet.id,
          chainId: chain.id,
          slug: `CP-${randomBytes(15).toString("base64url")}`,
          title: input.title,
          description: input.description,
          amount: input.amount,
          status: input.status,
          expiresAt: duration ? new Date(Date.now() + duration) : null,
        })
        .returning();
      return row;
    }),
  );
}
export async function changeRequest(
  userId: string,
  id: string,
  status: "active" | "cancelled",
) {
  return withDb((db) =>
    db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(paymentRequests)
        .where(
          and(eq(paymentRequests.id, id), eq(paymentRequests.userId, userId)),
        )
        .for("update");
      if (!row) throw new AppError(404, "Payment request not found.");
      const current = effectiveRequestStatus(row.status, row.expiresAt);
      if (
        status === "active"
          ? current !== "draft"
          : !["draft", "active", "expired"].includes(current)
      )
        throw new AppError(
          409,
          "This request cannot be changed in its current state.",
        );
      const [updated] = await tx
        .update(paymentRequests)
        .set({ status, updatedAt: new Date() })
        .where(eq(paymentRequests.id, id))
        .returning();
      return updated;
    }),
  );
}
