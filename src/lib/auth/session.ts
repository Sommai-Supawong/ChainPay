import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { adminAuth } from "./firebase-admin";
import { AppError } from "@/lib/errors";

export const SESSION_COOKIE = "chainpay_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 5;
export async function currentUser() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const auth = adminAuth();
  let decoded;
  try {
    decoded = await auth.verifySessionCookie(value, true);
  } catch {
    return null;
  }
  return withDb(
    async (db) =>
      (
        await db
          .select()
          .from(users)
          .where(eq(users.firebaseUid, decoded.uid))
          .limit(1)
      )[0] ?? null,
  );
}
export async function requireUser() {
  const user = await currentUser();
  if (!user)
    throw new AppError(401, "Your session has expired. Please sign in again.");
  return user;
}
export async function pageUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
