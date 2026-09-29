# Design system

## Product polish — September 2026

`src/app/product.css` is the application design layer. Its selectors are scoped to `.product-ui` on AppShell, Login, public payment/receipt pages, and portaled dialogs/sheets. Marketing components and `marketing.css` are unchanged. Public pages still default to Dark; the saved account preference remains limited to authenticated routes.

### Surfaces and tokens

| Layer            | Dark      | Light     | Use                                |
| ---------------- | --------- | --------- | ---------------------------------- |
| Canvas           | `#080c13` | `#f3f6fa` | App background                     |
| Surface          | `#0e141e` | `#ffffff` | Forms, lists, informational cards  |
| Soft surface     | `#111a27` | `#f6f8fc` | Secondary controls                 |
| Elevated surface | `#172131` | `#eaf0f8` | Selected controls and subtle depth |
| Accent           | `#78a2ff` | `#245bd1` | Primary actions and focus          |
| Primary text     | `#f3f6fb` | `#18273c` | Titles and financial values        |
| Secondary text   | `#a3b1c6` | `#52647b` | Descriptions and metadata          |

Semantic variables also cover input borders/backgrounds, success/warning/error, glass rims/highlights, and soft/elevated shadows. Radius hierarchy is 13px controls, 22px cards, 28px feature surfaces, and pill-shaped floating navigation. Normal cards use opaque Soft UI surfaces. Glass is reserved for Login, floating navigation, sheets/dialogs, and selected controls; the primary wallet uses a restrained surface gradient and inner highlight.

### Page hierarchy

- **Login:** brand and language controls, short product explanation, one Google action, and explicit account/wallet security reassurance. Desktop uses two columns; mobile uses a compact single column.
- **Dashboard:** greeting, primary wallet label/balance/address/verification/network, quick actions, real sent/received/pending/open-request totals, and recent activity. Existing server data and balance hooks remain authoritative.
- **Payments:** three-step progress, prominent amount, clear review totals and signing action. Submission/recovery logic is unchanged.
- **Requests, wallets, contacts:** shared quiet cards; primary wallet distinction; recipient initials and names before addresses; clear actions and status text.
- **Activity and receipt:** compact rows include localized dates. Receipts emphasize status, amount and payment title; hash/block/confirmation metadata is available in a keyboard-accessible disclosure.
- **Settings:** icon/title/description destinations, account summary, existing visual theme previews, and stacked navigation on mobile.

### Responsive, motion, and accessibility

Desktop uses a 248px sidebar (216px at intermediate widths); below 800px, the sticky header and existing custom bottom navigation take over. Content reserves safe-area-aware bottom space. The 3D glass lens, pill ends, resting dimensions, tap/hold/drag and route synchronization are preserved. Mobile dashboard statistics use two columns, actions use four compact controls, and long addresses/receipt details wrap. The audit targets 320, 375, 390, 430, 768, 1024, 1280, and 1440px.

Buttons generally have 44–46px minimum targets, forms have 48px inputs, and the financial amount input is larger. Focus rings use the theme accent. `Field` associates hints/errors with matching child controls using `aria-describedby` and exposes `aria-invalid`; status labels communicate meaning in text. Radix retains focus trapping and Escape handling. English uses the existing font stack; Thai uses Kanit with relaxed line height and no tracking on headings/controls.

`PageSkeleton` gives dashboard route transitions a content-shaped loading state with one screen-reader status. Page entrance uses opacity/12px translation over 260ms; control feedback is 160ms with a shared ease curve. Reduced motion disables these transitions/animations. The existing MotionConfig also respects the preference.

Reusable components remain Button, GlassCard, PageHeader, Field, StatusBadge, EmptyState, LoadingState, CopyButton, TransactionRow, ConfirmDialog and SettingsTabs; the only new visual primitive is PageSkeleton. Shared CSS carries the visual system instead of duplicating component variants.

## Account appearance

Authenticated routes now use an account-level Dark (default) or Light theme selected at `/settings/theme`. The dashboard layout reads `users.theme_preference` on the server and passes it to a client ThemeProvider. The initial `data-theme` attribute is therefore rendered with the saved value, without a client-only theme flash; switching updates the app shell immediately and persists through an authorized endpoint. The preference is scoped to the authenticated shell. Marketing `/`, login, and public payment/receipt pages stay dark.

Semantic tokens in `src/app/globals.css` cover foreground, background, surfaces, glass, borders, shadows, controls, navigation, and status colors. The light palette uses an off-white canvas, translucent white cards, neutral shadows, and ChainPay blue accents. The mobile bottom bar and More sheet, dialogs, inputs, status badges, and language control have light variants. Theme changes transition color, border, background, and shadow in about 240ms; reduced-motion users get nearly instant changes. Both preview cards are keyboard-accessible buttons with `aria-pressed`.

The specification palette is implemented as CSS tokens in `src/app/globals.css`: background #070A0F, surface #0B1018, primary #5B8CFF, primary light #8FB0FF, success #4ADE80, warning #FBBF24, error #F87171, text #F8FAFC, secondary #94A3B8, muted #64748B.

Design uses quiet surfaces, restrained borders, clear typography, readable addresses and short action labels. The landing-page wallet illustration communicates a journey without inventing balances or transaction records. Production account screens use actual server data and explicit empty states.

Reusable components include Button (shadcn-compatible CVA/Slot), accessible Radix ConfirmDialog, GlassCard, PageHeader, StatusBadge, WalletAddress, Field, EmptyState, LoadingState, CopyButton and TransactionRow. `components.json` supports future shadcn additions. Tailwind is restricted to application sources so prose in product documents cannot accidentally generate malformed utility selectors.

Most pages remain Server Components. Interactive feature components use React Hook Form/Zod, Sonner feedback, wagmi, and TanStack Query. The homepage also uses small client boundaries for navigation, reusable Motion reveals, a particle horizon, and an interactive interface preview. MotionConfig and CSS respect reduced-motion preferences.

Responsive behavior: desktop sidebar, mobile navigation, stacking dashboard and forms, minimum 40–44px controls, wrapping hash/address text, responsive QR and receipt layouts. Scan requests camera access only after a click; browsers lacking BarcodeDetector offer native-phone-camera or pasted-link fallback. Kanit is loaded through `next/font/google`; an uncached build needs access to Google Fonts.

Keyboard focus, skip link, form labels, real buttons, dialog focus trapping, live error messages and semantic navigation are present. Browser tests assert no horizontal overflow at desktop and mobile sizes. Financial values remain in ETH; there is no fabricated fiat conversion.

## Homepage

The marketing page uses isolated `cp-` styles in `src/app/marketing.css`, preserving shared dashboard, authentication, and payment styles. Sections live in `src/components/marketing/`; `Reveal` and `TextEmerge` in `src/components/motion/` share a calm ease curve and viewport policy. Hero entrances are staggered; section reveals run once. Reduced motion removes entrance transforms/blur and preview parallax. A noscript style preserves readable server-rendered content.

The Predictive Arc is an original Canvas 2D particle horizon inspired by the brief, not an imported component or WebGL dependency. It draws at most approximately 30 frames per second, caps device pixel ratio at 1.5, reduces particles from 1,392 to 448 below 700px, and pauses outside the viewport or in hidden tabs. Damped cursor movement uses local variables instead of React state. Reduced motion renders a static frame and touch pointers do not steer the field.

The preview composes existing Button, GlassCard, and EmptyState primitives with descriptive placeholders, not fabricated balances or transaction records. Its three tabs support arrow keys, Home/End, and focus management. Public copy reflects implemented functionality and explicitly identifies Sepolia test ETH. Footer resources target real page sections and product routes; the explorer and copy actions appear only for a valid configured public contract address.

The homepage checks the existing server session to choose Get Started or View Dashboard. The lookup is deduplicated with React cache and contained in small Suspense boundaries around navigation and CTAs; the main content does not wait for authentication. It does not change login, wallet verification, payment logic, or API contracts. This makes `/` dynamically rendered. Responsive layouts use a mobile navigation disclosure, stacked preview, vertical workflow, and reorganized cards/footer. No new dependencies or remote fonts are required.

Loading boundaries are scoped to `(auth)`, `(dashboard)`, `p`, and `tx` instead of the root. This preserves application loading feedback while keeping the marketing shell out of the account-loading boundary, including when JavaScript is disabled.
