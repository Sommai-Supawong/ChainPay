# Security model

ChainPay is non-custodial and Sepolia-only. It stores no user private keys or seed phrases. This implementation has automated security tests but is not an independent security audit.

## Application identity

- Fresh Google Firebase ID token required when creating a session (`auth_time` within five minutes; verified email; Google provider).
- Firebase Admin verifies tokens and revocation-aware session cookies. User identity never comes from browser userId/email/role fields.
- Five-day HttpOnly, SameSite=Lax, path=/ cookies; Secure in production. Logout clears this browser's cookie. It does not revoke every session on other devices.
- All state-changing endpoints require the configured exact Origin, including login and anonymous submission. JSON inputs are validated with Zod. Private service queries scope by internal owner UUID.
- Dashboard layout and data-fetching pages verify the session; APIs authorize independently of the UI.
- Safe user messages; logs include an opaque request ID, path and error category, never credentials or full exceptions.

## Wallet identity

Single-use five-minute server-generated SIWE challenges bind user UUID, address, domain, URI and Sepolia chain. Server verifies the exact stored message with a real signature and consumes the nonce in the same transaction as linking. Replays, expired challenges, another user's challenge and domain changes fail. Only EOA personal signatures are supported; ERC-1271 contract-wallet linking is not implemented.

An address cannot be linked to multiple accounts on the same chain. Removing it is soft deletion and preserves ownership/history. There is no unverified `POST /wallets` shortcut: challenge + verification is the only creation path.

## Settlement integrity

The browser cannot choose confirmed status. Server checks RPC chain ID, transaction chain/sender/target/value/calldata, successful receipt, expected event address/ID/payer/merchant/value/timestamp, canonical block hash, and two block confirmations. Failed receipts become failed records after confirmation depth; missing receipts stay pending. The contract forwards ETH with replay and reentrancy protection.

All new intents target V2 and fail closed if its public address or version is invalid. The server uses V1 only for pre-upgrade intents and historical transactions. A stored contract address must agree with the configured address for that version. V2 adds an explicit version method and rejects payment to the contract itself. Its external ETH call occurs after the replay key is marked; a failed call reverts both that mark and the transfer. The guard prevents a merchant callback from nesting another `pay` call.

The database has unique hash/chain, intent, and confirmed-request constraints. Confirmation and request updates are atomic. Public submissions require an unguessable capability whose hash is stored in the database; possessing a transaction hash alone cannot attach arbitrary metadata to it. Public receipts expose only on-chain facts; private notes are visible only to the originating account.

## Important testnet limitations

- The minimal contract does not know application request expiration, cancellation, or expected invoice amount. The normal UI and server prevent new invalid payments; an already signed transaction cannot be revoked. A malicious/manual call or simultaneous payers may still transfer funds. Such late/racing broadcasts are recorded independently and audited rather than falsely settling a request twice. Review/refund handling is manual. On-chain invoice enforcement would require a revised contract with signed authorizations or on-chain request registration.
- Replay protection is scoped to payer + payment ID so another address cannot burn a payer's ID. It does not deduplicate distinct payer intents for the same off-chain invoice.
- Two confirmations mitigate ordinary reorgs, not deep reorgs or a malicious RPC. Completed records are not continuously revalidated. Use trusted RPC and add an indexer/finality reconciliation before mainnet.
- Dropped/replaced transactions remain pending until investigated; a client never marks them failed on a timeout. The receipt offers rechecking and explorer access.
- If the tab closes before the hash is saved and recovery data is lost, there is no event indexer to discover it automatically. Keep the wallet transaction hash.
- Rate limits use PostgreSQL atomic counters. Vercel's overwritten client-IP header is trusted only on Vercel; elsewhere anonymous traffic shares one bucket. Configure trusted ingress before deploying elsewhere. Clean old buckets regularly.
- No CSP is currently enforced; introducing it requires testing Firebase popup/frame behavior and Next's script nonce integration. X-Frame-Options, nosniff, Referrer-Policy and restricted browser permissions are set.

## Deployment review

Keep `.env.local` out of Git, restrict Firebase service-account permissions, use least-privilege database roles, and put server credentials only in Vercel server env vars. Browser Firebase configuration is intentionally public. Private RPC credentials never enter wagmi configuration; the browser uses Sepolia's public transport and MetaMask.

Test Google sign-in on the exact deployed origin, account revocation, cross-user access, signature rejection, anonymous payment, transaction rejection, and real Sepolia confirmation. Enable monitoring for repeated 5xx/429 responses and old pending transactions. See MANUAL_TESTS.md.
