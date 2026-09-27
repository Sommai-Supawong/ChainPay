# Connected-service acceptance checklist

These tests require your configured Firebase project, Neon database, deployed contract and funded Sepolia wallets. They have not been replaced by local fixtures.

## Authentication

- Enable Google provider, authorize localhost and deployment domains, sign in, refresh protected pages, open a second tab and verify persistent profile/history.
- Reject/close Google popup; revoke the Firebase session; verify expired/revoked cookies return login/401.
- Sign out and verify private API access fails. Attempt user-ID/email substitution and cross-origin POSTs.

## Wallet

- No MetaMask: helpful error and mobile MetaMask-browser path.
- Connect, reject connection, disconnect/reconnect, switch account, change to an unsupported network, switch back to Sepolia.
- Verify ownership, reject signature, wait beyond nonce expiry, replay signature, use another user's challenge, change domain.
- Add a second wallet, change primary, remove secondary. Confirm wallet removal with an open request is blocked and history survives removal.

## Send and settlement

- Invalid recipient, zero/self-recipient, zero/negative/scientific/19-decimal amount, insufficient payment funds, insufficient fee funds.
- Choose a saved contact. Confirm sender, recipient, amount, fee, total, title and note in review.
- Switch wallet/network during review; confirm signing is blocked until re-review. Reject the transaction.
- Complete a real Sepolia transaction. Verify pending persistence first, then confirmed only after two canonical confirmations and expected event.
- Open receipt independently and compare hash, sender, merchant, amount, block and timestamp with Etherscan.
- Reverted recipient transaction: failed history, no transferred value, network fees disclosed.
- Retry the same hash: one record. Substitute sender/value/event/contract/hash: reject.
- Interrupt the submission request after broadcast. Use “Recover a submitted payment” in the same tab; save it without sending again.
- Replaced/dropped transaction: do not show fake success or failed status from a timeout; retain hash for operator investigation.

## Requests and privacy

- Create draft, publish, share URL, scan QR on another device, open anonymously without Google login and pay from an unlinked wallet.
- Request title/description and merchant name are public; email, UID, private note and recovery token are absent.
- Expire/cancel a request; verify fresh intent creation is blocked. Already-paid and pending pages prevent ordinary repeat payment.
- Exercise cancellation after wallet signing and simultaneous payers: preserve all real broadcasts, settle at most one associated request, and inspect audit records for independent late payments.
- Confirm requester/payer history across devices and ownership boundaries with two Google accounts.

## Product and operations

- Check landing, login, dashboard, send/review, requests/QR, contacts, wallet manager, activity filters/search, receipt and settings at 390px, tablet and desktop widths.
- Keyboard navigation, focus visibility, dialog focus trap, reduced motion, rejection messages, offline errors and clipboard/camera fallback.
- Run production build, apply migrations on a staging Neon branch, verify least-privilege runtime credentials, and exercise restore procedures before any production use.
