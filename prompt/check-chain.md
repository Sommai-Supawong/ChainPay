Audit the entire existing ChainPay project after the ChainPay V2 upgrade.

Do NOT redesign the UI or rebuild working features.

The goal is to make sure the existing website is fully and consistently configured for ChainPay V2 on Ethereum Sepolia.

Important context:
- ChainPayV2 is already deployed on Ethereum Sepolia.
- New transactions must use V2 only.
- V1 is legacy/history-only.
- Neon migration has already been applied.
- A real V2 payment successfully transferred Sepolia ETH to the receiver.
- However transaction persistence initially failed because ETHEREUM_RPC_URL was accidentally pointing to Ethereum Mainnet instead of Sepolia.
- This caused POST /api/transactions to return HTTP 409 because the server could not find the Sepolia transaction.

Please inspect the entire repository and fix/audit all related integration points.

Check especially:

1. Network configuration
- ChainPay must use Ethereum Sepolia only.
- chainId must be 11155111.
- Make sure there are no hard-coded Ethereum Mainnet RPC URLs.
- Search for:
  eth-mainnet
  mainnet
  chainId 1
  0x1
  ETHEREUM_RPC_URL
  NEXT_PUBLIC_CHAIN_ID
  Sepolia
- Remove or correct stale Mainnet configuration where inappropriate.

2. RPC configuration
- ETHEREUM_RPC_URL must be server-only.
- It must point to Ethereum Sepolia.
- Add runtime validation that rejects an RPC connected to the wrong chain.
- If possible, when server blockchain verification starts, confirm:
  eth_chainId == 11155111
- Return a clear configuration error such as:
  "Ethereum RPC is connected to the wrong network. Expected Sepolia (11155111)."
- Do not silently return "transaction not found" when the RPC itself is on the wrong chain.

3. ChainPay V2
- New browser payments must use ChainPayV2 only.
- Verify NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS is treated as V2.
- Verify NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION=2.
- Verify the V2 ABI is used for writeContract/payment calls.
- V1 must never be selected for new payments.

4. V1 legacy support
- CHAINPAY_V1_CONTRACT_ADDRESS must remain server-only where possible.
- V1 should only be used for historical verification.
- Do not route new transactions to V1.

5. Transaction lifecycle
Audit the full flow:

Payment Intent
→ MetaMask
→ ChainPayV2
→ transaction hash
→ POST /api/transactions
→ save pending transaction in Neon
→ blockchain verification
→ 2 confirmations
→ confirmed
→ receipt/activity

Make sure a successful blockchain transaction cannot disappear from the application merely because verification is temporarily unavailable.

6. Recovery behavior
The app already shows a recovery screen when the blockchain transaction succeeded but persistence failed.

Review this carefully.

The "retry saving transaction" action must:
- reuse the ORIGINAL tx hash
- reuse the original payment intent
- never create another blockchain payment
- safely retry server persistence/verification
- be idempotent

If the transaction exists but the RPC has not indexed it yet, return a retryable response.

If the RPC network is wrong, return a configuration error rather than presenting it as normal propagation delay.

7. Neon persistence
Verify that new V2 transactions persist:
- tx_hash
- chain_id = 11155111
- contract_version = 2
- contract_address = V2 address
- from_address
- to_address
- amount
- payment/payment-request relation
- pending/confirmed status
- timestamps

Do not reset or delete Neon data.

8. Activity / dashboard
Verify that successfully persisted transactions appear correctly in:
- sender Activity
- dashboard recent activity
- transaction receipt/detail

Also review received transactions.

If the recipient wallet belongs to another verified ChainPay user, the transaction should appear as Received for that user's account according to the existing architecture.

Do not invent duplicate transaction rows just to show the transaction to two users.

Prefer querying transaction direction based on verified wallet ownership if that matches the existing schema.

9. Error handling
Improve errors for:
- wrong RPC network
- transaction not propagated yet
- wrong contract address
- incorrect chain
- invalid PaymentCompleted event
- paymentId mismatch
- RPC unavailable
- database persistence failure
- insufficient confirmations

Do not expose secrets or raw internal stack traces to users.

10. Environment files
Review:
.env.example
README.md
docs/SMART_CONTRACT_V2_DEPLOYMENT.md

The correct environment model should clearly distinguish:

Local:
NEXT_PUBLIC_APP_URL=http://localhost:3000

Production:
NEXT_PUBLIC_APP_URL=https://chain-pay-eta.vercel.app

Blockchain:
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS=<V2>
NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION=2
CHAINPAY_V1_CONTRACT_ADDRESS=<V1>
ETHEREUM_RPC_URL=<SEPOLIA RPC>

Never expose ETHEREUM_RPC_URL as NEXT_PUBLIC_*.

11. Vercel
Document that production Vercel must also use a Sepolia RPC.

Make sure documentation explicitly warns:

WRONG:
https://eth-mainnet.g.alchemy.com/...

CORRECT:
Ethereum Sepolia RPC endpoint

Do not hardcode an API key.

12. Tests
Add/update tests for:
- RPC chainId Sepolia accepted
- Mainnet RPC rejected
- V2 transaction persistence
- transaction-not-found retry behavior
- recovery retry uses existing tx hash
- retry does not initiate another blockchain transaction
- V2 contract address validation
- V1 historical verification remains functional

Run:
npm run contract:compile
npm run lint
npm run typecheck
npm test
npm run build

Do not claim a test passed unless it actually ran.

Finally provide a report:
- root cause found
- files changed
- network config changes
- RPC validation added
- transaction recovery behavior
- Neon impact
- Vercel variables that I must manually change
- tests run and results
- any remaining manual steps

Do not deploy to Vercel, modify the live Neon database, or submit blockchain transactions automatically.