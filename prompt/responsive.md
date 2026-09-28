ปรับ ChainPay ทั้งเว็บให้ Responsive อย่างจริงจัง โดยเน้น Mobile UX ให้รู้สึกเหมือนแอปธนาคาร / FinTech Mobile App มากกว่าเว็บไซต์ย่อส่วน

ก่อนแก้:
- อ่านโครงสร้าง project, routing, navbar, layout และ mobile breakpoint ปัจจุบัน
- ห้ามทำลาย desktop layout ที่ใช้งานได้ดีอยู่แล้ว
- ห้ามแก้ business logic, auth, wallet, payment, API, database หรือ smart contract

# 1. Mobile Navigation

เมื่อหน้าจอเป็น Mobile:
- เลิกใช้ Hamburger Menu เดิม
- เปลี่ยนเป็น Floating Bottom Navigation / Tap Toggle Bar
- Design อ้างอิงจากภาพ reference ที่ให้ไว้
- Style เป็น Liquid Glass + Soft UI + Glassmorphism
- ลอยอยู่ด้านล่างของหน้าจอ
- rounded pill
- translucent dark surface
- backdrop blur
- thin glass border
- soft shadow
- subtle blue/white glow
- active item มี glass bubble / floating capsule highlight แบบใน reference
- active indicator เลื่อนไปมาระหว่าง tab อย่าง smooth

ใช้ Motion / Framer Motion สำหรับ:
- sliding active indicator
- tap feedback
- subtle scale
- spring / ease-out transition

ห้ามทำ animation เด้งแรงหรือ neon จัด

# 2. จำนวนปุ่มบน Mobile

ถ้ามี navigation มากเกินไป ห้ามยัดทุกเมนูลง bottom bar

ให้เลือกเฉพาะเมนูสำคัญต่อการใช้งานจริงประมาณ 4–5 ปุ่ม เช่น:

Home
Pay
Request
Activity
Profile / More

หรือเลือกตาม routing/function ที่มีจริงใน project

ตัวอย่าง:

[ Home ] [ Pay ] [ Request ] [ Activity ] [ More ]

เมนูรอง เช่น:
- Wallets
- Contacts
- Settings
- Security
- Language

ให้อยู่ใน More / Profile sheet ที่เปิดเป็น Liquid Glass Bottom Sheet

เป้าหมายคือใช้ง่ายด้วยนิ้วโป้งและไม่รก

# 3. Desktop / Tablet

Desktop:
- คง Navbar ด้านบน
- ใช้ layout ปัจจุบันเป็นหลัก

Tablet:
- ปรับตามพื้นที่จริง
- ถ้าพื้นที่ไม่พอสามารถใช้ mobile navigation ได้

อย่าใช้ breakpoint แบบแข็งโดยไม่ตรวจ layout จริง

# 4. Mobile App Feel

ปรับทุกหน้าบนมือถือให้รู้สึกเหมือน Native Banking App

เน้น:
- card-based layout
- compact header
- balance / primary information เด่น
- quick actions ใช้ง่าย
- touch target ใหญ่พอ
- spacing สบายตา
- border radius consistent
- scroll smooth
- ไม่มี horizontal overflow
- ไม่มี desktop table ที่บีบจนอ่านไม่ได้

หน้าที่สำคัญ เช่น:

Dashboard
Pay
Request
Activity
Wallet
Settings

ต้อง redesign responsive ให้เหมาะกับ mobile โดยเฉพาะ ไม่ใช่แค่ shrink desktop UI

# 5. Dashboard Mobile

บนมือถือ Dashboard ควรมีลำดับประมาณ:

Greeting / Profile
↓
Primary Wallet / Balance Card
↓
Quick Actions
↓
Payment / Request Status
↓
Recent Activity
↓
Bottom Navigation

Quick Actions เช่น:

Send
Request
Receive
Scan

ทำเป็น touch-friendly icon button/card

# 6. Mobile Header

ลดความซับซ้อนของ Navbar บนมือถือ

Header อาจเหลือ:

ChainPay Logo
+
Notification / Profile / Language

ไม่ต้องแสดง navigation links ซ้ำกับ Bottom Navigation

# 7. Bottom Navigation Behavior

Bottom navigation:
- position fixed
- เว้น safe area สำหรับ iPhone
- ไม่บัง CTA / form / bottom content
- มี proper `padding-bottom`
- รองรับ `env(safe-area-inset-bottom)`

เมื่อ scroll:
- อาจ compact เล็กน้อยได้
- แต่ต้องยังเข้าถึงง่าย

ห้ามซ่อน navigation จนผู้ใช้หาไม่เจอ

# 8. Liquid Glass Interaction

Active tab ให้เหมือน reference:

inactive:
- icon muted
- text อาจซ่อนหรือแสดงแบบ subtle

active:
- glass bubble / capsule
- icon brighter
- label แสดงชัด
- soft white/blue highlight
- subtle inner shadow

เมื่อเปลี่ยน tab ให้ bubble slide ไปตำแหน่งใหม่แบบ fluid

ใช้ Motion `layoutId` ถ้าเหมาะสม

# 9. Language

รองรับ EN / TH toggle ที่มีอยู่

เมื่อใช้ภาษาไทย:
- ใช้ Kanit ตามระบบปัจจุบัน
- ห้าม text overflow
- Bottom nav label ต้องสั้นและอ่านง่าย

ตัวอย่าง:

Home → หน้าแรก
Pay → จ่าย
Request → รับเงิน
Activity → ประวัติ
More → เพิ่มเติม

# 10. Responsive Requirements

ทดสอบอย่างน้อย:

320px
375px
390px
430px
768px
1024px
1440px

ต้องไม่มี:
- horizontal scroll
- clipped card
- modal ล้นจอ
- text ทับกัน
- button เล็กเกินไป
- bottom nav บังเนื้อหา
- keyboard บัง form field โดยไม่สามารถ scroll ได้

# 11. Accessibility

Bottom navigation ต้อง:
- ใช้ semantic navigation
- keyboard accessible
- aria-label
- active state ที่ screen reader เข้าใจ
- focus visible
- touch target อย่างน้อยประมาณ 44px

รองรับ:

prefers-reduced-motion

โดยลด sliding / spring animation เมื่อ user เปิด reduced motion

# 12. Code Quality

สร้าง reusable component เช่น:

components/navigation/
  mobile-bottom-nav.tsx
  mobile-more-sheet.tsx

หรือใช้ structure ที่เหมาะกับ project ปัจจุบัน

ห้าม duplicate navigation config

สร้าง navigation config กลางเพื่อให้ Desktop Navbar และ Mobile Bottom Navigation ใช้ข้อมูล route ชุดเดียวกันเมื่อเหมาะสม

# 13. Important

ห้ามกระทบ:
- Firebase Authentication
- MetaMask
- wallet verification
- Payment flow
- Payment Request
- Transaction verification
- Neon / Drizzle
- API
- Smart Contract

งานนี้คือ:

Responsive UI
+
Mobile Navigation
+
Mobile Banking UX
+
Liquid Glass Bottom Navigation

# Final Goal

Desktop:
Professional FinTech Web App

Mobile:
ให้ ChainPay รู้สึกเหมือน “แอปธนาคารจริง” ที่ใช้งานง่ายด้วยมือเดียว

ไม่ใช่ desktop website ที่ถูกย่อให้เล็กลง

หลังทำเสร็จให้ run:

npm run lint
npm run typecheck
npm run build

แล้วสรุป:
1. responsive changes
2. mobile navigation architecture
3. routes ที่อยู่ใน bottom bar
4. routes ที่ย้ายไป More
5. mobile pages ที่ปรับใหม่
6. accessibility improvements
7. tests/checks ที่ run