# ChainPay Escrow — Debug Slow Submit Work, Approval Errors, and Missing MetaMask Transaction

We now have a serious runtime/workflow issue in the Escrow system.

## Current Symptoms

### Freelancer — Submit Work

When the Freelancer clicks **Submit Work**:

1. UI becomes slow / appears to hang
2. An error alert appears
3. User waits for a while
4. Eventually the submission is actually created successfully

So the operation appears to fail to the user, but the backend eventually completes it.

### Client — Approve & Release

When the Client clicks **Approve & Release**:

1. UI becomes slow / appears to hang
2. An error alert appears
3. After waiting for a while, the milestone eventually becomes approved
4. BUT:

   * MetaMask does NOT open
   * No transaction appears in MetaMask
   * No blockchain transaction is submitted
   * No ETH is transferred
   * The milestone does not actually complete the release flow

This strongly suggests an asynchronous/API/blockchain workflow problem.

---

# IMPORTANT

Do NOT simply:

* increase timeout
* hide the alert
* add arbitrary delays
* retry requests blindly
* add `setTimeout`
* fake a successful transaction
* mark a milestone RELEASED without blockchain confirmation

We need to identify the actual root cause.

Audit the complete flow first.

---

# 1. Reproduce Both Problems

Run the application locally and reproduce:

```text
Freelancer → Submit Work
```

and:

```text
Client → Approve & Release
```

Inspect BOTH:

### Browser console

Look for:

* network errors
* fetch timeout
* AbortError
* React Query mutation errors
* duplicate requests
* unhandled promise rejection
* wallet errors

### Next.js server terminal

Look for:

* API request duration
* database query delay
* Drizzle errors
* Firebase authentication delay
* request handler exceptions
* RPC calls
* blockchain verification calls
* response serialization
* connection issues

### Network tab

Inspect:

```text
POST /api/escrows/:id/milestones/:milestoneId/submit
```

and:

```text
POST /api/escrows/:id/milestones/:milestoneId/approve
```

Record:

* request start time
* response time
* HTTP status
* response body
* whether the request is duplicated
* whether there are multiple simultaneous requests

---

# 2. Diagnose Submit Work First

Trace:

```text
Submit Work button
↓
React mutation
↓
client-api.ts
↓
POST /submit
↓
API route
↓
escrow server.ts
↓
Firebase auth
↓
DB query
↓
insert submission
↓
update milestone
↓
response
```

Determine exactly which operation is slow.

The submit operation should NOT involve:

* Ethereum RPC
* blockchain transaction
* `waitForTransactionReceipt`
* Sepolia confirmation
* Smart Contract interaction

Submit Work is an application/database operation only.

Therefore the expected flow should be fast:

```text
POST /submit
→ validate auth
→ validate role
→ validate milestone
→ insert submission
→ update milestone
→ return
```

If the server is performing blockchain calls during Submit Work, remove that unnecessary dependency.

---

# 3. Diagnose the Alert Error

Find the exact code producing the alert.

Do not assume the alert means the backend failed.

Determine whether this is:

```text
request actually failed
```

or:

```text
request succeeded but frontend timed out / misread response
```

For example, check whether the frontend does something like:

```ts
await mutation.mutateAsync(...)
```

while the API is still processing.

Check:

* React Query mutation timeout
* custom fetch timeout
* AbortController
* `Promise.race`
* API client timeout
* error transformation
* response parsing

If the API eventually succeeds after the frontend already shows an error, fix the frontend/backend contract rather than adding retries blindly.

---

# 4. Check for Duplicate Requests

This is VERY IMPORTANT.

When the user clicks Submit or Approve once, verify that only ONE request is sent.

Check for:

```text
onClick
form onSubmit
button type
mutation.mutate
mutation.mutateAsync
```

and whether both `onClick` and `onSubmit` trigger the same action.

Also check React Strict Mode or effects that might accidentally invoke requests.

The same applies to Approve.

We must not create:

```text
Request #1
Request #2
Request #3
```

for one user action.

---

# 5. Fix Submit Work UX

Submit Work should behave like:

```text
User clicks Submit
        ↓
Disable button
        ↓
Show inline loading state
        ↓
POST API
        ↓
Success
        ↓
Invalidate/refetch escrow
        ↓
Show SUBMITTED
```

Do NOT show a generic error alert while the request is still legitimately processing.

The UI should clearly distinguish:

```text
Submitting...
```

from:

```text
Submission failed
```

and:

```text
Submission successful
```

Use the existing ChainPay design/i18n system.

Do not introduce a new notification library.

---

# 6. VERY IMPORTANT — Audit Approve & Release

The current implementation reportedly does:

```text
Client clicks Approve & Release
↓
Backend approveMilestone()
↓
DB → APPROVED
↓
Frontend should invoke MetaMask
```

This is potentially incorrect.

If the action is called:

```text
Approve & Release
```

the blockchain transaction must be part of the same logical workflow.

The database must NEVER become:

```text
RELEASED
```

until the blockchain confirms:

```text
PaymentReleased
```

---

# 7. Determine Why MetaMask Does Not Open

Trace the exact code path after:

```text
Approve API success
```

Find the call to:

```ts
writeContract(...)
```

or:

```ts
useWriteContract()
```

or the equivalent Wagmi/Viem function.

Determine whether it is actually reached.

Add temporary development logging around the critical sequence:

```text
[Escrow] Approve clicked
[Escrow] Calling approve API
[Escrow] Approve API success
[Escrow] Preparing release transaction
[Escrow] Calling writeContract
[Escrow] Transaction submitted
[Escrow] Waiting for receipt
[Escrow] Receipt confirmed
[Escrow] Verifying PaymentReleased event
[Escrow] Escrow marked RELEASED
```

Use this only for debugging and keep logging appropriately scoped.

If execution stops after:

```text
Approve API success
```

then identify exactly why the blockchain call is not reached.

---

# 8. MetaMask Must Be Triggered from User Action

Check whether the current architecture waits for an asynchronous backend request BEFORE invoking MetaMask.

For example:

```ts
await approveMilestone()
writeContract(...)
```

This can create wallet UX problems because the wallet interaction is no longer directly tied to the original user gesture in some browser/wallet environments.

Prefer a flow where the blockchain transaction is initiated directly from the user's click path.

For example:

```text
Client clicks Approve & Release
↓
Validate local state
↓
Prepare release transaction
↓
writeContract()
↓
MetaMask opens
↓
User confirms
↓
txHash
↓
Backend verifies transaction
↓
DB state update
```

However, do NOT blindly rewrite the architecture.

First inspect the existing Smart Contract API and determine exactly what operation the deployed contract requires for release.

---

# 9. Preserve Smart Contract Security

The existing deployed:

```text
ChainPayEscrow.sol
```

must NOT be redeployed.

Do NOT modify the deployed contract as part of this bug fix unless absolutely necessary and explicitly justified.

The blockchain remains the settlement authority.

The application database must reflect verified blockchain state.

---

# 10. Correct Approval/Release State Machine

Audit the current state machine.

The desired logical behavior is:

```text
PENDING
   ↓
SUBMITTED
   ↓
APPROVED
   ↓
Release transaction
   ↓
RELEASE_PENDING
   ↓
PaymentReleased event confirmed
   ↓
RELEASED
```

But before introducing `RELEASE_PENDING`, determine whether the existing architecture already has an equivalent transaction-pending mechanism.

Do NOT add a new DB state unnecessarily.

If the existing model can safely represent:

```text
APPROVED
```

while a release transaction is pending, make sure:

* user can retry safely
* duplicate release is impossible
* rejected MetaMask transaction does not permanently corrupt the state
* failed blockchain transaction does not leave misleading state
* release only becomes `RELEASED` after receipt/event verification

If the current `APPROVED` state is being treated as final approval before blockchain release, make that distinction explicit in UI.

---

# 11. MetaMask Rejection Must Be Handled Correctly

Test:

### Case A

User clicks Approve & Release.

MetaMask opens.

User clicks Reject.

Expected:

```text
DB is NOT RELEASED
Blockchain has no payment
User sees a clear cancellation message
User can retry
```

Do not show:

```text
Payment Released
```

---

# 12. Blockchain Transaction Failure

Test:

```text
writeContract()
→ transaction fails/reverts
```

Expected:

```text
DB is NOT RELEASED
User sees transaction failure
Milestone remains safely retryable
```

Never mark:

```text
RELEASED
```

before blockchain confirmation.

---

# 13. Successful Release

Test the real successful flow:

```text
Client
↓
Approve & Release
↓
MetaMask opens
↓
User confirms
↓
Sepolia transaction submitted
↓
txHash returned
↓
wait for receipt
↓
verify PaymentReleased event
↓
backend updates DB
↓
milestone = RELEASED
↓
UI refresh
```

Verify the actual transaction exists on Sepolia.

---

# 14. Check RPC Calls

Inspect whether the backend is unnecessarily waiting on Sepolia RPC during operations that do not need blockchain interaction.

Especially:

### Submit Work

Should NOT wait for blockchain RPC.

### Approve

Should NOT perform unnecessary blockchain verification before the transaction exists.

### Release

Blockchain RPC is expected, but it must be handled asynchronously and visibly.

---

# 15. React Query Cache

After successful operations, invalidate/refetch the correct query:

```text
['escrow', escrowId]
```

or whatever query key the existing implementation uses.

Do not create stale UI where:

```text
backend = SUBMITTED
UI = PENDING
```

or:

```text
blockchain = RELEASED
DB/UI = APPROVED
```

---

# 16. Prevent Race Conditions

Audit for:

* duplicate mutation
* stale milestone state
* two browser tabs
* repeated clicks
* concurrent approval
* concurrent release

Server must remain authoritative.

For example:

```text
SUBMITTED → APPROVED
```

must only happen once.

And:

```text
APPROVED → RELEASED
```

must not allow two blockchain release transactions.

---

# 17. Error Messages

Replace generic:

```text
Something went wrong
```

where possible with the existing localized ChainPay error system.

Examples:

### Submit

```text
กำลังส่งงาน...
ส่งงานสำเร็จ
ไม่สามารถส่งงานได้
```

### Approval

```text
กำลังเตรียมการอนุมัติ...
กรุณายืนยันธุรกรรมใน MetaMask
ผู้ใช้ยกเลิกธุรกรรม
ธุรกรรมล้มเหลว
ปล่อยเงินสำเร็จ
```

Use existing Thai/English i18n architecture.

Do NOT add another i18n system.

---

# 18. Important UX Requirement

The user must always know which stage the operation is currently in.

For Release:

```text
Approve & Release
↓
Preparing transaction...
↓
Waiting for MetaMask...
↓
Confirming transaction...
↓
Verifying blockchain...
↓
Payment Released
```

Do not show a generic error while the transaction is still legitimately pending.

---

# 19. Tests

Add/update tests for:

### Submit

* Freelancer can submit
* Client cannot submit
* submission created
* milestone becomes SUBMITTED
* no blockchain call
* no duplicate submission
* request completes without unnecessary delay

### Approve

* Client can approve
* Freelancer cannot approve
* only SUBMITTED can be approved
* duplicate approval prevented

### Release

* MetaMask/writeContract is reached
* user rejection handled
* transaction failure handled
* receipt confirmation handled
* PaymentReleased event verified
* DB becomes RELEASED only after verified blockchain transaction
* duplicate release prevented

---

# 20. Manual Test

Perform the complete two-account test:

### Browser A — Freelancer

```text
Login
↓
Open Escrow
↓
Submit Work
```

Expected:

```text
fast response
no false error alert
milestone = SUBMITTED
```

### Browser B — Client

```text
Refresh
↓
Review submission
↓
Click Approve & Release
```

Expected:

```text
MetaMask opens
↓
Confirm
↓
Sepolia transaction appears
↓
receipt confirmed
↓
PaymentReleased verified
↓
milestone = RELEASED
```

---

# 21. Final Validation

Run:

```bash
npm run typecheck
npm run lint
npm run build
npm run test
```

Also run existing:

```text
EVM tests
Playwright tests
```

if available.

---

# 22. Final Report

Report:

1. Root cause of slow Submit Work
2. Root cause of false error alert
3. Root cause of missing MetaMask popup
4. Whether duplicate requests were occurring
5. Exact API timing before/after
6. Exact files changed
7. Final Submit workflow
8. Final Approve & Release workflow
9. How MetaMask rejection is handled
10. How blockchain confirmation is handled
11. How DB state is synchronized with blockchain
12. Tests passed

Do not perform unrelated redesign or refactoring.

The goal is to make the existing Escrow workflow reliable, deterministic, and blockchain-correct.
