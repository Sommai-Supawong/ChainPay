# ChainPay implementation report

## A. Status

**Implemented locally; requires external setup and connected acceptance.** The original starter is now a full-stack Sepolia payment application. Production deployment and real Firebase/Neon/Sepolia flows are not claimed as complete because no credentials or deployed contract were supplied.

The authoritative `document.md` and execution prompt were preserved. Existing user work (including the pre-existing deletion of `CLAUDE.md`) was not reverted or committed. Original Git commit `50046ba` remains the starter checkpoint; no history was rewritten.

## B. Architecture

- Next.js 16 App Router with Server Components, protected route group, interactive feature components and Node Route Handlers. Installed Next.js guides were read before implementation.
- Firebase Google client sign-in and Firebase Admin verification establish secure five-day sessions, mapping provider UID to an internal UUID.
- Neon PostgreSQL through Drizzle with pooled serverless connections, interactive transactions and explicit ownership checks.
- wagmi/viem/TanStack Query for MetaMask, network handling, balance, estimation and contract signing.
- Sepolia and `ChainPay.sol` for non-custodial settlement; server checks actual call/receipt/event and two canonical confirmations.
- Tailwind, shadcn-compatible Radix/CVA components, Lucide, Motion, Sonner, React Hook Form/Zod and QR codes.

No separate backend, Supabase, custodial keys, fabricated transaction history or browser-authoritative confirmation was introduced.

## C. Major paths

| Path                                 | Work                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `src/app/`                           | Landing/login, protected account pages, public payment pages, receipts, loading/errors and API dispatcher  |
| `src/components/`                    | UI primitives, navigation, wallet/payment/request/activity/contact/profile workflows                       |
| `src/features/`                      | Auth, nonce verification, wallet management, request lifecycle, settlement and ownership services          |
| `src/lib/`                           | Server-only adapters, API/error/origin/rate-limit helpers, validation, chain config and event verification |
| `src/db/schema.ts`                   | Typed schema and constraints                                                                               |
| `db/migrations/`                     | Generated initial SQL and Drizzle snapshots                                                                |
| `contracts/ChainPay.sol`             | ETH forwarding with event, replay and reentrancy protection                                                |
| `tests/`                             | Pure validation, auth boundary, real PostgreSQL services, EVM execution and browser tests                  |
| `scripts/compile-contract.mjs`       | Reproducible contract compilation                                                                          |
| `.env.example`, `README.md`, `docs/` | Integration setup, deployment, architecture, security, design and manual acceptance                        |

## D. Database

Ten tables: users, wallets, wallet_verification_nonces, payment_requests, payment_intents, transactions, transaction_metadata, contacts, audit_logs and rate_limits. Internal UUID FKs, normalized unique wallet/chain, unique Firebase UID/email, unique slug, unique transaction hash/chain and intent, one active primary wallet, one confirmed settlement per request, amount checks, constrained statuses and lookup indexes are implemented.

Initial migration generated successfully and applied inside embedded PostgreSQL tests. It has **not** been applied to a real Neon database. Runtime and migration credentials are separated. Details: DATABASE.md.

## E. Authentication

Fresh Google tokens are verified server-side, including verified email/provider/authentication time. Identity is derived only from Admin-verified claims. Cookies use HttpOnly, SameSite=Lax, explicit expiration and Secure in production. Sessions check revocation; logout clears this browser's session. All private services scope access by the internal user UUID. All mutations check exact Origin and validated JSON.

## F. Web3 and payment behavior

- MetaMask connection, rejection handling, network switch, real balances, verified wallets and primary/removal controls.
- Five-minute domain/user/address-bound signed challenges, single-use consumption under lock.
- Immutable server payment intent, user review, ETH fee/balance checks, wallet signing, pending persistence and retry/recovery after broadcast.
- Exact server verification before confirmed status; failed receipts recorded; idempotent database transitions and stale-verifier race protection.
- Requests with drafts, publishing, expiration/cancellation, links/QR and anonymous payment.
- Persistent searchable activity, server-backed receipts, explorer/copy actions, saved contacts and profile/security screens.
- Solidity compiled and executed in an isolated EVM; no network contract deployment performed.

## G. Validation results

| Command/check              | Final result                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `npm run lint`             | Passed, no errors/warnings                                                         |
| `npm run typecheck`        | Passed                                                                             |
| `npm test`                 | 60 tests passed in 5 files                                                         |
| `npm run build`            | Passed, all application routes generated                                           |
| `npm run test:e2e`         | 10 passed across desktop and mobile Chromium                                       |
| `npm run db:generate`      | Initial migration generated                                                        |
| `npm run contract:compile` | Solidity 0.8.37 compilation passed                                                 |
| Dependency audit           | Zero reported vulnerabilities after compatible transitive overrides                |
| Visual inspection          | Desktop/mobile landing and login screenshots inspected; overflow assertions passed |

Browser test assertions cover navigation/login shell, protected access, cross-origin rejection, public request without login, invalid identifiers, receipt state and responsive overflow. Request/receipt E2E data is intercepted only in tests. Authenticated dashboard/Google/MetaMask integration still requires connected acceptance. No production testing bypass was added.

Windows required `npm.cmd`; browser tests were run outside the sandbox to allow reliable test-server cleanup. Earlier JSX, source encoding, dependency/native runner and Tailwind source scanning issues were resolved, not suppressed. Dependency overrides patch esbuild under Drizzle tooling, tmp under solc, and UUID under gaxios; all test/build checks passed with them.

## H. Environment values to supply

Names only; see `.env.example`:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
DATABASE_URL
DATABASE_URL_UNPOOLED
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS
ETHEREUM_RPC_URL
```

The network is deliberately fixed to Sepolia chain ID 11155111 in shared code, rather than accepting an environment override that could silently enable an unsupported network.

## I. Manual setup remaining

1. Create Firebase project/Web app, enable Google provider and authorize local/deployment domains.
2. Configure Firebase client/Admin environment values and exact application origin.
3. Create Neon database, configure pooled/direct roles and apply committed migrations.
4. Deploy and verify ChainPay.sol on Sepolia, configure contract address and server RPC.
5. Configure Vercel Node.js 24 and environment values, then deploy.
6. Run `docs/MANUAL_TESTS.md` with two Google accounts and Sepolia wallets, including real payment, failed transfer, request/receipt privacy and recovery.

## J. Decisions and known limitations

The prompt includes contacts/multiple wallets in scope although some specification sections defer them; both are implemented. Additional payment intents and shared rate-limit tables support security and integrity.

Off-chain cancellation/expiration cannot recall a signed ETH transfer. The minimal specified contract cannot enforce unique invoices across different payer intents. Racing/late broadcasts are retained as independent payments with audit entries; only one associated request settles. Manual reconciliation/refund handling remains necessary.

No continuous indexer, replacement/drop detection, deep-reorg revalidation, global logout, smart-contract-wallet ownership or real-money support. Polling reconciles viewed receipts. Loss of unsaved tab recovery data may require operator investigation. Activity/overview cover the latest 500 records, and Merchant is currently a profile classification. Camera scanning has a pasted-link/native-camera fallback. See SECURITY.md for full operational limits.

These external acceptance and operational items remain part of the specification's deployment Definition of Done; the local green checks are not a claim of live production readiness.
