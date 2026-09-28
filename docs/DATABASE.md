# Database

Schema: `src/db/schema.ts`. Versioned SQL and Drizzle snapshots: `db/migrations/`.

| Table                      | Purpose and key constraints                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| users                      | Internal UUID; unique Firebase UID and email; personal/merchant enum                                                     |
| wallets                    | User FK; unique normalized address + chain; one active primary per user; verified timestamp; soft removal                |
| wallet_verification_nonces | User FK; unique nonce; exact SIWE message, domain, expiry, consumption time                                              |
| payment_requests           | User and wallet FKs; unique unguessable public slug; decimal amount; lifecycle enum                                      |
| payment_intents            | Immutable expected payment; random payment ID and hashed submission capability; optional account and request FKs         |
| transactions               | Optional account/request FKs; unique intent and hash + chain; one confirmed settlement per request; exact decimal values |
| transaction_metadata       | Transaction PK/FK; title and private payer note, kept off-chain                                                          |
| contacts                   | Owner FK; unique owner + normalized wallet + chain                                                                       |
| audit_logs                 | Exceptional settlement reconciliation records, without credentials or capabilities                                       |
| rate_limits                | Atomic shared per-minute counters; hashed keys                                                                           |

Amounts use `NUMERIC(36,18)` and are represented as strings in JavaScript. Wei arithmetic uses bigint. Never aggregate money with floating-point numbers. Dates use timestamptz. User/request/transaction lookup columns have indexes.

Migration `0001_stiff_union_jack.sql` adds nullable `contract_address` and `contract_version` to intents and transactions without dropping existing rows. Existing rows become V1; new rows persist V2 and its address. The V1 address is supplied by the operator through `CHAINPAY_V1_CONTRACT_ADDRESS`, with an optional explicit backfill. See [V2 cutover](SMART_CONTRACT_V2_DEPLOYMENT.md). Do not infer a V1 address from the new public V2 setting.

## Setup and migrations

1. Create a Neon PostgreSQL project and database in the deployment region.
2. Set `DATABASE_URL` to the pooled connection URI. Set `DATABASE_URL_UNPOOLED` to the direct URI for migrations.
3. Run `npm run db:migrate` using a schema-owner role. Review generated SQL before production application.
4. Use a separate runtime role with only SELECT/INSERT/UPDATE/DELETE on ChainPay tables and USAGE on public schema/types. It must not own the schema or have DDL permissions. RLS is not configured; authorization is explicit in every private service query.
5. For schema changes: edit schema, `npm run db:generate`, review SQL, test it on a branch, then migrate.

Migration configuration loads `.env.local` using Next's env loader and prefers the unpooled URL. Generation works with no live credentials. Applying migrations requires real Neon configuration and was not run against a remote database in this implementation.

## Consistency

Wallet linking locks the owner row and nonce, verifies ownership, and consumes the nonce atomically. Primary-wallet changes share the owner lock. Request creation uses the same lock as wallet removal. Request transitions and settlement lock the request. Database uniqueness guards transaction and request replay. Aborted operations roll back.

The tests execute the real migrations and Drizzle feature services against PGlite (embedded PostgreSQL). RPC and Firebase are replaced at their external boundaries. This validates SQL and ownership behavior but does not replace a real Neon connectivity/concurrency smoke test.

## Operations

Schedule cleanup of expired rate-limit buckets (`DELETE FROM rate_limits WHERE reset_at < now()`). Expired wallet challenges may be removed after your audit retention window. Do not delete payment intents referenced by transactions; recovery and forensic checks depend on them. Establish explicit retention for abandoned intents before operating at scale.

Enable and verify Neon recovery/backups for the chosen plan. Test restoring a branch and replaying migrations. Do not move to real-money networks without restore drills, reconciliation monitoring, and a retention policy.
