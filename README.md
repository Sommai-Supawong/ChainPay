# ChainPay

A production-oriented, non-custodial payment application for **Ethereum Sepolia**. Pay with blockchain, without the complexity.

Built in the existing Next.js 16 App Router / TypeScript repository. Application identity comes from Firebase Google sign-in; wallet identity comes from a signed MetaMask challenge; Neon stores application records; Ethereum is authoritative for settlement.

## Implemented

- Google sign-in, secure server session, internal UUID account and profile settings.
- Verified MetaMask wallets, primary-wallet management, Sepolia balance and network switching.
- Send, review with fee estimate, contract submission, pending persistence, server verification and receipts.
- Database-backed requests, drafts, publishing, cancellation/expiration, anonymous public payment pages and QR links.
- Persistent activity with status/direction/search filters, contacts and dashboard totals.
- Responsive dark FinTech UI, accessible confirmation dialogs, loading/empty/error states and reduced motion.
- Real PostgreSQL migration/service tests and isolated EVM contract tests; desktop/mobile Playwright checks.

**Status:** implementation and local checks are available; connected Firebase/Neon/Sepolia acceptance and deployment require your service configuration. This is testnet software, not an audited mainnet payment service. See [known limits](docs/SECURITY.md).

## Local setup

Use Node.js 24 and npm. On Windows PowerShell, use `npm.cmd` / `npx.cmd` if script execution policy blocks `npm.ps1`.

```sh
npm ci
cp .env.example .env.local
# Fill in your configuration; never commit .env.local.
npm run db:migrate
npm run dev
```

PowerShell copy equivalent: `Copy-Item .env.example .env.local`.

Without credentials, landing/login and static analysis/build work. Data operations return an explicit configuration error. There is no fake auth, balance, database, or payment-success fallback.

## Firebase setup

1. Create a Firebase project and register a Web app.
2. Enable Authentication → Sign-in method → Google.
3. Add `localhost` and your deployment hostname to authorized domains.
4. Set the Web app's API key, auth domain, project ID and app ID in the matching `NEXT_PUBLIC_FIREBASE_*` variables.
5. Create a service account for Admin authentication verification and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` on the server. Escaped `\n` in the PEM key is normalized automatically.
6. Set `NEXT_PUBLIC_APP_URL` to the exact origin used by the browser. Origin checks protect all mutations. Keep Firebase client/Admin project IDs aligned.

Login requires a fresh verified Google identity. Firebase Admin verifies it and creates a five-day HttpOnly session. Domain records refer to an internal user UUID, not Firebase UID. See [architecture](docs/ARCHITECTURE.md).

## Neon / Drizzle setup

For a new installation, create a Neon PostgreSQL database. For the existing deployment, keep the current database and apply only the new versioned migration. Set `DATABASE_URL` to a pooled URL, and `DATABASE_URL_UNPOOLED` to the direct migration URL. Both remain server-only.

```sh
npm run db:generate  # only after schema changes; review the SQL
npm run db:migrate  # apply versioned migrations to the configured database
```

The committed migration defines users, wallets, wallet challenges, requests, payment intents, transactions, transaction metadata, contacts, audit logs and shared rate limits. See [database operations](docs/DATABASE.md) for roles, constraints, retention and recovery.

## MetaMask / Sepolia / contract

Install MetaMask or use its mobile browser, enable test networks, choose Ethereum Sepolia, and fund a test-only wallet with test ETH. Sign in to ChainPay, connect and verify your wallet, then create a request or send a payment. Anonymous payers need only MetaMask to pay an active public link.

Run `npm run contract:compile`, then follow the [ChainPay V2 Remix deployment and cutover guide](docs/SMART_CONTRACT_V2_DEPLOYMENT.md). V2 is the only contract for new payments. V1 stays available internally for historical verification and pre-upgrade pending transactions. The guide covers the additive migration on the existing Neon database, the server-only V1 address, Vercel variables and mandatory redeploy. No deployment or user private key is saved in this repository.

The server verifies transaction chain, sender, contract, value, calldata, receipt, block and event before confirming. Browser success is never authoritative. Two confirmations are required.

## Commands

| Command                           | Purpose                                                         |
| --------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                     | Local Next.js development                                       |
| `npm run lint`                    | ESLint including Next/React rules                               |
| `npm run typecheck`               | Generate Next route types and check strict TypeScript           |
| `npm test`                        | Validation, auth, database service and EVM contract tests       |
| `npm run contract:compile`        | Compile Solidity into ignored artifacts                         |
| `npm run build`                   | Production build; no credentials required at build time         |
| `npm start`                       | Serve production output                                         |
| `npx playwright install chromium` | Install browser for E2E tests                                   |
| `npm run test:e2e`                | Desktop and mobile tests against production server on port 3100 |
| `npm run format`                  | Format application/test/documentation source                    |

Tests use embedded PostgreSQL and an isolated Ethereum VM. No real credentials or funds are involved. E2E public request/receipt fixtures are intercepted only in test code, never in production. Real Google/MetaMask interactions, deployed contract receipts and Neon connections still need the [manual acceptance checklist](docs/MANUAL_TESTS.md).

## Project map

```text
src/app/                 Marketing, auth, dashboard, public requests, receipts, API
src/components/          Reusable UI and interactive feature components
src/features/            Server-side auth, wallet, payment, request, contact services
src/lib/                 Auth, DB, blockchain, validation, HTTP and utilities
src/db/schema.ts         Typed PostgreSQL schema
contracts/ChainPay.sol    Legacy V1 settlement contract
contracts/ChainPayV2.sol  Active non-custodial settlement contract
db/migrations/           Versioned SQL + Drizzle snapshots
tests/                   Unit, integration, isolated EVM and Playwright tests
scripts/                 Contract compiler
docs/                    Architecture, database, design, security, deployment/testing
```

UI uses Tailwind, shadcn-compatible Radix primitives, Lucide, Motion, Sonner, React Hook Form and Zod. Web3 uses wagmi, viem and TanStack Query. QR uses qrcode.react.

## Vercel deployment

1. Import this repository into Vercel as a Next.js project; select Node.js 24.
2. Configure all `.env.example` values for the intended environment. Browser values are embedded during build, so redeploy after changing them.
3. Authorize your production hostname in Firebase. Set the exact HTTPS origin in `NEXT_PUBLIC_APP_URL`.
4. Apply migrations to the target Neon database with a migration role. Configure a separate least-privileged runtime database role.
5. Deploy/verify the Sepolia contract and configure its address and RPC.
6. Deploy the app and complete the manual acceptance checklist on the production origin, including anonymous payment, revoked login, signature rejection, and mobile UX.
7. Monitor server errors and old pending payments; schedule rate-limit cleanup and establish database recovery procedures.

There is no Render/Express backend. Next.js Route Handlers own the server boundary.

## Limits and roadmap

- Sepolia ETH only; no mainnet, tokens, fiat or custody.
- Off-chain invoice cancellation cannot revoke already signed blockchain transactions. Racing/late payments remain recorded independently with audit entries and may require manual reconciliation/refund.
- Confirmation is receipt-driven polling; no continuous indexer, deep-reorg monitoring, dropped/replaced transaction automation or webhooks yet.
- Recovery is current-tab sessionStorage until server persistence. Losing the tab before saving may require support using the on-chain hash.
- Overview and activity cover the latest 500 records; pagination and full-ledger aggregates are future work.
- Wallet ownership is EOA-based. Soft-removed addresses cannot transfer to another ChainPay account.
- Camera scanning uses BarcodeDetector when available, with native-camera/pasted-link fallback.
- Merchant account type is a profile preference; merchant teams, analytics and roles are not implemented.

Next: connected staging acceptance, scheduled reconciliation/indexing, stronger on-chain invoice enforcement, pagination, observability, then audited expansion toward stablecoins, exports and merchant APIs.

See [implementation report](docs/IMPLEMENTATION_REPORT.md), [security](docs/SECURITY.md), and [design](docs/DESIGN.md).
