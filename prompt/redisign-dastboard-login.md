You are working on the existing ChainPay production-oriented Web3 / FinTech application.

Your task is to perform a COMPLETE PRODUCT UI/UX POLISH of the authenticated application.

Primary goal:

Transform ChainPay's Dashboard, Login, Payment flows, Settings, Activity,
Wallet management, Requests, Receipts and supporting application UI into a
cohesive, premium, production-quality FinTech product.

Design language:

Soft UI
+
Liquid Glass
+
Glassmorphism
+
Premium FinTech
+
Subtle Motion
+
Mobile Banking UX

The final result must look intentionally designed by a professional product
designer and frontend engineer.

It must NOT look like:
- an AI-generated dashboard
- a generic Tailwind template
- a crypto casino
- a Dribbble concept that cannot actually be used
- a page with glass cards everywhere
- excessive neon
- excessive gradients
- excessive glow
- excessive blur

==================================================
CRITICAL: DO NOT MODIFY THE HOMEPAGE
==================================================

DO NOT redesign or visually modify:

/
Homepage
Marketing Hero
Predictive Arc
Marketing sections
Marketing footer
Homepage navigation

Do not modify:

src/components/marketing/*
src/app/marketing.css

unless a shared dependency absolutely requires a compatibility fix.

The marketing homepage is already complete.

This task is ONLY for:

Login
Authenticated Application
Dashboard
Payments
Requests
Activity
Wallets
Contacts
Settings
Transaction / Receipt UI
Mobile app shell
Supporting UI

==================================================
1. BEFORE MAKING CHANGES
==================================================

First inspect the entire existing project.

Read and understand:

README.md
document.md
docs/DESIGN.md
docs/ARCHITECTURE.md

Then inspect:

src/app/
src/components/
src/features/
src/app/globals.css

Pay special attention to:

- current design tokens
- App Shell
- Dashboard layout
- Login
- Sidebar / desktop navigation
- Mobile Bottom Navigation
- EN / TH system
- Kanit Thai typography
- Dark / Light theme system
- existing Liquid Glass components
- Button
- GlassCard
- Dialog
- Form components
- Status badges
- Empty states
- Loading states

Do not blindly rewrite existing components.

Reuse and improve the existing design system.

==================================================
2. DESIGN PRINCIPLE
==================================================

The product should visually feel closer to:

modern banking applications
Wise
Revolut
Stripe Dashboard
premium SaaS finance products

The interface should communicate:

Trust
Clarity
Calmness
Precision
Security
Quality

Blockchain should remain the infrastructure underneath.

Do not make the application visually scream:

CRYPTO
WEB3
BLOCKCHAIN

ChainPay should feel like a modern payment application first.

==================================================
3. VISUAL HIERARCHY
==================================================

Create clear surface hierarchy.

Use approximately:

LEVEL 0
Application background

LEVEL 1
Main content surfaces

LEVEL 2
Cards / panels

LEVEL 3
Interactive Liquid Glass controls

LEVEL 4
Modal / sheet / floating navigation

Do not give every component:

backdrop-blur
glow
gradient
large shadow

Liquid Glass should be used strategically for:

- navigation
- modal
- sheet
- important actions
- selected controls
- floating elements
- key balance/wallet cards

Normal informational cards can use quieter Soft UI surfaces.

==================================================
4. DESIGN TOKENS
==================================================

Audit current CSS variables.

Use semantic reusable tokens.

Examples:

--background
--surface
--surface-soft
--surface-elevated

--foreground
--foreground-secondary
--muted

--border
--border-strong

--primary
--primary-soft

--glass
--glass-border
--glass-highlight

--shadow-soft
--shadow-elevated

--success
--warning
--error

Do not hardcode random colors in components.

Use the current ChainPay blue identity.

==================================================
5. DARK THEME
==================================================

Dark remains the default ChainPay application theme.

Use:

deep near-black / navy background
quiet blue-black surfaces
very restrained border
white primary typography
blue-gray secondary typography

ChainPay blue should be an accent,
not the background color of every element.

Avoid excessive black #000000.

Prefer layered dark tones.

Example direction:

background:
#070A0F

surface:
#0B1018

surface elevated:
#101722

primary:
ChainPay Blue

==================================================
6. LIGHT THEME
==================================================

The existing Light Theme must be polished at the same time.

It must NOT become:

plain white website
gray enterprise dashboard
Bootstrap-like UI

Use:

soft off-white application background
clean white surfaces
subtle blue tint
soft neutral shadows
subtle glass transparency
ChainPay blue accent

Maintain identical hierarchy between Dark and Light themes.

Every redesigned component must be reviewed in BOTH themes.

==================================================
7. TYPOGRAPHY
==================================================

Improve typography hierarchy.

English:
keep the existing professional ChainPay font system.

Thai:
continue using Kanit.

Create clear hierarchy:

Page eyebrow
Page title
Page description

Section title
Card title
Card supporting text

Labels
Metadata
Status
Helper text

Do not use oversized typography everywhere.

Dashboard UI should be compact but readable.

Thai typography may require different:

line-height
letter spacing
font weight

Prevent layout changes or overflow between EN / TH.

==================================================
8. LOGIN PAGE
==================================================

Redesign / polish the Login page significantly.

Target:

Premium FinTech authentication experience.

The login page should feel:

minimal
secure
calm
professional

Recommended structure:

ChainPay brand
↓
Short product statement
↓
Authentication card
↓
Continue with Google
↓
Security / non-custodial reassurance

Use:

Soft background
Subtle atmospheric blue lighting
Liquid Glass authentication surface
Premium Google login button
Very restrained motion

Avoid:

giant gradients
floating crypto coins
Ethereum decorations everywhere
3D random illustrations
generic AI landing-page design

On mobile:
Login must feel almost like launching a banking app.

==================================================
9. AUTHENTICATED APP SHELL
==================================================

Audit and polish the main authenticated application shell.

Desktop:

- sidebar / top app navigation
- page content container
- responsive spacing
- content width
- user/profile controls
- language
- theme control if currently exposed

Mobile:

- compact header
- current Liquid Glass Bottom Navigation
- safe-area support
- banking-app style composition

Do not duplicate navigation.

Use shared navigation configuration.

==================================================
10. DASHBOARD
==================================================

Make Dashboard the strongest product page.

The page should immediately answer:

How much do I have?
Which wallet is active?
What can I do?
What happened recently?
Is anything pending?

Recommended hierarchy:

Greeting / contextual header
↓
Primary Wallet / Balance
↓
Quick Actions
↓
Sent / Received / Pending overview
↓
Recent Activity

Primary Wallet Card:

Make this one of the strongest visual components.

Use premium Soft UI + controlled Liquid Glass.

It should display clearly:

Wallet
Balance
Address
Verification state
Network

Do NOT fake financial metrics.

Use actual application data only.

==================================================
11. QUICK ACTIONS
==================================================

Polish:

Send
Request
Receive
Scan

Make them feel like banking-app action controls.

Desktop:
compact action cards / buttons

Mobile:
large touch-friendly controls

Use consistent icon sizing.

Hover:
small lift

Press:
small scale

Avoid dramatic motion.

==================================================
12. PAYMENT / PAY PAGE
==================================================

Make the payment experience extremely clear.

Use clear progressive hierarchy:

Recipient
↓
Amount
↓
Optional metadata
↓
Balance / Network
↓
Continue

Inputs should be premium financial inputs.

Amount field should visually receive more importance.

Wallet addresses should remain readable.

Provide clear states for:

invalid address
insufficient funds
wrong network
missing wallet

Avoid dense technical Web3 terminology.

==================================================
13. PAYMENT REVIEW
==================================================

The Review Payment experience should resemble a banking confirmation screen.

Highlight:

Amount

Then show:

From
To
Network
Estimated fee
Total
Note

The main Confirm action should be visually unmistakable.

Secondary Back action must remain accessible.

Do not overload with decoration.

==================================================
14. PAYMENT REQUESTS
==================================================

Polish:

Requests list
Create Request
Request Detail
Public link actions
QR
Status

Use clear Request status visuals:

Draft
Active
Pending
Paid
Expired
Cancelled

Status colors must remain subtle and professional.

Do not make every status a brightly colored badge.

==================================================
15. ACTIVITY / HISTORY
==================================================

The current Activity page should be refined into a polished banking transaction history.

Improve:

Search
Filter tabs
Transaction rows
Amount hierarchy
Status readability
Sender / receiver metadata
Empty states

Transaction rows should be easy to scan.

Example hierarchy:

Icon
Title
Address / Contact

                     Amount
                     Status

Hover or tap may slightly elevate/highlight the row.

Do not turn every transaction into a giant card.

==================================================
16. TRANSACTION DETAIL / RECEIPT
==================================================

Redesign Receipt / Transaction Detail to feel like a real digital receipt.

Information hierarchy:

Status
Amount
Payment title

From
To

Network
Block
Transaction Hash
Confirmation Time

Actions:

Copy Hash
View Explorer
Back

Make blockchain details accessible but visually secondary.

The receipt should communicate the payment first,
technical blockchain metadata second.

Ensure the existing Back navigation remains clear.

==================================================
17. WALLETS
==================================================

Polish Wallet Management.

Differentiate clearly:

Primary Wallet
Verified Wallet
Secondary Wallet

Wallet card may contain:

label
short address
network
verification
primary state
balance if appropriate

Actions:

Copy
Explorer
Set Primary
Remove

Avoid cluttering all actions at once.

Use contextual menu / secondary action area where appropriate.

==================================================
18. CONTACTS
==================================================

Treat Contacts like payment recipients in a finance app.

Improve:

contact avatar/initial
name
label
wallet address
network

Make:

Add Contact
Edit
Delete
Pay Contact

clear and easy.

Wallet address should remain readable but secondary to contact name.

==================================================
19. SETTINGS
==================================================

Create a consistent Settings experience.

Sections such as:

Profile
Security
Theme

Potential layout:

Settings navigation
+
Content area

On mobile:
Settings should use stacked banking-style list items.

Each setting item:

Icon
Title
Description
Chevron / value

Example:

Profile
Manage your account information

Security
Wallet and account security

Theme
Dark / Light appearance

Avoid creating large glass cards for every setting row.

==================================================
20. THEME SETTINGS
==================================================

Polish:

/settings/theme

Use visual theme previews.

Dark Theme card
Light Theme card

Selected theme should use a subtle Liquid Glass selection treatment.

Do not use a simple plain radio button-only interface.

Theme switching must remain:

instant
persistent
accessible
hydration-safe

Do not modify homepage theme behavior.

Homepage `/` remains dark.

==================================================
21. LANGUAGE CONTROL
==================================================

Keep existing:

EN / TH

Improve the toggle if necessary.

Style:

compact Liquid Glass segmented toggle

Active language:
clear optical highlight

Inactive:
quiet

Do not make the language selector visually dominate pages.

Thai uses Kanit.

==================================================
22. MOBILE BOTTOM NAVIGATION
==================================================

The current custom Liquid Glass bottom navigation and drag interaction are important.

DO NOT remove it.

Preserve:

tap
drag
hold
route synchronization
Home
Pay
Request
Activity
More

Visually refine only if necessary for consistency with the redesigned application.

The active item should remain:

3D Liquid Glass
convex
floating
clearly separated from navbar surface

Do not regress it into a flat rounded rectangle.

==================================================
23. LIQUID GLASS COMPONENT SYSTEM
==================================================

Create or refine reusable glass primitives instead of repeating CSS.

Possible variants:

GlassSurface
GlassButton
GlassPanel
GlassFloatingControl

But only introduce abstractions if they meaningfully reduce duplication.

Glass appearance should include:

transparency
controlled blur
inner highlight
rim highlight
soft depth

Avoid:

excessive blur
giant glowing borders
neon outlines

==================================================
24. SOFT UI COMPONENTS
==================================================

Normal UI should use Soft UI rather than Glass everywhere.

Examples:

Dashboard sections
List groups
Form containers
History rows
Settings rows

Use:

subtle surface contrast
gentle shadows
soft borders
comfortable radius

Cards should look like part of one design system.

==================================================
25. BORDER RADIUS
==================================================

Audit inconsistent radius values.

Create a coherent hierarchy.

For example:

small control:
10–12px

input/button:
12–16px

card:
18–24px

large feature surface:
24–30px

floating navigation:
pill / high radius

Do not make every element pill-shaped.

==================================================
26. BUTTON SYSTEM
==================================================

Audit all buttons.

Define hierarchy:

Primary
Secondary
Ghost
Danger
Glass
Icon

Primary:
ChainPay blue

Secondary:
quiet surface

Glass:
only floating / premium actions

Danger:
restrained red

All buttons need:

hover
press
focus
disabled
loading

Touch targets:
minimum ~44px where appropriate.

==================================================
27. FORM SYSTEM
==================================================

Polish:

inputs
selects
textareas
labels
validation
helper text

Input style must work in both themes.

Focus state:

clear blue ring / border

Error:

clear but not aggressive

Avoid oversized inputs unless the field is financially important,
such as Payment Amount.

==================================================
28. DIALOGS / SHEETS
==================================================

Refine:

confirmation dialogs
More sheet
mobile sheets
wallet actions
delete confirmation

Use controlled Liquid Glass.

Add:

soft entrance
opacity
small scale / translate

Ensure:

focus trapping
keyboard closing
accessible labels

==================================================
29. EMPTY STATES
==================================================

Audit all empty states.

Examples:

No transactions
No payment requests
No contacts
No wallets

Each empty state should include:

simple icon
short title
one helpful sentence
optional action

Do not create giant illustrations.

==================================================
30. LOADING STATES
==================================================

Use:

skeleton
inline loader
clear status

Avoid blank screens.

Examples:

Loading balance
Loading activity
Verifying transaction
Connecting wallet

Skeletons must match the final layout.

==================================================
31. STATUS DESIGN
==================================================

Standardize:

Pending
Confirmed
Failed
Active
Paid
Cancelled
Expired
Verified

Each state should use:

semantic color
small icon if useful
quiet background
clear text

Avoid strong saturated fills.

==================================================
32. MOTION SYSTEM
==================================================

Use Motion intentionally.

Recommended:

page entrance:
opacity + 12–20px translate

card hover:
-1px / -2px

button tap:
scale 0.98

dialog:
opacity + scale .98

sheet:
small translate

Do not animate everything.

Motion should feel:

soft
fast
premium
predictable

Use consistent easing.

Respect:

prefers-reduced-motion

==================================================
33. NO AI-LOOK DESIGN
==================================================

This requirement is critical.

Avoid common AI-generated UI patterns:

- purple/blue gradient everywhere
- random glowing orbs
- huge gradient heading
- every card having glass blur
- excessive decorative badges
- excessive rounded pills
- meaningless metrics
- fake charts
- fake balances
- fake transactions
- generic marketing text inside the app
- random 3D icons
- over-designed empty areas

Every visual element must have a product purpose.

If a component looks good without an effect,
do not add the effect.

==================================================
34. RESPONSIVE DESIGN
==================================================

Do a full responsive audit.

Test at least:

320px
375px
390px
430px
768px
1024px
1280px
1440px

Ensure:

no horizontal overflow
no clipped cards
no broken tables
no text collisions
no bottom navigation covering actions
no dialog overflow

Desktop and mobile should feel intentionally designed separately.

Mobile must feel like a banking application.

Do not simply shrink desktop UI.

==================================================
35. MOBILE UX
==================================================

Prioritize one-handed use.

Important actions should be reachable.

Use:

stacked cards
compact headers
bottom navigation
bottom sheets
large primary actions

Avoid tiny desktop controls.

Account for:

env(safe-area-inset-bottom)

==================================================
36. ACCESSIBILITY
==================================================

Maintain or improve:

semantic HTML
keyboard navigation
focus visibility
screen reader labels
button semantics
form labels
dialog focus trap
aria-current
contrast

Test both Dark and Light theme contrast.

==================================================
37. EN / TH
==================================================

All redesigned components must work in:

English
Thai

Do not hardcode visible UI strings if translation infrastructure already exists.

Thai:

use Kanit

Check Thai text for:

overflow
line height
card height
button width
mobile navigation label width

==================================================
38. DO NOT MODIFY BUSINESS LOGIC
==================================================

Do NOT alter behavior unnecessarily for:

Firebase Authentication
Google Login
MetaMask
wallet verification
payment intents
payment requests
transaction verification
Ethereum RPC
Neon
Drizzle
Smart Contract
contract ABI
API contracts

This task is primarily:

UI
UX
Design System
Responsive
Accessibility
Motion

If a functional change appears necessary,
keep it minimal and document why.

==================================================
39. DO NOT FAKE DATA
==================================================

Never invent:

balances
payments
analytics
contacts
transactions
revenue
merchant statistics

Use real server data.

If no data exists:

show a professional empty state.

==================================================
40. COMPONENT REFACTOR
==================================================

Avoid giant page components.

Extract shared pieces where appropriate.

Potential organization:

components/ui/
components/layout/
components/navigation/
components/settings/
components/payment/

But follow the existing project structure.

Do not reorganize the whole repository just for aesthetics.

==================================================
41. POLISH PASS
==================================================

After the initial redesign, perform a SECOND visual audit.

Look for:

misaligned spacing
inconsistent radius
random font sizes
inconsistent icons
hardcoded colors
duplicate UI
empty awkward areas
weak visual hierarchy
poor Light Theme surfaces
mobile overflow
buttons with inconsistent height
unnecessary visual effects

Fix these before considering the task complete.

==================================================
42. VISUAL CONSISTENCY REVIEW
==================================================

Every page should visually feel like it belongs to the same ChainPay product.

Check:

Login
Dashboard
Pay
Review
Requests
Public request application controls where shared
Activity
Receipt
Wallets
Contacts
Profile
Security
Theme

The user should not feel like each page came from a different template.

==================================================
43. VALIDATION
==================================================

After implementation run:

npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e

Fix implementation-caused errors.

Do not suppress problems.

==================================================
44. DOCUMENTATION
==================================================

Update:

docs/DESIGN.md
docs/IMPLEMENTATION_REPORT.md

Document:

- updated application design system
- Dark / Light treatment
- Soft UI system
- Liquid Glass usage rules
- responsive/mobile principles
- motion system
- reusable components
- pages redesigned

Do not rewrite unrelated architecture documentation.

==================================================
FINAL TARGET
==================================================

The result should feel like:

ChainPay is a real FinTech/Web3 product
that could be shown to users or included in a professional developer portfolio.

Desktop:
Premium modern FinTech web application

Mobile:
Premium modern banking application

The visual language should be:

quiet
clean
soft
precise
premium
trustworthy

Use:

Soft UI as the foundation
Liquid Glass for emphasis
Glassmorphism selectively
Motion for feedback

Do not use visual effects simply because they are available.

The goal is NOT to make the UI more decorative.

The goal is to make the entire authenticated ChainPay application
feel more intentional, coherent and production-ready.

==================================================
FINAL REPORT
==================================================

When finished, report:

1. Pages redesigned
2. Components created
3. Components modified
4. Design-system changes
5. Dark Theme improvements
6. Light Theme improvements
7. Liquid Glass usage
8. Mobile improvements
9. Responsive fixes
10. Accessibility improvements
11. Motion improvements
12. Files modified
13. Tests executed
14. Remaining UI issues

Again:

DO NOT REDESIGN THE HOMEPAGE `/`.