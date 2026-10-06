# ChainPay — Phase 7: End-to-End Sepolia Integration & Verification

You are working on the existing ChainPay project.

Your task is to implement **Phase 7: End-to-End Sepolia Integration & Verification**.

## IMPORTANT CONTEXT

Phase 3–6 are already completed.

The existing project already has:

* Next.js App Router full-stack architecture
* Firebase Authentication
* Neon PostgreSQL
* Drizzle ORM
* MetaMask wallet integration
* Ethereum Sepolia support
* Existing payment transaction verification
* Payment Request system
* Transaction History
* Escrow database schema
* Escrow backend logic
* Escrow API routes
* Escrow frontend pages
* `ChainPayEscrow.sol`
* Escrow contract tests
* Escrow UI using existing `GlassCard`, `StatusBadge`, and ChainPay design patterns

The Escrow smart contract has **ALREADY BEEN DEPLOYED TO ETHEREUM SEPOLIA**.

The deployed contract address has already been added to:

```env
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS=0x...
```

inside `.env.local`.

## CRITICAL RULES

### DO NOT:

* Deploy another Escrow contract
* Create a second Escrow contract
* Replace the existing deployed contract
* Change the core payment architecture
* Introduce Render backend
* Introduce another database
* Replace Firebase
* Replace Neon
* Replace Drizzle
* Rewrite existing payment functionality
* Break existing Send / Receive / Request / History functionality
* Hardcode the contract address
* Trust frontend state as proof of blockchain success
* Mark an escrow as funded only because MetaMask returned successfully

### MUST:

* Reuse the existing architecture
* Reuse existing wallet utilities
* Reuse existing Ethereum/Sepolia utilities
* Reuse existing transaction verification patterns
* Reuse existing validation patterns
* Reuse existing database architecture
* Reuse existing UI components
* Treat Ethereum Sepolia as the authoritative settlement layer
* Verify blockchain transactions server-side before updating authoritative database state
* Preserve backward compatibility with existing ChainPay features

---

# PHASE 7 OBJECTIVE

Make Escrow work as a complete real-world flow:

```text
Create Escrow
      ↓
Save Draft / Proposal
      ↓
Review Escrow
      ↓
Connect / Verify Wallet
      ↓
Fund Escrow
      ↓
MetaMask
      ↓
Ethereum Sepolia
      ↓
Transaction Hash
      ↓
Server-side Verification
      ↓
Contract Event Verification
      ↓
Neon PostgreSQL
      ↓
Escrow = FUNDED
      ↓
Milestone Workflow
      ↓
Release / Refund / Dispute
      ↓
Blockchain Verification
      ↓
Database State Synchronization
```

The goal is NOT merely to show a successful UI.

The goal is to prove:

> ChainPay frontend → MetaMask → Sepolia → Smart Contract → Receipt/Event Verification → Neon database

works correctly end-to-end.

---

# STEP 1 — AUDIT THE EXISTING IMPLEMENTATION

Before modifying code:

Inspect the complete existing implementation.

Read at minimum:

```text
contracts/ChainPayEscrow.sol

tests/contract-escrow.test.ts

src/db/schema.ts

src/features/escrow/server.ts

src/app/api/[...path]/route.ts

src/app/(dashboard)/contracts/

src/components/navigation/app-nav.ts

src/lib/

package.json

.env.local.example
```

Also search the repository for:

```text
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS

ChainPayEscrow

escrow

sepolia

viem

ethers

walletClient

publicClient

transactionHash

waitForTransactionReceipt

```

Do not assume the implementation details.

Understand the existing architecture first.

After inspection, produce a short internal implementation plan and then execute it.

---

# STEP 2 — VERIFY ENVIRONMENT CONFIGURATION

Verify that the project correctly reads:

```env
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS=0x...
```

Requirements:

* Address must be a valid Ethereum address
* Do not expose private keys
* Do not create new private keys
* Do not hardcode the address anywhere
* Frontend and server should use the same configured contract address
* Ensure `.env.local` is ignored by Git
* Add a safe placeholder to `.env.local.example` if appropriate

Example:

```env
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS=
```

Do not put the real deployed address into `.env.local.example`.

---

# STEP 3 — VERIFY SEPOLIA NETWORK

Create or reuse the existing network configuration.

The Escrow system must explicitly use:

```text
Ethereum Sepolia
Chain ID: 11155111
```

Verify:

* MetaMask is connected to Sepolia
* Client chain matches Sepolia
* Server RPC is configured for Sepolia
* Contract address belongs to Sepolia
* Transaction verification rejects transactions from the wrong chain

Do not silently switch networks.

If the wallet is on the wrong network, show a clear UI state:

```text
Wrong Network

Please switch to Ethereum Sepolia.
[Switch Network]
```

Reuse the existing ChainPay network-switching behavior if it already exists.

---

# STEP 4 — CONTRACT ABI / CONFIGURATION

Locate the ABI currently used for:

```text
ChainPayEscrow.sol
```

If ABI generation already exists, reuse it.

Do NOT manually create an inaccurate ABI if an existing generated ABI is available.

Create a single reusable configuration if needed, for example:

```text
src/features/escrow/contract.ts
```

or the project's existing equivalent.

It should centralize:

* Contract address
* ABI
* Sepolia chain
* Contract metadata

Avoid duplicated contract configuration across components.

---

# STEP 5 — IMPLEMENT REAL ESCROW FUNDING

The Escrow form/detail flow must support a real on-chain funding transaction.

Expected flow:

```text
User opens Escrow
        ↓
Fund Escrow
        ↓
Validate wallet
        ↓
Validate Sepolia
        ↓
Validate amount
        ↓
Validate escrow state
        ↓
Prepare contract transaction
        ↓
MetaMask confirmation
        ↓
Transaction submitted
        ↓
txHash returned
        ↓
Show Pending state
        ↓
Server verifies transaction
        ↓
Contract event verified
        ↓
Database updated
```

Do NOT immediately mark:

```text
status = FUNDED
```

after:

```text
sendTransaction()
```

The transaction must first be verified.

---

# STEP 6 — SERVER-SIDE TRANSACTION VERIFICATION

This is the most important part of Phase 7.

Implement or reuse a server-side verification function.

It should verify at minimum:

### Transaction

* transaction exists
* transaction is mined
* transaction succeeded
* correct chain / Sepolia
* correct contract address
* expected sender
* expected value
* expected function / interaction where possible

### Receipt

Verify:

```text
receipt.status === success
```

### Contract Event

Verify the expected Escrow contract event.

Do not trust:

```text
frontend status
frontend amount
frontend txHash alone
```

The database must only become authoritative after blockchain verification.

---

# STEP 7 — VERIFY ESCROW EVENTS

Inspect the actual events emitted by:

```text
ChainPayEscrow.sol
```

Use those events as the source of truth for state transitions.

For example, depending on the actual contract implementation:

```text
EscrowCreated
EscrowFunded
MilestoneReleased
Refunded
Disputed
Resolved
```

Do NOT invent event names.

Use the exact events defined in the deployed contract/source.

Decode and verify event arguments where relevant.

For example:

```text
escrowId
client
freelancer
amount
milestoneId
```

must correspond to the expected database record.

---

# STEP 8 — DATABASE STATE MACHINE

Review the existing Escrow database schema.

Ensure the database can represent at least:

```text
DRAFT
PENDING
FUNDED
IN_PROGRESS
MILESTONE_SUBMITTED
PARTIALLY_RELEASED
COMPLETED
DISPUTED
REFUNDED
CANCELLED
FAILED
```

IMPORTANT:

Only use states that are compatible with the existing schema.

Do not unnecessarily redesign the schema.

If additional fields are genuinely required, make the smallest safe migration.

Recommended transaction-related fields if missing:

```text
fundingTxHash
fundingConfirmedAt
lastVerifiedBlock
```

For milestone transactions:

```text
releaseTxHash
releaseConfirmedAt
```

For refund:

```text
refundTxHash
refundConfirmedAt
```

Use the existing naming conventions if different.

---

# STEP 9 — IDEMPOTENCY

This is REQUIRED.

A user may:

* refresh the page
* click retry
* submit the same txHash again
* reopen the Escrow page
* reconnect the wallet

The server must not create duplicate state transitions.

For example:

```text
same txHash
      ↓
already verified
      ↓
return existing result
```

Do not release or refund the same milestone twice.

Use database constraints or server-side checks where appropriate.

---

# STEP 10 — MILESTONE RELEASE

Implement and verify the real milestone release flow.

Expected:

```text
Funded Escrow
      ↓
Milestone available
      ↓
Release Milestone
      ↓
Validate caller
      ↓
MetaMask
      ↓
Sepolia transaction
      ↓
Receipt
      ↓
Contract event
      ↓
Server verification
      ↓
Neon update
```

Verify:

* correct escrow
* correct milestone
* correct amount
* correct client
* correct freelancer
* milestone cannot be released twice
* released amount cannot exceed escrow balance

Do not trust frontend milestone amounts.

Read authoritative values from the database and/or contract as appropriate.

---

# STEP 11 — REFUND

Implement or verify the real refund flow based on the existing contract rules.

Expected:

```text
Eligible Escrow
      ↓
Refund
      ↓
MetaMask / contract authorization
      ↓
Sepolia
      ↓
Receipt
      ↓
Event verification
      ↓
Database update
```

Ensure:

* refund cannot exceed available escrow balance
* refund cannot happen after funds have already been released
* duplicate refunds are prevented
* database only changes after successful blockchain verification

---

# STEP 12 — DISPUTE

Verify the existing dispute flow.

The frontend should clearly communicate:

```text
Normal
→ Funded
→ Milestone
→ Release
```

versus:

```text
Disputed
→ Resolution
→ Release / Refund
```

Do not introduce centralized admin custody.

The contract must remain non-custodial according to its current rules.

---

# STEP 13 — ESCROW DETAIL PAGE

Improve the existing EscrowDetail UI only where necessary to make blockchain state clear.

Display:

```text
Contract Status
Blockchain Status
Funding Status
Milestone Progress
Total Amount
Released Amount
Remaining Amount
```

For transactions show:

```text
Pending
Confirmed
Failed
```

Provide a Sepolia explorer link for confirmed transactions.

Do not show fake confirmation states.

If transaction is pending:

```text
Transaction Pending

Waiting for Sepolia confirmation...
```

If failed:

```text
Transaction Failed

No funds were marked as confirmed.
```

If confirmed:

```text
Confirmed on Sepolia
```

---

# STEP 14 — ERROR HANDLING

Implement clear handling for:

### User rejects MetaMask

```text
Transaction cancelled by user.
```

### Wrong network

```text
Please switch to Ethereum Sepolia.
```

### Insufficient ETH

```text
Insufficient Sepolia ETH for this transaction.
```

### Transaction reverted

```text
The blockchain transaction failed.
```

### RPC failure

```text
Unable to verify the blockchain transaction.
Please try again.
```

### Invalid transaction

```text
Transaction verification failed.
```

### Contract mismatch

```text
The transaction does not match the expected ChainPay Escrow contract.
```

Never mark the database as confirmed when verification fails.

---

# STEP 15 — SECURITY REVIEW

Before considering Phase 7 complete, audit for:

* No private keys in frontend
* No private keys committed
* No hardcoded secrets
* No trusting frontend confirmation
* No arbitrary contract address from client input
* No arbitrary amount from untrusted request
* No unauthorized milestone release
* No duplicate transaction processing
* No duplicate milestone release
* No unauthorized refund
* Correct user ownership checks
* Correct wallet ownership checks
* Zod validation
* Server-side authorization
* Chain ID validation
* Contract address validation

Do not weaken existing authentication or authorization.

---

# STEP 16 — TESTING

Run all existing tests first.

Then run:

```bash
npm test
```

or the project's actual test command.

Run:

```bash
npm run lint
```

Run:

```bash
npm run build
```

Run contract tests:

```bash
npm run test:contract
```

if such a script exists.

If the project uses another existing command, use that instead.

Do not invent scripts unnecessarily.

---

# STEP 17 — E2E TEST MATRIX

Create a test checklist covering:

## Happy Path

```text
Create Escrow
→ Fund
→ Verify
→ Milestone 1
→ Release
→ Verify
→ Milestone 2
→ Release
→ Complete
```

## Refund

```text
Create
→ Fund
→ Refund
→ Verify
```

## Dispute

```text
Create
→ Fund
→ Dispute
→ Resolve
→ Verify
```

## Failure

```text
Wrong Network
Insufficient Balance
User Rejects
Reverted Transaction
Invalid txHash
Wrong Contract
Wrong Chain
Duplicate txHash
Duplicate Release
Unauthorized User
```

---

# STEP 18 — REAL SEPOLIA VERIFICATION

If the environment has a funded Sepolia wallet and the application is configured correctly, perform a real test transaction.

IMPORTANT:

Do not fake a successful transaction.

If an actual wallet confirmation is required, pause at the wallet interaction and clearly report what action is needed from the user.

After a real transaction is completed, verify:

```text
txHash
↓
Sepolia
↓
Contract Address
↓
Receipt
↓
Event
↓
Database
```

Record the result.

Do not expose private keys or sensitive secrets.

---

# STEP 19 — PRESERVE EXISTING FEATURES

After implementing Phase 7, verify that these still work:

```text
Google Login
Wallet Connection
Wallet Verification
Send ETH
Receive
Payment Request
QR Payment
Transaction History
Contacts
Wallet Management
Existing Dashboard
```

No regression is acceptable.

---

# STEP 20 — FINAL REPORT

When implementation is complete, provide a concise report containing:

## Files Changed

List every modified/created file.

## Blockchain

```text
Network: Ethereum Sepolia
Chain ID: 11155111
Contract: <configured address>
```

Do not print secrets.

## Implemented

List the completed Phase 7 features.

## Verification

Report:

```text
Contract configuration     PASS/FAIL
Sepolia network             PASS/FAIL
Funding                     PASS/FAIL
Receipt verification        PASS/FAIL
Event verification          PASS/FAIL
Database synchronization    PASS/FAIL
Milestone release           PASS/FAIL
Refund                      PASS/FAIL
Dispute                     PASS/FAIL
Idempotency                 PASS/FAIL
Security checks             PASS/FAIL
Build                       PASS/FAIL
Lint                        PASS/FAIL
Tests                       PASS/FAIL
```

## Real Transaction

If a real Sepolia transaction was executed, report only:

```text
Transaction Hash
Block Number
Contract Address
Status
```

Never report private keys, seed phrases, or secrets.

## Remaining Work

Clearly separate:

```text
Completed
Needs user action
Optional improvements
```

---

# FINAL QUALITY BAR

Do not stop after making the UI appear functional.

Phase 7 is complete only when the implementation establishes this trust boundary:

```text
Frontend
   ↓
User Intent
   ↓
MetaMask
   ↓
Ethereum Sepolia
   ↓
ChainPayEscrow.sol
   ↓
Receipt + Event Verification
   ↓
Next.js Server
   ↓
Neon PostgreSQL
   ↓
Authoritative Escrow State
```

The fundamental rule is:

> **Blockchain confirmation is the source of truth for financial settlement.**

Frontend state is only presentation state.

Do not claim Phase 7 is complete if only mock transactions, simulated state, or database-only updates work.

Start by auditing the existing implementation, then implement the smallest safe changes necessary to make the existing deployed Escrow contract fully usable and verifiable on Ethereum Sepolia.
