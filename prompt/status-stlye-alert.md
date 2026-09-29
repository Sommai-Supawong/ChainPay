ปรับ UI ของ Status และ Alert ใน ChainPay ให้ดูเข้าใจง่ายขึ้น โดยเน้นภาษาไทยและความชัดเจนของสถานะ

1. ปรับ Status Badge

ปรับสถานะอย่าง:

- “ชำระแล้ว”
- “ใช้งานอยู่”

ให้ดูอ่านง่ายและแยกความหมายชัดเจนขึ้น

แนวทาง:
- ใช้ badge แบบ Soft UI / subtle glass
- มี icon ประกอบ
- ใช้สี semantic ที่เข้าใจง่าย
- ไม่ใช้สีสดหรือ neon เกินไป
- ขนาดเล็ก กระชับ แต่ต้องอ่านชัด

ตัวอย่าง:

ชำระแล้ว
→ ใช้ CheckCircle
→ สีเขียวอ่อน / success
→ label: “ชำระแล้ว”

ใช้งานอยู่
→ ใช้ Circle / Activity / ShieldCheck
→ สีเขียวหรือฟ้าอ่อน
→ label: “ใช้งานอยู่”

สถานะอื่นให้จัดมาตรฐานเดียวกัน เช่น:

รอดำเนินการ
→ Clock
→ สีเหลืองอ่อน

ยืนยันแล้ว
→ BadgeCheck
→ สีเขียว

ไม่สำเร็จ
→ XCircle
→ สีแดงอ่อน

ยกเลิก
→ Ban / X
→ สีเทา/แดงอ่อน

หมดอายุ
→ TimerOff
→ สีเทา/ส้มอ่อน

อย่าใช้แค่สีอย่างเดียว ต้องมี text + icon เพื่อให้เข้าใจได้ทันที

--------------------------------------------------

2. ปรับข้อความ Status ภาษาไทย

ถ้าปัจจุบันมีคำแปลที่แข็งหรือไม่เป็นธรรมชาติ ให้ปรับให้เป็นภาษาไทยที่คนทั่วไปเข้าใจ

ตัวอย่าง:

Paid
→ ชำระแล้ว

Active
→ ใช้งานอยู่

Pending
→ รอดำเนินการ

Confirmed
→ ยืนยันแล้ว

Failed
→ ไม่สำเร็จ

Cancelled
→ ยกเลิกแล้ว

Expired
→ หมดอายุ

Verified
→ ยืนยันแล้ว

Draft
→ แบบร่าง

ต้องใช้ translation key จากระบบ i18n เดิม
ห้าม hardcode ภาษาไทยแยกใน component

--------------------------------------------------

3. Alert / Toast / Error Message

ปรับ Alert, Toast, Warning, Success และ Error message ให้รองรับภาษาไทยเต็มรูปแบบ

เมื่อ locale = TH:
- ทุก alert ต้องเป็นภาษาไทย
- ใช้ข้อความสั้น เข้าใจง่าย
- หลีกเลี่ยงศัพท์ technical ถ้าไม่จำเป็น
- ถ้ามีข้อมูล technical เช่น tx hash หรือ wallet address ให้แสดงเป็นรายละเอียดรอง

ตัวอย่าง:

EN:
Payment confirmed successfully.

TH:
ยืนยันการชำระเงินสำเร็จแล้ว

EN:
Transaction is still pending.

TH:
ธุรกรรมกำลังรอการยืนยัน

EN:
Your transaction was sent but has not been saved yet.

TH:
ส่งธุรกรรมสำเร็จแล้ว แต่ระบบยังไม่ได้บันทึกรายการ กรุณาอย่าชำระซ้ำ

--------------------------------------------------

4. Thai Font — Kanit

สำคัญ:

เมื่อ locale = `th`
ให้ Alert / Toast / Dialog / Status Badge / Tooltip / Modal / Bottom Sheet
ใช้ฟอนต์ Kanit ตามระบบภาษาไทยเดิม

ต้องครอบคลุม:

- toast
- alert
- status badge
- dialog
- confirm dialog
- error message
- success message
- warning
- helper text
- tooltip

อย่าให้บาง component หลุดไปใช้ font อังกฤษ

ใช้ CSS variable / locale-aware class ที่มีอยู่ เช่น:

html[lang="th"] {
  font-family: var(--font-kanit), sans-serif;
}

แต่ถ้า component พวก Toast ถูก render ผ่าน Portal / Sonner / Radix
ให้ตรวจด้วยว่า Kanit ถูก inherit จริง

ถ้าไม่ inherit:
ให้เพิ่ม class/theme wrapper ที่เหมาะสม
อย่า hardcode `font-family` ซ้ำในทุก component

--------------------------------------------------

5. Alert Design

ปรับ visual ให้เข้ากับ ChainPay:

Success
→ green soft surface

Warning
→ amber soft surface

Error
→ red soft surface

Info
→ blue soft surface

Style:
- Soft UI
- Liquid Glass แบบบาง ๆ
- rounded 14–18px
- subtle border
- icon ชัดเจน
- title + description
- contrast อ่านง่ายทั้ง Dark / Light

ห้ามทำ:
- glow แรง
- สีจัด
- gradient เยอะ
- alert ใหญ่เกินไป

--------------------------------------------------

6. Dark / Light Theme

ตรวจทั้ง:

Dark Theme
Light Theme

Status และ Alert ต้องอ่านง่ายทั้งสองธีม

โดยเฉพาะ:
- success green
- warning yellow
- error red
- muted text

ห้ามใช้สีที่ contrast ต่ำเกินไปบน Light Theme

--------------------------------------------------

7. EN / TH

ต้องรองรับทั้งภาษาอังกฤษและภาษาไทย

EN:
ใช้ font เดิม

TH:
ใช้ Kanit

ถ้าภาษาไทยยาวกว่า:
- badge ห้าม text overflow
- toast ห้ามล้น
- dialog layout ต้องไม่พัง
- mobile ต้องอ่านง่าย

--------------------------------------------------

8. Reusable Status Component

ถ้าปัจจุบัน status badge กระจายหลายแบบ ให้รวมเป็น reusable component เดียว เช่น:

<StatusBadge status="paid" />

แล้ว map:

paid
active
pending
confirmed
failed
cancelled
expired
verified
draft

ไปยัง:
- icon
- color
- label
- theme style

ห้าม duplicate logic หลายไฟล์

--------------------------------------------------

9. ห้ามกระทบ Logic

ห้ามเปลี่ยน actual status logic หรือ business logic

งานนี้คือ:
- visual
- translation
- typography
- UX clarity

ไม่เปลี่ยน:
- payment status transition
- database enum
- API
- blockchain verification
- smart contract

--------------------------------------------------

10. ตรวจหลังแก้

ตรวจอย่างน้อย:

Dashboard
Payment Request
Activity
Receipt
Wallet
Settings

ทั้ง:
- EN
- TH
- Dark
- Light
- Mobile
- Desktop

แล้ว run:

npm run lint
npm run typecheck
npm run build

สรุป:
1. Status component ที่แก้
2. Translation ที่เพิ่ม/แก้
3. Alert/Toast ที่ปรับ
4. Kanit integration
5. Dark/Light support