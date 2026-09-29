แก้ Mobile Bottom Navigation ของ Homepage `/` ใหม่

ปัญหาปัจจุบัน:
ครั้งก่อนนำ Dashboard Bottom Navigation มาใช้ทั้ง component ทำให้เมนูและ route ของ Homepage เปลี่ยนไปตาม Dashboard

สิ่งที่ต้องการจริง:
“เอาเฉพาะ UI STYLE + MOTION ของ Dashboard Bottom Navigation มาใช้กับ Homepage”
แต่ Homepage ต้องคง navigation behavior เดิมทุกอย่าง

IMPORTANT:
ห้ามเปลี่ยน function / destination / anchor / routing ของ Homepage

==================================================
1. RESTORE HOMEPAGE NAV BEHAVIOR
==================================================

ก่อนแก้ ให้ตรวจ Git diff / Git history / code เดิมของ Homepage ก่อนการเปลี่ยนครั้งล่าสุด

ค้นหาว่า Mobile Homepage Navigation เดิมมี:
- เมนูอะไรบ้าง
- icon อะไร
- แต่ละปุ่มกดไปไหน
- เป็น route หรือ section anchor
- scroll ไป section ไหน
- CTA ใดเปิด login / dashboard
- active state เดิมคำนวณอย่างไร

จากนั้น RESTORE behavior เหล่านั้นทั้งหมด

ตัวอย่าง:
ถ้าปุ่มเดิมกดแล้ว scroll ไป section เช่น:

#features
#how-it-works
#security
#faq

ให้กลับไป scroll ไปตำแหน่งเดิม

ถ้าเดิมมีปุ่ม:
Explore
Features
How it works
Security
Get Started

ให้ใช้รายการเดิม

ห้ามแทนด้วย:

Home
Pay
Request
Activity
More

เว้นแต่ Homepage เดิมใช้เมนูเหล่านี้จริง

==================================================
2. ONLY COPY THE VISUAL STYLE
==================================================

ให้นำเฉพาะ visual language ของ Dashboard Mobile Bottom Navigation มาใช้:

- Liquid Glass bar
- 3D convex glass active bubble
- glass rim
- top reflection
- inner refraction
- soft shadow
- floating depth
- same border radius
- same spacing quality
- same icon treatment
- same typography treatment
- same press animation
- same smooth spring motion

แต่ Homepage navigation data และ click behavior ต้องเป็นของ Homepage เดิม

คิดแบบนี้:

Dashboard Nav
= Visual Reference Only

Homepage Nav
= Existing Behavior + Existing Destinations

==================================================
3. DO NOT REUSE DASHBOARD ROUTE CONFIG
==================================================

ห้ามนำ Dashboard navigation config มาใช้กับ Homepage

Dashboard config เช่น:

/dashboard
/pay
/requests
/activity
/more

ต้องไม่ถูกบังคับให้ Homepage ใช้

Homepage ต้องมี config ของตัวเอง หรือ reuse marketing navigation config เดิม

ถ้าปัจจุบันถูกเปลี่ยนไปใช้ shared Dashboard config แล้ว:
ให้แยก behavior กลับออกมา

สามารถ reuse ได้เฉพาะ:
- LiquidGlassIndicator
- GlassNavSurface
- motion variants
- shared visual primitives

ห้าม reuse:
- dashboard routes
- dashboard menu labels
- dashboard auth navigation behavior

==================================================
4. SECTION SCROLL BEHAVIOR
==================================================

ถ้า Homepage navigation เดิมใช้ anchor/section navigation:

เมื่อ user กด:
→ smooth scroll ไป section เดิม

เช่น:

document.querySelector(...)
scrollIntoView({
  behavior: "smooth"
})

หรือใช้ implementation เดิมของ project

ต้อง:
- scroll ไปตำแหน่งถูกต้อง
- account for sticky header
- ไม่ scroll เลย section
- ไม่ reload page

==================================================
5. ACTIVE INDICATOR
==================================================

Liquid Glass Bubble ต้องแสดง active Homepage section

เช่น:

Hero
↓ scroll
Features
↓ scroll
How It Works
↓ scroll
Security

Active bubble สามารถเลื่อนไปตาม section ที่ user กำลังดูอยู่

ใช้ IntersectionObserver ถ้าระบบเดิมมีอยู่แล้ว
หรือคง logic เดิม

อย่าเปลี่ยน route เพื่อทำ active state

==================================================
6. TAP BEHAVIOR
==================================================

Tap:

Homepage nav item
↓
Liquid bubble move
↓
scroll / navigate ไป destination เดิม
↓
active state update

อย่า navigate ไป Dashboard route เพียงเพราะใช้ style เดียวกัน

==================================================
7. DRAG BEHAVIOR
==================================================

ถ้าเก็บ hold + drag interaction:

user drag bubble
↓
nearest Homepage nav item highlight
↓
release
↓
เรียก action ของ Homepage item นั้น

ถ้า item เป็น section:
→ scroll section

ถ้า item เป็น CTA:
→ execute CTA เดิม

อย่า hardcode router.push() สำหรับทุก item

สร้าง action abstraction เช่น:

{
  id,
  label,
  icon,
  type: "section" | "route" | "action",
  target
}

หรือใช้ architecture เดิมที่เหมาะสม

==================================================
8. HOMEPAGE DESIGN MUST REMAIN UNCHANGED
==================================================

ห้ามเปลี่ยน:

- Hero
- Predictive Arc
- headings
- CTA
- sections
- homepage content
- spacing หลัก
- desktop navbar
- footer
- animations อื่น

แก้เฉพาะ Mobile Bottom Navigation

==================================================
9. VISUAL TARGET
==================================================

จากภาพปัจจุบัน style ของ bottom nav ถือว่าใช้ได้แล้ว

ให้รักษา:

- dark glass pill
- floating 3D active bubble
- white / blue refraction
- premium banking-app feel

ไม่ต้อง redesign bubble ใหม่ทั้งหมด
เน้นแก้ behavior ให้กลับเป็น Homepage เดิม

==================================================
10. MOBILE ONLY
==================================================

แก้เฉพาะ mobile breakpoint

Desktop Homepage:
ต้องเหมือนเดิม 100%

ตรวจ:

320px
375px
390px
430px

==================================================
11. EN / TH
==================================================

ใช้ Homepage translation เดิม

ห้ามเปลี่ยน Homepage menu เป็นคำของ Dashboard

ภาษาไทย:
Kanit

ภาษาอังกฤษ:
font เดิม

==================================================
12. AUTH
==================================================

CTA/auth behavior ต้องเหมือน Homepage เดิม

ตัวอย่าง:
ถ้า user login แล้ว:
Get Started → Dashboard

ถ้ายังไม่ login:
Get Started → Login

อย่าเปลี่ยน logic เดิม

==================================================
13. CLEAN UP PREVIOUS IMPLEMENTATION
==================================================

ตรวจ diff จากการแก้ครั้งก่อน

ลบ/revertเฉพาะส่วนที่ทำให้:
- Homepage ใช้ Dashboard routes
- Homepage ใช้ Dashboard menu config
- click destinations เปลี่ยน
- Homepage behavior เปลี่ยน

แต่เก็บ:
- Liquid Glass CSS
- visual primitives
- animation style

==================================================
14. ACCEPTANCE TEST
==================================================

ก่อนจบ ต้องทดสอบ:

1. Homepage mobile เปิดได้ปกติ
2. Bottom nav หน้าตาเหมือน Dashboard style
3. แต่ labels เป็น Homepage เดิม
4. กดแต่ละปุ่มแล้วไป destination เดิม
5. section buttons scroll ไปตำแหน่งเดิม
6. CTA behavior เดิม
7. Dashboard navigation ไม่เปลี่ยน
8. Desktop Homepage ไม่เปลี่ยน
9. browser Back/Forward ยังทำงาน
10. ไม่มี horizontal overflow
11. bottom nav ไม่บัง footer/CTA

==================================================
15. VALIDATION
==================================================

run:

npm run lint
npm run typecheck
npm run build

ถ้ามี E2E ให้เพิ่ม test:

Homepage mobile navigation
→ click each item
→ verify original destination/section

สุดท้ายสรุป:
- behavior ที่ restore
- styles ที่ reuse
- files modified
- homepage destinations
- tests executed

ทำเลยโดยดู Git history/code เดิมเป็น source of truth
ไม่ต้องถาม clarification เพิ่ม เว้นแต่หา implementation เดิมไม่เจอจริง ๆ