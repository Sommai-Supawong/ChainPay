import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { requireValue } from "@/lib/errors";
export function adminAuth() {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: requireValue(
          process.env.FIREBASE_PROJECT_ID,
          "Firebase project",
        ),
        clientEmail: requireValue(
          process.env.FIREBASE_CLIENT_EMAIL,
          "Firebase administrator",
        ),
        privateKey: requireValue(
          process.env.FIREBASE_PRIVATE_KEY,
          "Firebase credentials",
        ).replace(/\\n/g, "\n"),
      }),
    });
  return getAuth(app);
}
