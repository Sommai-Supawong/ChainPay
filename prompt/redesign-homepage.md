You are working on the existing **ChainPay** project.

Before making changes:

1. Read the entire existing project structure.
2. Read:
   - `README.md`
   - `document.md`
   - `docs/DESIGN.md`
   - relevant homepage/components/styles
3. Understand the existing design system, components, routing, authentication, wallet integration, and current homepage.
4. DO NOT rewrite or break existing working functionality.
5. Preserve the existing ChainPay product identity and architecture.
6. Reuse existing dependencies/components when possible.
7. Do not add unnecessary libraries.

Your task is to perform a major **visual, content, UX and motion refinement of the ChainPay Homepage / Landing Page** so that it feels like a polished real-world FinTech/Web3 product rather than a student blockchain demo.

---

# PRIMARY GOAL

Make the homepage feel:

- Premium
- Modern FinTech
- Trustworthy
- Smooth
- Interactive
- Technically sophisticated
- Minimal but visually memorable
- Suitable for a junior developer portfolio
- Comparable in presentation quality to modern SaaS / FinTech landing pages

The blockchain should NOT dominate the experience.

The core message should remain:

> **Pay with blockchain, without the complexity.**

ChainPay should visually feel closer to:

- Wise
- Stripe
- Revolut
- Modern banking apps
- Premium SaaS products

rather than a typical crypto landing page.

---

# IMPORTANT DESIGN DIRECTION

Preserve and improve the existing ChainPay design language:

- Dark theme
- Modern FinTech
- Soft UI
- Liquid Glass
- Glassmorphism
- Subtle blue accents
- Soft shadows
- Thin borders
- Controlled glow
- Large whitespace
- Premium typography
- Smooth rounded surfaces

Avoid:

- excessive neon
- cyberpunk styling
- crypto casino appearance
- excessive gradients
- excessive blur
- noisy backgrounds
- animations everywhere
- generic template-looking sections

Animation should make the website feel alive, but never distracting.

---

# 1. HERO SECTION — MAJOR UPGRADE

Redesign and enhance the top Hero section.

Keep the core headline around:

**Pay with blockchain, without the complexity.**

Add a strong supporting paragraph explaining ChainPay in simple language.

Example content direction:

> Send, request and track blockchain payments through an experience designed to feel as simple as everyday digital banking.

Then provide clear CTA buttons such as:

Primary:
**Get Started**

Secondary:
**Explore ChainPay**

or:

**View Dashboard**

depending on authenticated state.

---

# HERO BACKGROUND — PREDICTIVE ARC

The Hero section should have a sophisticated interactive motion background inspired by:

**Originkit.dev — Predictive Arc**

Use Predictive Arc as a visual inspiration rather than blindly copying unrelated styling.

Create a futuristic but subtle animated arc / particle / pixel field behind the hero content.

Desired characteristics:

- giant curved arc / horizon behind the content
- composed from particles, dots, pixels or soft lines
- subtle blue / indigo / white light
- low opacity
- dark FinTech background
- soft depth
- slight perspective
- slow idle motion

Most importantly:

### Mouse interaction

The background should react smoothly to the user's cursor.

When the mouse moves:

- nearby particles / arc should subtly respond
- perspective may gently shift
- glow can slightly follow cursor
- arc movement can have inertia
- movement should continue slightly after the cursor stops
- use spring/easing rather than directly locking to cursor position

The result should feel:

**predictive / magnetic / fluid**

NOT:

- aggressive
- fast
- game-like
- distracting

Use the existing Motion / Framer Motion stack where practical.

If the Predictive Arc effect needs Canvas, SVG or CSS, choose the lightest production-friendly solution.

Do NOT introduce heavy WebGL/Three.js unless it meaningfully improves the experience and does not hurt performance.

If an existing implementation/package is unavailable or incompatible, recreate the interaction using lightweight React + CSS/SVG/Canvas instead.

---

# 2. HERO MICRO-INTERACTIONS

Add subtle motion to:

- headline
- supporting text
- CTA buttons
- badges
- product preview cards
- decorative elements

Initial page entrance sequence:

1. background fades in
2. small badge enters
3. headline emerges
4. supporting copy emerges
5. buttons appear
6. product visual appears

Use staggered timing.

Do not make everything enter simultaneously.

Preferred motion:

- opacity: 0 → 1
- y: 20–35px → 0
- blur: small blur → sharp
- scale only where appropriate

Use smooth premium easing.

Example direction:

`ease-out / cubic-bezier / spring`

Avoid bouncy cartoon animation.

---

# 3. TEXT EMERGE EFFECT

For important multi-line text blocks throughout the homepage, create a reusable component such as:

`TextEmerge`

Use it for:

- Hero heading
- Section headings
- Selected descriptions
- Closing CTA

Desired behavior:

Each line/word smoothly emerges when entering the viewport.

Possible effect:

- opacity 0 → 1
- translateY 24px → 0
- blur 6px → 0
- slight stagger

Animation should only trigger when appropriate.

Do NOT animate every paragraph.

The effect should feel elegant and editorial.

---

# 4. SCROLL REVEAL SYSTEM

Create a consistent reusable reveal system for homepage sections.

As users scroll down:

- sections softly move upward into view
- cards enter with stagger
- text appears smoothly
- larger visual components may use slight scale/parallax
- separators/glows may slowly appear

Example:

```text
opacity 0 → 1
y 40px → 0
scale 0.98 → 1
```

Use viewport detection through Motion.

Use smooth ease-in/ease-out transitions.

Animations should happen naturally instead of every element appearing identically.

Create reusable animation components/variants rather than duplicating Motion code everywhere.

Possible reusable abstractions:

- `Reveal`
- `RevealGroup`
- `TextEmerge`
- `FadeUp`
- `StaggerContainer`

---

# 5. ADD MORE USEFUL HOMEPAGE CONTENT

The current homepage should provide enough information for a first-time visitor to understand ChainPay without logging in.

Build a clear product story.

Recommended homepage structure:

## Section 1 — Hero

Headline:

**Pay with blockchain, without the complexity.**

Supporting copy explaining ChainPay.

CTA.

Interactive Predictive Arc background.

Optional product UI preview.

---

## Section 2 — Trusted payment experience

Introduce the core idea:

**Blockchain underneath. Simplicity on top.**

Explain that users should not need to think about:

- ABI
- RPC
- contract internals
- raw transaction calls
- low-level blockchain concepts

Instead they interact with familiar concepts:

- Who am I paying?
- How much?
- What is it for?
- Has it been confirmed?
- Can I verify it?

Present this visually rather than as a large text wall.

---

# 6. FEATURE SECTION

Create a visually interesting feature grid.

Use different card dimensions instead of a boring equal grid if appropriate.

Feature examples:

### Send payments

Send Sepolia ETH through a guided payment flow with review and confirmation.

### Request payments

Create shareable payment requests with public payment links.

### QR payments

Turn payment requests into QR codes for fast cross-device payment.

### Verified wallets

Link MetaMask wallets through cryptographic ownership verification.

### Persistent history

Keep payment activity available through your ChainPay account.

### Human-readable receipts

Turn blockchain transactions into payment information normal users can understand.

### Server verification

ChainPay verifies transaction details against Ethereum instead of trusting browser-reported success.

Cards can include:

- Lucide icons
- micro animation
- subtle hover elevation
- border glow following pointer
- slight internal parallax

But keep interactions restrained.

---

# 7. HOW CHAINPAY WORKS

Add a simple visual 3-step or 4-step workflow.

Example:

### 01 — Sign in
Continue with Google and create your ChainPay account.

### 02 — Connect & verify
Connect MetaMask and verify wallet ownership securely.

### 03 — Send or request
Create a payment or share a payment request.

### 04 — Verify & track
ChainPay verifies the transaction on Ethereum and saves the record.

Use a visual connecting line or timeline that softly animates as the section enters the viewport.

---

# 8. DESIGNED FOR REAL USERS

Create a section communicating target users.

Examples:

### Individuals
Simple blockchain payments without low-level Web3 complexity.

### Freelancers
Create payment links, add descriptions and track project payments.

### Small merchants
Organize blockchain payment requests and payment history.

### Web3 beginners
Use blockchain payments through a familiar guided interface.

Make these feel like actual product use cases rather than generic marketing filler.

---

# 9. TRUST / SECURITY SECTION

ChainPay is a payment product, so the homepage must communicate trust.

Add a section such as:

## Built for verifiable payments

Possible supporting points:

- Wallet ownership verification
- Server-side transaction verification
- Secure authenticated sessions
- Ethereum settlement
- Persistent PostgreSQL records
- Non-custodial architecture

Use a calm presentation.

Do NOT falsely claim:

- bank-level security
- audited smart contracts
- mainnet readiness
- regulatory approval
- guaranteed security

Make it clear when appropriate that ChainPay currently operates on:

**Ethereum Sepolia Testnet**

Use a tasteful Testnet badge.

---

# 10. PRODUCT PREVIEW

Create a product interface preview section.

Show visually representative previews such as:

- Dashboard
- Send payment
- Payment request
- Recent activity
- Transaction receipt

Do not use fake screenshots if real reusable components already exist.

Prefer composing previews from the actual ChainPay design system.

Consider layering 2–3 glass UI panels with slight parallax.

Mouse movement can gently shift the layers.

Keep movement extremely subtle.

---

# 11. TECHNOLOGY / TRUST STRIP

Optionally add a small understated technology section.

Example:

**Built with modern infrastructure**

Next.js  
TypeScript  
Ethereum  
MetaMask  
Firebase  
PostgreSQL  
Vercel

Use actual icons only if they already exist or can be safely loaded locally.

Keep this section subtle because users care more about the product than the tech stack.

---

# 12. CTA SECTION

Before the footer, add a strong final CTA.

Possible content:

**Ready to make Web3 payments feel simple?**

Supporting line:

Create your ChainPay account, connect a wallet and explore a better blockchain payment experience.

Buttons:

**Get Started**

and optional:

**Learn How It Works**

Give this section a distinctive ambient glow / arc background, but simpler than the hero.

Use Text Emerge on the heading.

---

# 13. FOOTER — REDESIGN

Create a proper professional footer.

The footer should feel integrated into the ChainPay design system.

Include:

## Brand

ChainPay logo/name

Short description:

> Modern Web3 payments with transparent blockchain settlement and a simple everyday payment experience.

---

## Product

- Dashboard
- Send Payment
- Payment Requests
- Activity
- Wallets

---

## Resources

- Documentation
- Security
- Smart Contract
- GitHub if configured

Do NOT hardcode links that do not exist.

---

## Contract

Add a Contract / Network information area.

Example:

**Network**
Ethereum Sepolia

**Chain**
Sepolia Testnet

If `NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS` exists, allow the deployed contract address to be displayed safely.

Display shortened form:

`0x1234...ABCD`

Include copy action if appropriate.

Do NOT expose any server secrets.

If an explorer URL can be constructed safely from the contract address, provide:

**View Contract**

---

## Support

Add a Support section.

Possible items:

- Help / Documentation
- Security information
- Report an issue

Only link to routes/resources that actually exist.

Do not invent contact details.

---

## Credits

At the bottom of the footer include:

**Designed & Developed by Sommai Devcodejeng**

or

**Built by Sommai Devcodejeng**

Make it subtle but clearly visible.

Optionally use:

`© {currentYear} ChainPay`

alongside the developer credit.

Example layout:

```text
© 2026 ChainPay
Built by Sommai Devcodejeng
Ethereum Sepolia Testnet
```

Use dynamic year rather than hardcoding when practical.

---

# 14. NAVBAR MOTION

Improve the homepage navbar.

Desired effects:

- transparent / subtle at top
- stronger glass surface after scrolling
- smooth transition
- slight border visibility after scroll
- active hover feedback
- responsive mobile navigation
- CTA button

Do NOT make navbar movement distracting.

Potential behavior:

```text
top of page:
transparent dark surface

after scroll:
rgba glass surface
backdrop blur
thin border
soft shadow
```

---

# 15. BUTTON INTERACTION

Improve important buttons.

Primary button:

- subtle gradient or highlight
- soft outer glow
- hover translateY(-1px)
- subtle light sweep if appropriate
- tap scale ~0.98

Secondary button:

- glass surface
- subtle border
- hover background/border transition

Avoid exaggerated hover animations.

---

# 16. CARD INTERACTION

For feature cards:

Mouse hover should optionally produce:

- translateY(-2px to -4px)
- slightly brighter border
- very subtle glow
- icon movement
- pointer-based soft highlight

If implementing a pointer-following highlight, use CSS variables such as:

`--mouse-x`
`--mouse-y`

and radial-gradient.

Keep it performant.

---

# 17. PAGE DEPTH

Introduce subtle depth to the homepage.

Possible layers:

- ambient radial glows
- fine grid
- dotted patterns
- Predictive Arc
- glass panels
- subtle blur shapes
- section dividers

Do not fill every region.

Large areas of negative space are important.

---

# 18. PERFORMANCE

Animation must remain production-friendly.

Important:

- avoid unnecessary rerenders from mousemove
- prefer transforms and opacity
- use requestAnimationFrame where necessary
- avoid huge blur values
- lazy load expensive visuals
- avoid heavy WebGL unless justified
- avoid hydration mismatch
- test mobile performance

Mouse interaction should not cause React state updates on every frame if CSS variables / MotionValues can do it more efficiently.

---

# 19. ACCESSIBILITY

All motion must respect:

`prefers-reduced-motion`

When reduced motion is enabled:

- disable Predictive Arc cursor movement or significantly reduce it
- disable parallax
- remove large entrance transforms
- preserve content readability
- keep essential state transitions understandable

Also maintain:

- keyboard accessibility
- visible focus states
- semantic HTML
- sufficient text contrast
- accessible buttons/links

---

# 20. RESPONSIVE DESIGN

The homepage must look intentionally designed on:

- 1440px desktop
- laptop
- tablet
- mobile

Do not simply shrink desktop layouts.

Mobile Hero:

- simplified Predictive Arc
- lower particle count
- readable text
- no overflow
- CTA buttons fit comfortably
- interactive background should not interfere with touch scrolling

Cards should reorganize intelligently.

---

# 21. REUSABLE MOTION SYSTEM

Do not scatter random animation values throughout the project.

Create reusable Motion variants/constants where useful.

Example concept:

```ts
export const fadeUp = ...
export const staggerContainer = ...
export const softScale = ...
```

Use a consistent motion language.

Suggested characteristics:

- duration approximately 0.5–0.8 sec
- small movement distances
- deliberate stagger
- premium easing curves

Avoid excessively long animation sequences.

---

# 22. CODE QUALITY

Keep components maintainable.

Avoid creating a giant homepage component.

Break sections into components where useful, for example:

```text
components/marketing/
  hero-section.tsx
  predictive-arc.tsx
  feature-grid.tsx
  how-it-works.tsx
  trust-section.tsx
  product-preview.tsx
  final-cta.tsx
  site-footer.tsx

components/motion/
  reveal.tsx
  text-emerge.tsx
```

Adapt filenames to the existing repository structure rather than forcing this exact structure.

---

# 23. DO NOT BREAK EXISTING PRODUCT

Do NOT:

- remove Firebase authentication
- change authentication behavior unnecessarily
- modify Neon schema
- modify Drizzle migrations
- change payment logic
- change wallet verification logic
- modify smart contract behavior
- expose environment variables
- change existing API contracts without reason
- introduce fake transactions
- introduce fake balances
- introduce fake authentication
- replace existing business logic with mock data

This task is primarily:

**Homepage design + marketing content + UX + animation + responsive refinement.**

---

# 24. VERIFY CONTENT AGAINST PROJECT

Before adding product claims, verify them against:

`README.md`
`document.md`
existing source code

Do not advertise functionality that ChainPay does not implement.

It is okay to mark upcoming capabilities as:

**Coming soon**

but avoid unnecessary future-feature marketing.

---

# 25. FINAL QA

After implementation, run the project's available validation commands.

At minimum where available:

```bash
npm run lint
npm run typecheck
npm run build
```

Also run relevant tests if practical.

Fix:

- TypeScript errors
- lint errors
- hydration issues
- console errors caused by the implementation
- responsive overflow
- animation performance issues
- accessibility regressions

---

# FINAL EXPECTATION

The finished homepage should communicate this story visually:

```text
ChainPay
↓
Pay with blockchain, without the complexity.
↓
Simple payment experience
↓
Powerful Web3 infrastructure underneath
↓
Send / Request / QR / Verify / Track
↓
Safe and understandable product flow
↓
Professional real-world FinTech product
↓
Get Started
```

The final result should feel custom-designed for **ChainPay**, not like a generic Tailwind landing page.

Prioritize:

1. Visual hierarchy
2. Product clarity
3. Smooth motion
4. Premium FinTech appearance
5. Responsive behavior
6. Performance
7. Accessibility
8. Maintainable code

Use animation to reinforce the product experience, not to decorate every element.

When finished, provide a concise report containing:

1. Files created
2. Files modified
3. Homepage sections added/changed
4. Animation system implemented
5. Predictive Arc implementation approach
6. Responsive improvements
7. Accessibility/performance considerations
8. Tests/checks executed
9. Any remaining issues