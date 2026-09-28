เพิ่มระบบ **bilingual EN / TH** ให้เว็บ ChainPay โดยภาษาเริ่มต้นยังคงเป็น **English** และเพิ่มภาษาไทยเป็นตัวเลือก

## UI
เพิ่ม **language toggle button แบบ Liquid Glass** ใน Navbar เช่น:

`EN  |  TH`

Design:
- Liquid Glass / Glassmorphism
- rounded pill
- dark translucent background
- thin white/blue border
- soft blur + subtle glow
- active language มี background/highlight ชัดกว่า
- transition แบบ smooth 200–300ms
- hover / tap animation เบา ๆ
- responsive บน mobile
- เข้ากับ ChainPay dark FinTech theme

ตัวอย่าง behavior:

```text
[ EN | TH ]
```

เมื่อเลือก EN:
- EN active
- UI ทั้งหมดแสดงภาษาอังกฤษ

เมื่อเลือก TH:
- TH active
- UI ทั้งหมดเปลี่ยนเป็นภาษาไทย

## Translation Architecture
ห้าม hardcode การแปลกระจายตาม component

สร้างระบบ translation กลาง เช่น:

```text
src/i18n/
  en.ts
  th.ts
  index.ts
```

หรือ structure ที่เหมาะกับ project ปัจจุบัน

ตัวอย่าง:

```ts
{
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    pay: "Pay",
    activity: "Activity"
  },
  hero: {
    title: "Pay with blockchain, without the complexity.",
    description: "..."
  }
}
```

และภาษาไทย:

```ts
{
  nav: {
    home: "หน้าแรก",
    dashboard: "แดชบอร์ด",
    pay: "ชำระเงิน",
    activity: "ประวัติ"
  },
  hero: {
    title: "ชำระเงินด้วยบล็อกเชน โดยไม่ต้องเข้าใจความซับซ้อน",
    description: "..."
  }
}
```

สร้าง reusable hook/context เช่น:

```ts
useLanguage()
```

หรือ

```ts
useTranslation()
```

ให้ component เรียกข้อความผ่าน key แทน hardcoded text

---

## Language State
ภาษาเริ่มต้น:

```text
en
```

เมื่อ user เปลี่ยนภาษา:
- เปลี่ยนข้อความทันทีโดยไม่ reload หน้า
- persist preference ด้วย `localStorage` หรือ cookie
- refresh หน้าแล้วยังคงภาษาที่ user เลือก
- ถ้ายังไม่เคยเลือก ให้ default เป็น EN

ต้องป้องกัน hydration mismatch ใน Next.js App Router

---

## Scope
เริ่มแปลส่วน UI ที่ user เห็นทั้งหมด โดยเฉพาะ:

- Navbar
- Homepage
- Hero
- Features
- How it Works
- Trust / Security section
- CTA
- Footer
- Login
- Dashboard
- Pay
- Payment Request
- Activity
- Wallet
- Settings
- common buttons
- empty states
- loading messages
- validation/error messages ที่เหมาะสม

ไม่ต้องแปล:
- wallet address
- transaction hash
- network name
- Ethereum / Sepolia
- technical identifiers
- environment values
- contract address

---

## Thai Translation Style
ภาษาไทยต้อง:
- เป็นธรรมชาติ
- อ่านง่าย
- ไม่แปลตรงตัวเกินไป
- ใช้ศัพท์ FinTech/Web3 ที่คนทั่วไปเข้าใจ

ตัวอย่าง:

```text
Send Payment
→ ส่งเงิน

Request Payment
→ ขอรับชำระเงิน

Payment Request
→ คำขอรับชำระเงิน

Transaction History
→ ประวัติธุรกรรม

Connect Wallet
→ เชื่อมต่อกระเป๋า

Verify Wallet
→ ยืนยันความเป็นเจ้าของกระเป๋า

Payment Confirmed
→ ยืนยันการชำระเงินแล้ว
```

---

## Animation
เวลา toggle ภาษา:

- ใช้ sliding active indicator
- Motion / Framer Motion ได้
- indicator เลื่อนจาก EN → TH อย่าง smooth
- ใช้ spring หรือ ease-out แบบ soft
- ห้ามทำ animation ใหญ่
- ห้ามให้ layout กระโดดตอนภาษาไทยมีข้อความยาวกว่า

ใช้ `layout` / `layoutId` ของ Motion ถ้าเหมาะสม

---

## Accessibility
ต้องรองรับ:
- keyboard navigation
- `aria-label`
- visible focus state
- correct button semantics

ตัวอย่าง:

```text
aria-label="Change language"
```

---

## Important
อย่าเปลี่ยน business logic ใด ๆ

ห้ามกระทบ:
- Firebase Auth
- MetaMask
- wallet verification
- payment flow
- API
- database
- smart contract
- transaction verification

งานนี้คือ:

**UI Internationalization + EN/TH Language Toggle เท่านั้น**

หลังทำเสร็จให้ run:

```bash
npm run lint
npm run typecheck
npm run build
```

และแก้ error ทั้งหมดก่อนจบงาน

สุดท้ายสรุป:
1. ไฟล์ที่สร้าง
2. ไฟล์ที่แก้
3. translation architecture
4. วิธี persist ภาษา
5. component ของ EN/TH toggle
6. หน้าใดรองรับภาษาไทยแล้วบ้าง