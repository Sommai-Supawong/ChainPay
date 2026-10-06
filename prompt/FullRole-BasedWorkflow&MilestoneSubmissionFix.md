# ChainPay Escrow — Full Role-Based Workflow & Milestone Submission Fix

You are working on the existing **ChainPay V2** project.

Your task is to perform a **full audit and implementation fix for the Escrow / Contracts domain**, specifically the Client/Freelancer roles and the milestone submission/review workflow.

This is a **business-logic and authorization correction**, not merely a UI change.

Do NOT redesign the entire application.

Do NOT create a new Escrow smart contract.

Do NOT replace the existing architecture.

Preserve the existing ChainPay V2 architecture, existing deployed `ChainPayEscrow.sol`, existing Thai/English i18n system, existing design system, and existing blockchain integration.

---

# 1. PRIMARY OBJECTIVE

The Escrow system must correctly represent two parties:

### Client

The person who:

* creates the Escrow contract
* hires the Freelancer
* deposits/funds the Escrow
* reviews submitted work
* approves completed work
* triggers/releases payment according to the existing contract workflow
* can open a dispute according to the existing rules
* can perform refund actions according to the existing rules

### Freelancer

The person who:

* receives the work contract
* performs the work
* works through milestones
* submits completed work/deliverables
* waits for Client review
* receives payment after approval/release

The fundamental workflow must be:

```text
Client
  ↓
Create Contract
  ↓
Fund Escrow
  ↓
Freelancer works on milestone
  ↓
Freelancer submits work
  ↓
Client reviews submission
  ↓
Client approves
  ↓
Payment is released
  ↓
Freelancer receives funds
```

The current implementation has incorrect behavior:

1. Escrow Detail displays only the Freelancer and does not clearly display the Client.
2. Both Client and Freelancer currently see the `Submit Work` action.
3. The Freelancer cannot currently create/use a real work submission.
4. The Client does not have a complete and clear submission review workflow.
5. Milestone role authorization and state transitions need to be audited.

Fix all of these issues properly.

---

# 2. IMPORTANT — AUDIT FIRST

Before modifying code, inspect the existing implementation completely.

Read and understand:

```text
src/features/escrow/
src/components/escrow/
src/app/(dashboard)/contracts/
src/app/api/
src/db/schema.ts
src/db/
src/lib/validation/
src/i18n/
src/components/navigation/
```

Also inspect:

* Escrow models/types
* Escrow API routes
* Escrow server functions
* authentication/session logic
* wallet ownership logic
* existing authorization logic
* milestone state handling
* existing smart contract integration
* existing Wagmi/Viem usage
* existing tests
* existing i18n implementation
* existing status presentation
* existing UI components such as GlassCard, StatusBadge, dialogs, forms, etc.

Do not assume the schema or API structure.

Determine how the existing system currently identifies:

* Client
* Freelancer
* current authenticated user
* wallet owner
* Escrow owner
* milestone owner
* contract participant

Reuse the existing architecture wherever possible.

Do not introduce duplicate role models unnecessarily.

---

# 3. ROLE MODEL

Establish a clear and consistent role model.

The Escrow must have:

```text
Client
Freelancer
```

Do not use ambiguous terms such as:

```text
owner
creator
user
sender
receiver
```

as substitutes unless they already have a clearly defined meaning in the existing architecture.

If the current database/model uses different field names, map them correctly instead of unnecessarily renaming the entire schema.

The semantic meaning must be:

```text
Client = the hiring/payment party

Freelancer = the work/delivery party
```

---

# 4. ESCROW DETAIL — DISPLAY BOTH PARTIES

The Escrow Detail page currently displays only the Freelancer.

Fix this.

Add a clear section such as:

```text
ESCROW PARTIES

Client
0x1234...5678

Freelancer
0xabcd...7890
```

Use the existing ChainPay design system.

Do not create an unrelated visual style.

The section should work responsively on desktop and mobile.

If profile information is available, display the appropriate user identity.

If only a wallet address is available, use the existing wallet-address formatting/truncation utility.

Do not expose unnecessary personal information.

---

# 5. ROLE-BASED ACTIONS

The UI must correctly reflect the authenticated user's role.

## Client actions

Client may see actions such as:

```text
Fund Escrow
Review Submission
Approve
Release Funds
Open Dispute
Refund
```

Only show actions that are valid for the current Escrow/milestone state.

Client must NOT see:

```text
Submit Work
```

## Freelancer actions

Freelancer may see:

```text
Submit Work
View Contract
View Milestones
View Submission Status
```

Freelancer must NOT be allowed to:

```text
Approve
Release Funds
Approve their own work
Release their own payment
Submit work on behalf of Client
```

Do not merely hide buttons.

The backend/API must enforce the same permissions.

---

# 6. CRITICAL SECURITY REQUIREMENT

Frontend role checks are NOT sufficient.

A malicious user must not be able to bypass the UI and call an API endpoint directly.

Every sensitive Escrow operation must verify the authenticated user on the server.

For example:

## Submit Work

Server must verify:

```text
authenticated user
        ↓
Escrow freelancer
        ↓
Milestone belongs to Escrow
        ↓
milestone state allows submission
        ↓
allow
```

Otherwise:

```text
403 Forbidden
```

with an appropriate translated error.

## Approve Work

Server must verify:

```text
authenticated user
        ↓
Escrow client
        ↓
Milestone belongs to Escrow
        ↓
Milestone is submitted
        ↓
allow
```

Freelancer must never be able to approve their own work.

---

# 7. IMPLEMENT REAL WORK SUBMISSION

The existing `Submit Work` button currently does not provide a usable submission workflow.

Implement a proper submission form using the existing ChainPay UI components.

At minimum, the submission should support:

### Submission Title

Example:

```text
Homepage UI completed
```

### Description

Example:

```text
Completed the responsive homepage and desktop layout.
```

### Evidence / Deliverable URL

Example:

```text
https://example.com/project-preview
```

Use URL evidence if the existing architecture supports it.

Do NOT introduce a new file-upload/storage provider unless the current project already has one and it is appropriate.

For this task, a text description + URL evidence is sufficient if no existing file-upload infrastructure exists.

---

# 8. SUBMISSION MUST BELONG TO A MILESTONE

A work submission must be associated with a specific milestone.

Conceptually:

```text
Escrow
  ↓
Milestone
  ↓
Submission
```

Do not store an unstructured submission that cannot be associated with its milestone.

Inspect the current database schema first.

If the existing schema already has a submission structure, reuse it.

If the schema genuinely lacks the required structure, add the minimum necessary database fields/table and create a proper Drizzle migration.

Do not unnecessarily redesign the entire database.

Preserve existing data.

---

# 9. MILESTONE STATE MACHINE

Audit the current milestone states.

The intended workflow is:

```text
PENDING
   ↓
IN_PROGRESS
   ↓
SUBMITTED
   ↓
APPROVED
   ↓
RELEASED
```

Dispute path:

```text
SUBMITTED
   ↓
DISPUTED
```

Use the existing enum/state values if they already exist.

Do not create duplicate status systems.

The following transitions must be protected:

### Freelancer

```text
IN_PROGRESS → SUBMITTED
```

### Client

```text
SUBMITTED → APPROVED
```

### Payment settlement

```text
APPROVED → RELEASED
```

Do not allow invalid transitions such as:

```text
PENDING → RELEASED
IN_PROGRESS → RELEASED
RELEASED → SUBMITTED
RELEASED → APPROVED
Freelancer → APPROVED
Client → SUBMITTED
```

unless the existing business rules explicitly require them.

---

# 10. SUBMISSION FORM UX

Create the submission UI using the existing ChainPay visual language.

Example:

```text
Submit Work

Milestone
Website UI Design

Submission Title
[ Homepage UI completed ]

Description
[ Completed responsive homepage... ]

Evidence / Deliverable URL
[ https://... ]

[ Cancel ] [ Submit Work ]
```

Requirements:

* proper validation
* loading state
* disabled state during submission
* success state
* error state
* Thai/English i18n
* responsive behavior
* accessible labels
* keyboard accessibility

Do not redesign unrelated parts of the page.

---

# 11. AFTER SUBMISSION — FREELANCER VIEW

After successful submission, the Freelancer should see something like:

```text
Milestone 1

Status
Submitted

Your Submission

Homepage UI completed

Completed responsive homepage and desktop layout.

Evidence
https://...

Waiting for client review.
```

The Freelancer must not be able to submit the same milestone repeatedly while it is already `SUBMITTED`.

If resubmission is required in the future, it should be an explicit business rule.

Do not implement accidental duplicate submissions.

---

# 12. CLIENT REVIEW UI

When the Freelancer submits work, the Client should see:

```text
Milestone 1
Website UI Design

Status
Submitted

Submission

Title
Homepage UI completed

Description
Completed responsive homepage and desktop layout.

Evidence
https://...

[ Approve ]
[ Open Dispute ]
```

The Client should be able to inspect the submission before approving it.

The Client should NOT see:

```text
Submit Work
```

---

# 13. APPROVAL WORKFLOW

When the Client clicks Approve:

1. Verify authenticated user is the Client.
2. Verify the milestone belongs to the Escrow.
3. Verify the milestone is currently `SUBMITTED`.
4. Update the appropriate application state.
5. Continue into the existing payment release flow.
6. Use the existing Smart Contract integration.
7. Verify the blockchain transaction/event as already implemented.
8. Only update final settlement state after successful blockchain verification.

Do not bypass the existing blockchain verification architecture.

---

# 14. SMART CONTRACT BOUNDARY

This task does NOT require a new smart contract.

Do NOT deploy another contract.

Do NOT replace the existing deployed:

```text
ChainPayEscrow.sol
```

Do not modify the smart contract unless an actual incompatibility is discovered that makes the required workflow impossible.

The existing blockchain architecture must remain:

```text
Frontend
   ↓
MetaMask / Wagmi
   ↓
Ethereum Sepolia
   ↓
ChainPayEscrow Smart Contract
   ↓
Transaction Receipt / Events
   ↓
Server Verification
   ↓
Neon Database
```

Blockchain remains the authoritative settlement/verification layer.

Application database stores application workflow information such as submissions and review state.

Do not treat frontend state as authoritative.

---

# 15. FUND / RELEASE FLOW

Preserve the existing funding and release logic.

The intended business flow should become:

```text
CLIENT
  │
  │ Create Contract
  ▼
ESCROW
  │
  │ Fund
  ▼
FUNDED
  │
  │
  ▼
FREELANCER
  │
  │ Work
  ▼
IN_PROGRESS
  │
  │ Submit Work
  ▼
SUBMITTED
  │
  │
  ▼
CLIENT REVIEW
  │
  ├───────────────┐
  │               │
  ▼               ▼
APPROVE         DISPUTE
  │
  ▼
RELEASE
  │
  ▼
FREELANCER
```

Do not let the Client directly "submit work".

Do not let the Freelancer approve their own work.

---

# 16. DATABASE AND API AUDIT

Inspect all Escrow-related API endpoints.

Identify endpoints related to:

* create Escrow
* get Escrow
* list Escrows
* fund
* submit milestone
* approve
* release
* refund
* dispute
* transaction verification

Verify that every mutation checks:

```text
authentication
+
authorization
+
resource ownership
+
state transition validity
```

Do not trust IDs supplied by the client.

Do not trust role information supplied by the frontend.

Fetch the authoritative Escrow/milestone record from the database.

---

# 17. ERROR HANDLING

Use the existing error/translation architecture.

Examples:

```text
Only the freelancer can submit work.
Only the client can approve work.
Milestone is not in a submittable state.
Milestone is already submitted.
Submission title is required.
Submission description is required.
Invalid evidence URL.
Submission not found.
Unauthorized escrow access.
```

Do not hardcode user-visible strings.

All user-facing messages must use the existing Thai/English i18n system.

---

# 18. THAI / ENGLISH I18N

The project already has Thai/English localization.

Reuse it.

Do NOT install another i18n library.

Add translations for any new user-facing text, including:

### Roles

```text
Client
Freelancer
Escrow Parties
```

### Submission

```text
Submit Work
Submission
Submission Title
Description
Evidence
Deliverable
Evidence URL
Submitted At
Waiting for Client Review
No Submission Yet
```

### Review

```text
Review Submission
Approve
Approve & Release
Open Dispute
```

### Messages

```text
Work submitted successfully.
Failed to submit work.
Only the freelancer can submit work.
Only the client can approve work.
Submission is already submitted.
Milestone cannot be submitted in its current state.
```

Use the project's existing flat English-keyed dictionary/naming conventions.

Do not introduce another translation structure.

---

# 19. UI / DESIGN REQUIREMENTS

Preserve the existing ChainPay visual design.

Do NOT redesign the entire Contracts page.

Continue using existing:

* GlassCard
* StatusBadge
* buttons
* form components
* typography
* spacing
* modal/dialog patterns
* responsive layout
* navigation
* i18n
* existing visual hierarchy

The new UI should feel like a native part of ChainPay.

Do not introduce:

* excessive gradients
* AI-looking visuals
* unrelated illustrations
* new design systems
* unnecessary animations
* excessive glass effects
* unnecessary dependencies

---

# 20. ACCESSIBILITY

For all new submission/review controls:

* proper labels
* accessible buttons
* meaningful aria-labels
* keyboard accessibility
* visible focus states
* disabled/loading states
* clear validation errors

Use existing accessibility patterns in the project.

---

# 21. RESPONSIVE BEHAVIOR

Verify the workflow on:

### Desktop

```text
Client/Freelancer
Milestone
Submission
Review actions
```

### Mobile

Ensure:

* parties stack correctly
* submission form fits viewport
* buttons do not overflow
* evidence URL does not break layout
* status remains readable
* dialogs/forms remain usable

Do not introduce horizontal scrolling.

---

# 22. TESTING REQUIREMENTS

Add or update tests.

## Client tests

Verify:

* Client can view both parties.
* Client can fund according to existing workflow.
* Client cannot submit work.
* Client can see submitted work.
* Client can approve submitted work.
* Client can open dispute according to existing rules.
* Client cannot manipulate another user's Escrow.

## Freelancer tests

Verify:

* Freelancer can view both parties.
* Freelancer can submit work.
* Freelancer cannot approve.
* Freelancer cannot release funds.
* Freelancer cannot approve their own submission.
* Freelancer cannot submit the same milestone twice while already submitted.

## Unauthorized user tests

Verify:

* Cannot submit work.
* Cannot approve work.
* Cannot release funds.
* Cannot modify another user's Escrow.
* Cannot access private submission data if authorization rules prohibit it.

## Submission tests

Verify:

* Create submission.
* Validate title.
* Validate description.
* Validate URL if required.
* Persist submission.
* Retrieve submission.
* Display submission.
* Change milestone to `SUBMITTED`.
* Client can review.
* Invalid transitions are rejected.

---

# 23. E2E TEST

Add or update Playwright coverage for the complete workflow where the existing test infrastructure allows it.

Expected flow:

```text
Client creates Escrow
      ↓
Client funds Escrow
      ↓
Freelancer opens Escrow
      ↓
Freelancer opens milestone
      ↓
Freelancer submits work
      ↓
Milestone becomes SUBMITTED
      ↓
Client opens Escrow
      ↓
Client sees submission
      ↓
Client approves
      ↓
Existing release/settlement workflow executes
      ↓
Milestone becomes RELEASED
```

Do not fake blockchain confirmation if the existing E2E architecture supports real Sepolia testing.

Follow the project's existing test conventions.

---

# 24. DO NOT BREAK EXISTING FUNCTIONALITY

After implementation, verify that these existing features still work:

* Google authentication
* wallet connection
* wallet verification
* Sepolia network handling
* Send ETH
* Payment Request
* QR Payment
* Transaction History
* Contacts
* Escrow list
* Escrow detail
* Escrow funding
* Escrow release
* Escrow refund
* Escrow dispute
* blockchain verification
* Thai/English switching

Do not regress existing features.

---

# 25. IMPORTANT: DO NOT OVER-ENGINEER

Use the minimum changes required to make the Escrow workflow correct.

Do not:

* rewrite the entire Escrow domain
* replace the existing database architecture
* replace Drizzle
* replace Neon
* replace Firebase Auth
* replace Wagmi/Viem
* replace the existing Smart Contract
* introduce another backend
* introduce another i18n library
* introduce another state-management framework

Reuse existing utilities and components.

---

# 26. VALIDATION COMMANDS

After implementation, run:

```bash
npm run typecheck
npm run lint
npm run build
```

Then run the existing:

```text
Vitest
EVM / Smart Contract tests
Playwright tests
```

Fix all failures.

Do not report success if any relevant test fails.

---

# 27. MANUAL QA CHECKLIST

After automated tests, manually verify:

### As Client

* [ ] Escrow Detail shows Client
* [ ] Escrow Detail shows Freelancer
* [ ] Client does not see Submit Work
* [ ] Client can view milestone
* [ ] Client can view submitted work
* [ ] Client can approve
* [ ] Client can open dispute where valid

### As Freelancer

* [ ] Escrow Detail shows Client
* [ ] Escrow Detail shows Freelancer
* [ ] Freelancer sees Submit Work
* [ ] Freelancer can open submission form
* [ ] Freelancer can enter title
* [ ] Freelancer can enter description
* [ ] Freelancer can add evidence URL
* [ ] Freelancer can submit
* [ ] Milestone changes to SUBMITTED
* [ ] Freelancer sees waiting-for-review state
* [ ] Freelancer cannot approve
* [ ] Freelancer cannot release

### Language

* [ ] Thai works
* [ ] English works
* [ ] Dynamic language switching works
* [ ] New submission/review messages are localized

### Responsive

* [ ] Desktop works
* [ ] Mobile works
* [ ] No overflow
* [ ] Forms work correctly
* [ ] Buttons remain accessible

---

# 28. FINAL REPORT

When finished, provide a concise but complete report containing:

## Root Cause

Explain:

1. Why Client was not displayed.
2. Why both roles saw Submit Work.
3. Why work submission did not function.
4. Whether the problem existed in frontend, backend, database, or multiple layers.

## Files Changed

List every important file changed.

## Database Changes

Clearly state:

* no schema change, or
* exact schema/migration changes.

## API Changes

List changed endpoints and authorization rules.

## State Machine

Explain the final milestone state transitions.

## UI Changes

Explain:

* Client/Freelancer display
* Submit Work form
* Submission display
* Client Review
* role-based actions

## i18n

List new translation keys.

## Security

Explain how server-side role authorization prevents unauthorized actions.

## Blockchain

Confirm:

* existing deployed ChainPayEscrow contract was preserved
* no unnecessary contract deployment occurred
* existing Wagmi/Viem flow was preserved
* blockchain verification remains authoritative
* transaction amounts remain in correct blockchain units

## Test Results

Report:

```text
Typecheck: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Unit tests: PASS/FAIL
EVM tests: PASS/FAIL
Playwright: PASS/FAIL
```

## Final Workflow Confirmation

Confirm that the final workflow is:

```text
CLIENT
  ↓
Create Contract
  ↓
Fund Escrow
  ↓
FREELANCER
  ↓
Work on Milestone
  ↓
Submit Work
  ↓
CLIENT
  ↓
Review Submission
  ↓
Approve
  ↓
Release
  ↓
FREELANCER receives payment
```

The task is complete only when this workflow is correctly enforced at both the UI and server/API authorization layers.
