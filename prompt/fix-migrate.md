Fix ChainPay transaction verification so it safely supports MetaMask delegated /
wrapped smart-account execution in addition to direct ChainPay contract calls.

A real Sepolia payment has already succeeded and ETH was transferred, but
ChainPay refused to persist it because the outer transaction target is a
MetaMask delegation/execution contract rather than the ChainPay V2 address.

IMPORTANT:
Do not broadcast another transaction.
The existing transaction hash must be recoverable.

First inspect:

src/lib/blockchain/verification.ts
src/lib/blockchain/contracts.ts
src/features/payment/server.ts
src/components/payment/payment-form.tsx
transaction recovery flow
contract tests
verification tests

Current direct verifier assumes:

tx.to === ChainPay contract
tx.value === payment amount
tx.input directly decodes as ChainPay.pay(...)

That assumption is invalid for a wrapped/delegated transaction where:

Outer transaction
→ delegation / smart-account execution contract
→ internal ChainPay V2 call
→ merchant

Do NOT simply remove the contract-address validation.

==================================================
1. PRESERVE DIRECT EXECUTION
==================================================

Keep the current strict direct transaction validation path:

- tx.to == expected ChainPay contract
- tx.from == expected payer
- tx.value == expected amount
- calldata decodes to expected pay(...)
- paymentId matches
- merchant matches

This remains the preferred/simple path.

==================================================
2. ADD WRAPPED / DELEGATED EXECUTION SUPPORT
==================================================

If the outer transaction does not directly target the expected ChainPay
contract, do not immediately return:

"The transaction targets a different ChainPay contract."

Treat it as a possible wrapped execution.

For wrapped execution, authoritative verification must come from the
successful transaction receipt and logs emitted by the EXPECTED ChainPay
contract stored on the payment intent.

Verify:

- Sepolia chain
- successful receipt
- expected ChainPay contract address
- exactly one expected PaymentCompleted event
- expected paymentId
- expected payer
- expected merchant
- exact payment amount
- canonical block
- required confirmation depth

The ChainPay event MUST originate from:

intent.contractAddress

Never trust an event emitted by another contract.

Do not treat an arbitrary successful wrapper transaction as a ChainPay
payment.

==================================================
3. DO NOT REQUIRE OUTER tx.value FOR WRAPPED EXECUTION
==================================================

For direct execution:
outer tx.value must still equal expected amount.

For delegated/wrapped execution:
the outer transaction may have value = 0.

Use the verified ChainPay PaymentCompleted event amount as the settlement
value, because the actual ETH transfer occurs during nested execution.

Do not weaken the direct-payment path.

==================================================
4. CALLDATA
==================================================

For direct execution:
continue decoding outer tx.input as ChainPay pay(...).

For wrapped execution:
do not attempt to decode the outer delegation calldata as ChainPay ABI.

Instead, verify the ChainPay contract execution using the emitted event and,
if a reliable execution trace is already available from the configured RPC,
use it as additional evidence.

Do NOT require debug_traceTransaction unless the application's configured
RPC already reliably supports it.

The receipt/event verification must remain sufficient and deterministic.

==================================================
5. PAYER SECURITY
==================================================

Carefully verify payer semantics.

The PaymentCompleted event emitted by the expected ChainPay contract must
contain the expected payer address.

Do not assume outer tx.from alone proves the payer for wrapped execution.

If the current V2 event payer differs under MetaMask delegation, investigate
the actual contract execution semantics before accepting it.

Never relax payer verification merely to make the test pass.

==================================================
6. SUBMISSION / PERSISTENCE
==================================================

Current submitTransaction calls assertTransaction BEFORE inserting the
transaction.

Refactor safely:

DIRECT:
existing pre-persistence verification can remain.

WRAPPED:
if the transaction exists but cannot be verified from the outer call alone,
associate the existing hash with the immutable intent without broadcasting
anything again, then perform receipt/event verification before marking it
confirmed.

Possible state:

pending
→ receipt/event verification
→ confirmed / failed

Never show Confirmed solely because the browser says it succeeded.

Keep one hash per payment intent and preserve idempotency.

==================================================
7. RECOVERY
==================================================

Update "Recover a submitted payment".

Given the already-broadcast transaction hash:

- load immutable payment intent
- resolve stored contractVersion and contractAddress
- fetch transaction + receipt
- support direct or wrapped execution
- verify expected ChainPay event
- save transaction idempotently
- continue normal confirmation flow
- do not send ETH again

If the transaction is already on-chain, recovery must never invoke
writeContract/sendTransaction.

==================================================
8. ERROR UX
==================================================

When an already-broadcast transaction cannot yet be persisted, show:

EN:
"Your transaction was submitted successfully, but ChainPay has not saved it
yet. Do not pay again. Recover this transaction using the existing hash."

TH:
"ธุรกรรมถูกส่งสำเร็จแล้ว แต่ ChainPay ยังไม่ได้บันทึกรายการ
กรุณาอย่าชำระซ้ำ และใช้ Transaction Hash เดิมเพื่อกู้คืนรายการ"

Provide a Recover Transaction action.

==================================================
9. TESTS
==================================================

Add regression tests for:

- normal direct V2 payment still passes
- wrong direct contract is rejected
- valid delegated/wrapped payment with expected ChainPay event passes
- wrapped tx with outer value = 0 can pass only when expected event proves
  exact amount
- wrapper transaction without ChainPay event rejected
- event from wrong contract rejected
- wrong paymentId rejected
- wrong payer rejected
- wrong merchant rejected
- wrong amount rejected
- duplicate event rejected
- same hash recovery idempotent
- recovery never sends another transaction
- persisted wrapped transaction appears in Activity
- sender/receiver/request state updates correctly

Do not weaken existing V1/V2 compatibility tests.

==================================================
10. DO NOT CHANGE
==================================================

Do not change:

NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS
NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION
CHAINPAY_V1_CONTRACT_ADDRESS

unless code inspection proves configuration is actually wrong.

Existing contract/version binding to payment_intents is correct and should be
preserved.

Do not modify the smart contract solely to solve this application verifier
issue.

==================================================
11. VALIDATION
==================================================

Run:

npm run lint
npm run typecheck
npm test
npm run build

Then report:

1. exact root cause
2. whether the real transaction is direct or wrapped
3. files changed
4. direct verification behavior
5. wrapped verification behavior
6. how existing hash recovery works
7. security checks retained
8. tests added