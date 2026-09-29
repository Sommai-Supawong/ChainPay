import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("adds dark appearance to existing users without changing their identity", async () => {
  const pg = new PGlite();
  try {
    for (const file of ["0000_greedy_sunfire.sql", "0001_stiff_union_jack.sql"])
      await pg.exec(readFileSync(`db/migrations/${file}`, "utf8"));
    await pg.exec(
      "INSERT INTO users (firebase_uid, email) VALUES ('existing', 'existing@example.test')",
    );
    await pg.exec(
      readFileSync("db/migrations/0002_dazzling_celestials.sql", "utf8"),
    );
    const result = await pg.query<{
      firebase_uid: string;
      theme_preference: string;
    }>("SELECT firebase_uid, theme_preference FROM users");
    expect(result.rows).toEqual([
      { firebase_uid: "existing", theme_preference: "dark" },
    ]);
  } finally {
    await pg.close();
  }
});
