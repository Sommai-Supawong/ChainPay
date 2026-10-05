# MASTER PROMPT — ChainPay Escrow + Milestone Payment System

You are a **Senior Full-Stack Web3 Engineer, Solidity Engineer, FinTech Product Engineer, Security Engineer, and QA Engineer**.

You are working on an existing project called **ChainPay**, a production-oriented, non-custodial Web3 payment platform running on **Ethereum Sepolia**.

Your task is to **extend the existing ChainPay system by adding a complete Escrow + Milestone Payment + Dispute system**.

---

# 0. CRITICAL RULE — DO NOT START CODING IMMEDIATELY

Before modifying any source code, you MUST fully understand the existing project.

You MUST first:

1. Read `README.md` completely.
2. Read `document.md` completely.
3. Inspect the actual repository structure.
4. Inspect `package.json` and available scripts.
5. Inspect the existing frontend architecture.
6. Inspect the existing backend/API architecture.
7. Inspect the database schema and migrations.
8. Inspect Firebase Authentication and authorization.
9. Inspect wallet connection and wallet verification.
10. Inspect the existing `contracts/ChainPay.sol`.
11. Inspect the blockchain transaction verification flow.
12. Inspect existing tests.
13. Inspect existing Playwright E2E tests.
14. Inspect the existing UI/design system.
15. Inspect existing environment variables and configuration.

**Do not assume the documentation and source code are identical.**

The **actual repository implementation is the source of truth**.

Use `README.md` and `document.md` as the product and architecture specification.

Do not rewrite or replace working systems simply because you would personally design them differently.

---

# 1. EXISTING CHAINPAY CONTEXT

ChainPay is designed around the product principle:

> **Pay with blockchain, without the complexity.**

The current architecture includes:

* Next.js 16 App Router
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Motion / Framer Motion
* Lucide React
* Sonner
* Firebase Authentication
* Firebase Admin
* Neon PostgreSQL
* Drizzle ORM
* Ethereum Sepolia
* MetaMask
* wagmi
* viem
* Solidity
* Vitest
* Playwright
* Vercel

The current application uses **Next.js Route Handlers / Server Actions** as the application backend.

Do NOT introduce Express, FastAPI, Render, microservices, queues, Redis, or other infrastructure merely to make the architecture more complicated.

Only introduce new infrastructure if the existing architecture has a concrete technical limitation that requires it.

---

# 2. EXISTING SMART CONTRACT MUST REMAIN

The existing payment contract is:

```text
contracts/ChainPay.sol
```

Do NOT remove or replace it.

Do NOT unnecessarily modify its existing payment behavior.

The existing contract continues to handle the existing payment functionality.

The new Escrow system must use a separate contract:

```text
contracts/ChainPayEscrow.sol
```

The conceptual architecture should be:

```text
                    ChainPay
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
      ChainPay.sol       ChainPayEscrow.sol
      Normal Payments        Escrow System
      Send / Pay / etc.      Lock Funds
                              Milestones
                              Submit
                              Approve
                              Release
                              Dispute
                              Refund
```

The goal is to **extend ChainPay**, not rewrite ChainPay.

---

# 3. NEW FEATURE

Implement:

# Escrow + Milestone Payments + Dispute System

The new feature should transform ChainPay from a simple payment application into a platform that can manage **agreement-based payments**.

Instead of:

```text
Send → Receive
```

ChainPay should also support:

```text
Create Agreement
        ↓
Define Milestones
        ↓
Deposit Funds
        ↓
Funds Locked in Smart Contract
        ↓
Work Completed
        ↓
Milestone Submitted
        ↓
Client Reviews
        ↓
Approve
        ↓
Smart Contract Releases Funds
```

If there is a problem:

```text
Open Dispute
        ↓
Review / Resolution
        ↓
Release OR Refund
```

---

# 4. PRODUCT GOAL

The user should feel:

> "I am creating a secure payment agreement."

Not:

> "I am interacting with a smart contract."

Blockchain should remain the **settlement and verification layer**.

ChainPay should remain the **product experience**.

The UI must hide unnecessary blockchain complexity from normal users.

Do not expose concepts such as:

* ABI
* RPC
* nonce
* gas limit
* contract bytecode

unless they are useful in an advanced transaction detail view.

---

# 5. PHASE 0 — BASELINE AND SAFETY CHECKPOINT

Before implementation:

1. Check Git status.
2. Check the current branch.
3. Check for uncommitted changes.
4. Do not overwrite user work.
5. Create a safe checkpoint/commit if appropriate.
6. Record the current test baseline.

Run the project's existing validation commands.

At minimum, attempt:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If E2E is available:

```bash
npm run test:e2e
```

If the project uses different commands, inspect `package.json` and use the correct commands.

Record all existing failures.

Do NOT incorrectly attribute pre-existing failures to the Escrow implementation.

---

# 6. PHASE 1 — DEEP PROJECT ANALYSIS

Before implementation, inspect:

## Frontend

* App Router structure
* layouts
* routes
* components
* feature modules
* forms
* validation
* loading states
* error states
* empty states
* responsive behavior
* design tokens
* animations
* existing navigation

## Backend

Inspect:

* Route Handlers
* Server Actions
* services
* authorization
* validation
* error handling
* database access
* blockchain verification

## Database

Inspect all existing tables, relationships, constraints, migrations, and indexes.

Pay particular attention to:

```text
users
wallets
wallet challenges
requests
payment intents
transactions
transaction metadata
contacts
audit logs
rate limits
```

## Blockchain

Inspect:

* `ChainPay.sol`
* ABI handling
* contract address configuration
* wagmi configuration
* viem clients
* transaction submission
* receipt verification
* event verification
* confirmation handling
* chain ID validation

## Testing

Inspect:

* unit tests
* integration tests
* database tests
* contract tests
* isolated EVM tests
* Playwright E2E tests
* fixtures
* mocks

After analysis, produce a detailed implementation plan.

**Do not modify application source code before the analysis is complete.**

---

# 7. REQUIRED ANALYSIS OUTPUT BEFORE IMPLEMENTATION

Before changing code, provide:

```text
CURRENT ARCHITECTURE
CURRENT PAYMENT FLOW
CURRENT SMART CONTRACT
CURRENT DATABASE
CURRENT AUTHORIZATION MODEL
CURRENT BLOCKCHAIN VERIFICATION
CURRENT TEST COVERAGE
CURRENT DESIGN SYSTEM
ESCROW ARCHITECTURE
ESCROW USER FLOWS
DATABASE CHANGES
SMART CONTRACT CHANGES
API CHANGES
FRONTEND CHANGES
TESTING STRATEGY
SECURITY RISKS
FILES TO CREATE
FILES TO MODIFY
IMPLEMENTATION PLAN
```

Then proceed with implementation.

Do not stop after producing the plan.

---

# 8. PHASE 2 — ESCROW ARCHITECTURE

Design the Escrow system to fit the existing architecture.

Primary actors:

```text
Client / Payer
Freelancer / Payee
Platform / Admin
```

Escrow lifecycle should support states such as:

```text
Created
Funded
InProgress
Submitted
Approved
Disputed
Released
Cancelled
Refunded
```

You may adjust the exact state model if the existing architecture requires it.

However, state transitions must be explicit and validated.

Example:

```text
Created
   ↓
Funded
   ↓
InProgress
   ↓
Submitted
   ↓
Approved
   ↓
Released
```

Dispute path:

```text
Submitted
   ↓
Disputed
   ↓
Released OR Refunded
```

Do not allow arbitrary state transitions.

---

# 9. PHASE 3 — SMART CONTRACT

Create:

```text
contracts/ChainPayEscrow.sol
```

The contract must support, as appropriate:

## Create Escrow

Store:

* client
* freelancer
* total amount
* description/reference
* milestones
* deadlines where appropriate

## Deposit

Client deposits ETH into the Escrow contract.

Funds must remain locked until the defined release conditions are satisfied.

## Milestones

Each milestone should contain appropriate fields such as:

```text
id
amount
description
deadline
status
```

Possible states:

```text
Pending
Submitted
Approved
Released
Disputed
Refunded
```

## Submit Milestone

Only the Freelancer should be able to submit their milestone.

## Approve Milestone

Only the Client should be able to approve a submitted milestone.

## Release

The contract releases the milestone payment to the Freelancer after the required conditions are satisfied.

## Cancel / Refund

Implement clear cancellation and refund rules.

Do not invent ambiguous refund behavior.

## Dispute

Allow the appropriate participant to open a dispute.

## Resolution

Allow an explicitly authorized platform/admin role to resolve disputes according to clearly defined rules.

---

# 10. SMART CONTRACT SECURITY REQUIREMENTS

The contract must consider:

* Access control
* Participant validation
* Immutable participant addresses where appropriate
* Explicit state transitions
* Zero-value protection
* Amount validation
* Milestone total validation
* Double-release prevention
* Double-refund prevention
* Reentrancy protection
* Checks-effects-interactions
* Pull-payment patterns where appropriate
* Event emission
* Deadline validation
* Contract balance consistency
* No arbitrary external calls
* No `tx.origin`
* No private key custody

Do not create an admin function that can arbitrarily steal or withdraw user funds.

Security-sensitive logic must have tests.

---

# 11. REQUIRED EVENTS

The contract should emit appropriate events, including:

```solidity
EscrowCreated
EscrowFunded
MilestoneSubmitted
MilestoneApproved
PaymentReleased
DisputeOpened
DisputeResolved
RefundIssued
EscrowCancelled
```

Adjust event names if the existing coding conventions require it.

The backend must be able to verify these events.

---

# 12. PHASE 4 — DATABASE

Extend the existing Neon PostgreSQL / Drizzle schema.

Do NOT break existing tables.

Add appropriate models, potentially including:

```text
escrows
escrow_milestones
escrow_disputes
escrow_transactions
```

Adapt the exact schema to the existing database architecture.

## Escrow

Should support information such as:

* internal ID
* client user ID
* freelancer user/wallet where applicable
* on-chain escrow ID
* contract address
* amount
* asset
* description
* status
* timestamps
* relevant transaction references

## Milestone

Should support:

* escrow ID
* milestone index
* description
* amount
* deadline
* status
* submission metadata
* submittedAt
* approvedAt
* releasedAt

## Dispute

Should support:

* escrow ID
* openedBy
* reason
* status
* resolution
* timestamps

## Escrow Transactions

Should support:

* transaction hash
* chain ID
* block number
* event type
* amount
* verification status
* timestamps

Use appropriate:

* foreign keys
* unique constraints
* indexes
* idempotency constraints

Duplicate blockchain processing must not create duplicate records.

---

# 13. PHASE 5 — BACKEND

Add the Escrow application layer using the same backend architecture already used by ChainPay.

Potential operations:

```text
Create Escrow
List Escrows
Get Escrow
Deposit
Submit Milestone
Approve Milestone
Release
Open Dispute
Resolve Dispute
Refund
Cancel
```

Possible API structure:

```text
/api/escrows
/api/escrows/[id]
/api/escrows/[id]/deposit
/api/escrows/[id]/milestones/[milestoneId]/submit
/api/escrows/[id]/milestones/[milestoneId]/approve
/api/escrows/[id]/milestones/[milestoneId]/release
/api/escrows/[id]/dispute
/api/escrows/[id]/resolve
/api/escrows/[id]/refund
```

However:

**Do not blindly create these routes.**

First inspect whether the project uses Route Handlers, Server Actions, or another service abstraction.

Follow the existing architecture.

---

# 14. SERVER-SIDE BLOCKCHAIN VERIFICATION

Never trust browser-reported success.

Do NOT accept:

```json
{
  "status": "confirmed"
}
```

as authoritative.

For blockchain operations, verify server-side where appropriate:

```text
Chain ID
Transaction hash
Receipt
Receipt status
Contract address
Sender
Recipient
Value
Expected event
Escrow ID
Milestone ID
Block number
Confirmation state
```

Blockchain remains authoritative for settlement.

Database stores application state derived from verified blockchain events.

Implement idempotency.

The same transaction/event must never be processed twice.

---

# 15. PHASE 6 — FRONTEND

Add Escrow to the existing ChainPay design system.

Do NOT create a completely different visual language.

Preserve:

* Existing typography
* Existing spacing
* Existing components
* Existing buttons
* Existing cards
* Existing dialogs
* Existing glass UI
* Existing dark FinTech aesthetic
* Existing motion principles
* Existing responsive behavior
* Existing accessibility patterns

Avoid:

* Excessive gradients
* Aggressive neon
* Crypto-casino styling
* Generic AI dashboards
* Excessive blur
* Excessive animation
* Unnecessary 3D
* Visual clutter

The new system should feel like it was designed as part of ChainPay from day one.

---

# 16. NAVIGATION

Add an appropriate navigation item such as:

```text
Dashboard
Pay
Request
Activity
Contracts
Wallets
Contacts
Settings
```

Use the project's existing naming conventions.

The new feature may be called:

```text
Contracts
```

with Escrow used as the technical/business concept.

Choose the terminology that creates the clearest user experience.

---

# 17. ESCROW DASHBOARD

Create an appropriate route, for example:

```text
/escrow
```

or:

```text
/contracts
```

based on existing routing conventions.

Dashboard should show:

```text
Active Contracts
Locked Funds
Released Funds
Pending Milestones
Disputes
```

Contract list should show information such as:

```text
Client / Freelancer
Amount
Progress
Next Milestone
Status
Updated
```

---

# 18. CREATE ESCROW FLOW

Create a user-friendly flow.

Example:

```text
Create Contract

Who are you paying?
[ Contact / Wallet ]

Contract Title
[ Website Development ]

Description
[ ... ]

Total Amount
[ 0.05 ETH ]

Milestones

1. UI Design        0.015 ETH
2. Development      0.020 ETH
3. Final Delivery   0.015 ETH

[ Create Contract ]
```

Validate:

* valid Ethereum address
* client != freelancer
* amount > 0
* milestone amounts > 0
* milestone total = escrow total
* valid deadline
* valid description
* wallet connected
* wallet verified where required
* correct network
* sufficient wallet balance

---

# 19. ESCROW DETAIL PAGE

Create an appropriate route such as:

```text
/escrow/[id]
```

or follow the project's routing convention.

Display:

```text
Contract Status
Locked Amount
Released Amount
Remaining Amount

Client
Freelancer

Milestone Timeline

✓ UI Design
  Submitted
  Approved
  Released

● Development
  In Progress

○ Final Delivery
  Pending
```

Transaction details should be available when useful.

Blockchain details should remain secondary to the business information.

---

# 20. CLIENT FLOW

Client should be able to:

```text
Create Escrow
      ↓
Deposit Funds
      ↓
View Contract
      ↓
Review Milestone
      ↓
Approve
      ↓
Release Payment
```

---

# 21. FREELANCER FLOW

Freelancer should be able to:

```text
Receive Escrow
      ↓
View Contract
      ↓
Work on Milestone
      ↓
Submit Milestone
      ↓
Wait for Approval
      ↓
Receive Payment
```

---

# 22. DISPUTE FLOW

Support:

```text
Client / Freelancer
        ↓
Open Dispute
        ↓
Escrow becomes Disputed
        ↓
Authorized Resolution
        ↓
Release OR Refund
```

The UI must clearly explain the dispute state.

Do not create a fake decentralized arbitration system.

For this version, a clearly documented platform/admin resolution model is acceptable.

---

# 23. TRANSACTION UX

Every blockchain action should have a clear lifecycle:

```text
Preparing
    ↓
Waiting for Wallet Confirmation
    ↓
Transaction Submitted
    ↓
Verifying on Blockchain
    ↓
Confirmed
```

Handle:

* wallet rejection
* wrong network
* insufficient balance
* insufficient gas
* transaction revert
* pending transaction
* verification timeout
* duplicate submission
* expired session
* unauthorized action

Never display a successful payment before appropriate blockchain verification.

---

# 24. AUTHORIZATION

Firebase handles authentication.

Internal ChainPay user ID handles application authorization.

Do NOT authorize access using only wallet addresses.

Example:

```text
User A
    X
User B's Escrow
```

Client must not modify another user's escrow.

Freelancer must not approve their own milestone.

Only authorized participants can:

* view private escrow data
* submit milestones
* approve milestones
* open disputes

Admin-only operations must have explicit authorization.

Public pages, if introduced, must only expose intentionally public information.

---

# 25. PHASE 7 — TESTING

Implement comprehensive tests.

## Solidity Tests

### Happy Path

```text
Create
→ Fund
→ Submit
→ Approve
→ Release
```

### Multiple Milestones

```text
Milestone 1 → Release
Milestone 2 → Release
Milestone 3 → Release
```

### Unauthorized Access

Test:

```text
Wrong Client
Wrong Freelancer
Random Wallet
Unauthorized Admin
```

### Invalid State Transitions

Test:

```text
Approve before Submit
Release twice
Refund twice
Submit after Release
Approve after Release
```

### Amount Validation

Test:

```text
Zero amount
Incorrect amount
Insufficient funding
Incorrect milestone total
```

### Dispute

Test:

```text
Open dispute
Resolve dispute
Release
Refund
```

### Security

Test security-sensitive paths, including reentrancy protection where applicable.

---

# 26. BACKEND / DATABASE TESTS

Test:

* authentication
* authorization
* ownership
* validation
* idempotency
* duplicate transactions
* invalid state transitions
* milestone access
* dispute access
* transaction consistency

---

# 27. PHASE 8 — END-TO-END TESTING

Use Playwright.

Create E2E coverage appropriate to the existing test architecture.

At minimum:

## E2E — Escrow List

```text
Login
→ Open Contracts/Escrow
→ View contracts
```

## E2E — Create Escrow

```text
Login
→ Create Contract
→ Enter details
→ Validate form
→ Create
→ Open contract detail
```

## E2E — Milestone

```text
Open Contract
→ View milestones
→ Verify milestone status
```

## E2E — Authorization

```text
User A
cannot access
User B's private escrow
```

## E2E — Existing Payment Regression

Verify the existing payment flow still works:

```text
Login
→ Wallet
→ Send Payment
→ Activity
→ Receipt
```

Also verify:

```text
Payment Request
→ Public Payment Page
→ Payment
→ Verification
```

Escrow must not introduce regressions into the existing payment system.

---

# 28. REAL SEPOLIA ACCEPTANCE TEST

If the environment is configured and wallets are available, perform real Sepolia acceptance testing.

Test:

```text
Deploy ChainPayEscrow
        ↓
Create Escrow
        ↓
Deposit
        ↓
Submit Milestone
        ↓
Approve
        ↓
Release
        ↓
Verify Blockchain
        ↓
Verify Database
        ↓
Verify UI
```

If real MetaMask interaction cannot be automated:

* use isolated EVM tests for automated testing
* create a manual acceptance checklist
* clearly identify what was automated and what requires manual verification

**Never fake blockchain success.**

---

# 29. PHASE 9 — REGRESSION TESTING

After Escrow implementation, verify all existing ChainPay functionality:

```text
Authentication
Wallet Connection
Wallet Verification
Send Payment
Payment Requests
Public Payment Page
QR Payments
Activity
Transaction Details
Receipts
Contacts
Settings
```

The Escrow system must be additive.

Do not unnecessarily change existing behavior.

---

# 30. PHASE 10 — RESPONSIVE / UI AUDIT

Test:

* Desktop
* Tablet
* Mobile
* Small viewport
* Large viewport

Test all states:

* Loading
* Empty
* Error
* Success
* Pending
* Disputed
* Refunded
* Cancelled

Also test:

* Long wallet addresses
* Long descriptions
* Many milestones
* Long transaction hashes
* Small screens

There must be no:

* horizontal overflow
* clipped buttons
* broken dialogs
* unreadable text
* inaccessible controls
* severe layout shifts
* inconsistent spacing
* inconsistent typography

---

# 31. PHASE 11 — DOCUMENTATION

After implementation, update:

```text
README.md
```

And update relevant existing documentation, such as:

```text
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SMART_CONTRACT.md
docs/SECURITY.md
docs/MANUAL_TESTS.md
```

Only create new documentation when appropriate.

Do not duplicate documentation unnecessarily.

---

# 32. README REQUIREMENTS

Add a clear section:

# Escrow & Milestone Payments

Explain:

* What Escrow is
* Why ChainPay has it
* How it works
* Client flow
* Freelancer flow
* Milestone flow
* Dispute flow
* Smart Contract architecture
* Database architecture
* Testing
* Deployment
* Limitations

Update the project map:

```text
contracts/
  ChainPay.sol
  ChainPayEscrow.sol
```

Update commands based on the actual `package.json`.

If a new environment variable is required, update:

```text
.env.example
```

Never place real secrets in documentation.

---

# 33. SECURITY DOCUMENTATION

Clearly document:

* Ethereum Sepolia
* Testnet status
* Not audited
* Not suitable for real-money production
* No private keys stored
* No seed phrases stored
* Admin/dispute model
* Known limitations
* Smart contract assumptions
* Deployment requirements

Do NOT claim the system is fully secure or production-ready if it has not been audited.

---

# 34. ENVIRONMENT VARIABLES

If required, add an environment variable such as:

```text
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS
```

or another name consistent with the existing configuration.

Keep client variables and server-only secrets correctly separated.

Never expose:

* private keys
* seed phrases
* Firebase Admin credentials
* database credentials
* server-only RPC credentials

Never commit `.env.local`.

---

# 35. CODE QUALITY

Follow the existing project's conventions.

Use:

* strict TypeScript
* existing component patterns
* existing service patterns
* existing validation
* existing error handling
* existing database abstractions
* existing design system

Avoid:

* duplicated logic
* giant components
* unnecessary dependencies
* dead code
* hardcoded secrets
* fake production data
* unnecessary abstractions

Reuse existing infrastructure before creating new infrastructure.

---

# 36. DO NOT OVERENGINEER

Do NOT introduce:

* separate backend services
* microservices
* Redis
* queues
* indexers
* new authentication systems
* new databases
* new UI frameworks

unless the actual project architecture demonstrates a concrete need.

The objective is to add a **complete Escrow feature while keeping ChainPay maintainable**.

---

# 37. IMPLEMENTATION ORDER

Work in this order:

```text
Phase 0
Baseline + Git Checkpoint

Phase 1
Repository / Architecture Analysis

Phase 2
Escrow Architecture Design

Phase 3
Smart Contract

Phase 4
Database

Phase 5
Backend

Phase 6
Frontend

Phase 7
Security / Authorization

Phase 8
Automated Tests

Phase 9
Playwright E2E

Phase 10
Regression Testing

Phase 11
Documentation

Phase 12
Final Audit
```

After every phase:

1. Validate the result.
2. Run relevant tests.
3. Fix errors immediately.
4. Do not allow known errors to accumulate into the next phase.

---

# 38. FINAL VALIDATION

Before declaring the work complete, run the appropriate project commands.

At minimum:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Also run the Solidity compilation and contract tests using the actual scripts defined by the repository.

If a command does not exist, inspect `package.json` and use the correct equivalent.

---

# 39. FINAL AUDIT REPORT

Do NOT finish with only:

> "Done."

Provide a complete final report.

## 1. What Changed

List important files created and modified.

## 2. Architecture

Explain:

```text
Existing Payment System
+
New Escrow System
```

## 3. Smart Contract

Report:

* Contract name
* Functions
* Events
* States
* Security mechanisms
* Deployment status
* Contract address if deployed

## 4. Database

Report:

* Tables
* Relationships
* Constraints
* Migrations

## 5. Backend

Report:

* Routes / Server Actions
* Services
* Validation
* Authorization
* Blockchain verification

## 6. Frontend

Report:

* Routes
* Components
* User flows
* Responsive behavior

## 7. Testing

Provide:

```text
Lint: PASS / FAIL
Typecheck: PASS / FAIL
Unit Tests: PASS / FAIL
Integration Tests: PASS / FAIL
Contract Tests: PASS / FAIL
E2E Tests: PASS / FAIL
Build: PASS / FAIL
```

## 8. Manual Testing

List anything that still requires:

* MetaMask
* Sepolia
* Real wallet interaction
* Real deployed contract
* Firebase
* Neon

## 9. Known Limitations

Be honest about limitations.

Do not hide failures.

## 10. Documentation

List which documentation files were updated.

---

# 40. DEFINITION OF DONE

The feature is complete only when:

* Existing payment system still works.
* `ChainPay.sol` remains functional.
* `ChainPayEscrow.sol` compiles.
* Smart contract tests pass.
* Database migration passes.
* Backend validation passes.
* Authorization passes.
* Escrow creation works.
* Escrow funding works.
* Milestone submission works.
* Milestone approval works.
* Payment release works.
* Dispute flow works according to the documented model.
* Refund/cancellation works according to documented rules.
* Blockchain verification works.
* Duplicate transaction processing is prevented.
* Unauthorized access is prevented.
* Responsive UI works.
* Existing payment regression tests pass.
* Playwright E2E tests pass where automation is supported.
* Production build passes.
* README is updated.
* Relevant documentation is updated.
* `.env.example` is updated if necessary.
* No secrets are committed.
* No private keys or seed phrases are stored.
* No fake blockchain success is used.
* Known limitations are documented.

---

# FINAL PRODUCT PRINCIPLE

ChainPay should feel like:

> **A modern payment platform powered by blockchain.**

Not:

> **A blockchain developer console.**

The Escrow feature should make the user feel:

> **"I am creating a secure payment agreement."**

Not:

> **"I am interacting with a smart contract."**

Blockchain is the settlement and verification layer.

ChainPay is the product experience.

---

# START NOW

Begin with:

### STEP 1

Read completely:

```text
README.md
document.md
package.json
```

### STEP 2

Inspect the repository structure.

### STEP 3

Inspect the existing ChainPay payment architecture.

### STEP 4

Inspect the database schema and migrations.

### STEP 5

Inspect `contracts/ChainPay.sol`.

### STEP 6

Inspect the existing tests and E2E tests.

### STEP 7

Run baseline validation.

### STEP 8

Produce the detailed analysis and implementation plan.

**DO NOT MODIFY APPLICATION SOURCE CODE UNTIL STEPS 1–7 ARE COMPLETE.**

After the analysis, proceed with implementation.

Do not stop after planning.

Continue until the complete **Definition of Done** is satisfied.

The goal is a **real, tested, documented Escrow system integrated into the existing ChainPay product without breaking the existing payment functionality.**
