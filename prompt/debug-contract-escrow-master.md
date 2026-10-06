# ChainPay Escrow — Master End-to-End Stability & Data Consistency Fix

You are working on the existing **ChainPay V2 + ChainPay Escrow** production-oriented application.

Use **agy cli 3.1 pro** capabilities to perform a complete end-to-end engineering pass.

This is NOT a request for a quick patch.

You must:

```text
ANALYZE
→ REPRODUCE
→ IDENTIFY ROOT CAUSE
→ DESIGN THE CORRECT FIX
→ IMPLEMENT
→ TEST
→ VERIFY
→ REGRESSION TEST
→ REPORT
```

The goal is to make the Escrow system **stable, data-consistent, responsive, recoverable, and reliable without requiring manual browser reloads**.

Do not stop after fixing the visible symptom.

---

# 0. Current Critical Problems

There are currently TWO confirmed production/runtime problems.

---

## PROBLEM 1 — Escrow ETH Amount Displays 0

The Client creates an Escrow and specifies milestone amounts in ETH.

For example:

```text
Milestone 1 = 0.001 ETH
Milestone 2 = 0.002 ETH
Milestone 3 = 0.003 ETH

Total = 0.006 ETH
```

But when viewing the Escrow detail / milestone information, the ETH amount currently displays:

```text
0 ETH
```

or equivalent zero values.

This is incorrect.

The amount entered by the Client must be preserved and displayed correctly.

---

# PROBLEM 2 — Freelancer Submit Work Shows Error Until Browser Reload

When the Freelancer submits work:

```text
Freelancer
→ Submit Work
```

the UI currently behaves incorrectly.

Observed behavior:

```text
Click Submit Work
↓
Error alert appears
↓
UI does not immediately update
↓
User must manually reload browser
↓
After reload, the submission/state is actually updated
```

The desired behavior is:

```text
Click Submit Work
↓
Button immediately locks
↓
Loading state appears
↓
API completes
↓
Success
↓
Escrow data automatically refreshes
↓
Milestone immediately becomes SUBMITTED
↓
Submission appears
↓
No manual browser reload
```

The system must be able to recover and synchronize itself automatically.

---

# 1. NON-NEGOTIABLE ENGINEERING RULES

Before changing anything:

## DO NOT:

* blindly patch the UI
* add arbitrary `setTimeout`
* add arbitrary delays
* hide errors
* suppress alerts
* force reload the entire browser
* use `window.location.reload()` as the primary solution
* fake ETH values
* convert blockchain values using floating-point arithmetic
* mark blockchain states as successful without verification
* deploy another Escrow contract
* replace the existing architecture
* introduce another state-management library unnecessarily
* introduce another i18n library
* rewrite unrelated features
* redesign the whole application

## MUST:

* inspect the existing architecture
* reproduce both bugs
* identify the real root cause
* trace data from database → API → client → UI
* trace transaction/state synchronization
* fix the underlying cause
* preserve existing ChainPay architecture
* preserve the existing deployed `ChainPayEscrow.sol`
* preserve Thai/English i18n
* preserve the current UI/design system
* add proper loading/success/error/recovery states
* invalidate/refetch React Query data correctly
* verify actual DB state
* verify blockchain values independently
* add regression tests
* perform manual end-to-end verification

---

# 2. EXISTING ARCHITECTURE

Do not assume a different architecture.

Audit the existing implementation first.

Current system uses:

```text
Next.js App Router
Firebase Authentication
Neon PostgreSQL
Drizzle ORM
Ethereum Sepolia
MetaMask
Wagmi
Viem
Existing Thai/English i18n
Existing ChainPay design system
Existing ChainPayEscrow.sol
```

Existing Escrow architecture includes:

```text
Client
Freelancer
Escrow
Milestones
Work Submission
Smart Contract
Blockchain Verification
```

The blockchain remains the authoritative settlement layer.

Database stores application state only after appropriate validation/verification.

---

# 3. PHASE 1 — COMPLETE REPOSITORY AUDIT

Before editing files, inspect the entire relevant Escrow implementation.

Audit at minimum:

```text
src/components/escrow/
src/features/escrow/
src/app/api/
src/db/
src/lib/
src/i18n/
contracts/
tests/
```

Specifically locate:

```text
Escrow detail component
Escrow creation form
Escrow server functions
Escrow API routes
Milestone schema
Escrow schema
Submission schema
Wallet schema
Client API helper
React Query hooks
Mutation functions
Query keys
Blockchain utility functions
ETH/Wei conversion utilities
Smart contract ABI
Transaction verification functions
```

Create an internal dependency map before making changes:

```text
UI
 ↓
Client API
 ↓
API Route
 ↓
Server Function
 ↓
Drizzle
 ↓
PostgreSQL

and

UI
 ↓
Wagmi/Viem
 ↓
MetaMask
 ↓
Sepolia
 ↓
Receipt/Event
 ↓
Backend Verification
 ↓
Database
 ↓
React Query Refresh
 ↓
UI
```

Do not modify anything until the problematic paths are understood.

---

# 4. PHASE 2 — REPRODUCE PROBLEM #1

Use an existing Escrow or create a controlled test Escrow.

Use milestone values:

```text
0.001 ETH
0.002 ETH
0.003 ETH
```

Expected:

```text
Total = 0.006 ETH
```

Inspect every stage.

---

# 5. ETH AMOUNT DATA FLOW AUDIT

Trace the amount through:

```text
Escrow Form
↓
Form State
↓
Validation
↓
parseEther()
↓
API payload
↓
Database
↓
GET /api/escrows/:id
↓
Server response
↓
client-api.ts
↓
EscrowModel
↓
escrow-detail.tsx
↓
ETH display
```

Determine EXACTLY where the value becomes `0`.

Do not guess.

---

# 6. VERIFY DATABASE AMOUNT

Inspect the actual PostgreSQL database.

Determine the stored value for:

```text
escrows.totalAmount
escrowMilestones.amount
```

Compare:

### Expected

```text
0.001 ETH
→ 1000000000000000 Wei

0.002 ETH
→ 2000000000000000 Wei

0.003 ETH
→ 3000000000000000 Wei

Total
→ 6000000000000000 Wei
```

Database values must preserve exact blockchain values.

Prefer string / numeric representation appropriate to the existing schema.

Never use JavaScript floating point for Wei.

---

# 7. VERIFY API RESPONSE

Inspect:

```text
GET /api/escrows/:id
```

Capture the actual JSON response.

Verify whether the API returns:

```json
{
  "totalAmount": "...",
  "milestones": [
    {
      "amount": "..."
    }
  ]
}
```

Determine whether the API is returning:

```text
correct Wei
```

or:

```text
0
```

or:

```text
undefined
```

or:

```text
wrong field name
```

or:

```text
BigInt serialization problem
```

or another incorrect representation.

---

# 8. VERIFY TYPES / MODELS

Audit:

```text
EscrowModel
EscrowMilestoneModel
Database schema
API response type
Frontend type
```

Make sure the amount field has one consistent semantic meaning.

For example:

```text
amount = Wei string
```

or whatever convention the existing application uses.

Do NOT allow one layer to interpret the same field as:

```text
ETH
```

while another interprets it as:

```text
Wei
```

---

# 9. VERIFY ETH DISPLAY

Frontend must convert:

```text
Wei
→ ETH
```

only for display.

Use the existing Viem utility:

```text
formatEther()
```

or the existing ChainPay amount formatter if one already exists.

Example:

```text
6000000000000000 Wei
→ 0.006 ETH
```

Milestones:

```text
1000000000000000
→ 0.001 ETH

2000000000000000
→ 0.002 ETH

3000000000000000
→ 0.003 ETH
```

Do NOT do:

```ts
Number(wei) / 1e18
```

for blockchain-critical calculations.

Do not introduce floating-point rounding errors.

---

# 10. VERIFY SMART CONTRACT AMOUNT

For funded Escrows, verify that the amount displayed by the application is consistent with the amount expected by the deployed contract.

Do not change the contract.

Do not deploy another contract.

Do not change the contract address.

If necessary, read the existing contract state from Sepolia and compare:

```text
Database amount
vs
API amount
vs
UI amount
vs
Smart Contract amount
```

If these differ, identify which layer is wrong.

---

# 11. PHASE 3 — REPRODUCE PROBLEM #2

Use:

```text
Browser A = Freelancer
Browser B = Client
```

Freelancer:

```text
Open Escrow
↓
Open milestone
↓
Submit Work
```

Observe:

* button state
* network request
* response
* toast/alert
* React Query state
* UI state
* milestone status
* submission record
* browser console
* server terminal

---

# 12. SUBMIT WORK — FULL ASYNC AUDIT

Trace:

```text
Submit button
↓
submitWork handler
↓
busy lock
↓
React Query mutation
↓
client-api.ts
↓
POST /api/escrows/:id/milestones/:milestoneId/submit
↓
authentication
↓
authorization
↓
database transaction
↓
submission insert
↓
milestone status update
↓
API response
↓
mutation success
↓
query invalidation
↓
refetch
↓
UI update
```

Identify EXACTLY why:

```text
backend succeeds
but UI still shows an error/stale state
```

if that is what is happening.

---

# 13. CHECK FOR DUPLICATE REQUESTS

Verify that one click creates exactly one HTTP request.

Inspect:

```text
onClick
onSubmit
mutation.mutate
mutation.mutateAsync
form handler
button type
```

Ensure no duplicate request path exists.

The synchronous busy lock must remain.

Expected:

```text
First click
→ lock immediately
→ one request
→ no duplicate
```

---

# 14. CHECK API RESPONSE CONTRACT

Verify the frontend expects the same response shape the backend returns.

For example, if the backend returns:

```json
{
  "success": true,
  "submission": {...}
}
```

but frontend expects:

```json
{
  "data": {...}
}
```

fix the contract.

Do not hide the mismatch with defensive hacks.

---

# 15. CHECK HTTP STATUS HANDLING

Verify:

```text
2xx
```

is treated as success.

Verify errors:

```text
400
401
403
404
409
500
```

are handled correctly.

A successful backend operation must never be interpreted as an error because of:

* wrong response parsing
* empty response
* incorrect JSON handling
* wrong status check
* timeout
* AbortController
* stale mutation state

---

# 16. CHECK DATABASE TRANSACTION

The Submit Work operation should update related database state atomically if the existing architecture supports it.

Conceptually:

```text
BEGIN
    insert submission
    update milestone → SUBMITTED
COMMIT
```

If the submission succeeds but milestone update fails, or vice versa, do not leave inconsistent state.

Use the existing Drizzle transaction approach where appropriate.

Do not introduce unnecessary architectural complexity.

---

# 17. AUTOMATIC UI RESET / REFRESH

This is CRITICAL.

After successful Submit Work:

```text
mutation success
↓
invalidate relevant escrow query
↓
refetch latest escrow
↓
update UI automatically
```

Do NOT require:

```text
window.location.reload()
```

Do NOT ask the user to manually refresh.

Find the exact query key used by:

```text
GET /api/escrows/:id
```

and invalidate the correct key.

For example, if the existing query is conceptually:

```text
['escrow', escrowId]
```

then invalidate THAT query.

Do not invalidate random queries.

---

# 18. IMPORTANT — RESET LOCAL UI STATE

After successful Submit Work:

```text
submission form
```

must reset correctly.

Expected:

```text
Title input → cleared or replaced by submitted view
Description → cleared or replaced
Evidence URL → cleared or replaced
busy → false
error → cleared
success → handled
```

But do not clear useful form state if submission fails.

Correct:

```text
Success → reset UI
Failure → preserve user input where appropriate
```

---

# 19. HANDLE MUTATION LIFECYCLE CORRECTLY

Use a deterministic mutation lifecycle:

```text
idle
↓
submitting
↓
success
↓
refetching
↓
synced
```

Error:

```text
idle
↓
submitting
↓
failure
↓
busy=false
↓
show error
↓
allow retry
```

Never leave:

```text
busy=true
```

after a failed request.

Use `finally` or the React Query lifecycle appropriately.

---

# 20. APPROVE & RELEASE REGRESSION AUDIT

Do NOT break the previously fixed MetaMask flow.

The existing requirement is:

```text
Client click
↓
MetaMask transaction request
↓
User confirms
↓
transaction hash
↓
backend verification
↓
database update
```

Verify that the new changes do not regress this.

---

# 21. BLOCKCHAIN STATE MUST REMAIN AUTHORITATIVE

For release:

```text
MetaMask
↓
Sepolia
↓
transaction receipt
↓
PaymentReleased event
↓
backend verification
↓
DB = RELEASED
```

Never:

```text
DB = RELEASED
```

before blockchain confirmation.

---

# 22. AUTOMATIC REFRESH AFTER APPROVAL / RELEASE

After successful release:

```text
transaction confirmed
↓
backend verifies
↓
invalidate escrow query
↓
refetch
↓
UI shows RELEASED
```

No manual reload.

---

# 23. HANDLE WALLET REJECTION

Test:

```text
Approve & Release
↓
MetaMask opens
↓
User Rejects
```

Expected:

```text
No RELEASED state
No false success
busy resets
Retry remains possible
Clear localized error
```

---

# 24. HANDLE TRANSACTION FAILURE

Test:

```text
transaction submitted
↓
transaction fails/reverts
```

Expected:

```text
DB not falsely marked RELEASED
UI explains failure
Retry possible if safe
```

---

# 25. HANDLE NETWORK / RPC DELAY

Do not interpret temporary blockchain latency as immediate failure.

Display meaningful states:

```text
Preparing transaction...
Waiting for MetaMask...
Confirming transaction...
Verifying blockchain...
Updating Escrow...
Completed
```

Use existing UI design system.

No excessive spinners or AI-looking UI.

---

# 26. QUERY CACHE AUDIT

Audit all Escrow React Query keys.

Find:

```text
Escrow detail query
Escrow list query
Milestone query
Submission query
```

Ensure mutations invalidate the correct related data.

Potentially:

```text
Submit Work
→ invalidate escrow detail

Approve
→ invalidate escrow detail

Release
→ invalidate escrow detail
→ invalidate escrow list if status appears there
```

Do not over-invalidate the entire application.

---

# 27. SERVER CACHE / NEXT.JS CACHE AUDIT

Determine whether Next.js server caching, fetch caching, route caching, or other caching causes stale Escrow responses.

The Escrow detail endpoint must return current application state.

If the route is unintentionally cached, fix the actual caching behavior.

Do not add random cache-busting query parameters.

---

# 28. CONCURRENCY / RACE CONDITION AUDIT

Test:

```text
User clicks Submit twice quickly
```

Expected:

```text
Exactly one submission
```

Test:

```text
Client clicks Approve twice quickly
```

Expected:

```text
Exactly one valid transition
```

Test:

```text
Two tabs open
```

Ensure stale state does not allow invalid state transitions.

Server-side authorization/state validation remains authoritative.

---

# 29. ERROR RECOVERY REQUIREMENT

The system must recover automatically from transient problems where safe.

For example:

```text
API success
but refetch temporarily fails
```

should NOT tell the user:

```text
Submit failed
```

if the mutation itself succeeded.

Instead:

```text
Submission successful
Refreshing Escrow...
```

and retry/refetch appropriately using the existing query mechanism.

Do not blindly repeat mutation requests.

IMPORTANT:

```text
Retry GET/refetch = potentially safe
Retry POST mutation = NOT automatically safe
```

unless the operation is explicitly idempotent.

---

# 30. IDEMPOTENCY

Audit whether Submit Work can accidentally create duplicate submissions.

If the business rule is:

```text
one active submission per milestone
```

enforce it at the server/database layer.

Frontend protection alone is not enough.

If an existing submission already exists, return a proper conflict/validation response rather than creating duplicates.

---

# 31. DATA CONSISTENCY MATRIX

Create and verify this matrix:

| Layer              | Expected         |
| ------------------ | ---------------- |
| Form               | ETH input        |
| API create payload | exact Wei        |
| Database           | exact Wei        |
| GET API            | exact Wei string |
| Frontend model     | exact Wei string |
| Display            | formatted ETH    |
| Smart Contract     | exact Wei        |
| Transaction        | exact Wei        |
| Receipt/Event      | exact Wei        |
| Final UI           | formatted ETH    |

No layer may silently convert blockchain amounts to floating point.

---

# 32. UI STATE MATRIX

Verify:

| Action  | Backend            | Blockchain                             | UI                        |
| ------- | ------------------ | -------------------------------------- | ------------------------- |
| Create  | created            | none                                   | created                   |
| Fund    | pending            | transaction                            | funded after verification |
| Submit  | submission created | none                                   | SUBMITTED                 |
| Approve | approval           | none/according to current architecture | APPROVED                  |
| Release | verified           | transaction                            | RELEASED                  |

Make sure the UI does not display a stronger state than what has actually been verified.

---

# 33. ACCESS CONTROL REGRESSION

Verify:

### Freelancer

Can:

```text
Submit Work
```

Cannot:

```text
Approve
Release
Refund
```

according to existing business rules.

### Client

Can:

```text
Fund
Review
Approve
Release
Dispute
Refund
```

according to the existing state rules.

Do not rely only on hidden buttons.

Backend authorization must remain enforced.

---

# 34. INTERNATIONALIZATION

Any new or modified messages must use the existing Thai/English i18n system.

Do not hardcode new UI messages in only one language.

Check:

```text
Thai
English
```

for:

* loading
* success
* error
* retry
* submission
* release
* transaction status

---

# 35. ACCESSIBILITY

Ensure loading/disabled states are accessible.

Buttons should communicate:

```text
disabled
loading
current action
```

Do not make users guess whether their click worked.

---

# 36. PERFORMANCE

Measure the Submit Work request.

Target:

```text
No unnecessary blockchain/RPC operations
No unnecessary repeated database queries
No duplicate requests
No unnecessary full-page reload
```

If DB connection initialization is responsible for a ~1.5–1.8 second cold-start delay, do not hide it with fake UI delays.

Document it and ensure the UI handles it correctly.

---

# 37. TEST PLAN

Create/update automated tests.

## Unit Tests

Test:

```text
Wei → ETH formatting
ETH → Wei conversion
amount serialization
null submission handling
mutation state handling
```

---

## API Tests

Test:

```text
GET escrow
POST submit
POST approve
```

Verify:

```text
status code
response shape
authorization
state transitions
duplicate handling
```

---

## Database Tests

Verify:

```text
amount stored correctly
submission stored correctly
milestone state updated correctly
transaction consistency
```

---

## EVM Tests

Preserve existing EVM tests.

Verify:

```text
fund
release
refund
dispute
PaymentReleased
```

---

## Playwright / E2E Tests

At minimum:

### Test 1

```text
Client creates Escrow
→ amounts display correctly
```

### Test 2

```text
Freelancer submits work
→ UI updates without browser reload
```

### Test 3

```text
Client reviews submission
```

### Test 4

```text
Client approves/releases
→ MetaMask flow
→ blockchain confirmation
→ UI updates
```

---

# 38. MANUAL END-TO-END TEST

Do not rely only on automated tests.

Perform a real manual test using two accounts.

## Client

Create:

```text
Milestone 1 = 0.001 ETH
Milestone 2 = 0.002 ETH
Milestone 3 = 0.003 ETH
```

Verify UI immediately shows:

```text
0.001 ETH
0.002 ETH
0.003 ETH

Total:
0.006 ETH
```

Then fund the Escrow using MetaMask.

---

## Freelancer

Open the same Escrow.

Verify:

```text
Client address visible
Freelancer address visible
Correct ETH amounts visible
```

Submit work.

Expected:

```text
No false error
No manual reload
Milestone changes to SUBMITTED automatically
Submission appears automatically
```

---

## Client

Return to Escrow.

Verify submission appears without manual reload where the existing architecture supports automatic refresh.

Click:

```text
Approve & Release
```

Expected:

```text
MetaMask opens
↓
Confirm
↓
Transaction submitted
↓
Transaction confirmed
↓
PaymentReleased verified
↓
Escrow updates automatically
↓
Milestone = RELEASED
```

---

# 39. BROWSER REFRESH TEST

After each major state:

```text
PENDING
SUBMITTED
APPROVED
RELEASED
```

refresh the browser manually and confirm the persisted state matches what was shown before refresh.

This verifies:

```text
DB state
↔
API state
↔
UI state
```

---

# 40. NO MANUAL RELOAD REQUIREMENT

The final system must NOT require:

```text
F5
Ctrl+R
window.location.reload()
```

to make successful actions appear.

All normal state transitions must update through:

```text
mutation success
→ query invalidation
→ refetch
→ UI update
```

---

# 41. BUILD / LINT / TYPE / TEST

Before declaring completion, run all relevant checks:

```bash
npm run typecheck
npm run lint
npm run build
npm run test
```

Then run:

```text
EVM tests
Playwright tests
```

if available.

If any test fails:

1. determine whether it is caused by your changes
2. fix it if related
3. rerun the test
4. report unrelated pre-existing failures separately

Do NOT claim 100% pass if a test is failing.

---

# 42. FINAL CODE REVIEW

Before finishing, review the diff and remove:

* debug logs that should not remain
* dead code
* unused imports
* temporary workarounds
* unnecessary timeouts
* duplicate logic
* unsafe `any`
* floating-point blockchain calculations
* unnecessary dependencies
* unrelated modifications

---

# 43. FINAL ACCEPTANCE CRITERIA

The task is NOT complete unless all of these are true:

### ETH Amount

```text
0.001 ETH
0.002 ETH
0.003 ETH
0.006 ETH total
```

display correctly.

No zero values unless the actual stored value is zero.

---

### Submit Work

```text
Click
→ immediate loading/lock
→ one request
→ success
→ SUBMITTED
→ UI updates automatically
→ no browser reload
→ no false error
```

---

### Approve & Release

```text
Click
→ MetaMask opens
→ user confirms
→ blockchain transaction occurs
→ receipt confirmed
→ PaymentReleased verified
→ DB updated
→ UI updates automatically
```

---

### Failure Handling

```text
MetaMask reject
→ safe retry

Transaction failure
→ safe retry

API failure
→ clear error
→ busy resets

Refetch failure
→ does not falsely report mutation failure
```

---

### Security

Server-side role/state authorization remains intact.

---

### Blockchain

Existing deployed `ChainPayEscrow.sol` remains unchanged.

No new contract deployment.

No fake transaction.

No false `RELEASED`.

---

# 44. FINAL REPORT

At the end, provide a detailed report containing:

## A. Root Causes

For each problem:

```text
Problem
Root cause
Evidence
```

---

## B. Files Changed

List every changed file and explain why.

---

## C. Data Flow

Show the corrected amount flow:

```text
ETH
→ Wei
→ DB
→ API
→ frontend
→ formatEther
→ ETH display
```

---

## D. Submit Flow

Show:

```text
Freelancer
→ Submit
→ API
→ DB
→ React Query invalidate
→ Refetch
→ SUBMITTED
```

---

## E. Release Flow

Show:

```text
Client
→ MetaMask
→ Sepolia
→ txHash
→ receipt
→ PaymentReleased
→ backend verification
→ DB
→ React Query
→ RELEASED
```

---

## F. Tests

Report exact results:

```text
Typecheck: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Unit: PASS/FAIL
API: PASS/FAIL
EVM: PASS/FAIL
Playwright: PASS/FAIL
Manual E2E: PASS/FAIL
```

If anything fails, explain it honestly.

---

## G. Remaining Risks

If any known issue remains, explicitly state it.

Do not hide known limitations.

---

# FINAL INSTRUCTION

Treat this as a **production-stability task**, not a cosmetic bug fix.

Do not stop when the UI looks correct.

The implementation is complete only when:

```text
DATABASE
    ↕
API
    ↕
FRONTEND STATE
    ↕
BLOCKCHAIN
    ↕
META MASK
```

are consistent and the user can complete the entire Escrow workflow without:

* manual browser reload
* duplicate clicks
* false error alerts
* zero ETH values
* stale milestone state
* missing submissions
* missing MetaMask transaction
* false payment status

Analyze first.
Implement second.
Test third.
Verify end-to-end last.

Do not ask the user to manually fix intermediate problems.
Complete the implementation in this single engineering pass.
