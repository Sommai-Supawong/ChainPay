import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { contacts, users } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { chain } from "@/lib/blockchain/config";
import { AppError } from "@/lib/errors";
import { contactSchema, profileSchema } from "@/lib/validation";
export const listContacts = (userId: string) =>
  withDb((db) =>
    db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .orderBy(asc(contacts.name)),
  );
export async function saveContact(
  userId: string,
  input: z.output<typeof contactSchema>,
  id?: string,
) {
  const [row] = await withDb((db) =>
    id
      ? db
          .update(contacts)
          .set({ ...input, updatedAt: new Date() })
          .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
          .returning()
      : db
          .insert(contacts)
          .values({ ...input, userId, chainId: chain.id })
          .returning(),
  );
  if (!row) throw new AppError(404, "Contact not found.");
  return row;
}
export async function removeContact(userId: string, id: string) {
  const rows = await withDb((db) =>
    db
      .delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning({ id: contacts.id }),
  );
  if (!rows.length) throw new AppError(404, "Contact not found.");
  return { ok: true };
}
export async function updateProfile(
  userId: string,
  input: z.output<typeof profileSchema>,
) {
  const [row] = await withDb((db) =>
    db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning(),
  );
  return { displayName: row.displayName, accountType: row.accountType };
}
