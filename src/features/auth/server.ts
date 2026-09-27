import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { users } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { body } from "@/lib/api";
import { adminAuth } from "@/lib/auth/firebase-admin";
import { SESSION_COOKIE, SESSION_SECONDS } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function createSession(request: Request) {
  await rateLimit(`login:${clientKey(request)}`, 15);
  const { idToken } = z
    .object({ idToken: z.string().min(1).max(12000) })
    .parse(await body(request));
  const auth = adminAuth();
  let token;
  try {
    token = await auth.verifyIdToken(idToken, true);
  } catch {
    throw new AppError(
      401,
      "Google sign-in could not be verified. Please sign in again.",
    );
  }
  if (
    !token.email ||
    !token.email_verified ||
    token.firebase.sign_in_provider !== "google.com" ||
    Date.now() / 1000 - token.auth_time > 300
  )
    throw new AppError(401, "Please complete a fresh Google sign-in.");
  await withDb((db) =>
    db
      .insert(users)
      .values({
        firebaseUid: token.uid,
        email: token.email!,
        displayName: token.name ?? null,
        avatarUrl: token.picture ?? null,
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email: token.email!,
          avatarUrl: token.picture ?? null,
          updatedAt: new Date(),
        },
      }),
  );
  const cookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_SECONDS * 1000,
  });
  (await cookies()).set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return { ok: true };
}
export async function logout() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
}
