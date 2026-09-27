# ChainPay.sol

`contracts/ChainPay.sol` implements `pay(bytes32 paymentId, address payable merchant) external payable`. It rejects zero amounts, zero identifiers, zero recipients and self-payments; forwards ETH; emits `PaymentCompleted(paymentId, payer, merchant, amount, timestamp)`; retains no payment funds; and has no administrator or upgrade mechanism.

Replay protection uses `keccak256(abi.encode(payer, paymentId))`. A global reentrancy guard and checks/effects/interaction ordering protect forwarding. A failed recipient call reverts both payment and consumed identifier. No names, emails or private notes are written on-chain.

## Compile and deploy to Sepolia

1. Run `npm run contract:compile`. It writes ABI, creation bytecode and runtime bytecode to ignored `artifacts/ChainPay.json`. The compiler version is recorded there; optimizer uses 200 runs and EVM target Cancun.
2. In Remix, open the exact `contracts/ChainPay.sol` source. Select the same Solidity compiler version printed by the command, enable optimizer with 200 runs, and select Cancun EVM target.
3. In MetaMask, switch to Ethereum Sepolia (chain ID 11155111) and obtain test ETH. Never use a production-funded account for testing.
4. In Remix's Deploy & Run panel, choose the injected browser wallet environment, verify the displayed network/account, select ChainPay and deploy. Approve the deployment in MetaMask. No key is copied into this repository.
5. Verify the source and compiler settings on Sepolia Etherscan. Confirm the deployed runtime matches the compiled artifact.
6. Set `NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS` to the deployed address. Set server-only `ETHEREUM_RPC_URL` to a Sepolia RPC. Redeploy Next.js because public variables are embedded at build time.
7. Use two test wallets to exercise payment, rejected transaction, successful forwarding/event, recipient revert, receipt and request settlement.

The shared UI/server ABI is `src/lib/blockchain/config.ts`. Chain constants are centralized; no mainnet switching is exposed.

## Tests and scope

`tests/contract.test.ts` compiles the actual Solidity and deploys it into an isolated EthereumJS EVM. Tests execute signed local transactions for forwarding, exact event data, duplicate replay, zero/self validation, failed transfer rollback and reentrancy. Deterministic keys are test-only and never used on a network.

The contract intentionally has no knowledge of off-chain invoices. It cannot enforce off-chain cancellation, expiry or unique invoice payment across different payers. Application policies and the reconciliation behavior are described in SECURITY.md. A mainnet release requires an audited contract design and stronger invoice/finality enforcement.
