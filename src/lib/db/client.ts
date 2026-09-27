import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/db/schema";
import { requireValue } from "@/lib/errors";

neonConfig.webSocketConstructor = ws;
export type Database = ReturnType<typeof drizzle<typeof schema>>;
export async function withDb<T>(
  work: (db: Database) => Promise<T>,
): Promise<T> {
  const pool = new Pool({
    connectionString: requireValue(process.env.DATABASE_URL, "Database"),
    max: 3,
    connectionTimeoutMillis: 10_000,
  });
  try {
    return await work(drizzle(pool, { schema }));
  } finally {
    await pool.end();
  }
}
