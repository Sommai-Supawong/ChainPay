# ChainPay V2: Remix deployment and application cutover

V1 is a legacy deployed contract for old receipts and transactions. Every newly created ChainPay payment intent uses V2. Use the real existing V1 address for `<V1_CONTRACT_ADDRESS>` and the newly deployed V2 address for `<V2_CONTRACT_ADDRESS_AFTER_DEPLOY>`; do not guess either value. Do not deploy automatically or enter a MetaMask private key into the repository.

## Before deployment

1. Run `npm run contract:compile`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` locally. The compiler script reports Solidity **0.8.37** and writes `artifacts/ChainPayV2.json`.
2. Confirm the V1 address from the existing deployed application configuration or Sepolia deployment record. Record it securely for historical verification. Confirm the target chain is Ethereum Sepolia, ID **11155111**.
3. Review `db/migrations/0001_stiff_union_jack.sql`. It only adds nullable contract fields and marks preexisting intents and transactions as V1. It does not drop or reset data.

## Deploy ChainPayV2 with Remix

1. Open Remix IDE in a trusted browser session.
2. Create or open `ChainPayV2.sol` and paste the exact contents of `contracts/ChainPayV2.sol`. It has no imports or constructor arguments.
3. In Solidity Compiler, select **0.8.37**, enable optimization with **200 runs**, and select **Cancun** EVM target.
4. Compile `ChainPayV2.sol` and confirm that `ChainPayV2` has no errors.
5. Connect and unlock MetaMask. Select **Ethereum Sepolia** in MetaMask; confirm chain ID 11155111 and enough test ETH for gas.
6. Open Remix **Deploy & Run Transactions**. Select **Injected Provider - MetaMask** (or the equivalent browser wallet option). Confirm Remix shows the expected Sepolia network and deployer account.
7. Select **ChainPayV2** and click Deploy. Confirm the deployment transaction in MetaMask.
8. Wait for confirmation. Copy the **new V2 contract address** from Remix or the confirmed transaction. Record the deployment hash and block number.
9. Check the address and transaction on Sepolia Etherscan. Confirm `version()` returns `2` in Remix. Verify the source there using Solidity 0.8.37, optimization 200, Cancun and the exact source if publishing verified source.
10. Use two test wallets to call `pay` with a new nonzero bytes32 payment ID, a valid merchant address and a small Sepolia ETH amount. Confirm the merchant received that amount and the transaction emitted `PaymentCompleted` with the ID, payer, merchant, amount and block timestamp. Use a fresh ID for each test payment.

## After ChainPayV2 is deployed

Apply the migration to the **existing** Neon database, configure Vercel, redeploy Vercel, then run the smoke test. Keep the old V1 deployment intact.

### Existing Neon database

Do not create a new Neon project, delete data, or reset migration history. Use the migration role and existing `DATABASE_URL_UNPOOLED` (or configured migration URL) to run the project's exact command:

```sh
npm run db:migrate
```

`0001_stiff_union_jack.sql` adds nullable `contract_address` and `contract_version` to payment intents and transactions. It sets old rows to version 1 without assuming an address. New rows write version 2 and the V2 address. Pending V1 intents remain recoverable with the original submission capability.

Set `CHAINPAY_V1_CONTRACT_ADDRESS=<V1_CONTRACT_ADDRESS>` in Vercel before serving historical verification. Backfill the old address after verifying it. In the Neon SQL editor, replace the placeholder below with the **actual V1 address** and run the statements against the existing database:

```sql
UPDATE payment_intents
SET contract_address = '<V1_CONTRACT_ADDRESS>'
WHERE contract_version = 1 AND contract_address IS NULL;

UPDATE transactions
SET contract_address = '<V1_CONTRACT_ADDRESS>'
WHERE contract_version = 1 AND contract_address IS NULL;
```

The server can resolve unbackfilled V1 rows from `CHAINPAY_V1_CONTRACT_ADDRESS`; it refuses a stored address that disagrees with the configured address. Keep that variable available as long as V1 records may need verification. Test the migration and backfill on a Neon branch before applying them to the live database.

### Existing Vercel deployment

Update these variables in the Vercel environment that hosts ChainPay:

```env
NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS=<V2_CONTRACT_ADDRESS_AFTER_DEPLOY>
NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION=2
CHAINPAY_V1_CONTRACT_ADDRESS=<V1_CONTRACT_ADDRESS>
ETHEREUM_RPC_URL=<SEPOLIA_RPC_ENDPOINT>
```

`ETHEREUM_RPC_URL` is server-only and **must** point to Sepolia. **Wrong:** `https://eth-mainnet.g.alchemy.com/...`. **Correct:** an Ethereum Sepolia RPC endpoint whose `eth_chainId` returns `11155111`. Do not put the RPC URL or an API key in a `NEXT_PUBLIC_*` variable. Keep the existing Neon URLs and Firebase settings unless they are independently wrong. `NEXT_PUBLIC_*` values are embedded into the browser bundle at build time, so **redeploy Vercel** after changing the active address or version. Redeploy after changing the server RPC as well. The application checks the RPC chain before creating a new intent or looking up a submitted hash. It fails closed when the V2 address, version or Sepolia RPC is invalid; it never sends a new payment to V1.

If MetaMask already transferred Sepolia ETH but saving the transaction failed while Vercel used a Mainnet RPC, correct `ETHEREUM_RPC_URL`, redeploy, then use **Retry saving transaction** in the original tab. This reuses the original payment intent, submission capability and transaction hash. It does not send another blockchain payment. If the RPC has not indexed the hash, retry later; a wrong-chain RPC now produces a configuration error instead. If the original tab and its recovery data are gone, retain the hash and contact the operator for reconciliation. Do not pay again to solve a persistence error.

### Post-deployment smoke test

On the redeployed site, check login, wallet connection and wallet ownership verification. Create a request, open its public page and QR destination, review a payment, and submit a small Sepolia payment. Confirm the pending record, two-confirmation server verification, receipt, and activity/history. Open one old V1 transaction detail and one new V2 detail; both must load. Check wrong-network and invalid-configuration behavior before allowing regular users to pay.
