# ChainPay — Thai / English i18n Integration for New Features

You are working on the existing ChainPay project.

The project already has a working **Thai / English bilingual system (i18n)**.

Your task is to audit and update **ONLY the newly created features from the Escrow / Contracts implementation** so that they fully support the existing Thai/English localization system.

Do NOT redesign the existing i18n architecture.

Do NOT replace the current language system.

Do NOT modify unrelated existing features unless required to correctly integrate the new Escrow translations.

---

# CURRENT PROJECT STATE

ChainPay already has:

* Next.js App Router
* Firebase Authentication
* Neon PostgreSQL
* Drizzle ORM
* MetaMask
* Ethereum Sepolia
* Existing Thai / English language switching
* Existing localized UI
* Payment system
* Payment Request
* QR Payment
* Transaction History
* Wallet Management
* Escrow / Contracts system
* `ChainPayEscrow.sol`
* Real Sepolia integration
* Server-side blockchain transaction verification
* Contract event verification
* Neon synchronization

The following Escrow phases have already been implemented:

```text
Phase 3 — Smart Contract
Phase 4 — Database
Phase 5 — Backend API
Phase 6 — Frontend
Phase 7 — Sepolia E2E Integration
```

The new feature area includes:

```text
/contracts

EscrowList
EscrowForm
EscrowDetail
Contract status
Milestones
Funding
Release
Refund
Dispute
Blockchain verification
Transaction status
Sepolia explorer links
```

The existing application already supports:

```text
Thai
English
```

The new Escrow / Contracts UI must now fully participate in that existing system.

---

# PRIMARY OBJECTIVE

Make every user-facing string introduced by the new Escrow / Contracts functionality available in:

```text
TH
EN
```

and make sure switching language dynamically updates the UI without requiring a page redesign or manual refresh.

The final result should feel like the Escrow system was part of ChainPay from the beginning.

---

# STEP 1 — AUDIT THE EXISTING i18n SYSTEM

Before changing anything, inspect the existing localization architecture.

Search the entire repository for:

```text
i18n
locale
language
lang
translations
messages
useTranslations
t(
next-intl
dictionary
Thai
English
th
en
```

Determine exactly:

1. How the current language is stored
2. How language switching works
3. Where Thai translations live
4. Where English translations live
5. How components access translations
6. Whether translations are namespace-based
7. Whether server components and client components use different APIs
8. Existing naming conventions
9. Existing fallback behavior

IMPORTANT:

**Reuse the existing architecture.**

Do not introduce another i18n library.

Do not create a second translation system.

Do not duplicate language state.

---

# STEP 2 — AUDIT ALL NEW ESCROW UI

Inspect all files introduced or modified for the Escrow / Contracts feature.

At minimum inspect:

```text
src/app/(dashboard)/contracts/

src/components/escrow/

src/features/escrow/

src/app/api/

src/components/navigation/

```

Also search for user-facing strings inside:

```text
EscrowList
EscrowForm
EscrowDetail
Contract pages
Milestone components
Status badges
Transaction status
Funding flow
Release flow
Refund flow
Dispute flow
Error states
Empty states
Loading states
Confirmation dialogs
Toast messages
Wallet messages
Sepolia messages
Blockchain verification messages
```

Do not assume only visible labels need translation.

Find every hardcoded user-facing string.

---

# STEP 3 — NO HARD-CODED USER-FACING STRINGS

Replace newly introduced hardcoded UI strings such as:

```text
Contracts
Create Contract
Escrow
Create Escrow
Client
Freelancer
Milestones
Amount
Total Amount
Released
Remaining
Fund Escrow
Release Milestone
Refund
Dispute
Pending
Confirmed
Failed
Completed
Draft
In Progress
Waiting for confirmation
Transaction submitted
Transaction confirmed
Transaction failed
Wrong Network
Switch to Sepolia
Insufficient balance
Transaction rejected
Blockchain verification failed
```

with the project's existing translation mechanism.

Example concept:

```text
t("escrow.title")
t("escrow.create")
t("escrow.fund")
```

Use the actual naming convention already present in the project.

Do not blindly use this example if the project uses a different convention.

---

# STEP 4 — CREATE TRANSLATIONS FOR BOTH LANGUAGES

Add complete Thai and English translations using the existing translation files / namespace structure.

The translations must not be literal machine-like translations.

They should sound natural for a Web3 / FinTech application.

Examples:

| English                        | Thai                               |
| ------------------------------ | ---------------------------------- |
| Contracts                      | สัญญา                              |
| Escrow                         | เอสโครว์                           |
| Create Contract                | สร้างสัญญา                         |
| Create Escrow                  | สร้างเอสโครว์                      |
| Client                         | ผู้ว่าจ้าง                         |
| Freelancer                     | ผู้รับงาน                          |
| Milestones                     | งวดงาน                             |
| Total Amount                   | จำนวนเงินทั้งหมด                   |
| Released                       | จ่ายแล้ว                           |
| Remaining                      | คงเหลือ                            |
| Fund Escrow                    | ฝากเงินเข้า Escrow                 |
| Release Milestone              | ปล่อยเงินงวดงาน                    |
| Refund                         | คืนเงิน                            |
| Dispute                        | เปิดข้อพิพาท                       |
| Pending                        | กำลังดำเนินการ                     |
| Confirmed                      | ยืนยันแล้ว                         |
| Failed                         | ล้มเหลว                            |
| Completed                      | เสร็จสิ้น                          |
| Draft                          | แบบร่าง                            |
| In Progress                    | กำลังดำเนินการ                     |
| Waiting for confirmation       | กำลังรอการยืนยัน                   |
| Transaction submitted          | ส่งธุรกรรมแล้ว                     |
| Transaction confirmed          | ธุรกรรมได้รับการยืนยันแล้ว         |
| Transaction failed             | ธุรกรรมล้มเหลว                     |
| Wrong Network                  | เครือข่ายไม่ถูกต้อง                |
| Switch to Sepolia              | เปลี่ยนไปใช้ Sepolia               |
| Insufficient balance           | ยอดคงเหลือไม่เพียงพอ               |
| Transaction rejected           | ผู้ใช้ปฏิเสธธุรกรรม                |
| Blockchain verification failed | การตรวจสอบธุรกรรมบนบล็อกเชนล้มเหลว |

Use better terminology if the existing ChainPay translation system already has established wording.

---

# STEP 5 — STATUS TRANSLATIONS

Pay special attention to statuses.

Statuses must NEVER be hardcoded directly into the UI.

For example, do NOT do:

```tsx
<StatusBadge>
  {status}
</StatusBadge>
```

if the raw status is:

```text
FUNDED
IN_PROGRESS
MILESTONE_SUBMITTED
PARTIALLY_RELEASED
COMPLETED
DISPUTED
REFUNDED
CANCELLED
FAILED
```

Instead map them through the existing localization system.

Conceptually:

```text
FUNDED
→ Thai: ฝากเงินแล้ว
→ English: Funded

IN_PROGRESS
→ Thai: กำลังดำเนินการ
→ English: In Progress
```

Preserve the actual internal enum/database values.

Only the presentation layer should be localized.

---

# STEP 6 — BLOCKCHAIN / TRANSACTION MESSAGES

Make every user-facing blockchain message bilingual.

Include translations for:

```text
Connecting wallet
Checking network
Switching network
Preparing transaction
Waiting for wallet confirmation
Transaction submitted
Waiting for block confirmation
Verifying transaction
Verifying smart contract event
Transaction confirmed
Transaction failed
Transaction reverted
Transaction rejected
Insufficient ETH
Wrong network
Invalid transaction
Verification failed
Contract mismatch
```

Do NOT translate:

* transaction hash
* wallet address
* contract address
* chain ID
* raw blockchain error codes

Only translate the explanatory UI around them.

---

# STEP 7 — ESCROW FORM

Audit the entire Escrow creation form.

Every visible element must support Thai/English:

```text
Page title
Description
Client
Freelancer
Contract name
Description
Total amount
Milestones
Milestone name
Milestone description
Milestone amount
Due date
Add milestone
Remove milestone
Create
Save
Cancel
Review
Validation errors
```

Validation errors must also use the existing i18n system.

For example:

```text
English:
Milestone amount is required.

Thai:
กรุณาระบุจำนวนเงินของงวดงาน
```

Do not leave Zod validation errors in English if they are directly displayed to users.

---

# STEP 8 — ESCROW DETAIL

Audit `EscrowDetail` thoroughly.

Translate:

```text
Contract information
Participants
Client
Freelancer
Contract value
Funding status
Milestone progress
Payment progress
Remaining amount
Released amount
Blockchain transaction
Transaction hash
Block
Confirmed
View on Explorer
```

Buttons:

```text
Fund Escrow
Release Milestone
Request Refund
Open Dispute
Resolve Dispute
Cancel
Back
```

Dialogs:

```text
Confirm funding
Confirm milestone release
Confirm refund
Confirm dispute
```

All must use the existing i18n system.

---

# STEP 9 — ESCROW LIST

Audit the `/contracts` overview page.

Translate:

```text
Contracts
My Contracts
Incoming
Outgoing
All
Create Contract
No contracts found
No incoming contracts
No outgoing contracts
Loading contracts
Failed to load contracts
```

Table headers / cards must also be localized.

Do not hardcode column titles.

---

# STEP 10 — EMPTY / LOADING / ERROR STATES

This is important.

The following states must also support both languages:

```text
Loading...
No contracts found
No milestones found
Unable to load escrow
Something went wrong
Try again
Retry
No transaction yet
Waiting for blockchain confirmation
Blockchain verification in progress
```

Do not leave English-only fallback messages.

---

# STEP 11 — NAVIGATION

The newly added:

```text
Contracts
```

navigation item must use the existing localization mechanism.

If the existing navigation is already translated:

```text
Dashboard
Payments
Requests
History
...
```

then Contracts must follow the same system.

Do not modify the existing navigation architecture.

---

# STEP 12 — TOASTS / NOTIFICATIONS

Search for all:

```text
toast()
sonner
alert()
notification
error()
success()
```

inside the new Escrow feature.

Translate all user-facing messages.

For example:

```text
Escrow created successfully.
สร้างเอสโครว์สำเร็จแล้ว
```

```text
Transaction confirmed.
ธุรกรรมได้รับการยืนยันแล้ว
```

```text
Failed to verify transaction.
ไม่สามารถตรวจสอบธุรกรรมได้
```

---

# STEP 13 — PRESERVE TECHNICAL VALUES

Do NOT translate technical values.

Keep:

```text
ETH
Sepolia
Ethereum
txHash
wallet address
contract address
Chain ID
block number
```

For example:

Correct:

```text
ธุรกรรมได้รับการยืนยันบน Ethereum Sepolia
```

Incorrect:

```text
ธุรกรรมได้รับการยืนยันบน อีเธอเรียม ซีโพเลีย
```

Keep technical identifiers intact.

---

# STEP 14 — LANGUAGE SWITCH TEST

Verify the complete flow in both languages.

## Thai

```text
Switch to Thai
↓
Open Contracts
↓
Create Escrow
↓
Review
↓
Fund
↓
MetaMask
↓
Pending
↓
Confirmed
↓
Milestone
↓
Release
↓
Completed
```

Every visible user-facing string must be Thai.

## English

```text
Switch to English
↓
Open Contracts
↓
Create Escrow
↓
Review
↓
Fund
↓
MetaMask
↓
Pending
↓
Confirmed
↓
Milestone
↓
Release
↓
Completed
```

Every visible user-facing string must be English.

---

# STEP 15 — DYNAMIC SWITCHING

Ensure language switching works without breaking Escrow state.

For example:

```text
Thai
↓
Open Escrow
↓
Switch to English
↓
Same Escrow
↓
UI changes to English
```

Do not reset:

* escrow ID
* form data
* selected milestone
* transaction state
* wallet connection
* blockchain state

Language switching should only affect presentation.

---

# STEP 16 — DO NOT LOCALIZE SERVER / DATABASE ENUMS

Keep internal values unchanged.

Example:

```text
FUNDED
IN_PROGRESS
COMPLETED
DISPUTED
REFUNDED
```

must remain exactly the same in:

* database
* API
* contract integration
* TypeScript types
* server logic

Only UI labels are translated.

---

# STEP 17 — TESTING

After implementation run the existing project checks.

At minimum:

```bash
npm run typecheck
npm run lint
npm run build
```

Run the existing tests:

```bash
npm test
```

or the project's existing test command.

Run existing EVM / contract tests if available.

Run Playwright tests if already configured.

Do not remove or weaken existing tests.

---

# STEP 18 — ADD i18n REGRESSION TESTS IF APPROPRIATE

If the project already has localization tests, extend them.

Otherwise, add lightweight tests only if they fit the existing architecture.

Verify:

```text
Thai translation exists
English translation exists
No missing translation keys
No undefined translation values
Escrow navigation is localized
Escrow statuses are localized
Escrow errors are localized
Escrow buttons are localized
Blockchain states are localized
```

Do not introduce a heavy testing framework just for this task.

---

# STEP 19 — SEARCH FOR REMAINING HARD-CODED STRINGS

After implementation, perform a final repository search specifically in the new Escrow feature.

Look for strings such as:

```text
"Create"
"Cancel"
"Save"
"Confirm"
"Pending"
"Success"
"Failed"
"Error"
"Loading"
"Contracts"
"Escrow"
"Milestone"
"Release"
"Refund"
"Dispute"
"Transaction"
"Blockchain"
"Wallet"
"Network"
"Confirmed"
```

Review each result.

Not every string needs translation—for example internal constants, test descriptions, developer logs, or technical identifiers may remain unchanged.

But every **user-visible string** must use i18n.

---

# STEP 20 — DO NOT CHANGE THE EXISTING DESIGN

This task is an i18n integration task.

Do NOT:

* redesign the UI
* change colors
* change layout
* replace GlassCard
* replace StatusBadge
* replace icons
* add gradients
* change typography
* redesign navigation
* modify existing payment UI

Only make the minimum changes required for proper bilingual support.

The new Escrow UI should visually remain consistent with the existing ChainPay design system.

---

# STEP 21 — FINAL REPORT

When complete, provide:

## Files Changed

List all modified files.

## Translation Keys Added

Show the translation namespace/key structure.

Example:

```text
escrow.*
contracts.*
milestones.*
blockchain.*
```

Use the project's actual structure.

## Coverage

Report:

```text
Escrow List              PASS
Escrow Form              PASS
Escrow Detail            PASS
Milestones               PASS
Funding                  PASS
Release                  PASS
Refund                   PASS
Dispute                  PASS
Blockchain states        PASS
Transaction errors       PASS
Navigation               PASS
Thai                     PASS
English                  PASS
Dynamic switching        PASS
```

## Validation

Report:

```text
Typecheck                PASS/FAIL
Lint                     PASS/FAIL
Build                    PASS/FAIL
Unit tests               PASS/FAIL
EVM tests                PASS/FAIL
Playwright               PASS/FAIL
```

## Final Requirement

The final implementation must satisfy:

> **Every user-facing string introduced by the Escrow / Contracts features must be fully integrated into ChainPay's existing Thai/English i18n system, while preserving all existing functionality, blockchain behavior, database state, and visual design.**

Do not stop at translating only page titles.

Audit the complete user journey and all user-visible states.
