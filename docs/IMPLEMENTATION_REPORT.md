# ChainPay implementation report

## Product UI polish — September 2026

Implemented the brief in `prompt/redisign-dastboard-login.md`. This section records the current UI work; older sections below describe earlier implementation milestones.

### Pages and components

| Area                       | Result                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Login                      | New responsive two-column/single-column composition, focused Google sign-in card, security reassurance and EN/TH copy     |
| Dashboard                  | Primary wallet identity and balance, compact quick actions, real pending count, four summary cards, dated recent activity |
| Pay / review               | Three-step progress, stronger amount hierarchy, consistent financial inputs, review controls and validation associations  |
| Requests / public request  | Shared Soft UI cards, subtle statuses, coherent request creation, QR/detail and payment controls                          |
| Activity / receipts        | Compact dated transaction rows, mobile filters wrap, receipt title emphasized and technical details disclosed on demand   |
| Wallets / contacts         | Distinct primary wallet, quiet action areas, contact initials and recipient hierarchy                                     |
| Profile / Security / Theme | Icon/title/description navigation, profile summary, consistent surfaces and existing accessible theme previews            |
| Supporting UI              | New PageSkeleton; polished Button, Field, StatusBadge, dialogs, More sheet, empty/loading states via scoped styles        |

### System, themes, mobile, accessibility, motion

- Added `src/app/product.css`, scoped to `.product-ui`, with semantic Dark/Light surface, text, border, glass, status, radius and shadow tokens. Dark uses layered navy/near-black; Light uses off-white canvas, white surfaces and stronger blue actions. Primary wallet/Login/navigation/dialogs receive selective depth; ordinary forms/lists remain quiet.
- Desktop frame uses a 248px sidebar and bounded content. Mobile has a compact sticky header, safe-area-aware bottom clearance, two-column statistics, four quick actions, stacked Settings navigation, wrapping filters and long financial values/addresses.
- Preserved the existing 3D glass navigation geometry and gesture code. Its resting size, fully rounded pill ends, tap/hold/drag and route synchronization remain intact. The only navigation component change adds the product scope to the portaled More sheet.
- Added visible theme-aware focus treatment, form hint/error associations, `aria-invalid`, sign-in busy state, icon-only copy labels, text statuses, semantic receipt disclosure and screen-reader skeleton status. Existing Radix focus trapping and keyboard dismissal remain.
- Page entrance uses a 12px opacity/translation transition; controls use restrained lift/press feedback. Reduced motion disables product entrance/skeleton motion and transitions. Thai keeps Kanit, adjusted line height and untracked headings.
- Checked token contrast for normal text: Dark primary/secondary text 17.04:1 / 8.49:1 on cards; Light 15.06:1 / 6.06:1. Primary-button text exceeds 6:1 in both palettes. Light muted text was darkened during the second pass to clear 4.5:1 on the elevated surface. This is a token-pair check, not a claim of a complete WCAG audit.

### Files changed

- Application: `src/app/product.css`, root layout import, Login, Dashboard, dashboard loading, Profile/Security, public request and receipt wrappers.
- Components: AppShell, MobileBottomNav (sheet scope only), LoginButton, TransactionRow, ContactManager, PaymentForm, Receipt, PublicRequestView, SettingsTabs, ConfirmDialog, UI primitives, CopyButton and WalletManager.
- Localization/documentation: `src/i18n/th.ts`, `docs/DESIGN.md`, this report.
- No changes to marketing components, `src/app/marketing.css`, payment/auth server services, database schema, API contracts, ABI or signing/verification logic. Production values still come from the existing server queries and wallet hooks.

### Validation and second visual pass

- `npm run lint` and `npm run typecheck`: passed.
- `npm test`: 82 tests passed across 9 files.
- `npm run build`: passed.
- `npm run test:e2e`: 24 desktop/mobile tests passed, including public payments, receipt statuses/recovery, protected redirects, and homepage boundaries.
- Isolated Chromium visual audit used the actual app components with test-only API/auth/wallet adapters. It covered 15 page/stage views × 2 palettes × 2 languages × 8 widths = 480 combinations. Widths: 320, 375, 390, 430, 768, 1024, 1280, 1440px. Screenshots include 390/1440px views; Kanit and the real logo were loaded.
- Second pass aligned mobile page headers, removed redundant transaction-row frames/payment step headings, wrapped Activity filters, added long-value wrapping and improved Light muted contrast. A targeted 64-case Activity/review recheck found no horizontal overflow or browser errors. The earlier full matrix had no document overflow; its clipped filter-button findings were corrected in that follow-up.
- Twenty additional isolated checks passed: empty Dashboard/Activity/Wallets/Contacts/Requests in both themes; instant theme switching; More-sheet focus trapping and Escape; confirmation-dialog viewport bounds; form error associations; expanded receipt details. Audit script, screenshots and JSON evidence are local generated artifacts under `artifacts/product-audit.mjs` and `artifacts/product-polish/`.

### Remaining acceptance

No known layout issue remains in the audited viewport/state matrix. The authenticated visual audit used fixtures and does not establish real Google/MetaMask/Neon/RPC acceptance. Final connected acceptance should still cover Google sign-in, real wallet approval/rejection, saved account appearance across devices, and native iOS/Android keyboard/safe-area behavior. Public pages remain Dark in production; their Light styling was exercised only as a shared-component compatibility check. No production data was fabricated and no payment was signed during this UI work.

## Appearance update

The authenticated application now offers Dark (default) and Light at `/settings/theme`. The selected value is stored per user in `users.theme_preference`, updated through an authorized Route Handler, and supplied to the app shell during server rendering. Shared controls, cards, navigation, mobile sheets, dialogs, and statuses use theme-aware styling. Marketing and public pages retain dark styling. Migration `0002_dazzling_celestials.sql` is additive and defaults existing accounts to Dark; it has been generated locally and must be applied to the target database by an operator before deployment. Connected cross-device acceptance still requires configured Firebase and Neon.

Local validation for this update: lint, typecheck, 82 Vitest tests, production build, and 24 desktop/mobile Playwright tests passed. Automated browser checks cover the marketing theme boundary; a signed-in visual pass of both themes remains part of connected acceptance.

> This report describes the original V1 implementation. ChainPay V2 is now the sole contract for new payments; V1 remains for historical verification. See [V2 deployment and cutover](SMART_CONTRACT_V2_DEPLOYMENT.md) for the current migration and operator steps.

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
