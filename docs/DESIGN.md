# Design system

The specification palette is implemented as CSS tokens in `src/app/globals.css`: background #070A0F, surface #0B1018, primary #5B8CFF, primary light #8FB0FF, success #4ADE80, warning #FBBF24, error #F87171, text #F8FAFC, secondary #94A3B8, muted #64748B.

Design uses quiet surfaces, restrained borders, clear typography, readable addresses and short action labels. The landing-page wallet illustration communicates a journey without inventing balances or transaction records. Production account screens use actual server data and explicit empty states.

Reusable components include Button (shadcn-compatible CVA/Slot), accessible Radix ConfirmDialog, GlassCard, PageHeader, StatusBadge, WalletAddress, Field, EmptyState, LoadingState, CopyButton and TransactionRow. `components.json` supports future shadcn additions. Tailwind is restricted to application sources so prose in product documents cannot accidentally generate malformed utility selectors.

Most pages remain Server Components. Interactive feature components use React Hook Form/Zod, Sonner feedback, wagmi, and TanStack Query. The homepage also uses small client boundaries for navigation, reusable Motion reveals, a particle horizon, and an interactive interface preview. MotionConfig and CSS respect reduced-motion preferences.

Responsive behavior: desktop sidebar, mobile navigation, stacking dashboard and forms, minimum 40–44px controls, wrapping hash/address text, responsive QR and receipt layouts. Scan requests camera access only after a click; browsers lacking BarcodeDetector offer native-phone-camera or pasted-link fallback. No remote font fetch is needed for a build.

Keyboard focus, skip link, form labels, real buttons, dialog focus trapping, live error messages and semantic navigation are present. Browser tests assert no horizontal overflow at desktop and mobile sizes. Financial values remain in ETH; there is no fabricated fiat conversion.

## Homepage

The marketing page uses isolated `cp-` styles in `src/app/marketing.css`, preserving shared dashboard, authentication, and payment styles. Sections live in `src/components/marketing/`; `Reveal` and `TextEmerge` in `src/components/motion/` share a calm ease curve and viewport policy. Hero entrances are staggered; section reveals run once. Reduced motion removes entrance transforms/blur and preview parallax. A noscript style preserves readable server-rendered content.

The Predictive Arc is an original Canvas 2D particle horizon inspired by the brief, not an imported component or WebGL dependency. It draws at most approximately 30 frames per second, caps device pixel ratio at 1.5, reduces particles from 1,392 to 448 below 700px, and pauses outside the viewport or in hidden tabs. Damped cursor movement uses local variables instead of React state. Reduced motion renders a static frame and touch pointers do not steer the field.

The preview composes existing Button, GlassCard, and EmptyState primitives with descriptive placeholders, not fabricated balances or transaction records. Its three tabs support arrow keys, Home/End, and focus management. Public copy reflects implemented functionality and explicitly identifies Sepolia test ETH. Footer resources target real page sections and product routes; the explorer and copy actions appear only for a valid configured public contract address.

The homepage checks the existing server session to choose Get Started or View Dashboard. The lookup is deduplicated with React cache and contained in small Suspense boundaries around navigation and CTAs; the main content does not wait for authentication. It does not change login, wallet verification, payment logic, or API contracts. This makes `/` dynamically rendered. Responsive layouts use a mobile navigation disclosure, stacked preview, vertical workflow, and reorganized cards/footer. No new dependencies or remote fonts are required.

Loading boundaries are scoped to `(auth)`, `(dashboard)`, `p`, and `tx` instead of the root. This preserves application loading feedback while keeping the marketing shell out of the account-loading boundary, including when JavaScript is disabled.
