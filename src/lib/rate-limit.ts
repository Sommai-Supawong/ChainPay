import "server-only";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { rateLimits } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { AppError } from "./errors";

export async function rateLimit(key: string, limit = 30) {
  const digest = createHash("sha256").update(key).digest("hex");
  const bucket = `${digest}:${Math.floor(Date.now() / 60_000)}`;
  const [row] = await withDb((db) =>
    db
      .insert(rateLimits)
      .values({
        key: bucket,
        count: 1,
        resetAt: new Date(Date.now() + 120_000),
      })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning(),
  );
  if (row.count > limit)
    throw new AppError(429, "Too many attempts. Please wait a minute.");
}
export function clientKey(request: Request) {
  // Vercel overwrites this header. Local/other deployments share a safe fallback bucket.
  return process.env.VERCEL
    ? (request.headers.get("x-vercel-forwarded-for") ?? "public")
    : "public";
}
