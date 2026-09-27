# Design system

The specification palette is implemented as CSS tokens in `src/app/globals.css`: background #070A0F, surface #0B1018, primary #5B8CFF, primary light #8FB0FF, success #4ADE80, warning #FBBF24, error #F87171, text #F8FAFC, secondary #94A3B8, muted #64748B.

Design uses quiet surfaces, restrained borders, clear typography, readable addresses and short action labels. The landing-page wallet illustration communicates a journey without inventing balances or transaction records. Production account screens use actual server data and explicit empty states.

Reusable components include Button (shadcn-compatible CVA/Slot), accessible Radix ConfirmDialog, GlassCard, PageHeader, StatusBadge, WalletAddress, Field, EmptyState, LoadingState, CopyButton and TransactionRow. `components.json` supports future shadcn additions. Tailwind is restricted to application sources so prose in product documents cannot accidentally generate malformed utility selectors.

Most pages remain Server Components. Interactive feature components use React Hook Form/Zod, Sonner feedback, wagmi, and TanStack Query. Motion is limited to review feedback; MotionConfig and CSS respect reduced-motion preferences.

Responsive behavior: desktop sidebar, mobile navigation, stacking dashboard and forms, minimum 40–44px controls, wrapping hash/address text, responsive QR and receipt layouts. Scan requests camera access only after a click; browsers lacking BarcodeDetector offer native-phone-camera or pasted-link fallback. No remote font fetch is needed for a build.

Keyboard focus, skip link, form labels, real buttons, dialog focus trapping, live error messages and semantic navigation are present. Browser tests assert no horizontal overflow at desktop and mobile sizes. Financial values remain in ETH; there is no fabricated fiat conversion.
