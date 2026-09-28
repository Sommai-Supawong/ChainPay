# ChainPay settlement contracts

`contracts/ChainPay.sol` is the immutable V1 source and remains available for historical transaction verification. `contracts/ChainPayV2.sol` is the active contract for every new payment. V2 must be deployed at a **new Sepolia address**; changing application configuration cannot alter a deployed V1 contract. See the [V2 Remix deployment and cutover guide](SMART_CONTRACT_V2_DEPLOYMENT.md).

Both contracts expose `pay(bytes32 paymentId, address payable merchant)` and emit `PaymentCompleted(paymentId, payer, merchant, amount, timestamp)`. V2 adds `version() == 2`, explicit validation errors, and rejection of the contract itself as a merchant. It forwards all ETH with `call`, retains no payment funds, and has no owner, custody, upgrade proxy, or personal metadata.

V2 preserves V1's payer-scoped replay key, `keccak256(abi.encode(payer, paymentId))`. An unsuccessful forwarding call reverts the key and permits a retry. A different intent gets a random new ID, including late or competing payments for the same off-chain request; the database records those independently for reconciliation. Checks and the consumed key precede the external call, and a small reentrancy guard prevents nested `pay` calls. Failure reverts all state and ETH movement.

`npm run contract:compile` compiles both sources with the installed Solidity 0.8.37 compiler, optimizer 200 runs and Cancun EVM, writing ignored `artifacts/ChainPay.json` and `artifacts/ChainPayV2.json`. The canonical application ABIs are in `src/lib/blockchain/chainpay-v1-abi.ts` and `chainpay-v2-abi.ts`. Only the server-side contract registry uses V1. The browser uses V2 for gas estimates and wallet submission.

The contracts do not know off-chain request amount, cancellation or expiry. They cannot prevent two different payers from sending ETH for one request. The server records late or racing transfers without falsely settling the request twice; operators may need manual reconciliation. Automated contract tests use an isolated local EVM, never Sepolia funds.
