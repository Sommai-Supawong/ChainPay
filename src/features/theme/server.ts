import "server-only";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { withDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import type { Theme } from "@/components/theme/theme-provider";

export async function updateTheme(userId: string, theme: Theme) {
  const [row] = await withDb((db) =>
    db
      .update(users)
      .set({ themePreference: theme, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ theme: users.themePreference }),
  );
  if (!row) throw new AppError(404, "Account not found.");
  return row;
}
