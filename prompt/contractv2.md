You are working inside the existing **ChainPay** repository.

Your task is to upgrade the current blockchain layer from the existing V1 contract to a new **ChainPay V2 smart contract**, integrate V2 throughout the entire application, preserve historical V1 transaction compatibility, prepare the contract for deployment through **Remix IDE on Ethereum Sepolia**, and update all relevant application, database, test, environment, and documentation files.

Do not create a second independent payment system.

The target architecture is:

```text
ChainPay V1
Legacy contract
Used only for historical transactions

        ↓ migration

ChainPay V2
Current active contract
Used for ALL new transactions
```

The application must expose only V2 for new payments.

V1 must remain supported internally where necessary for verifying or displaying historical transactions.

---

# 1. FIRST: INSPECT THE ENTIRE PROJECT

Before modifying anything, read and understand the existing repository.

At minimum inspect:

```text
README.md
document.md
package.json
.env.example

contracts/
src/
src/lib/
src/features/
src/db/
db/
tests/
scripts/
docs/
```

Pay special attention to:

```text
contracts/ChainPay.sol

docs/SMART_CONTRACT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md

src/lib/blockchain/
src/features/payment/
src/features/transaction/
src/db/schema.ts
```

Also search the entire repository for:

```text
ChainPay.sol
CHAINPAY_CONTRACT
CONTRACT_ADDRESS
ABI
PaymentCompleted
paymentId
writeContract
readContract
decodeEventLog
parseEventLogs
getTransaction
getTransactionReceipt
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS
```

Do NOT assume filenames or architecture.

Use the actual project structure.

Before changing code, understand:

- how V1 is currently called
- where its ABI is stored
- how paymentId is generated
- how transaction records are persisted
- how server-side blockchain verification works
- how payment requests interact with blockchain payments
- how public payment pages submit transactions
- how receipts are generated
- how tests currently mock or deploy ChainPay.sol

Preserve existing working functionality unless a V2 change requires an intentional migration.

---

# 2. DO NOT DELETE V1

Preserve the current V1 contract.

The final contract structure should preferably become:

```text
contracts/
├── legacy/
│   └── ChainPayV1.sol
└── ChainPayV2.sol
```

If moving the old contract would cause unnecessary test/import breakage, it is acceptable to retain:

```text
contracts/
├── ChainPay.sol
└── ChainPayV2.sol
```

where:

```text
ChainPay.sol = V1 legacy
ChainPayV2.sol = current production-oriented version
```

Do not overwrite the old V1 source and pretend it was always V2.

Smart contracts already deployed on Ethereum are immutable.

V2 must be deployed as a new contract with a new address.

---

# 3. CREATE CHAINPAY V2

Create:

```text
contracts/ChainPayV2.sol
```

Use the Solidity version compatible with the existing project/compiler.

Do not introduce unnecessary dependencies merely to make the contract look more complex.

The contract should remain focused on blockchain settlement.

Application identity, customer profiles, emails, notes, merchant profile information, Firebase data, database records, private descriptions, and other application metadata must remain off-chain.

ChainPayV2 should consolidate the blockchain payment functionality that belongs logically to the ChainPay payment protocol.

Use the existing ChainPay.sol and current application requirements as the source of truth.

At minimum, V2 must preserve the existing fundamental payment flow:

```solidity
pay(
    bytes32 paymentId,
    address payable merchant
)
```

with ETH supplied through:

```solidity
msg.value
```

The exact interface may be improved only when the application integration is also updated correctly.

V2 must support:

```text
payer
merchant / receiver
paymentId
ETH amount
timestamp
verifiable blockchain event
```

Maintain or improve a clear event similar to:

```solidity
event PaymentCompleted(
    bytes32 indexed paymentId,
    address indexed payer,
    address indexed merchant,
    uint256 amount,
    uint256 timestamp
);
```

Use meaningful custom errors where appropriate instead of large revert strings.

Examples may include concepts such as:

```text
ZeroAmount
InvalidMerchant
TransferFailed
InvalidPaymentId
```

Only include errors actually needed by the implementation.

---

# 4. V2 SECURITY

Review the existing contract for security issues before implementing V2.

At minimum validate:

```text
msg.value > 0
merchant != address(0)
merchant != address(this)
valid paymentId
```

Consider whether paying yourself should be allowed or rejected based on existing ChainPay behavior.

Do not silently change business semantics.

Use safe ETH transfer logic.

Avoid:

```solidity
transfer()
```

if the project's target Solidity/EVM approach makes low-level `call` more appropriate.

If ETH is forwarded using:

```solidity
(bool success, ) = merchant.call{value: msg.value}("");
```

handle failure safely.

Follow checks-effects-interactions where applicable.

Analyze reentrancy risk.

Do not add OpenZeppelin ReentrancyGuard automatically unless it is genuinely justified.

If no persistent state is modified before/after the external call and reentrancy cannot create a meaningful exploit, keep the implementation minimal and explain the reasoning in documentation/tests.

Do not add:

```text
owner withdrawals
admin custody
private keys
upgrade proxy
arbitrary admin fund movement
```

unless the existing product specification explicitly requires them.

ChainPay must remain non-custodial.

---

# 5. PAYMENT ID / DUPLICATE PAYMENT DESIGN

Inspect how `paymentId` is used by the current application.

Determine whether V2 should enforce one successful blockchain payment per paymentId.

Do NOT blindly add:

```solidity
mapping(bytes32 => bool) usedPaymentIds;
```

without checking application behavior.

Consider legitimate cases such as:

```text
failed transaction retry
late payment
payment request retry
multiple independent payments
manual direct payment
```

If the existing ChainPay application defines payment IDs as one-time invoice/request identifiers and duplicate blockchain settlement must be prevented, implement duplicate protection safely.

If the current architecture intentionally records late/duplicate payments for reconciliation, preserve that behavior instead.

Document the decision.

Never silently change the meaning of paymentId.

---

# 6. CONTRACT VERSION IDENTIFICATION

Add a simple reliable way for tooling/tests to identify the contract as V2.

For example, if appropriate:

```solidity
function version() external pure returns (uint256) {
    return 2;
}
```

or an equivalent constant.

Do not add unnecessary storage just for this.

---

# 7. REMIX IDE COMPATIBILITY

`ChainPayV2.sol` must be easy to deploy manually using Remix IDE.

Prefer a self-contained contract where practical.

Avoid project-local Solidity imports that Remix cannot resolve automatically.

If an external dependency is absolutely necessary, make sure it works correctly in Remix and document exactly how to compile it.

The intended deployment flow is:

```text
Remix IDE
    ↓
Compile ChainPayV2.sol
    ↓
Injected Provider - MetaMask
    ↓
Ethereum Sepolia
    ↓
Deploy
    ↓
New V2 contract address
```

Do not introduce constructor arguments unless V2 genuinely needs them.

If constructor parameters exist, document them clearly.

---

# 8. ABI MANAGEMENT

Generate/update the application ABI for ChainPayV2.

Locate the existing ABI/config implementation and refactor it cleanly.

The application must use the V2 ABI for all NEW transactions.

Do not leave duplicated hard-coded ABI fragments scattered through React components or server routes.

Create or maintain one canonical blockchain contract configuration layer.

For example conceptually:

```text
src/lib/blockchain/
├── contracts.ts
├── chainpay-v1-abi.ts
└── chainpay-v2-abi.ts
```

Use the project's actual conventions.

V1 ABI should remain available only where historical transaction verification requires it.

V2 ABI becomes the active ABI.

---

# 9. CONTRACT REGISTRY

Introduce a clean contract-version registry if appropriate.

Conceptually:

```ts
const CHAINPAY_CONTRACTS = {
  1: {
    version: 1,
    address: V1_ADDRESS,
    abi: chainPayV1Abi,
  },

  2: {
    version: 2,
    address: CURRENT_ADDRESS,
    abi: chainPayV2Abi,
  },
};
```

Do not force the browser to choose V1 or V2.

Frontend behavior must simply be:

```text
New transaction
       ↓
ChainPay V2
```

The registry mainly exists for server-side/history compatibility.

---

# 10. ENVIRONMENT VARIABLES

Update `.env.example`.

The current active contract should remain configurable through:

```env
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS=
```

Add an explicit contract version if useful:

```env
NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION=2
```

For historical V1 verification, add something like:

```env
CHAINPAY_V1_CONTRACT_ADDRESS=
```

This should preferably be server-only unless the browser genuinely requires it.

Never put:

```text
private keys
seed phrases
deployment wallet private keys
```

into environment files.

Remix + MetaMask must perform deployment.

The repository must not store a deployer private key.

---

# 11. UPDATE ALL FRONTEND PAYMENT FLOWS

Search all V1 contract calls and migrate current payment execution to V2.

This includes potentially:

```text
/pay
payment review
public /p/[slug] payment
request payment
QR payment destination flow
transaction confirmation
receipt
activity/history
```

Use the actual routes/components found in the project.

New payments must always use:

```text
ChainPay V2 address
+
ChainPay V2 ABI
```

The user must NOT see a selector such as:

```text
Use V1
Use V2
```

V2 is simply ChainPay's current payment contract.

---

# 12. SERVER-SIDE BLOCKCHAIN VERIFICATION

This part is critical.

Inspect the existing server transaction verification.

Update it so newly submitted V2 transactions are verified against:

```text
correct chain ID
expected V2 contract address
transaction sender
transaction target
ETH value
expected calldata
paymentId
merchant
transaction receipt status
PaymentCompleted event
block number
confirmation count
```

Never trust browser-reported payment success.

The browser may submit:

```text
txHash
paymentId
```

but the server must independently obtain and verify the Ethereum transaction and receipt.

Do not mark a transaction confirmed simply because MetaMask returned a hash.

Preserve the existing confirmation policy unless there is a strong reason to change it.

---

# 13. KEEP V1 HISTORICAL VERIFICATION

Existing V1 transactions must not become unreadable after V2 deployment.

When loading/verifying an old transaction, the application should determine which contract version produced it.

Conceptually:

```text
Historical transaction
       ↓
contractVersion = 1
       ↓
V1 address + V1 ABI

New transaction
       ↓
contractVersion = 2
       ↓
V2 address + V2 ABI
```

Do not send any new payments to V1.

V1 becomes read/verification-only legacy infrastructure.

---

# 14. DATABASE MIGRATION — NEON IS ALREADY DEPLOYED

The production/staging Neon database may already contain real ChainPay application records.

DO NOT:

```text
drop tables
reset the database
delete transaction history
replace production schema from scratch
```

Create a backward-compatible Drizzle migration.

Inspect the existing `transactions` schema.

Add appropriate fields such as:

```text
contract_address
contract_version
```

Use naming conventions consistent with the existing schema.

Recommended concept:

```text
contract_address TEXT
contract_version INTEGER
```

For new transactions:

```text
contract_address = active V2 address
contract_version = 2
```

For old records:

```text
contract_version = 1
contract_address = historical V1 address
```

However, DO NOT invent the historical V1 contract address.

If it is not available in the repository, environment, database, or documentation, create a safe migration/backfill procedure requiring the operator to supply it.

Because Neon may already contain records, migration order must be safe.

For example:

```text
1. Add compatible columns
2. Backfill historical rows safely
3. Update application write path
4. Update application read/verification path
5. Add stricter constraints only when existing data satisfies them
```

Do not create a migration that fails because existing rows cannot satisfy a new NOT NULL constraint.

If a two-step migration is needed, implement/document it.

---

# 15. TRANSACTION CREATION

Whenever ChainPay creates a new pending transaction record after V2 submission, persist:

```text
tx hash
chain ID
contract address
contract version = 2
sender
expected merchant/recipient
amount
payment request relation if any
payment ID if applicable
pending status
submission timestamp
```

Use the actual schema architecture rather than duplicating data unnecessarily.

---

# 16. RECEIPTS AND ACTIVITY

Update receipt/detail/history code so historical V1 and new V2 records both work.

Users should NOT normally see technical contract version details.

The normal UI remains simple.

Advanced transaction details may optionally expose something like:

```text
Protocol: ChainPay V2
Contract: 0x....
```

only if it fits the current UX.

Do not clutter primary payment UX with blockchain implementation details.

---

# 17. TESTS

Update existing automated tests instead of deleting or bypassing them.

Add V2 contract tests covering at least:

```text
successful ETH payment
event correctness
paymentId
payer
merchant
amount
timestamp
zero-value rejection
zero-address merchant rejection
ETH forwarding
failed receiver behavior where testable
contract version
any duplicate-payment behavior if implemented
```

Also update server verification tests for:

```text
correct V2 contract
wrong contract address
wrong chain
wrong sender
wrong merchant
wrong amount
wrong paymentId
failed receipt
missing expected event
duplicate transaction processing
```

Preserve V1 historical compatibility tests where meaningful.

Tests must use an isolated local EVM/testing environment.

Do not require real Sepolia ETH for automated tests.

---

# 18. BUILD / QUALITY CHECKS

After implementation run the project's actual checks.

At minimum, when available:

```bash
npm run contract:compile
npm run lint
npm run typecheck
npm test
npm run build
```

Also run relevant E2E tests if they can run in the current environment.

Do not claim tests passed unless they actually ran successfully.

Fix application-caused errors rather than suppressing them.

---

# 19. UPDATE DOCUMENTATION

Update:

```text
README.md
document.md
docs/SMART_CONTRACT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
.env.example
```

only where relevant.

Clearly document:

```text
ChainPay V1 = legacy
ChainPay V2 = active
```

Explain why V1 remains available:

```text
historical verification
old receipts
old blockchain transactions
```

Explain that all new payments use V2.

Do not present V1 as an active payment option.

---

# 20. CREATE A DEDICATED V2 DEPLOYMENT GUIDE

Create:

```text
docs/SMART_CONTRACT_V2_DEPLOYMENT.md
```

It must contain a clear step-by-step deployment process for Remix IDE.

Include:

```text
1. Open Remix IDE
2. Create/open ChainPayV2.sol
3. Select the exact compiler version
4. Compile with the correct settings
5. Connect MetaMask
6. Switch MetaMask to Ethereum Sepolia
7. Select Injected Provider / browser wallet
8. Confirm deployer account
9. Deploy ChainPayV2
10. Confirm the deployment transaction in MetaMask
11. Wait for confirmation
12. Copy the V2 contract address
13. Verify deployment information
14. Perform a small Sepolia test payment
15. Confirm PaymentCompleted event
```

If Remix terminology has changed, use the terminology appropriate to the current workflow used by the project, while keeping the guide clear.

Never request or store the MetaMask private key.

---

# 21. POST-DEPLOY CONFIGURATION GUIDE

In the same deployment document, create a section:

```text
After ChainPayV2 is deployed
```

Explain exactly what the developer must manually change.

Assume:

```text
Frontend is already deployed on Vercel
Database is already deployed on Neon
Firebase authentication is already configured
```

The required workflow should be roughly:

```text
Deploy V2 on Sepolia
       ↓
Copy V2 contract address
       ↓
Configure Neon migration/backfill
       ↓
Update Vercel environment variables
       ↓
Redeploy Vercel
       ↓
Run smoke tests
```

---

# 22. VERCEL INSTRUCTIONS

Because the frontend/application is already deployed on Vercel, document which environment variables must be changed there.

At minimum:

```env
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS=<NEW_V2_ADDRESS>
NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION=2
CHAINPAY_V1_CONTRACT_ADDRESS=<OLD_V1_ADDRESS>
```

Only include variables actually implemented by the final code.

Explain clearly:

`NEXT_PUBLIC_*` values are embedded into the client bundle, therefore after changing the active contract address the Vercel application MUST be redeployed.

Do not tell the operator to change Firebase keys, Neon credentials, or unrelated settings unless the code change actually requires it.

After redeployment test:

```text
login
wallet connect
wallet verification
create request
public payment page
payment review
Sepolia payment
pending transaction
server verification
confirmed receipt
activity/history
old V1 transaction detail
new V2 transaction detail
```

---

# 23. NEON INSTRUCTIONS

Create a clear section for an already-running Neon database.

Explain:

```text
DO NOT create a new Neon project.
DO NOT delete production data.
DO NOT reset migrations.
```

The operator should only apply the new versioned migration.

Provide the exact project command after inspecting `package.json`.

Likely:

```bash
npm run db:migrate
```

but use the real command from the repository.

Explain any historical V1 backfill step.

If an old V1 contract address is required, document exactly where the developer must provide it.

If SQL must be executed manually, generate a safe SQL file or documented command.

Never embed a guessed V1 address.

---

# 24. DEPLOYMENT SAFETY

Before V2 becomes active, make sure:

```text
V2 compiles
contract unit tests pass
application tests pass
database migration succeeds
V1 historical records remain readable
V2 server verification works
V2 contract address is correct
chain ID is Ethereum Sepolia 11155111
```

New payments must not become available if contract configuration is invalid.

Use clear configuration errors.

Do not silently fall back to V1.

---

# 25. NO AUTOMATIC PRODUCTION DEPLOYMENT

You may modify the repository and create deployment instructions.

Do NOT:

```text
deploy the Solidity contract automatically
submit blockchain transactions
change Vercel production variables automatically
modify the live Neon database automatically
```

unless the environment explicitly provides authorized tooling and the operator has specifically requested execution.

Prepare everything so the developer can perform these deployment actions safely.

---

# 26. FINAL ARCHITECTURE

The intended final architecture is:

```text
                         ChainPay Application
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
     New Transactions                      Historical Data
             │                                     │
             ▼                                     ▼
      ChainPay V2                              Contract Registry
      ACTIVE                                    │
      Sepolia                                   ├── V1 ABI/address
             │                                  └── V2 ABI/address
             ▼
      PaymentCompleted
             │
             ▼
      Server Verification
             │
             ▼
        Neon PostgreSQL
             │
             ▼
        Receipt / Activity
```

V1 must NEVER be selected for new payment execution.

---

# 27. IMPORTANT DESIGN PRINCIPLE

Do not put application features into Solidity simply because this is called V2.

Keep on-chain only the parts that benefit from Ethereum settlement or verification.

Keep these off-chain in Neon/application infrastructure:

```text
Google identity
Firebase UID
user profile
email
contacts
private notes
payment descriptions
merchant profile metadata
UI settings
search/filter metadata
application audit metadata
```

The blockchain should remain the settlement and verification layer.

ChainPay remains the product layer.

---

# 28. DELIVERABLES

At the end, provide a concise implementation report containing:

```text
Files created
Files modified
V2 contract design
Security decisions
ABI/config changes
Database migration
Historical V1 compatibility
Tests added/updated
Test results
Remix deployment steps
Neon changes required
Vercel environment changes required
Post-deployment smoke test
Any manual values still required
```

Clearly identify manual placeholders such as:

```text
<V1_CONTRACT_ADDRESS>
<V2_CONTRACT_ADDRESS_AFTER_DEPLOY>
```

Never invent blockchain addresses.

If you encounter an architectural conflict between this instruction and the existing working project, preserve data and security first, then choose the least disruptive production-quality solution and document the reason.

The final result must leave ChainPay in this state:

```text
V1 = immutable legacy contract
V2 = sole active contract for all new ChainPay payments
Neon = preserves old + new transaction history
Server = can verify correct contract version
Frontend = transparently uses V2
Remix = ready for manual Sepolia deployment
Vercel = ready to receive new V2 address
```