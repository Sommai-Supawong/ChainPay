# ChainPay — Production Product Specification

> **V2 implementation update:** `contracts/ChainPayV2.sol` is the active Sepolia settlement contract for all new payments. `contracts/ChainPay.sol` remains the V1 source for historical verification and pre-upgrade pending payments. The additive `0001_stiff_union_jack.sql` migration preserves Neon history; see `docs/SMART_CONTRACT_V2_DEPLOYMENT.md` for Remix deployment and Vercel/Neon cutover. Older references to `ChainPay.sol` below describe the original V1 design.

> **Architecture revision:** Next.js full-stack on Vercel + Firebase Authentication + Neon PostgreSQL + Drizzle ORM + Ethereum. The MVP intentionally does **not** use a separate Render backend; Next.js Route Handlers / Server Actions form the application backend.

> **ChainPay** is a production-oriented Web3 payment platform that makes blockchain payments feel as simple and trustworthy as modern online banking.
>
> **Product promise:** *Pay with blockchain, without the complexity.*

---

## 1. Product Overview

**Project:** ChainPay  
**Category:** Full-stack Web3 / FinTech Payment Platform  
**Initial network:** Ethereum Sepolia Testnet  
**Production direction:** EVM payment platform with persistent accounts, verified wallets, payment requests, transaction history, and merchant-ready UX.

ChainPay is no longer treated as a frontend-only blockchain assignment. It should be developed as a real software product with clear separation between application identity, wallet identity, blockchain settlement, database persistence, server-side verification, and user experience.

### Vision

ChainPay should let users:

- Sign in and keep an account across devices.
- Connect and verify one or more wallets.
- Send blockchain payments.
- Request payments through public links.
- Generate payment QR codes.
- Track transaction history.
- View human-readable receipts.
- Save contacts.
- Manage wallets.
- Verify payments against the blockchain.
- Use the product without needing to understand low-level Web3 concepts.

### Product statement

> **ChainPay is a modern Web3 payment platform that combines blockchain transparency with the simplicity of everyday digital payments.**

---

## 2. Product Principles

ChainPay should feel closer to **Stripe, Wise, Revolut, or a modern banking application** than a developer blockchain console.

Users should think about:

```text
Who am I paying?
How much?
What is the payment for?
Has it been confirmed?
Can I verify it?
```

Users should not be forced to understand:

```text
ABI
RPC
Nonce
Gas Limit
Provider internals
Contract bytecode
Raw contract calls
```

Advanced blockchain details remain available when useful, but they should not dominate the primary flow.

### Core engineering principle

> **Blockchain is the settlement and verification layer. ChainPay is the product experience around it.**

---

## 3. Problem

Blockchain transfers work, but the surrounding payment experience is incomplete for normal users and merchants.

### Key problems

- Wallet addresses are difficult to recognize.
- Sending to the wrong address can be irreversible.
- New users may not understand networks.
- Gas fees are confusing.
- Transaction hashes are hard to interpret.
- Payment requests are often shared manually.
- Wallet applications do not provide rich invoice/payment metadata.
- Merchants need organized payment records rather than raw block explorer history.
- Browser-only history does not synchronize across devices.
- A normal wallet connection does not prove ownership for long-term account linking.
- Frontend-reported transaction success cannot be trusted as authoritative.

### Core problem statement

> **Blockchain transfers value, but it does not automatically provide a complete, human-friendly payment product.**

---

## 4. Target Users

### Individual users
People who want an easier way to send and receive crypto.

Needs:
- Simple payment flow
- Clear fees and status
- History
- Contacts
- Receipts

### Freelancers
People receiving project payments from clients.

Needs:
- Payment links
- QR codes
- Descriptions
- Request status
- Receipts
- Persistent records

### Small merchants
Sellers who want to accept blockchain payments.

Needs:
- Merchant identity
- Payment request management
- Payment verification
- Dashboard
- Revenue/activity overview

### Web3 beginners
Users comfortable with digital payments but not blockchain terminology.

Needs:
- Guided flows
- Network protection
- Human-readable errors
- Simple wallet interaction

---

## 5. Product Goals

### Primary

1. Make blockchain payments easy to understand.
2. Provide a complete payment lifecycle.
3. Persist history in PostgreSQL.
4. Support cross-device access.
5. Verify wallet ownership.
6. Verify blockchain transactions server-side.
7. Support payment requests and public payment links.
8. Support QR payments.
9. Provide receipts and transaction detail.
10. Build a polished, professional fintech interface.
11. Demonstrate production-minded full-stack and Web3 engineering.

### Future

- Multiple wallets
- Merchant mode
- Stablecoins
- Additional EVM networks
- Analytics
- CSV/PDF exports
- Email notifications
- Developer API/webhooks
- Team accounts

---

## 6. Initial Non-Goals

The first production MVP is **not**:

- A centralized exchange
- A custodial wallet
- An NFT marketplace
- A lending protocol
- A trading terminal
- A fiat payment processor
- A multi-chain bridge
- A full accounting product

The first product stays focused on:

> **Payments, requests, identity, verification, receipts, and history.**

---

## 7. Recommended Technology Stack

### Application

- **Next.js 16 App Router**
- **TypeScript**
- **React**
- **Tailwind CSS**
- **shadcn/ui**
- **Motion / Framer Motion**
- **Lucide React**
- **Sonner**

### Forms and validation

- **React Hook Form**
- **Zod**
- **@hookform/resolvers**

### Authentication

- **Firebase Authentication**
- **Google Sign-In / Google OAuth provider**
- **Firebase Admin SDK** for server-side token/session verification

### Database

- **Neon PostgreSQL**
- **Drizzle ORM**
- **@neondatabase/serverless**

### Backend

- **Next.js Route Handlers**
- **Next.js Server Actions where appropriate**
- **Vercel Functions / Fluid Compute runtime**

The MVP does **not** require a separate Express/FastAPI service on Render. A dedicated backend or worker should only be introduced when there is a concrete operational need such as event indexing, queue workers, long-running reconciliation, or heavy asynchronous processing.

### Blockchain

- **Ethereum Sepolia Testnet**
- **MetaMask**
- **wagmi**
- **viem**
- **Solidity**

### QR

- **qrcode.react**

### Testing

- **Vitest** for unit/integration tests where suitable
- **Playwright** for end-to-end browser flows

### Deployment

- **Vercel** — Next.js frontend + server-side application runtime
- **Firebase** — authentication provider
- **Neon** — managed PostgreSQL
- **Ethereum Sepolia** — blockchain settlement/testing

### Source control

- **GitHub or GitLab**

### Migration note

Existing `ethers.js` or `web3-react` code can remain temporarily while refactoring, but the target architecture should prefer `wagmi + viem` for new wallet and EVM integration.

Existing Supabase-specific code should be removed only after Firebase Authentication and Neon persistence are working end-to-end. Do not migrate authentication and database code in one untestable step.

---

## 8. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │                      │
                         │ Next.js UI           │
                         │ Tailwind / shadcn    │
                         │ wagmi / viem         │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌────────────────┐ ┌──────────────────┐
        │ Firebase Auth  │ │ Next.js Server │ │     MetaMask     │
        │ Google Sign-In │ │ API / Actions  │ │ Wallet + Signing │
        └───────┬────────┘ └───────┬────────┘ └─────────┬────────┘
                │                  │                    │
                │                  ▼                    ▼
                │          ┌────────────────┐     ┌───────────────┐
                └─────────▶│ Neon PostgreSQL│     │   Ethereum    │
                           │ Drizzle ORM    │     │    Sepolia    │
                           └────────────────┘     └───────┬───────┘
                                                        │
                                                        ▼
                                                ┌────────────────┐
                                                │  ChainPay.sol  │
                                                └────────────────┘
```

### Runtime responsibility

**Browser** is responsible for:

- User interface
- Firebase client sign-in
- MetaMask connection
- Wallet signatures
- Transaction confirmation UX

**Next.js server on Vercel** is responsible for:

- Verifying Firebase identity/session
- Authorization
- Zod validation
- Database access through Drizzle
- Wallet ownership verification
- Blockchain receipt/event verification
- Protecting server secrets

**Neon PostgreSQL** is responsible for persistent application data.

**Ethereum** is responsible for settlement and authoritative on-chain transaction data.

### Why no Render backend in the MVP

ChainPay does not currently require a dedicated always-on API server. Next.js already provides the server-side boundary needed for authentication, database access, validation, and blockchain verification. Avoiding a separate Render service reduces CORS configuration, duplicate deployment infrastructure, free-tier cold starts, and operational complexity.

A separate worker/backend can be introduced later if ChainPay adds event indexing, background queues, scheduled reconciliation at scale, webhook processing, or other workloads that do not fit request/response serverless execution.

---

## 9. Identity Model

ChainPay separates **application identity** from **blockchain identity**.

### Application identity

Managed by Firebase Authentication, with a corresponding internal ChainPay user record stored in Neon PostgreSQL.

Example:

```text
Firebase UID: xYz123...
ChainPay User ID: 7a8f... (UUID)
Som
som@example.com
```

The Firebase UID identifies the authenticated account at the identity-provider layer. The internal `users.id` UUID is the application/database identity used by ChainPay domain tables.

Used for:

- Session / authenticated identity
- User profile
- Cross-device history
- Preferences
- Merchant information
- Contacts
- Wallet relationships

### Blockchain identity

Managed by MetaMask / Ethereum.

Example:

```text
0x82A...91Fc
```

Used for:

- Payment signing
- Wallet ownership
- On-chain transactions
- Blockchain verification

### Relationship

```text
Firebase User
    │
    ▼
ChainPay User (internal UUID)
    │
    ├── Wallet A
    ├── Wallet B
    └── Wallet C
```

Authentication proves who the application user is. Wallet signature verification separately proves control of a blockchain address.

---

## 10. Authentication

### Primary MVP authentication

**Google Sign-In through Firebase Authentication**

Google represents the user's ChainPay application login identity.

It does **not** replace MetaMask and does not prove ownership of an Ethereum wallet.

### Recommended web session flow

```text
User clicks Continue with Google
      ↓
Firebase client completes Google sign-in
      ↓
Firebase ID token obtained
      ↓
POST /api/auth/session
      ↓
Firebase Admin verifies ID token
      ↓
Server creates secure HttpOnly session cookie
      ↓
Create / update ChainPay user in Neon
      ↓
Authenticated dashboard
```

Private server routes must verify the Firebase session/token server-side. They must not trust a user ID or email supplied by the browser.

Recommended session cookie properties:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax` or stricter where compatible
- Explicit expiration
- Revocation-aware verification for sensitive operations where appropriate

### Public payment rule

A person paying a public payment request should not be forced to create a ChainPay account.

They should be able to:

```text
Open payment link
→ Connect wallet
→ Review
→ Pay
```

### Future authentication

- Email link / passwordless sign-in
- Wallet-only authentication
- SIWE-based login
- MFA for merchant/high-risk operations

---

## 11. Wallet Ownership Verification

A connected wallet should not automatically become permanently linked to a user account.

Use a challenge/signature flow:

```text
Authenticated User
      ↓
Connect MetaMask
      ↓
Request challenge from server
      ↓
Server creates single-use nonce
      ↓
User signs verification message
      ↓
Server verifies signature
      ↓
Wallet becomes Verified
```

### Requirements

- Server-generated nonce
- Expiration time
- Single use
- Expected domain
- Expected address
- Server-side signature verification
- Recovered signer must match the wallet

The verification signature must never move funds.

A SIWE-style message flow should be preferred where appropriate.

---

## 12. Database Strategy

### Database

**Neon PostgreSQL**

Neon provides managed PostgreSQL while allowing the application compute and database lifecycle to remain separate. It is suitable for the Vercel-hosted Next.js architecture and can scale compute down during inactivity and resume when database traffic returns.

### ORM

**Drizzle ORM**

Use a Neon-compatible PostgreSQL driver. Prefer a pooled/serverless-safe connection for normal application traffic and a direct/unpooled connection for schema migrations when required by the migration tooling.

### Data ownership rule

#### Blockchain is authoritative for:

- Transaction existence
- Sender
- Receiver
- Transferred amount
- Receipt status
- Block number
- Contract events

#### PostgreSQL is authoritative for:

- Internal ChainPay user profile
- Firebase UID mapping
- Payment request metadata
- Contacts
- Merchant data
- UI metadata
- Application transaction records
- User settings

The database must never claim that an on-chain payment is confirmed unless the server verifies it.

### Database access rule

Normal browser code must not connect directly to Neon with privileged database credentials.

```text
Browser
  ↓
Authenticated Next.js server route/action
  ↓
Authorization + validation
  ↓
Drizzle ORM
  ↓
Neon PostgreSQL
```

Use least-privileged database credentials and keep database connection strings server-only.

---

## 13. Database Schema

### users

```text
id UUID PK
firebase_uid TEXT UNIQUE NOT NULL
email TEXT UNIQUE NOT NULL
display_name TEXT
avatar_url TEXT
account_type TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

`firebase_uid` links the Firebase Authentication identity to ChainPay's internal user record. Domain tables should reference `users.id`, not the external provider UID.

`account_type`:

```text
personal
merchant
```

### wallets

```text
id UUID PK
user_id UUID FK -> users.id
address TEXT
chain_id INTEGER
label TEXT
is_primary BOOLEAN
verified_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

Recommended uniqueness:

```text
address + chain_id
```

### wallet_verification_nonces

```text
id UUID PK
user_id UUID
wallet_address TEXT
nonce TEXT
expires_at TIMESTAMP
used_at TIMESTAMP
created_at TIMESTAMP
```

### payment_requests

```text
id UUID PK
slug TEXT UNIQUE
user_id UUID FK -> users.id
receiver_wallet_id UUID FK -> wallets.id
title TEXT
description TEXT
amount NUMERIC
asset TEXT
chain_id INTEGER
status TEXT
expires_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
paid_at TIMESTAMP
```

### transactions

```text
id UUID PK
user_id UUID
payment_request_id UUID NULL
tx_hash TEXT
chain_id INTEGER
from_address TEXT
to_address TEXT
amount NUMERIC
asset TEXT
status TEXT
block_number BIGINT NULL
gas_used TEXT NULL
submitted_at TIMESTAMP
confirmed_at TIMESTAMP NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

Recommended uniqueness:

```text
tx_hash + chain_id
```

### transaction_metadata

Optional:

```text
transaction_id UUID
title TEXT
note TEXT
category TEXT
```

### contacts

```text
id UUID PK
user_id UUID FK
name TEXT
wallet_address TEXT
chain_id INTEGER
label TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

### audit_logs

Future:

```text
id UUID PK
user_id UUID NULL
action TEXT
entity_type TEXT
entity_id TEXT
metadata JSONB
created_at TIMESTAMP
```

Never store secrets in audit logs.

---

## 14. Main Routes

### Public / marketing

```text
/
```

### Authentication

```text
/login
/api/auth/session
/api/auth/logout
```

Firebase handles the Google provider flow. ChainPay uses server endpoints to establish and clear the application session cookie.

### Dashboard

```text
/dashboard
```

### Send payment

```text
/pay
```

### Payment requests

```text
/requests
/request/new
/request/[id]
```

### Public payment page

```text
/p/[slug]
```

### Activity

```text
/activity
```

### Transaction detail

```text
/tx/[hash]
```

### Wallets

```text
/wallets
```

### Contacts

```text
/contacts
```

### Settings

```text
/settings/profile
/settings/security
```

---

## 15. Onboarding

Recommended first-time flow:

```text
Landing Page
     ↓
Continue with Google
     ↓
ChainPay account created
     ↓
Dashboard
     ↓
Connect MetaMask
     ↓
Verify wallet signature
     ↓
Set primary wallet
     ↓
Ready to pay
```

A user may explore the dashboard before connecting a wallet, but blockchain actions require a suitable connected wallet.

---

## 16. Dashboard

Route:

```text
/dashboard
```

### Dashboard modules

- Greeting
- Primary wallet
- ETH balance
- Quick actions
- Sent total
- Received total
- Pending requests
- Recent activity

Example:

```text
Good afternoon, Som

Primary Wallet
0x82A...91Fc
0.1824 ETH

Quick Actions
[ Send ] [ Request ] [ Receive ] [ Scan ]

Recent Activity

↑ Sent
Coffee
0.001 ETH
Confirmed

↓ Received
Website Project
0.025 ETH
Confirmed
```

---

## 17. Send Payment

Route:

```text
/pay
```

### Fields

- From wallet
- Recipient
- Amount
- Asset
- Optional note

### Helpful UX

- Recent recipients
- Saved contacts
- Paste address
- Address validation
- Available balance
- Network badge

### Validation

- Correct wallet/account state
- Wallet connected
- Wallet verified for authenticated sending where required
- Correct network
- Valid Ethereum address
- Sender != receiver
- Amount > 0
- Valid numeric precision
- Enough ETH
- Enough ETH for estimated gas

---

## 18. Payment Review

Review must happen before MetaMask transaction signing.

Example:

```text
Review Payment

Amount
0.005 ETH

From
0x82A...91Fc

To
0x73B...52C1

Network
Ethereum Sepolia

Estimated Fee
0.000021 ETH

Estimated Total
0.005021 ETH

Note
Website design

[ Back ]
[ Confirm & Pay ]
```

---

## 19. Payment Transaction Flow

```text
User enters payment
        ↓
Frontend validates
        ↓
Review Payment
        ↓
Wallet transaction requested
        ↓
MetaMask signing
        ↓
Transaction broadcast
        ↓
Transaction hash returned
        ↓
Database record = pending
        ↓
Server verifies blockchain transaction
        ↓
Confirmation detected
        ↓
Database record = confirmed
        ↓
Receipt shown
```

---

## 20. Server-Side Blockchain Verification

The server must not trust:

```json
{
  "status": "confirmed"
}
```

when it comes from the browser.

### Server verification should check

- Transaction exists
- Correct chain
- Receipt success
- Correct sender
- Correct recipient or contract
- Correct value
- Expected payment ID / event if contract is used
- Block number
- Confirmation state

Only after successful verification:

```text
transaction.status = confirmed
```

---

## 21. Smart Contract Strategy

Initial contract:

```text
contracts/ChainPay.sol
```

### Responsibility

- Receive payment
- Associate payment with payment ID
- Forward ETH
- Emit verifiable event

### Suggested interface

```solidity
function pay(
    bytes32 paymentId,
    address payable merchant
) external payable;
```

### Basic validation

```text
msg.value > 0
merchant != address(0)
```

### Suggested event

```solidity
event PaymentCompleted(
    bytes32 indexed paymentId,
    address indexed payer,
    address indexed merchant,
    uint256 amount,
    uint256 timestamp
);
```

### Never store on-chain

- Email
- User name
- Customer name
- Private note
- Profile data
- Sensitive personal data

---

## 22. Payment Requests

Payment Request is a core product feature.

Example:

```text
Title
Website Development

Amount
0.025 ETH

Receiver
Primary Wallet

Description
Final milestone payment

Expires
7 days
```

Requests are stored in PostgreSQL.

### Statuses

```text
draft
active
pending
paid
expired
cancelled
```

---

## 23. Public Payment Links

Each request gets a short public slug.

Example:

```text
https://chainpay.app/p/CP-A8F291
```

Example public page:

```text
Som Studio

Payment Request

Website Development

0.025 ETH

Ethereum

[ Pay with MetaMask ]
```

Public payment should not require Google login.

---

## 24. QR Payment

The QR code should encode the public request URL:

```text
https://chainpay.app/p/CP-A8F291
```

Use:

```text
qrcode.react
```

Benefits:

- Short QR
- Cross-device payment
- Request status tracking
- Request cancellation/expiry
- Better merchant UX
- Better analytics later

---

## 25. Activity and History

Route:

```text
/activity
```

History comes from PostgreSQL, not only `localStorage`.

### Filters

- All
- Sent
- Received
- Pending
- Confirmed
- Failed

### Search

- Transaction hash
- Wallet address
- Payment title
- Contact name

Future:
- Date range
- CSV export
- PDF statement

---

## 26. Transaction Detail / Receipt

Route:

```text
/tx/[hash]
```

Example:

```text
Payment Confirmed

0.025 ETH

Website Development

From
0x82A...91Fc

To
0x91C...4F12

Network
Ethereum Sepolia

Block
9238129

Transaction
0xaf91...

Confirmed
26 Sep 2026 · 17:42

[ View on Explorer ]
[ Copy Transaction Hash ]
```

Future:
- Download PDF
- Share receipt

---

## 27. Contacts

Route:

```text
/contacts
```

Contact:

```text
Name
Wallet Address
Chain
Label
Created At
```

Example:

```text
Jane
0x91F...82C
Designer
```

Contacts improve safety and usability by reducing repeated manual wallet entry.

---

## 28. Wallet Management

Route:

```text
/wallets
```

Features:

- Add wallet
- Verify wallet
- Remove wallet
- Set primary wallet
- Copy address
- View explorer

Example:

```text
Primary
0x82A...91Fc
Verified

Secondary
0x91F...21AD
Verified
```

---

## 29. Merchant Mode

Future account type:

```text
personal
merchant
```

Potential merchant fields:

```text
Business Name
Logo
Description
Primary Wallet
Public Handle
```

Possible future public profile:

```text
chainpay.app/@somstudio
```

Possible merchant dashboard:

- Payments
- Payment requests
- Revenue
- Pending requests
- Analytics

---

## 30. API Design

Recommended endpoints / route handlers:

```text
POST   /api/auth/session
POST   /api/auth/logout
GET    /api/auth/me

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

Private endpoints require server-side authorization.

---

## 31. Validation

Use **Zod**.

Validate:

- API input
- URL/search params
- Wallet addresses
- Amounts
- Payment requests
- Contacts
- Profile settings
- Merchant settings

Never trust browser input.

---

## 32. Forms

Use:

```text
React Hook Form
+
Zod
```

For:

- Pay
- Request
- Contacts
- Profile
- Merchant settings

---

## 33. Security Requirements

### Authentication

- Firebase ID tokens/session cookies must be verified server-side with Firebase Admin
- Protected private routes
- Secure HttpOnly session cookie for the web application
- Session expiration and logout handling
- Never trust browser-provided `uid`, email, role, or ownership claims
- Re-authentication can be required for sensitive merchant/security operations

### Authorization

Authentication answers **who the user is**; authorization determines **what that user may access**.

Every private database operation must scope records to the authenticated internal ChainPay user ID.

Examples:

- A user cannot read another user's contacts.
- A user cannot modify another user's payment request.
- A user cannot link a wallet to another user's account.
- A public payment page may expose only intentionally public request fields.

### Wallet verification

- Server-generated nonce
- Expiration
- Single use
- Signature verification
- Recovered signer must match expected address
- Challenge must be bound to the authenticated ChainPay user and expected domain

### Blockchain transactions

- Never trust client-reported success
- Verify chain ID
- Verify transaction receipt
- Verify amount/recipient
- Verify contract event when applicable
- Prevent duplicate processing using transaction hash + chain ID uniqueness/idempotency

### Secrets

Never expose:

- Private keys
- Seed phrases
- Firebase Admin private key
- Server-only database connection strings
- Server-only RPC secrets
- OAuth/provider secrets where applicable

Firebase web configuration values such as `NEXT_PUBLIC_FIREBASE_API_KEY` are client configuration, not a substitute for server authorization. Security must rely on Firebase Authentication verification and server-side access control, not on hiding public client configuration.

### Environment

Never commit:

```text
.env.local
```

Create:

```text
.env.example
```

### Database

- Server-side authorization is mandatory
- Use typed database access through Drizzle
- Use least-privileged PostgreSQL credentials
- No user can read or mutate another user's private records
- PostgreSQL RLS may be added as defense in depth where the chosen connection/role strategy supports it cleanly
- Database backups/recovery strategy should be documented before real-money production use

---

## 34. Rate Limiting

Prioritize rate limiting for:

- Wallet challenge creation
- Wallet signature verification
- Payment request creation
- Transaction verification

This can be added after the core MVP works.

---

## 35. Logging / Observability

Production-oriented additions:

- Vercel logs
- Structured server logs
- Sentry later

Useful log fields:

- Request ID
- Route
- Operation
- User ID where appropriate
- Error category

Never log:

- Seed phrases
- Private keys
- OAuth tokens
- Service-role keys

---

## 36. Error UX

Examples:

```text
Your session has expired. Please sign in again.
```

```text
MetaMask was not detected.
```

```text
Switch to Ethereum Sepolia to continue.
```

```text
Wallet verification was cancelled.
```

```text
Payment was cancelled in your wallet.
```

```text
Your wallet does not have enough ETH for this payment and network fee.
```

```text
We could not verify this transaction on Ethereum yet.
```

Do not expose raw stack traces to normal users.

---

## 37. UX / UI Direction

Style:

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

The product should feel:

- Premium
- Calm
- Trustworthy
- Distinctive
- Minimal
- Responsive

Avoid:

- Aggressive neon
- Excessive gradients
- Casino-like crypto styling
- Generic dashboard templates
- Excessive blur
- Constant animation

---

## 38. Design Tokens

Starting palette:

```text
Background       #070A0F
Surface          #0B1018
Primary          #5B8CFF
Primary Light    #8FB0FF
Success          #4ADE80
Warning          #FBBF24
Error            #F87171
Text             #F8FAFC
Secondary Text   #94A3B8
Muted Text       #64748B
```

These should become reusable CSS/Tailwind design tokens.

---

## 39. Liquid Glass System

Recommended glass surface:

```text
background:
rgba(15, 20, 30, 0.55)

border:
rgba(255,255,255,0.08)

backdrop blur:
20px–28px

shadow:
large, soft, low-opacity

inner highlight:
very subtle
```

Glass should support readability, not reduce it.

---

## 40. Motion System

Use Motion / Framer Motion for feedback.

### Button

```text
hover: translateY(-1px)
tap: scale(0.98)
```

### Card

```text
hover: translateY(-2px)
```

### Modal / sheet

```text
opacity 0 → 1
scale 0.98 → 1
```

### Payment success

- Animated check
- Soft green glow
- Small non-distracting movement

Respect:

```text
prefers-reduced-motion
```

---

## 41. Responsive Design

Support:

- Desktop
- Laptop
- Tablet
- Mobile

Mobile must handle:

- Login
- Wallet
- Pay
- Review
- Public request
- QR
- Activity
- Receipt

Requirements:

- No horizontal overflow
- Comfortable touch targets
- Readable addresses
- Mobile-friendly dialogs/sheets

---

## 42. Loading States

Examples:

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

Use skeletons and inline progress rather than blank screens.

---

## 43. Empty States

### Activity

```text
No transactions yet

Your ChainPay payments will appear here after your first transaction.

[ Send Payment ]
```

### Requests

```text
No payment requests

Create a payment link to receive your first Web3 payment.

[ Create Request ]
```

### Contacts

```text
No saved contacts

Save frequently used wallet addresses for faster payments.

[ Add Contact ]
```

---

## 44. Public Payment UX

```text
Open Payment Link
      ↓
Review Merchant
      ↓
Review Amount
      ↓
Connect Wallet
      ↓
Review Payment
      ↓
Confirm in Wallet
      ↓
Blockchain Confirmation
      ↓
Receipt
```

A payer does not need a ChainPay account for the basic public payment flow.

---

## 45. Payment Request Expiration

Supported options can include:

```text
No expiration
1 hour
24 hours
7 days
Custom
```

Expired requests must not accept a normal payment through the UI.

---

## 46. Blockchain Synchronization

### MVP

- Verify when a transaction is submitted
- Store pending state
- Re-check pending status where practical

### Future

- Scheduled reconciliation
- Contract event indexing
- Webhooks/indexer
- Automatic pending transaction reconciliation

---

## 47. Recommended Folder Structure

```text
chainpay/
│
├── app/
│   ├── (marketing)/
│   │   └── page.tsx
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── pay/
│   │   │   └── page.tsx
│   │   ├── requests/
│   │   │   └── page.tsx
│   │   ├── activity/
│   │   │   └── page.tsx
│   │   ├── contacts/
│   │   │   └── page.tsx
│   │   ├── wallets/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── profile/
│   │           └── page.tsx
│   │
│   ├── p/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── tx/
│   │   └── [hash]/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── session/
│   │   │   ├── logout/
│   │   │   └── me/
│   │   ├── wallets/
│   │   ├── transactions/
│   │   ├── payment-requests/
│   │   └── contacts/
│   │
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
│   │   ├── firebase-client.ts
│   │   ├── firebase-admin.ts
│   │   └── session.ts
│   ├── db/
│   │   ├── client.ts
│   │   └── queries/
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

The repository remains one Next.js application for the MVP. Do not create a separate `/backend` service unless a real runtime requirement appears.

---

## 48. Environment Variables

Example:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase client configuration (browser-safe configuration)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Neon PostgreSQL (server only)
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS=
ETHEREUM_RPC_URL=
```

Rules:

- Public browser configuration uses `NEXT_PUBLIC_` only when it is intentionally safe for the client bundle.
- `FIREBASE_PRIVATE_KEY`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `ETHEREUM_RPC_URL` are server-only.
- Never expose a database connection string to browser code.
- Never expose Firebase Admin credentials to browser code.
- When storing a multiline Firebase private key in Vercel, normalize escaped newlines in server initialization code if required by the environment format.
- Never commit `.env.local`.
- Keep `.env.example` populated with variable names only, never real secrets.

---

## 49. Recommended Dependencies

### Core

```text
next
react
react-dom
typescript
```

### UI

```text
tailwindcss
lucide-react
motion / framer-motion
sonner
```

### Forms

```text
react-hook-form
zod
@hookform/resolvers
```

### Database

```text
drizzle-orm
drizzle-kit
@neondatabase/serverless
```

### Authentication

```text
firebase
firebase-admin
```

### Web3

```text
wagmi
viem
@tanstack/react-query
```

### QR

```text
qrcode.react
```

### Testing

```text
vitest
@playwright/test
```

Only install dependencies actually used by the final implementation.

---

## 50. Engineering Principles

### Clear server/client boundaries

Client:
- UI
- MetaMask
- Browser APIs
- User interaction

Server:
- Database
- Authorization
- Blockchain verification
- Sensitive environment variables

### Feature-oriented structure

Keep business logic near its feature.

### Avoid giant pages

Extract:

- Components
- Hooks
- Services
- Validation schemas
- Utilities

### Avoid duplicate logic

Centralize:

- Address formatting
- Chain configuration
- Validation
- Status mapping
- Transaction parsing

---

## 51. Testing Strategy

### Unit tests

- Address validation
- Payment validation
- Amount parsing
- Formatters
- Status mapping

### Integration tests

- Authentication
- Wallet verification
- Payment request creation
- Transaction persistence
- Authorization

### E2E

Recommended:

```text
Playwright
```

Important flows:

- Login
- Dashboard
- Create request
- Public request
- Payment UI
- Activity
- Receipt

Wallet automation can use a specialized test strategy.

---

## 52. Manual Web3 Checklist

### Wallet

- MetaMask installed
- MetaMask missing
- Connect
- Reject
- Account switch
- Network switch
- Verify
- Reject verification signature
- Primary wallet

### Payment

- Valid address
- Invalid address
- Same sender/receiver
- Zero
- Insufficient balance
- Reject transaction
- Successful Sepolia transaction
- Failed transaction
- Receipt

### Request

- Create
- Share
- Open anonymously
- QR
- Expire
- Cancel
- Pay

---

## 53. Deployment Architecture

```text
GitHub / GitLab
      ↓
    Vercel
      │
      ├── Next.js Application
      ├── Route Handlers / Server Actions
      └── Environment Variables
           │
           ├──────────────▶ Firebase Authentication
           │                 └── Google Sign-In
           │
           ├──────────────▶ Neon PostgreSQL
           │                 └── Drizzle ORM
           │
           └──────────────▶ Ethereum Sepolia
                             └── ChainPay.sol
```

### MVP deployment decision

There is **no dedicated Render backend** in the MVP.

This is intentional:

- Next.js provides the application backend boundary.
- Vercel runs the server-side request handlers.
- Neon provides PostgreSQL independently from application compute.
- Firebase provides identity independently from application data.
- Fewer deployed services reduce CORS, cold-start chains, duplicated configuration, and debugging overhead.

### When a separate backend/worker becomes justified

Consider a dedicated service later for:

- Continuous contract event indexing
- Queue workers
- High-volume webhook processing
- Scheduled blockchain reconciliation
- Long-running jobs
- Compute workloads that exceed serverless request constraints

---

## 54. Deployment Checklist

Before production deployment:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Unit/integration tests pass
- E2E critical flows pass
- Neon database migrations applied
- Google provider enabled in Firebase Authentication
- Firebase authorized domains configured
- Firebase Admin environment variables configured on Vercel
- Authentication/session flow tested in production origin
- Database authorization rules reviewed
- Least-privileged database access reviewed
- Environment variables configured
- Sepolia contract address configured
- RPC configured
- No secrets in client bundle
- `.env.local` ignored
- No hydration errors
- No application-caused console errors
- Public payment page tested anonymously
- Wallet verification tested
- Server-side transaction verification tested
- Mobile UX tested
- Error states tested
- Production logging checked

---

## 55. Production MVP Scope

### Authentication

- Google OAuth
- Session
- Profile

### Wallet

- MetaMask
- Wallet verification
- Primary wallet
- Balance

### Payment

- Send Sepolia ETH
- Review
- Smart contract transaction
- Server verification
- Persistent transaction
- Receipt

### Payment Requests

- Create request
- Public URL
- QR
- Status
- Payment

### Activity

- Persistent history
- Filters
- Transaction detail

### UX

- Dashboard
- Responsive
- Loading
- Errors
- Toasts
- Soft animations
- Empty states

---

## 56. Phase 2

After MVP:

- Multiple wallets
- Contacts
- Merchant mode
- Analytics
- CSV export
- PDF receipts
- Email notifications
- Wallet-only authentication
- Additional EVM chain
- USDC

---

## 57. Phase 3

Longer-term:

- Payment API
- API keys
- Webhooks
- Merchant checkout SDK
- Embeddable pay button
- Subscription payments
- Refund workflow
- Team accounts
- Business roles
- Multi-chain

---

## 58. Development Roadmap

### Phase 1 — Foundation

- Back up current project / create Git checkpoint
- Convert JS → TypeScript
- Add Tailwind
- Add shadcn/ui
- Create design system
- Refactor folder structure
- Gradually remove obsolete MUI/Emotion

### Phase 2 — Neon Database

- Create Neon project
- Create PostgreSQL schema
- Configure `DATABASE_URL`
- Add Drizzle ORM + Drizzle Kit
- Create migrations
- Add internal `users` table with `firebase_uid`
- Implement typed database access

### Phase 3 — Firebase Authentication

- Create Firebase project
- Enable Google provider
- Configure Firebase client SDK
- Configure Firebase Admin SDK
- Implement `/api/auth/session`
- Implement secure session cookie
- Implement logout
- Protect private routes/server operations
- Create/update ChainPay profile in Neon after verified sign-in

### Phase 4 — Wallet Identity

- wagmi
- viem
- MetaMask
- Wallet ownership challenge
- Server-side signature verification
- Primary wallet

### Phase 5 — Payment Core

- Pay form
- Validation
- Review
- Smart contract
- Transaction
- Pending database record
- Server-side blockchain verification
- Idempotent confirmation update
- Receipt

### Phase 6 — Payment Requests

- DB-backed requests
- Public slug
- Public page
- QR
- Expiry/cancel
- Request status

### Phase 7 — Activity

- Persistent history
- Search
- Filters
- Detail

### Phase 8 — Product Polish

- Responsive layout
- Motion
- Error boundaries
- Loading
- Empty states
- Accessibility

### Phase 9 — Quality / Deployment

- Unit/integration tests
- Playwright E2E
- Lint
- Typecheck
- Build
- Security review
- Deploy Next.js to Vercel
- Configure Firebase production authorized domains
- Apply Neon production migrations
- Validate production environment variables
- Run production smoke test

---

## 59. Portfolio Positioning

Suggested portfolio description:

> **ChainPay is a full-stack Web3 payment platform built with Next.js, TypeScript, Neon PostgreSQL, Drizzle ORM, Firebase Authentication, MetaMask, wagmi/viem, and Solidity. It supports Google sign-in, verified wallet ownership, blockchain payments, server-side transaction verification, persistent transaction history, database-backed payment requests, QR payments, and responsive fintech UX. The application uses Next.js server-side APIs on Vercel rather than a separate backend service for the MVP.**

Relevant roles:

- Junior Full-stack Developer
- Junior Frontend Developer
- Web3 Developer
- Software Developer
- FinTech Developer

---

## 60. Definition of Done

The ChainPay Production MVP is complete when:

- A user can sign in with Google through Firebase Authentication.
- Firebase identity is verified server-side.
- A ChainPay internal user record is persisted in Neon PostgreSQL.
- A secure authenticated application session works across protected routes.
- A user can connect MetaMask.
- Wallet ownership can be verified with a signed challenge.
- A user can create a payment request.
- A public user can open a payment link without creating an account.
- A payer can send Sepolia ETH.
- The transaction is verified server-side against Ethereum.
- Confirmed payments persist in Neon PostgreSQL.
- Duplicate transaction confirmation cannot create duplicate records.
- History is available across devices after login.
- A receipt can be viewed.
- QR payment works.
- UI is responsive.
- No private keys or seed phrases are stored.
- No Firebase Admin or database secrets reach the client bundle.
- No fake client-reported success state is trusted as authoritative.
- Authorization prevents cross-user private data access.
- Lint passes.
- TypeScript passes.
- Automated critical tests pass.
- Production build passes.
- Deployment documentation exists.

---

## 61. Immediate Refactor Order

Start upgrading the current ChainPay project in this order:

```text
1. Create a backup / Git checkpoint.
2. Convert project to TypeScript.
3. Configure Tailwind CSS.
4. Add shadcn/ui.
5. Build ChainPay design tokens and reusable UI.
6. Replace MUI incrementally.
7. Remove MUI/Emotion only after migration is complete.
8. Create and configure Neon PostgreSQL.
9. Add Drizzle ORM + schema + migrations.
10. Add firebase_uid mapping to the internal users table.
11. Configure Firebase Authentication + Google provider.
12. Configure Firebase Admin on the Next.js server.
13. Implement secure auth session endpoints/cookies.
14. Add authenticated dashboard and server-side authorization.
15. Refactor wallet integration to wagmi + viem.
16. Add wallet ownership verification.
17. Implement DB-backed payment requests.
18. Implement public payment pages.
19. Implement ChainPay.sol payment flow.
20. Add server-side transaction verification.
21. Persist transaction history in Neon.
22. Add QR payments.
23. Add contacts and wallet management.
24. Polish mobile UX and motion.
25. Add tests and documentation.
26. Deploy Next.js to Vercel.
27. Configure Firebase production domains and credentials.
28. Apply Neon production migrations and run smoke tests.
```

Do not add Render merely to make the architecture look more complex. Add a dedicated backend/worker only when the workload requires a runtime that Next.js/Vercel should not own.

---

# Final Principle

> **ChainPay should be built as a real payment product first and a Web3 demo second. The blockchain should create trust and settlement; the application should create usability.**
