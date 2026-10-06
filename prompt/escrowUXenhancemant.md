# ChainPay V2 — Escrow UX Enhancement

## Status Filter + Smart Contract Explorer

### One-Pass Analyze → Design → Implement → Test → Fix → Verify

You are working on the existing **ChainPay V2** repository.

Your task is to implement two UX improvements to the existing Escrow system:

1. Add a **status filter** to the Escrow listing, following the existing `/activity` filtering UX and behavior.
2. Add a clear action that allows users to open and inspect the **Escrow Smart Contract on the official Sepolia block explorer**.

You must complete the entire task in one working session:

> Analyze → Inspect Existing Patterns → Reproduce → Design → Implement → Test → Fix → Re-test → Final Verification

Do not stop after merely making the code compile.

The final result must be production-ready, responsive, consistent with the existing ChainPay design system, and free from regressions.

---

# 0. NON-NEGOTIABLE RULES

Before modifying anything:

* Read the relevant existing implementation completely.
* Inspect the existing `/activity` page and reuse its established patterns.
* Inspect the existing Escrow pages/components/API/query architecture.
* Inspect existing i18n conventions.
* Inspect existing design-system components.
* Inspect existing responsive behavior.
* Inspect existing block explorer / transaction-link utilities if they already exist.
* Do not create duplicate utilities/components when an existing reusable implementation exists.

Do NOT:

* deploy a new smart contract
* modify the deployed Escrow contract
* change the Escrow contract address
* change blockchain business logic
* change payment/release/refund/dispute logic
* change DB schema unless absolutely required and proven necessary
* rewrite the Escrow architecture
* introduce a new UI framework
* introduce a new state-management library
* introduce a new i18n library
* replace the existing design system
* break existing `/activity`
* use `window.location.reload()`
* hard-code duplicated explorer URLs throughout the UI
* hard-code status labels directly in JSX if the project already uses i18n
* create fake filter results on the client
* hide backend errors
* claim success without testing

Preserve all existing working behavior.

---

# 1. UNDERSTAND THE CURRENT ARCHITECTURE

First inspect the repository and identify:

## Escrow

Find:

* Escrow listing page
* Escrow detail page
* Escrow components
* Escrow hooks
* Escrow queries
* Escrow API routes
* Escrow server functions
* Escrow types
* Escrow status definitions
* existing pagination if any
* existing search/filter logic if any

Specifically inspect files related to:

```text
src/features/escrow/
src/components/escrow/
src/app/(dashboard)/contracts/
src/app/api/
```

Use the actual repository structure rather than assuming these paths exist.

---

# 2. STUDY `/activity`

This is extremely important.

Inspect the existing:

```text
/activity
```

page and all relevant components/hooks/utilities used for:

* status filters
* filter buttons
* tabs
* dropdowns
* active filter state
* query parameters
* client-side filtering
* server-side filtering
* responsive behavior
* empty states
* loading states
* reset behavior
* URL synchronization
* i18n
* accessibility

Determine exactly how `/activity` implements filtering.

Document internally:

```text
Activity filter pattern
        ↓
Reusable component?
        ↓
State management
        ↓
Data filtering
        ↓
UI states
        ↓
Responsive behavior
```

Then reuse the same established pattern for Escrow wherever technically appropriate.

Do not blindly copy code if `/activity` already has reusable components/utilities.

---

# 3. REQUIREMENT A — ESCROW STATUS FILTER

Add a status filter to the Escrow listing.

The user should be able to quickly filter Escrows by status.

First inspect the actual statuses used by the current implementation.

Do NOT invent statuses.

Use the actual enum/type/status values from the repository.

Possible examples might include:

```text
ALL
PENDING
FUNDED
IN_PROGRESS
SUBMITTED
APPROVED
RELEASED
DISPUTED
REFUNDED
COMPLETED
```

But this is ONLY an example.

Use the actual project statuses.

---

# 4. FILTER UX

The filter should visually and behaviorally match `/activity`.

Requirements:

* clear active state
* clear inactive state
* accessible keyboard behavior
* responsive on mobile
* no layout overflow
* no excessive UI decoration
* no unnecessary gradients
* preserve existing ChainPay FinTech visual language
* support dark/light mode if the existing application does
* support Thai/English through existing i18n

If `/activity` uses:

* segmented controls → reuse that pattern
* pills → reuse that pattern
* dropdown → reuse that pattern
* tabs → reuse that pattern

Do not introduce a completely different filtering interaction.

---

# 5. FILTER DATA CORRECTNESS

Determine whether Escrow data is currently fetched:

```text
all at once
```

or:

```text
server-side paginated
```

or:

```text
server-side filtered
```

or:

```text
client-side filtered
```

Implement the filter at the correct layer.

If the current Escrow dataset is small and `/activity` uses client filtering, client filtering may be appropriate.

If the existing architecture supports server-side filtering, prefer that.

Do not introduce unnecessary API changes.

---

# 6. FILTER STATE

The filter must behave correctly when:

### User selects a status

Only matching Escrows are displayed.

### User selects ALL

All Escrows are displayed.

### User changes status repeatedly

Results update correctly without stale state.

### User navigates away and returns

Follow the existing `/activity` behavior.

### User refreshes the page

Follow the existing application convention.

Do NOT use:

```ts
window.location.reload()
```

---

# 7. FILTER EMPTY STATES

If a filter produces no results, display the application's existing empty-state pattern.

Example concept:

```text
No escrow contracts found
```

But use the project's existing i18n and wording conventions.

Do not create a visually inconsistent empty state.

There must be a distinction between:

```text
No Escrows exist
```

and:

```text
No Escrows match this filter
```

if the existing UX supports that distinction.

---

# 8. REQUIREMENT B — SMART CONTRACT EXPLORER BUTTON

Add an obvious but clean action allowing the user to inspect the deployed Escrow smart contract.

The button should open the **official Sepolia block explorer**.

The target must be the deployed:

```text
CHAINPAY_ESCROW_CONTRACT_ADDRESS
```

or whatever existing environment/config variable is actually used by the project.

Do NOT hard-code the contract address.

---

# 9. EXPLORER URL ARCHITECTURE

First inspect whether the repository already has:

* explorer URL utilities
* transaction explorer links
* chain configuration
* `getExplorerUrl`
* `getBlockExplorerUrl`
* `getTxUrl`
* `getAddressUrl`
* Wagmi chain configuration
* Viem chain configuration

If an existing utility exists, reuse it.

If one does not exist, create a small reusable utility rather than hard-coding URLs in JSX.

Conceptually:

```ts
getExplorerAddressUrl(chainId, contractAddress)
```

For Sepolia the resulting URL should resolve to the deployed contract address on the official Sepolia block explorer.

Do not assume the explorer is always Sepolia.

Use the project's configured chain.

---

# 10. CONTRACT BUTTON UX

The button should communicate clearly what it does.

Preferred semantic concept:

```text
View Smart Contract
```

or the existing project's Thai/English equivalent.

It may include an existing external-link icon from the design system.

Do not introduce a new icon library if one already exists.

The button should:

* open the explorer in a new tab/window
* use safe external-link behavior
* preserve the current ChainPay page
* work on desktop
* work on mobile
* be keyboard accessible
* have an accessible label

Use appropriate:

```html
target="_blank"
rel="noopener noreferrer"
```

if using a normal anchor.

Prefer an `<a>` when navigation is simply an external URL.

Do not use JavaScript `window.open()` unless the existing architecture specifically requires it.

---

# 11. WHERE TO PLACE THE CONTRACT BUTTON

Inspect the current Escrow UX and determine the most logical location.

Consider:

### Escrow list

Useful if users need quick access.

### Escrow detail

Very useful because the user is already inspecting the contract.

### Both

Only if it is genuinely useful and does not create UI clutter.

Do NOT blindly duplicate the same button everywhere.

Choose the placement that fits the existing information hierarchy.

If the existing detail page already has transaction information, a contract/explorer action should be placed near that blockchain-related information.

---

# 12. DISTINGUISH CONTRACT VS TRANSACTION

This is critical.

Do not confuse:

```text
Smart Contract Address
```

with:

```text
Transaction Hash
```

The new action requested here is:

```text
View Smart Contract
→ contract address on Sepolia explorer
```

Existing transaction links should remain:

```text
View Transaction
→ transaction hash on Sepolia explorer
```

If the project already has transaction explorer links, make the two actions visually and semantically distinct.

---

# 13. CONTRACT ADDRESS VALIDATION

Before rendering the link:

* validate that the configured address exists
* ensure it is a valid EVM address
* ensure it belongs to the configured chain
* do not generate malformed URLs

If the address is missing:

Do not render a broken external link.

Use an appropriate fallback according to the existing application's error/availability pattern.

Do not crash the page.

---

# 14. ENVIRONMENT CONFIGURATION

Inspect all existing environment variable usage.

Determine the exact variable used for the deployed Escrow contract.

For example, it may be:

```env
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS=0x...
```

Do not assume the variable name.

Search the entire repository.

Ensure:

* client-side code uses `NEXT_PUBLIC_...` when necessary
* server-only secrets remain server-only
* contract address is not duplicated in source code
* local development still works
* Vercel production can use the same configuration

Do not modify `.env` files with real secrets.

If an example file exists, update only if necessary and use placeholders.

---

# 15. I18N

Inspect the existing Thai/English translation structure.

Add translation keys for:

* All statuses
* Filter labels
* Smart Contract button
* View Smart Contract
* No matching Escrows
* any tooltip/aria labels if needed

Do NOT hard-code:

```tsx
"View Smart Contract"
```

directly in the component if the project uses i18n.

Do not create a new translation system.

Follow the existing key naming convention.

Verify both Thai and English.

---

# 16. RESPONSIVE DESIGN

Test at minimum:

### Desktop

```text
1440px
1280px
1024px
```

### Mobile

```text
390px
375px
```

Verify:

* filters do not overflow
* buttons do not collide
* contract button remains accessible
* cards remain readable
* no horizontal scrolling
* text truncation is graceful
* touch targets are usable
* status badges remain readable

Do not solve mobile problems by simply shrinking text excessively.

---

# 17. ACCESSIBILITY

Verify:

* buttons/links have accessible names
* keyboard navigation
* visible focus state
* filter active state is understandable
* external link behavior is understandable
* icon-only buttons have aria-labels
* color is not the only status indicator

Follow existing accessibility conventions.

---

# 18. PERFORMANCE

Do not introduce unnecessary:

* API requests
* database queries
* React effects
* re-renders
* duplicated fetching
* global state

Changing a filter should not trigger unnecessary blockchain RPC calls.

The filter should operate on Escrow application data.

The Smart Contract button should simply navigate to the explorer.

---

# 19. SECURITY

Do not expose:

* private keys
* RPC secrets
* Firebase Admin secrets
* database credentials

The contract address is public information and may be exposed to the client.

Never construct explorer URLs using untrusted arbitrary user input without validation.

---

# 20. IMPLEMENTATION STRATEGY

Work in this order:

```text
1. Audit repository
2. Inspect /activity
3. Inspect Escrow
4. Identify reusable components
5. Identify actual status enum
6. Identify contract address configuration
7. Identify existing explorer utilities
8. Design minimal UX
9. Implement filter
10. Implement explorer action
11. Add i18n
12. Verify responsive behavior
13. Run typecheck
14. Run lint
15. Run tests
16. Run build
17. Run relevant E2E tests
18. Fix all failures
19. Re-run everything
20. Perform final regression audit
```

Do not stop after the first successful build.

---

# 21. TEST MATRIX

## A. Filter

Test:

```text
ALL
each existing status
status with results
status with zero results
rapid filter changes
filter reset
mobile filter
desktop filter
```

Expected:

```text
Only matching Escrows appear.
```

---

# 22. SMART CONTRACT BUTTON TEST

Verify:

```text
Click View Smart Contract
↓
New tab opens
↓
Correct Sepolia explorer
↓
Correct contract address
↓
Contract page loads
```

Verify the URL does NOT accidentally point to:

```text
mainnet
Goerli
Holesky
wrong chain
transaction hash
wrong address
```

---

# 23. REGRESSION TEST

Existing Escrow features MUST continue working:

### Client

* create escrow
* view escrow
* fund escrow
* approve
* release
* dispute
* refund where applicable

### Freelancer

* view escrow
* view milestones
* submit work
* view submission
* see status changes

### Blockchain

* MetaMask
* Sepolia
* transaction submission
* receipt verification
* event verification
* DB synchronization

### UI

* loading
* errors
* empty states
* responsive
* i18n

Do not alter the successful blockchain flow that has already been manually verified.

---

# 24. REGRESSION TEST FOR PREVIOUS BUGS

Specifically verify that previous fixes remain intact.

### ETH display

Verify:

```text
0.001 ETH
0.002 ETH
0.003 ETH
Total 0.006 ETH
```

does not become:

```text
0 ETH
```

### Fund transaction

Verify:

```text
reasonable gas
```

and no:

```text
transaction gas limit too high
```

### Submit Work

Verify:

```text
Submit Work
↓
success
↓
SUBMITTED
```

without:

```text
red error toast
```

and without:

```text
manual browser reload
```

### Approve & Release

Verify:

```text
Approve & Release
↓
MetaMask opens
↓
Confirm
↓
transaction
↓
verification
↓
RELEASED
```

without requiring a page reload.

---

# 25. AUTOMATED TESTS

Run the repository's existing commands.

At minimum:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

If these scripts differ, inspect `package.json` and use the project's actual scripts.

If Playwright or another E2E framework exists:

```text
Run the relevant Escrow E2E tests.
```

Add tests for the new filter if the project testing architecture supports it.

Add tests for explorer URL generation if a reusable utility is introduced.

---

# 26. TEST FAILURE POLICY

If ANY test fails:

1. Read the actual failure.
2. Identify root cause.
3. Fix the root cause.
4. Re-run the failed test.
5. Re-run the relevant suite.
6. Re-run typecheck.
7. Re-run lint.
8. Re-run build.

Do not ignore failures.

Do not disable tests.

Do not change assertions simply to make tests pass unless the original assertion is demonstrably obsolete.

Do not report PASS if a test actually failed.

---

# 27. BUILD VERIFICATION

Production build must complete successfully.

Verify:

```text
TypeScript
ESLint
Next.js build
Route generation
Environment variable references
Client/server boundaries
```

Pay particular attention to:

```text
NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS
```

because client-side access requires the `NEXT_PUBLIC_` prefix.

---

# 28. FINAL CODE QUALITY AUDIT

Before finishing, inspect your own changes.

Look specifically for:

* duplicated components
* duplicated status mappings
* duplicated explorer URLs
* hard-coded translations
* unnecessary `useEffect`
* stale closures
* incorrect query invalidation
* broken loading state
* mobile overflow
* unused imports
* TypeScript `any`
* unsafe URL construction
* incorrect chain ID
* wrong contract address
* accidental contract logic changes

Clean them before finalizing.

---

# 29. FINAL ACCEPTANCE CRITERIA

The implementation is COMPLETE only when all of these are true:

### Status Filter

* [ ] Escrow status filter exists
* [ ] visually matches `/activity`
* [ ] uses real Escrow statuses
* [ ] ALL works
* [ ] each status works
* [ ] empty filter state works
* [ ] mobile works
* [ ] desktop works
* [ ] Thai works
* [ ] English works
* [ ] no unnecessary API calls

### Smart Contract

* [ ] View Smart Contract action exists
* [ ] points to the deployed Escrow contract
* [ ] uses configured contract address
* [ ] points to the correct Sepolia explorer
* [ ] opens safely in a new tab
* [ ] does not confuse contract address with transaction hash
* [ ] works on mobile
* [ ] works on desktop

### Existing Escrow

* [ ] Create works
* [ ] Fund works
* [ ] Submit Work works
* [ ] Approve & Release works
* [ ] existing verification remains intact
* [ ] no manual reload required
* [ ] previous gas fix remains intact
* [ ] ETH/Wei display remains correct

### Quality

* [ ] typecheck PASS
* [ ] lint PASS
* [ ] tests PASS
* [ ] build PASS
* [ ] E2E PASS where available
* [ ] no new console errors
* [ ] no broken existing features

---

# 30. FINAL REPORT

At the end, provide a concise but technically complete report containing:

## 1. Analysis

What existing `/activity` and Escrow patterns were discovered.

## 2. Design

Where the filter and Smart Contract action were placed and why.

## 3. Files Changed

List every changed file.

## 4. Implementation

Explain:

* filter architecture
* status handling
* explorer URL handling
* i18n
* responsive behavior

## 5. Tests

Report:

```text
Typecheck: PASS/FAIL
Lint: PASS/FAIL
Unit/Application tests: PASS/FAIL
E2E: PASS/FAIL/NOT AVAILABLE
Build: PASS/FAIL
Manual regression: PASS/FAIL
```

## 6. Regression

Explicitly confirm:

```text
ETH display:
Fund:
Submit Work:
Approve & Release:
Blockchain verification:
DB synchronization:
```

## 7. Remaining Issues

If anything remains, state it honestly.

Do not claim:

```text
Everything passed
```

unless it actually did.

---

# FINAL OBJECTIVE

Deliver a production-ready Escrow UX enhancement where:

```text
/contracts
      │
      ├── Status Filter
      │      ├── ALL
      │      ├── Status A
      │      ├── Status B
      │      └── Status C
      │
      └── Escrow
             │
             ├── Existing Escrow actions
             │
             └── View Smart Contract
                       ↓
                Sepolia Explorer
                       ↓
                Deployed ChainPayEscrow
```

The implementation must feel like it has always been part of ChainPay.

Prioritize:

**consistency > simplicity > correctness > maintainability > visual novelty**

Do not redesign the whole page.

Do not touch working blockchain logic unless required.

Finish the complete implementation, test it repeatedly, fix failures, and only then provide the final report.
