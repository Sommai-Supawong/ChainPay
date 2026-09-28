import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("migrates existing V1 payment rows without losing their history", async () => {
  const pg = new PGlite();
  try {
    await pg.exec(
      readFileSync("db/migrations/0000_greedy_sunfire.sql", "utf8"),
    );
    const intentId = "00000000-0000-4000-8000-000000000111";
    const transactionId = "00000000-0000-4000-8000-000000000222";
    await pg.exec(`
      INSERT INTO payment_intents (id, payment_id, token_hash, from_address, to_address, amount, expires_at)
      VALUES ('${intentId}', 'legacy-payment', 'legacy-token', '0xsender', '0xmerchant', 0.1, now());
      INSERT INTO transactions (id, intent_id, tx_hash, payment_id, chain_id, from_address, to_address, amount)
      VALUES ('${transactionId}', '${intentId}', '0xlegacyhash', 'legacy-payment', 11155111, '0xsender', '0xmerchant', 0.1);
    `);
    await pg.exec(
      readFileSync("db/migrations/0001_stiff_union_jack.sql", "utf8"),
    );
    const intent = await pg.query<{
      contract_version: number;
      contract_address: string | null;
      payment_id: string;
    }>(
      `SELECT contract_version, contract_address, payment_id FROM payment_intents WHERE id = '${intentId}'`,
    );
    const transaction = await pg.query<{
      contract_version: number;
      contract_address: string | null;
      tx_hash: string;
    }>(
      `SELECT contract_version, contract_address, tx_hash FROM transactions WHERE id = '${transactionId}'`,
    );
    expect(intent.rows[0]).toEqual({
      contract_version: 1,
      contract_address: null,
      payment_id: "legacy-payment",
    });
    expect(transaction.rows[0]).toEqual({
      contract_version: 1,
      contract_address: null,
      tx_hash: "0xlegacyhash",
    });
  } finally {
    await pg.close();
  }
});
