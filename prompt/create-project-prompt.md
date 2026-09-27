# MASTER PROMPT — BUILD CHAINPAY AS A PRODUCTION-STYLE FULL-STACK WEB3 APPLICATION

You are the lead full-stack/Web3 engineer responsible for building the **ChainPay** project.

Your first and most important source of truth is:

```text
./document.md
```

The goal is to turn this repository into a complete, coherent, production-oriented ChainPay web application.

Do not treat this as a simple school blockchain demo.

ChainPay must be implemented as a real full-stack Web3/FinTech product with proper application identity, wallet identity, database persistence, blockchain settlement, server-side verification, security boundaries, responsive UX, and maintainable architecture.

---

# 1. FIRST TASK — UNDERSTAND THE PROJECT BEFORE WRITING CODE

Before modifying anything:

1. Read `document.md` completely from beginning to end.
2. Do not skim only the Tech Stack section.
3. Understand:
   - Product vision
   - Product principles
   - Target users
   - MVP scope
   - Non-goals
   - Architecture
   - Authentication model
   - Identity model
   - Wallet ownership verification
   - Database strategy
   - Database schema
   - API design
   - Payment transaction lifecycle
   - Smart contract strategy
   - Payment requests
   - Public payment links
   - QR payments
   - Activity/history
   - Receipt flow
   - Security requirements
   - UI/UX direction
   - Folder structure
   - Environment variables
   - Testing strategy
   - Deployment architecture
   - Development roadmap
   - Definition of Done

4. Inspect the entire existing repository.

Check at minimum:

```text
package.json
app/
pages/
src/
components/
lib/
hooks/
contracts/
public/
styles/
docs/
.env*
README*
tsconfig*
tailwind*
next.config*
eslint*
drizzle*
```

Also search the repository for existing usage of:

```text
Supabase
MUI
Emotion
ethers
web3-react
Firebase
Drizzle
Neon
wagmi
viem
MetaMask
Solidity
```

5. Determine what already works and what needs to be:
   - retained
   - refactored
   - migrated
   - removed
   - rebuilt

Do NOT blindly delete working code.

Preserve useful existing functionality while migrating it toward the architecture defined in `document.md`.

---

# 2. SOURCE-OF-TRUTH RULE

`document.md` is the authoritative product specification.

If existing project code conflicts with `document.md`:

```text
document.md wins
```

Do not silently replace requirements with your own preferred architecture.

Do not simplify core requirements merely to make implementation easier.

If two requirements inside `document.md` genuinely conflict:

1. choose the interpretation that best supports the production MVP,
2. favor security and data integrity,
3. document the decision in the final implementation report.

Do not modify `document.md` unless absolutely necessary.

---

# 3. TARGET ARCHITECTURE

The intended MVP architecture is:

```text
                     User / Browser
                           │
                           ▼
                ┌─────────────────────┐
                │       Vercel        │
                │                     │
                │ Next.js 16          │
                │ React               │
                │ TypeScript          │
                │ Tailwind CSS        │
                │ shadcn/ui           │
                │ Motion              │
                └─────────┬───────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
 Firebase Auth     Next.js Server       MetaMask
 Google Login      Route Handlers       wagmi / viem
 Firebase Admin    Server Actions            │
                          │                  │
                          ▼                  ▼
                  Neon PostgreSQL      Ethereum Sepolia
                    Drizzle ORM               │
                                              ▼
                                        ChainPay.sol
```

The MVP intentionally does NOT use a separate Render backend.

Do not introduce:

```text
Render
Express backend
FastAPI backend
Supabase
```

unless an actual architectural requirement appears that cannot reasonably be handled by the approved Next.js/Vercel architecture.

Do not add services merely to make the architecture look more complex.

---

# 4. REQUIRED TECHNOLOGY STACK

Use the stack specified in `document.md`.

Core:

```text
Next.js 16
App Router
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
Motion / Framer Motion
Sonner
```

Forms:

```text
React Hook Form
Zod
@hookform/resolvers
```

Authentication:

```text
Firebase Authentication
Google Sign-In
Firebase Admin SDK
```

Database:

```text
Neon PostgreSQL
Drizzle ORM
Drizzle migrations
```

Web3:

```text
Ethereum Sepolia
MetaMask
wagmi
viem
TanStack Query
Solidity
```

QR:

```text
qrcode.react
```

Testing:

```text
Unit tests
Integration tests
Playwright E2E where practical
```

Deployment:

```text
Vercel
Firebase Authentication
Neon PostgreSQL
Ethereum Sepolia
```

Only install dependencies that are actually used.

Avoid unnecessary libraries.

---

# 5. APPLICATION IDENTITY VS BLOCKCHAIN IDENTITY

This separation is fundamental.

## Application identity

Firebase Authentication manages login identity.

Example:

```text
Google Account
        ↓
Firebase UID
        ↓
ChainPay internal users.id UUID
```

Firebase UID must be mapped to an internal ChainPay user record stored in Neon.

Do NOT make Firebase UID the primary domain key for every table.

Domain relationships should use:

```text
users.id
```

rather than directly coupling every table to:

```text
firebase_uid
```

The `users` table should contain the Firebase UID mapping.

---

## Blockchain identity

MetaMask/Ethereum represents blockchain identity.

Wallet connection alone does NOT permanently prove wallet ownership.

Implement proper wallet verification:

```text
Authenticated User
        ↓
Connect MetaMask
        ↓
Request server challenge
        ↓
Server creates nonce
        ↓
User signs message
        ↓
Signature sent to server
        ↓
Server recovers signer
        ↓
Validate nonce + domain + address + expiry
        ↓
Mark wallet verified
```

The signing message must not move funds.

Use a SIWE-style verification approach where appropriate.

---

# 6. AUTHENTICATION ARCHITECTURE

Implement Google Sign-In using Firebase Authentication.

Client responsibilities:

```text
Google Sign-In UI
Firebase client authentication
Receive Firebase identity token
```

Server responsibilities:

```text
Verify Firebase identity using Firebase Admin
Establish secure server-side session
Resolve Firebase UID → ChainPay internal user
Authorize protected operations
```

Never trust these values just because the browser sends them:

```text
userId
firebaseUid
email
role
accountType
```

Authorization must derive identity from a verified server-side Firebase session/token.

Use secure cookies where appropriate.

Production cookies should use sensible:

```text
HttpOnly
Secure
SameSite
Expiration
```

settings.

Provide:

```text
Login
Logout
Session validation
Protected dashboard
User bootstrap/profile synchronization
```

---

# 7. DATABASE — NEON + DRIZZLE

Create a proper Neon PostgreSQL data layer using Drizzle ORM.

Implement the schema defined by `document.md`.

Core entities should include at minimum:

```text
users
wallets
wallet_verification_nonces
payment_requests
transactions
transaction_metadata
contacts
```

Include audit log support if specified as appropriate/future-ready.

Use proper:

```text
UUID primary keys
foreign keys
unique constraints
indexes
timestamps
enums or constrained statuses
nullable relationships where required
```

Important uniqueness requirements include concepts such as:

```text
firebase_uid
wallet address + chain_id
tx_hash + chain_id
payment request slug
```

Use migrations.

Create:

```text
db/schema.ts
db/migrations/
drizzle.config.ts
```

or the equivalent folder layout defined by `document.md`.

Use server-only database credentials.

Browser code must NEVER connect directly to Neon using privileged credentials.

---

# 8. DATABASE CONNECTION STRATEGY

Use a Neon-compatible PostgreSQL connection strategy suitable for serverless Vercel execution.

Normal application queries should use an appropriate pooled/serverless-safe connection.

Migration tooling may use a direct/unpooled database connection if required.

Environment variables should clearly distinguish them when necessary.

Never hard-code credentials.

---

# 9. CORE PRODUCT ROUTES

Implement the main routes defined in `document.md`.

At minimum:

```text
/
```

Marketing / landing page.

```text
/login
```

Authentication.

```text
/dashboard
```

Authenticated overview.

```text
/pay
```

Send payment.

```text
/requests
/request/new
/request/[id]
```

Payment request management.

```text
/p/[slug]
```

Public payment page.

```text
/activity
```

Persistent transaction history.

```text
/tx/[hash]
```

Transaction details / receipt.

```text
/wallets
```

Wallet management.

```text
/contacts
```

Saved contacts.

```text
/settings/profile
/settings/security
```

User settings.

Use route groups where they improve maintainability.

---

# 10. DASHBOARD

Build a professional FinTech dashboard.

It should support information such as:

```text
Greeting
Primary wallet
ETH balance
Quick actions
Sent total
Received total
Pending payment requests
Recent activity
```

Quick actions:

```text
Send
Request
Receive
Scan
```

Do not populate production screens with misleading fake blockchain data.

Use meaningful empty states when data does not exist.

Development fixture data is acceptable only if clearly isolated from production behavior.

---

# 11. WALLET MANAGEMENT

Implement:

```text
Connect MetaMask
Detect missing MetaMask
Network detection
Switch to Ethereum Sepolia
Wallet verification
Verified state
Primary wallet
Multiple-wallet-ready data model
Copy address
Explorer link
Remove wallet
```

Handle:

```text
wallet rejection
signature rejection
account switching
network switching
disconnect/reconnect
invalid state
```

Centralize chain configuration.

Do not duplicate network constants across random components.

---

# 12. PAYMENT FLOW

Implement the complete payment lifecycle.

Required flow:

```text
User enters payment
        ↓
Validate input
        ↓
Review Payment
        ↓
Request wallet transaction
        ↓
MetaMask signs
        ↓
Transaction broadcast
        ↓
Receive tx hash
        ↓
Persist transaction = pending
        ↓
Server verifies blockchain transaction
        ↓
Confirmation detected
        ↓
Persist transaction = confirmed
        ↓
Display receipt
```

The review step must clearly show:

```text
Amount
Sender
Receiver
Network
Estimated gas/fee when available
Estimated total
Payment note/title
```

Validation must include:

```text
wallet connected
correct network
valid address
sender != receiver
amount > 0
numeric precision
sufficient ETH
sufficient balance for fee
```

---

# 13. NEVER TRUST CLIENT-REPORTED BLOCKCHAIN SUCCESS

This rule is non-negotiable.

Do NOT implement:

```text
browser says success
→ database confirmed
```

The server must independently verify the transaction against Ethereum.

Verify as appropriate:

```text
transaction exists
correct chain
transaction receipt success
sender
recipient / smart contract
amount
block number
payment identifier
expected smart-contract event
confirmation state
```

Only then:

```text
transaction.status = confirmed
```

There must be no fake success state.

---

# 14. SMART CONTRACT

Implement or refactor:

```text
contracts/ChainPay.sol
```

The contract's job is intentionally small.

Responsibilities:

```text
receive payment
associate payment with payment ID
forward ETH to merchant
emit verifiable event
```

Follow the contract design described in `document.md`.

Do not store personal information on-chain.

Never store:

```text
email
name
profile
private note
customer information
sensitive personal data
```

on Ethereum.

Keep the smart contract simple and auditable.

Include contract deployment/configuration documentation for Sepolia.

Do not hard-code private keys.

---

# 15. PAYMENT REQUEST SYSTEM

Implement database-backed payment requests.

A request should support relevant fields such as:

```text
title
description
amount
asset
receiver wallet
chain
slug
status
expiration
created_at
paid_at
```

Statuses should follow the specification, such as:

```text
draft
active
pending
paid
expired
cancelled
```

Support:

```text
Create
View
Share
Cancel
Expire
Pay
Track status
```

---

# 16. PUBLIC PAYMENT LINKS

Generate short public payment URLs:

```text
/p/[slug]
```

A payer should NOT need a ChainPay account just to pay a valid public payment request.

Expected public flow:

```text
Open payment link
        ↓
See merchant/request
        ↓
See amount
        ↓
Connect MetaMask
        ↓
Review payment
        ↓
Pay
        ↓
Blockchain verification
        ↓
Receipt
```

Protect against:

```text
expired request
cancelled request
already-paid request
invalid slug
wrong network
wrong amount
```

---

# 17. QR PAYMENT

Generate QR codes using:

```text
qrcode.react
```

Encode the public payment-request URL rather than exposing unnecessary raw payment internals.

Example concept:

```text
https://chainpay.app/p/CP-XXXXXX
```

QR payment must work responsively on mobile.

---

# 18. ACTIVITY / TRANSACTION HISTORY

History must come from Neon/PostgreSQL.

Do NOT use `localStorage` as the authoritative history source.

Implement:

```text
All
Sent
Received
Pending
Confirmed
Failed
```

Support useful search when practical:

```text
transaction hash
wallet address
payment title
contact name
```

Persistent history must be available across devices after sign-in.

---

# 19. RECEIPT / TRANSACTION DETAIL

Implement:

```text
/tx/[hash]
```

Show human-readable transaction information:

```text
status
amount
asset
payment title
sender
receiver
network
block
transaction hash
confirmation date/time
```

Include:

```text
Copy transaction hash
View on block explorer
```

Receipt information must be backed by actual persisted/on-chain information.

---

# 20. CONTACTS

Implement saved contacts according to the specification.

Typical fields:

```text
name
wallet address
chain
label
timestamps
```

Use contacts to reduce repeated manual entry of wallet addresses.

Always validate wallet addresses.

---

# 21. API / SERVER DESIGN

Implement clean Next.js Route Handlers / Server Actions.

Follow the API model from `document.md`.

Conceptual endpoints include:

```text
POST   /api/auth/session
DELETE /api/auth/session

POST   /api/wallets/challenge
POST   /api/wallets/verify

GET    /api/wallets
POST   /api/wallets
DELETE /api/wallets/[id]

GET    /api/payment-requests
POST   /api/payment-requests
GET    /api/payment-requests/[id]
PATCH  /api/payment-requests/[id]

POST   /api/transactions
GET    /api/transactions
GET    /api/transactions/[hash]
POST   /api/transactions/[hash]/verify

GET    /api/contacts
POST   /api/contacts
PATCH  /api/contacts/[id]
DELETE /api/contacts/[id]
```

The exact implementation may use route handlers or server actions where each is appropriate.

Do not expose private operations without authorization.

---

# 22. VALIDATION

Use Zod.

Validation must exist on the server even when client validation also exists.

Validate at minimum:

```text
API input
URL params
wallet addresses
amount
payment request
contact
profile
wallet challenge
transaction hashes
status transitions
```

Never trust browser input.

Use React Hook Form + Zod for user-facing forms where suitable.

---

# 23. SECURITY REQUIREMENTS

Treat security as a first-class feature.

Implement or prepare for:

```text
Firebase server-side verification
secure session handling
protected routes
server-side authorization
wallet challenge nonce
nonce expiry
single-use nonce
wallet signature verification
network verification
transaction verification
input validation
ownership checks
database constraints
safe error handling
```

Never expose:

```text
Firebase Admin private key
database credentials
private wallet keys
seed phrases
OAuth/admin credentials
private RPC credentials
server secrets
```

Never store a user's:

```text
private key
seed phrase
```

ChainPay is non-custodial.

---

# 24. ENVIRONMENT VARIABLES

Create/update:

```text
.env.example
```

Include every required variable but no real secret.

Include categories for:

```text
Application URL

Firebase Client
Firebase Admin

Neon PostgreSQL

Ethereum chain ID
Ethereum RPC
ChainPay contract address
```

Use:

```text
NEXT_PUBLIC_*
```

only for values intentionally exposed to the browser.

Server-only secrets must NOT use public prefixes.

Handle Firebase multiline private keys correctly.

Do not commit:

```text
.env
.env.local
actual credentials
private keys
```

---

# 25. UI / UX DIRECTION

Follow `document.md`.

The visual direction is:

```text
Modern FinTech
+
Soft UI
+
Liquid Glass
+
Glassmorphism
+
Subtle Motion
```

The interface should feel:

```text
premium
calm
trustworthy
distinctive
minimal
professional
responsive
```

Avoid:

```text
crypto casino design
aggressive neon
excessive gradients
excessive blur
constant animation
generic dashboard-template appearance
```

Use the ChainPay design tokens from the specification.

Build reusable components.

Examples:

```text
GlassCard
PageHeader
StatusBadge
WalletAddress
AmountDisplay
EmptyState
LoadingState
ConfirmDialog
TransactionRow
PaymentRequestCard
```

Use subtle motion for interaction feedback.

Respect:

```text
prefers-reduced-motion
```

---

# 26. RESPONSIVE DESIGN

The complete MVP must work on:

```text
desktop
laptop
tablet
mobile
```

Prioritize mobile usability for:

```text
login
wallet connection
payment
review
public payment page
QR
activity
receipt
```

No horizontal overflow.

Wallet addresses must not break layouts.

Use comfortable touch targets.

Use responsive dialogs/sheets appropriately.

---

# 27. LOADING / EMPTY / ERROR STATES

Do not leave blank pages during async operations.

Provide states such as:

```text
Signing in...
Connecting wallet...
Verifying wallet...
Loading balance...
Preparing transaction...
Waiting for MetaMask...
Transaction submitted...
Confirming payment...
Verifying on Ethereum...
Creating payment request...
Loading activity...
```

Use:

```text
skeletons
inline progress
disabled buttons
toasts
clear error messages
```

Provide polished empty states for:

```text
activity
requests
contacts
wallets
```

Do not expose raw stack traces to normal users.

---

# 28. PROJECT STRUCTURE

Follow the feature-oriented structure from `document.md`.

Prefer a structure similar to:

```text
chainpay/
│
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── p/
│   ├── tx/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── auth/
│   ├── wallet/
│   ├── payment/
│   ├── request/
│   └── activity/
│
├── features/
│   ├── auth/
│   ├── wallet/
│   ├── payment/
│   ├── payment-request/
│   ├── transaction/
│   ├── contact/
│   └── profile/
│
├── lib/
│   ├── auth/
│   ├── firebase/
│   ├── db/
│   ├── blockchain/
│   ├── validation/
│   └── utils/
│
├── db/
│   ├── schema.ts
│   └── migrations/
│
├── contracts/
│   └── ChainPay.sol
│
├── hooks/
├── types/
├── public/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DESIGN.md
│   ├── SECURITY.md
│   └── SMART_CONTRACT.md
│
├── document.md
├── README.md
├── .env.example
└── package.json
```

Adapt only where the existing repository structure makes another organization materially better.

Avoid giant page components.

Extract business logic into appropriate feature/lib modules.

---

# 29. CODE QUALITY

Write production-oriented TypeScript.

Avoid:

```text
any
duplicated logic
giant components
hard-coded chain configuration
hard-coded addresses
hard-coded secrets
business logic inside random UI components
unhandled promises
console.log spam
dead imports
unused dependencies
```

Centralize:

```text
chain config
address formatting
currency formatting
transaction statuses
validation
Firebase admin initialization
database initialization
authorization helpers
blockchain verification
error mapping
```

Use clear naming.

Prefer small cohesive modules.

---

# 30. TESTING

Add meaningful tests.

Unit tests should cover important pure logic such as:

```text
address validation
amount validation
amount parsing
formatters
status mapping
payment/request validation
```

Integration tests should cover important server logic when practical:

```text
authorization
wallet verification
payment request creation
transaction persistence
ownership boundaries
```

Use Playwright for major browser flows where practical:

```text
login shell
dashboard navigation
create request
open public request
activity
receipt
```

Wallet automation may require a specialized strategy; document any flow that must remain manual.

---

# 31. MANUAL WEB3 TEST CHECKLIST

Document how to manually verify:

Wallet:

```text
MetaMask installed
MetaMask missing
connect
reject connect
switch account
wrong network
network switch
verify wallet
reject signature
set primary wallet
```

Payment:

```text
valid payment
invalid address
sender = receiver
zero amount
insufficient balance
reject transaction
successful Sepolia transaction
failed transaction
receipt
```

Request:

```text
create
share
anonymous open
QR
expire
cancel
pay
```

---

# 32. DOCUMENTATION

Create or update:

```text
README.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/DESIGN.md
docs/SECURITY.md
docs/SMART_CONTRACT.md
.env.example
```

README must explain:

```text
What ChainPay is
Features
Architecture
Tech stack
Folder structure
Local installation
Environment setup
Firebase setup
Neon setup
Drizzle migrations
MetaMask setup
Sepolia setup
Smart contract deployment
Development commands
Testing
Production build
Deployment
Security model
Known limitations
Future roadmap
```

Use useful diagrams where appropriate.

README must match the actual implementation.

Do not document features that do not exist.

---

# 33. IMPLEMENTATION ORDER

Follow this general order unless the existing repository requires a safer migration sequence.

## Phase 1 — Repository Foundation

```text
1. Inspect existing project.
2. Create a safe Git checkpoint if Git is available.
3. Ensure Next.js 16 + App Router.
4. Ensure TypeScript.
5. Configure Tailwind.
6. Configure shadcn/ui.
7. Establish design tokens.
8. Remove obsolete UI dependencies only after their usage is migrated.
```

## Phase 2 — Database

```text
9. Configure Neon PostgreSQL.
10. Configure Drizzle.
11. Create schema.
12. Generate/apply migrations.
13. Add database utilities.
```

## Phase 3 — Authentication

```text
14. Configure Firebase client.
15. Configure Google Sign-In.
16. Configure Firebase Admin.
17. Implement server session verification.
18. Implement protected routes.
19. Implement users.firebase_uid → users.id mapping.
```

## Phase 4 — Wallet Identity

```text
20. Configure wagmi + viem.
21. Configure Sepolia.
22. Implement MetaMask connection.
23. Implement wallet challenge endpoint.
24. Implement signature verification.
25. Persist verified wallets.
26. Support primary wallet.
```

## Phase 5 — Payment Core

```text
27. Build payment form.
28. Add Zod validation.
29. Build review step.
30. Integrate ChainPay.sol.
31. Submit transaction.
32. Persist pending transaction.
33. Verify transaction server-side.
34. Persist confirmed/failed status.
35. Build receipt.
```

## Phase 6 — Payment Requests

```text
36. Create payment requests.
37. Generate public slug.
38. Build public payment page.
39. Add QR.
40. Handle expiration/cancellation.
41. Link payment to request.
```

## Phase 7 — Activity

```text
42. Build persistent history.
43. Add filters.
44. Add search.
45. Build transaction detail.
```

## Phase 8 — Additional MVP Product Features

```text
46. Wallet management.
47. Contacts.
48. Profile/settings.
49. Dashboard summaries.
```

## Phase 9 — Product Polish

```text
50. Responsive design.
51. Mobile UX.
52. Loading states.
53. Empty states.
54. Error boundaries.
55. Toasts.
56. Accessibility.
57. Motion polish.
```

## Phase 10 — Quality

```text
58. Unit tests.
59. Integration tests.
60. Playwright where practical.
61. Security review.
62. Remove dead code.
63. Remove unused dependencies.
64. Update documentation.
```

---

# 34. QUALITY GATES

Before declaring the project complete, run the appropriate project commands.

At minimum ensure equivalents of:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If `typecheck` or `test` scripts do not exist, add sensible scripts when appropriate.

Fix application-caused:

```text
TypeScript errors
lint errors
build errors
hydration errors
runtime errors
obvious console errors
broken imports
```

Do not suppress errors merely to get a green build.

Do not disable TypeScript or ESLint globally.

Do not use widespread:

```text
// @ts-ignore
eslint-disable
any
```

as a workaround.

Fix root causes.

---

# 35. EXTERNAL CREDENTIALS / MANUAL SETUP

You will probably not have real credentials for:

```text
Firebase
Neon
Ethereum RPC
deployed smart contract
```

Do NOT invent credentials.

Instead:

1. implement the integration correctly,
2. create `.env.example`,
3. make initialization safe and understandable,
4. document exact manual setup steps,
5. clearly list which values the developer must obtain.

Do not commit placeholders that look like real secrets.

Where possible, ensure the project can still be statically analyzed and built without accidentally executing privileged initialization at build time.

---

# 36. EXISTING PROJECT MIGRATION RULE

If the repository already contains a ChainPay implementation:

Do NOT create a second nested application such as:

```text
chainpay/chainpay/
```

unless the repository genuinely requires a monorepo.

Work in the existing project root.

Do not destroy existing useful files.

Refactor incrementally.

If legacy code uses:

```text
MUI
Emotion
ethers.js
web3-react
Supabase
```

migrate it carefully.

Target state should follow `document.md`.

Remove old dependencies only after nothing uses them.

---

# 37. GIT SAFETY

Before destructive restructuring, inspect Git status.

Do not overwrite unrelated user work.

Never delete:

```text
document.md
user assets
smart contracts
existing working code
configuration
```

without first understanding why they exist.

If Git is available, use logical checkpoints/commits if appropriate.

Do not rewrite Git history.

---

# 38. PRODUCTION PRINCIPLES

Keep these principles throughout the implementation:

```text
Blockchain is authoritative for settlement.

Neon is authoritative for application metadata.

Firebase is authoritative for application authentication identity.

MetaMask is the user's blockchain signing interface.

Next.js server code is responsible for authorization and application logic.

The browser is never trusted as the authority for payment confirmation.
```

Most importantly:

```text
ChainPay should be built as a real payment product first
and a Web3 demo second.
```

---

# 39. DO NOT DO THESE

Do NOT:

```text
create only a static UI prototype
fake blockchain confirmations
store transaction history only in localStorage
store seed phrases
store private keys
trust browser-reported payment success
expose Firebase Admin credentials
expose Neon credentials
hard-code wallet private keys
hard-code secrets
skip server-side authorization
make every page a Client Component
use random architecture inconsistent with document.md
add Render without a real need
add Supabase when the specification uses Firebase + Neon
add unnecessary microservices
replace working code just for stylistic reasons
leave TODO placeholders for core MVP behavior when they can be implemented now
```

---

# 40. WORKING STYLE

Work autonomously.

Do not stop after generating a plan.

After understanding the repository, continue directly into implementation.

Do not ask the user to approve every normal engineering decision.

Only stop for user input when an unavoidable external value or business decision cannot be inferred, such as a real Firebase credential.

Even when credentials are missing, continue implementing everything that does not require the real secret.

When something cannot be executed because external credentials are unavailable:

```text
implement the code
document the required setup
continue with the rest of the project
```

Do not leave the entire project unfinished just because one external integration cannot be authenticated.

---

# 41. FINAL COMPLETION CHECKLIST

Before finishing, verify against `document.md` again.

Check every major section.

The production MVP should ultimately support:

```text
Google authentication with Firebase
server-side Firebase identity verification
internal ChainPay user persisted in Neon
protected dashboard
MetaMask connection
wallet ownership verification
primary wallet
Sepolia network handling
send payment
payment review
ChainPay.sol payment flow
pending transaction persistence
server-side blockchain verification
confirmed transaction persistence
payment requests
public payment links
anonymous payer flow
QR payment
transaction history
transaction detail
receipt
wallet management
contacts
responsive interface
loading states
empty states
error handling
security boundaries
tests
documentation
production build
```

There must be:

```text
no fake success states
no private key storage
no seed phrase storage
no secrets in client bundle
no browser-authoritative transaction confirmation
```

---

# 42. FINAL REPORT

When implementation is complete, provide a concise but detailed engineering report containing:

## A. Project status

```text
Completed
Partially completed
Requires external setup
```

## B. Architecture implemented

Explain:

```text
Next.js
Firebase
Neon
Drizzle
wagmi / viem
Ethereum
ChainPay.sol
```

## C. Major files created or changed

List important paths.

## D. Database

List:

```text
tables
constraints
migrations
relationships
```

## E. Authentication

Explain:

```text
Google login
Firebase session
server verification
internal user mapping
```

## F. Web3

Explain:

```text
wallet connection
wallet ownership verification
Sepolia
payment flow
server verification
contract
```

## G. Commands executed

Report results of:

```text
lint
typecheck
tests
build
```

## H. Environment variables still required

List variable names only.

Never print actual secrets.

## I. Manual setup remaining

For example:

```text
Create Firebase project
Enable Google provider
Configure authorized domain
Create Neon database
Set environment variables
Run migrations
Deploy ChainPay.sol to Sepolia
Set contract address
Configure Vercel environment
```

## J. Known limitations

Be explicit.

Do not claim a feature works if it was not actually implemented or tested.

---

# EXECUTION START

Start now.

Your immediate sequence is:

```text
1. Read ./document.md completely.
2. Inspect the full repository.
3. Inspect package.json and current dependencies.
4. Inspect Git status.
5. Compare current implementation against document.md.
6. Create an internal implementation plan.
7. Begin implementing the project immediately.
8. Work through the MVP in dependency order.
9. Continuously run validation/build checks.
10. Re-read Definition of Done before finishing.
11. Produce the final engineering report.
```

Do not stop after analysis.

Build the project.