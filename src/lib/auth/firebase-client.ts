"use client";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  inMemoryPersistence,
  setPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
export const firebaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
export async function googleSignIn() {
  if (!firebaseConfigured())
    throw new Error(
      "Google sign-in is not configured yet. Please contact the operator.",
    );
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  try {
    return await result.user.getIdToken(true);
  } finally {
    await signOut(auth);
  }
}
