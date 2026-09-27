# Homepage refinement report

## Files created

- `src/app/marketing.css` — isolated homepage styles and responsive layouts.
- `src/components/marketing/hero-section.tsx` — product promise, primary actions, payment journey.
- `src/components/marketing/predictive-arc.tsx` — interactive Canvas horizon.
- `src/components/marketing/site-nav.tsx` — scroll-aware glass navigation and mobile disclosure.
- `src/components/marketing/session-actions.tsx` — cached server session lookup and streamed CTA/nav states.
- `src/components/marketing/feature-grid.tsx` — asymmetric product feature cards.
- `src/components/marketing/product-preview.tsx` — keyboard-accessible Send, Request, Activity preview.
- `src/components/marketing/how-it-works.tsx` — connected four-step workflow.
- `src/components/marketing/trust-section.tsx` — verified payment flow and non-custodial model.
- `src/components/marketing/use-cases.tsx` — individual, freelancer, merchant, beginner workflows.
- `src/components/marketing/final-cta.tsx` — native FAQ disclosures and closing CTA.
- `src/components/marketing/site-footer.tsx` — real product links, support anchors, contract info, developer credit.
- `src/components/motion/reveal.tsx` — shared reveal timing, easing, viewport policy.
- `src/components/motion/text-emerge.tsx` — reusable accessible line entrances.
- `src/app/(auth)/loading.tsx`, `src/app/p/loading.tsx`, `src/app/tx/loading.tsx` — scoped copies of the former root loading UI.
- `tests/e2e/homepage.spec.ts` — interaction, responsive, reduced-motion, and no-JavaScript coverage.
- `docs/HOMEPAGE_REDESIGN.md` — this report.

## Files modified or moved

- `src/app/page.tsx` — composes the marketing sections as a Server Component.
- `src/app/layout.tsx` — declares smooth-scroll behavior for Next.js route transitions.
- `tests/e2e/smoke.spec.ts` — updates the headline and CTA selector for the new design.
- `docs/DESIGN.md` — documents the homepage architecture, motion, and performance choices.
- Removed `src/app/loading.tsx` after relocating its UI into auth and public payment/receipt routes. The existing dashboard loading boundary is retained. This prevents the entire marketing page being hidden behind a streamed account-loading fallback when JavaScript is disabled.

## Product and visual changes

The hero leads with “Pay with blockchain, without the complexity.” A particle horizon sits behind a wallet → ChainPay → Ethereum journey. The page then explains send/request/QR/wallet/history features, provides an interactive interface preview, walks through onboarding, explains transaction checks, shows four practical use cases, answers common questions, and closes with an account CTA and full footer.

Copy was checked against README, the product specification, wallet verification, transaction verification, and existing receipt flows. Sepolia testnet limits remain explicit. Previews reuse Button, GlassCard, and EmptyState and contain descriptive placeholders rather than fabricated payments, balances, or confirmations. Existing auth, payment, wallet, contract, schema, and API logic is unchanged.

Resources point to real sections and routes. Only the validated public contract address is used for the footer explorer and copy actions. No contact details, audits, mainnet capabilities, or regulatory claims were invented.

## Motion and arc approach

Reveal and TextEmerge use Motion with a shared easing curve, 0.65–0.7 second entrances, once-per-viewport detection, and restrained stagger. The hero sequences badge, heading, description, actions, and journey. Cards lift subtly on hover. The preview uses spring-driven MotionValues for approximately one degree of pointer tilt.

The Predictive Arc is an original Canvas 2D implementation inspired by the supplied direction, not a copied Originkit component. Cursor position feeds a damped spring; nearby particles subtly brighten and shift. Idle movement is slow. There is no WebGL, Three.js, extra animation library, or per-frame React state update.

## Responsive, accessibility, and performance

- Verified browser layouts at 360, 768, 1024, and 1440 pixels with no horizontal overflow.
- Mobile has a navigation disclosure, stacked feature cards/preview, vertical workflow, and rearranged footer.
- Tabs support arrow keys, Home/End, selected state, and roving focus. Mobile navigation supports Escape and returns focus to its toggle.
- Reduced motion removes entrance transforms/blur and parallax; the arc becomes static. Content stays readable without JavaScript.
- Canvas caps drawing at approximately 30 fps and pixel ratio at 1.5; particle count falls from 1,392 to 448 below 700px. Rendering pauses off-screen and in background tabs. Touch movement does not steer the visual.
- Authentication lookup is shared per render and isolated in CTA/navigation Suspense boundaries. `/` is dynamically rendered; its marketing content does not wait for the session result.
- No new dependencies, remote images, or remote fonts. Existing shared application CSS remains unchanged.

## Validation

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed (telemetry disabled for the final sandbox build).
- `npm test` — 60 tests passed across five test files.
- `npm run test:e2e -- --workers=2` — 16 tests passed across desktop and mobile projects against a production build on port 3100.
- `git diff --check` — passed.
- Desktop/mobile screenshots reviewed; full-page captures at all four widths are in the ignored `artifacts/` directory. E2E checks report no uncaught page errors in the tested homepage flow.

## Remaining limits

No known failures remain in the checks above. Real Google sign-in, connected MetaMask/Sepolia transactions, and the authenticated CTA with a live user session were not exercised in this visual task. Mobile checks use browser emulation, not physical-device performance profiling. The site has not been deployed by this task.
