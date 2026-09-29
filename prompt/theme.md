เพิ่ม Feature Theme Settings ให้ ChainPay โดยรองรับ:

- Dark Theme — default
- Light / White Theme — user เลือกได้

IMPORTANT:
Homepage / Marketing page route `/` ไม่ต้องเปลี่ยน theme และยังคง Dark Theme เดิมตลอดเวลา

ให้ Theme Switching มีผลเฉพาะ Product / Dashboard area เช่น:

/dashboard
/pay
/requests
/activity
/wallets
/contacts
/settings/*
และหน้าภายใน authenticated application ที่ใช้ app shell เดียวกัน

ก่อนแก้:
- อ่าน design system ปัจจุบัน
- อ่าน `src/app/globals.css`
- อ่าน dashboard layout
- อ่าน settings routes/components
- ตรวจ theme/design tokens เดิม
- reuse architecture เดิมให้มากที่สุด
- ห้ามกระทบ Firebase, MetaMask, Payment, API, Database หรือ Smart Contract logic

==================================================
1. NEW SETTINGS PAGE
==================================================

เพิ่ม route:

/settings/theme

เพิ่มเมนูใหม่ใน Settings:

Theme
หรือภาษาไทย:
ธีมและการแสดงผล

หน้า Theme Settings แสดงตัวเลือก:

Dark
Light

ออกแบบเป็น selectable cards / segmented control แบบ:

[ Dark ]   [ Light ]

หรือ preview cards ที่เห็นตัวอย่างสีจริง

Design:
- Liquid Glass
- Soft UI
- rounded cards
- subtle border
- smooth transition
- active option มี highlight ชัดเจน
- responsive mobile
- ใช้งานง่ายเหมือน Settings ของ banking app

==================================================
2. DEFAULT THEME
==================================================

ค่า default ต้องเป็น:

dark

ผู้ใช้ใหม่ทุกคนเริ่มจาก Dark Theme

ห้ามเปลี่ยน default product identity เดิม

==================================================
3. LIGHT THEME
==================================================

สร้าง Light Theme ที่ออกแบบจริง ไม่ใช่แค่เปลี่ยน background เป็นขาว

ตัวอย่าง direction:

Background:
#F6F8FC / soft off-white

Surface:
#FFFFFF

Elevated Surface:
#F8FAFC

Text:
#0F172A

Secondary Text:
#475569

Muted:
#64748B

Border:
rgba(15, 23, 42, 0.08)

Primary:
คง ChainPay blue เดิม

Light Theme ต้องยังรักษา:

- FinTech look
- Liquid Glass
- Soft UI
- ChainPay blue identity
- premium appearance

Glass ใน Light Theme อาจใช้:

background:
rgba(255,255,255,0.72)

border:
rgba(15,23,42,0.08)

backdrop-filter:
blur(...)

shadow:
soft neutral shadow

ห้ามทำให้กลายเป็น plain white generic dashboard

==================================================
4. DESIGN TOKENS
==================================================

ห้าม hardcode สี light/dark กระจายไปทั่ว components

ปรับ design system เป็น semantic CSS variables เช่น:

--background
--surface
--surface-elevated
--foreground
--foreground-secondary
--muted
--border
--primary
--success
--warning
--error
--glass
--glass-border
--shadow

ตัวอย่าง:

:root,
[data-theme="dark"] {
   ...
}

[data-theme="light"] {
   ...
}

Components ต้องใช้ semantic tokens แทนค่าที่ผูกกับ dark theme โดยตรง

==================================================
5. THEME ARCHITECTURE
==================================================

สร้าง reusable theme system เช่น:

ThemeProvider
useTheme()

รองรับ:

theme = "dark" | "light"

เมื่อเปลี่ยน Theme:
- UI เปลี่ยนทันที
- ไม่ reload หน้า
- smooth transition
- ไม่เกิด hydration mismatch
- ไม่เกิด flash จาก wrong theme ตอน refresh

ใช้ attribute เช่น:

<html data-theme="dark">

หรือ apply ที่ authenticated app wrapper ถ้าเหมาะสมกว่า

IMPORTANT:
เนื่องจาก Homepage ต้อง Dark เสมอ อย่าให้ global theme preference เปลี่ยน marketing homepage

แนะนำ architecture:

Marketing `/`
→ force dark theme

Authenticated App
→ use user selected theme

==================================================
6. PERSIST USER PREFERENCE
==================================================

ตรวจ schema/profile/settings ปัจจุบันก่อน

ถ้ามีระบบ user preferences อยู่แล้ว ให้ใช้ระบบนั้น

Preferred behavior:

User login
↓
Load saved theme
↓
Apply Dark / Light

เมื่อ user เปลี่ยน:
↓
Save preference
↓
ใช้ theme เดิมข้าม device หลัง login

หากต้องเพิ่ม database field ให้ใช้ schema ที่เหมาะสม เช่น:

theme_preference
enum/string:
dark
light

แต่อย่าเพิ่ม table ใหม่ถ้าไม่จำเป็น

ถ้าจำเป็นต้องทำ migration:
- แก้ Drizzle schema
- generate migration
- default existing users = dark
- ห้าม apply production migration โดยอัตโนมัติ

สามารถใช้ localStorage เป็น client cache เพื่อให้ theme แสดงเร็วขึ้น แต่ server/database preference ควรเป็น authoritative ถ้าระบบ user settings รองรับอยู่แล้ว

==================================================
7. NAVIGATION / SETTINGS
==================================================

เพิ่ม Theme เข้า Settings navigation

ตัวอย่าง:

Profile
Security
Theme

Mobile More / Settings sheet ต้องเข้าถึง Theme Settings ได้ด้วย

ถ้ามี EN / TH i18n ให้เพิ่ม translation keys:

EN:
Theme
Appearance
Dark
Light
Choose how ChainPay looks

TH:
ธีม
การแสดงผล
โหมดมืด
โหมดสว่าง
เลือกรูปแบบการแสดงผลของ ChainPay

ภาษาไทยยังต้องใช้ Kanit ตามระบบเดิม

==================================================
8. COMPONENT AUDIT
==================================================

ตรวจ authenticated UI components ทั้งหมดว่ามี hardcoded dark colors หรือไม่ เช่น:

bg-[#...]
text-white
border-white/...
dark fixed gradients
black backgrounds

เปลี่ยนเฉพาะที่จำเป็นให้ใช้ semantic theme tokens

ตรวจอย่างน้อย:

- App Shell
- Sidebar
- Mobile Bottom Navigation
- Dashboard Cards
- Forms
- Inputs
- Buttons
- Dialogs
- Dropdowns
- Tables
- Activity
- Receipt
- Wallet cards
- Payment Review
- Requests
- Settings
- Toast / status UI

Status colors เช่น:
Success
Warning
Error
Pending

ต้องอ่านได้ดีทั้ง Dark และ Light

==================================================
9. MOBILE
==================================================

Light Theme ต้องรองรับ mobile banking layout เดิม

ตรวจ:

- Bottom Liquid Glass Navigation
- Header
- Cards
- Bottom Sheets
- Dialogs
- Form fields
- Safe area
- Active navigation state

Liquid Glass bottom bar ต้องมี light variant ที่มองเห็นชัดบนพื้นสีขาว

==================================================
10. THEME TRANSITION
==================================================

ตอนเปลี่ยน theme ให้ transition แบบ soft:

background-color
color
border-color
box-shadow

ประมาณ 200–300ms

ห้าม transition ทุก property ด้วย `transition: all`

หลีกเลี่ยง animation ใหญ่หรือ flash

รองรับ:

prefers-reduced-motion

==================================================
11. HOMEPAGE MUST NOT CHANGE
==================================================

สำคัญมาก:

หน้า Marketing Homepage `/`
ต้องยังคง Dark Theme เดิมเสมอ

รวมถึง:
- Predictive Arc
- Hero
- Navbar
- Marketing sections
- Footer

Theme preference ของ user ห้ามทำให้ Homepage กลายเป็น Light

Homepage เป็น Brand Experience ของ ChainPay และควร force Dark Theme

==================================================
12. PUBLIC PAGES
==================================================

อย่าขยาย scope โดยไม่จำเป็น

Public payment pages และ unauthenticated pages ให้รักษา theme เดิมก่อน เว้นแต่ shared architecture จำเป็นต้องเปลี่ยน

เป้าหมายหลักคือ authenticated ChainPay application

==================================================
13. ACCESSIBILITY
==================================================

ตรวจ contrast ทั้ง 2 themes

ต้องมี:
- readable text
- visible focus ring
- accessible form fields
- clear selected theme state
- keyboard support

Theme selector ควรมี aria state เช่น:

aria-pressed
หรือ radio group semantics

==================================================
14. TESTING
==================================================

เพิ่มหรือปรับ tests สำหรับ:

- default = Dark
- switch Dark → Light
- switch Light → Dark
- refresh แล้วยังคง theme
- user preference persistence
- Homepage `/` remains Dark
- Dashboard uses selected theme
- Mobile navigation renders correctly
- EN / TH text works
- no hydration mismatch
- no horizontal overflow

หลังแก้ให้ run:

npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e

ถ้ามี DB schema change:

npm run db:generate

แต่ห้าม apply production migration โดยอัตโนมัติ

==================================================
15. DOCUMENTATION
==================================================

อัปเดตเอกสาร:

README.md
document.md
docs/DESIGN.md
docs/IMPLEMENTATION_REPORT.md

เพิ่ม feature:

- Dark / Light theme
- Dark default
- Account-level appearance preference
- `/settings/theme`
- Marketing Homepage remains Dark
- Theme-aware Liquid Glass system

==================================================
FINAL RESULT
==================================================

ต้องได้ behavior:

Homepage
→ Always Dark

Login User
↓
Dashboard
→ Dark by default

Settings
↓
Theme
↓
[ Dark ] [ Light ]

เลือก Light
↓
Authenticated App เปลี่ยนเป็น Light Theme
↓
Preference ถูกบันทึก
↓
Refresh / Login ครั้งต่อไปยังใช้ Light

แต่เมื่อกลับ `/`
↓
Homepage ยังคง Dark

หลังทำเสร็จสรุป:

1. Files created
2. Files modified
3. Theme architecture
4. How preference is stored
5. DB migration required or not
6. Components converted to theme tokens
7. Responsive/mobile changes
8. i18n changes
9. Tests executed
10. Remaining issues