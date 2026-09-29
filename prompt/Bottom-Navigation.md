ปรับ Mobile Bottom Navigation ของ ChainPay โดยอ้างอิง interaction จากภาพ reference ที่ให้มา

ปัจจุบัน Bottom Navigation มี active item เป็น rounded rectangle สีฟ้า
ให้เปลี่ยน active indicator เป็น “Liquid Glass Sliding Bubble” ที่ดูเหมือนแก้วจริงและมี interaction แบบ native mobile app

IMPORTANT:
- ปรับเฉพาะ Mobile Bottom Navigation
- Desktop navigation ไม่ต้องเปลี่ยน
- ห้ามกระทบ routing, auth, payment logic หรือ business logic
- รองรับทั้ง Dark Theme และ Light Theme

==================================================
1. ACTIVE INDICATOR — LIQUID GLASS
==================================================

เปลี่ยน active tab indicator จากกล่องสีธรรมดาเป็น Liquid Glass Bubble

ลักษณะ:

- rounded capsule / soft rectangle
- translucent glass
- backdrop blur
- thin highlight border
- soft inner highlight
- subtle refraction-like gradient
- soft shadow
- blue / white tint ตาม ChainPay design
- ดูเหมือนแก้วลอยอยู่เหนือ navigation bar

Light Theme:
- glass ขาวใส
- border ฟ้าอ่อน
- soft blue highlight
- shadow เบา

Dark Theme:
- dark translucent glass
- white/blue edge highlight
- soft blue glow

ห้ามใช้ glow neon แรงเกินไป

==================================================
2. TAP INTERACTION
==================================================

เมื่อ user แตะ tab:

normal
↓
press
↓
glass bubble ขยายเล็กน้อย
↓
slide ไปยัง tab ใหม่
↓
settle ด้วย soft spring
↓
navigate

ตอน press:

scale ประมาณ:
1 → 1.06 → 1

หรือขยาย width/height เล็กน้อย

ให้รู้สึกเหมือน bubble มีแรงกดและยืดหยุ่น

ใช้ Motion / Framer Motion

แนะนำ:
- layoutId
- MotionValue
- spring animation

ไม่ควรใช้ animation แบบเด้งแรง

==================================================
3. HOLD + DRAG TO SELECT
==================================================

เพิ่ม interaction:

User สามารถ
“กดค้างที่ active glass bubble แล้วลากซ้าย/ขวา”

เพื่อเลือก tab อื่นได้

Interaction:

Long press
↓
Glass bubble ขยายเล็กน้อย
↓
เข้าสู่ drag mode
↓
User ลากนิ้วซ้าย/ขวา
↓
Bubble เคลื่อนตามนิ้วแบบ smooth
↓
Tab ที่อยู่ใกล้ที่สุดถูก highlight
↓
ปล่อยนิ้ว
↓
Bubble snap ไปยัง tab
↓
Navigate ไป route นั้น

ตัวอย่าง:

Home
↓ hold
[ GLASS ]
↓ drag →
Pay
↓ drag →
Request
↓ release
navigate → /requests

==================================================
4. DRAG FEEL
==================================================

Bubble ไม่ควรติดนิ้วแบบแข็งเกินไป

ให้มี:

- spring
- inertia
- resistance
- magnetic snap

รู้สึกเหมือน:

“liquid glass floating control”

ระหว่างลาก:
- bubble ขยายประมาณ 5–10%
- glow/brightness เพิ่มเล็กน้อย
- icon ที่อยู่ใต้ bubble brighten
- label ของ target tab fade/scale ขึ้น

เมื่อปล่อย:
- bubble snap ไป center ของ nearest tab
- route เปลี่ยน
- bubble กลับขนาดปกติ

==================================================
5. IMPORTANT GESTURE BEHAVIOR
==================================================

อย่า navigate ทุกครั้งที่นิ้วผ่าน tab ระหว่าง drag

ให้ navigate เฉพาะตอน:

pointer/touch release

เพื่อป้องกัน route เปลี่ยนหลายครั้งระหว่างลาก

ต้องแยก:

Tap
กับ
Drag

เช่น:

movement < threshold
→ Tap

movement > threshold
→ Drag Mode

ใช้ threshold ที่เหมาะสมประมาณ 6–10px

==================================================
6. LONG PRESS
==================================================

Long press ไม่จำเป็นต้องนาน

ประมาณ:

150–250ms

เพื่อเข้าสู่ drag mode

อย่าให้ user ต้องกดค้างนานจนรู้สึกช้า

หากเริ่มลากก่อน threshold time ให้สามารถเข้าสู่ drag mode ได้เช่นกันถ้า UX ดีกว่า

==================================================
7. ACTIVE TAB CONTENT
==================================================

Inactive tab:

icon
+
small label

สี muted

Active tab:

Liquid Glass Bubble
+
brighter icon
+
bold / stronger label

ตัวอย่าง:

[ Home ] Pay Request Activity More

เมื่อ Home active:

    ┌───────────┐
    │    ⌂      │
    │  หน้าแรก  │
    └───────────┘

แต่ bubble ต้องดูเป็น glass ไม่ใช่ solid blue rectangle

==================================================
8. BUBBLE MORPHING
==================================================

เพิ่ม subtle morph effect

เมื่อ bubble slide จาก tab หนึ่งไปอีก tab:

ก่อนเคลื่อน:
width ปกติ

ระหว่างเคลื่อน:
bubble stretch แนวนอนเล็กน้อย

เมื่อถึงตำแหน่ง:
bubble compress เล็กน้อย
แล้วกลับ normal

เช่น:

scaleX:
1 → 1.12 → 0.97 → 1

ให้ subtle มาก

เป้าหมายคือรู้สึกเหมือน liquid material

==================================================
9. NAVIGATION BAR SURFACE
==================================================

ตัว Bottom Navigation เองให้เป็น glass pill เช่นเดิม แต่ refine เพิ่ม:

- translucent background
- backdrop blur
- thin border
- subtle top highlight
- soft shadow

active bubble ต้องแยก layer จาก nav surface ชัดเจน

โครงสร้างประมาณ:

Bottom Nav Glass Surface
    ├── Liquid Active Bubble
    ├── Home
    ├── Pay
    ├── Request
    ├── Activity
    └── More

==================================================
10. MOBILE BANKING FEEL
==================================================

ให้ interaction รู้สึกเหมือน:

- premium banking app
- Apple-style control
- modern fintech mobile UI

ไม่ให้เหมือน:
- gaming UI
- neon crypto UI
- generic Tailwind navbar

Movement ต้อง:
soft
fluid
controlled
premium

==================================================
11. ROUTES
==================================================

ใช้ navigation config เดิมของ ChainPay

ตัวอย่าง:

Home → /dashboard
Pay → /pay
Request → /requests
Activity → /activity
More → existing More/Profile sheet

ห้าม duplicate route config

==================================================
12. MOBILE ONLY
==================================================

เปิด gesture นี้เฉพาะ touch/mobile layout

Desktop:
ใช้ navigation เดิม

Mouse สามารถ click ได้ตามปกติ
ไม่จำเป็นต้อง drag หากไม่เหมาะสม

แต่สามารถรองรับ pointer drag บน desktop dev/testing ได้ถ้าทำง่าย

==================================================
13. HAPTIC-LIKE VISUAL FEEDBACK
==================================================

ไม่มี native vibration ก็ไม่เป็นไร

ใช้ visual feedback แทน:

press:
scale down/up

drag target:
icon brighten

release:
small spring settle

route selected:
active bubble softly pulse once

อย่าทำ continuous pulse

==================================================
14. PERFORMANCE
==================================================

สำคัญมาก:

อย่าใช้ React state update ทุก pointermove frame ถ้าไม่จำเป็น

ใช้:
- MotionValue
- transform
- requestAnimationFrame
- pointer coordinates

หลีกเลี่ยง:
- layout thrashing
- expensive blur animation
- rerender navigation ทุก frame

Animate primarily:
transform
opacity
scale

==================================================
15. ACCESSIBILITY
==================================================

แม้มี drag gesture ผู้ใช้ยังต้องสามารถ:

- tap/click tab ได้
- keyboard navigate ได้
- screen reader เข้าใจ active route
- focus visible
- touch target >= 44px

ใช้:
aria-current="page"

สำหรับ tab ปัจจุบัน

drag เป็น enhancement เท่านั้น
ห้ามทำให้ user จำเป็นต้องลากถึงจะใช้ navigation ได้

==================================================
16. REDUCED MOTION
==================================================

ถ้า:

prefers-reduced-motion

ให้:
- ปิด stretch effect
- ลด spring
- ปิด drag morph
- ใช้ simple active state transition

แต่ navigation ยังทำงานครบ

==================================================
17. THEME SUPPORT
==================================================

ต้องทำงานกับ Theme feature ปัจจุบัน

Dark:
dark glass + blue/white highlight

Light:
white translucent glass + soft blue edge

ห้าม hardcode สีจน Light Theme อ่านไม่ออก

ใช้ semantic theme variables

==================================================
18. TH / EN SUPPORT
==================================================

ต้องรองรับ EN / TH

ตัวอย่าง:

EN:
Home
Pay
Request
Activity
More

TH:
หน้าแรก
จ่าย
ขอรับเงิน
ประวัติ
เพิ่มเติม

เมื่อภาษาไทย:
ใช้ Kanit ตามระบบ typography ปัจจุบัน

ต้องไม่เกิด overflow

==================================================
19. SAFE AREA
==================================================

รองรับ:

env(safe-area-inset-bottom)

Bottom nav ต้องไม่ชิดขอบ iPhone เกินไป

และไม่บัง:
- form buttons
- CTA
- receipt actions
- page content

==================================================
20. REUSABLE COMPONENT
==================================================

ปรับ component เดิมแทนการสร้าง navigation ซ้ำ

ถ้าเหมาะสมแยกเป็น:

MobileBottomNav
LiquidNavIndicator

ตัวอย่าง internal structure:

<nav>
  <motion.div className="liquid-indicator" />
  <NavItem />
  <NavItem />
  ...
</nav>

ใช้ navigation config กลาง

==================================================
FINAL EXPERIENCE
==================================================

ต้องได้ interaction:

User เห็น Bottom Navigation
↓
Active tab มี Liquid Glass Bubble
↓
Tap tab
→ Bubble ขยายเล็กน้อย
→ slide
→ snap
→ navigate

หรือ

Press & Hold
↓
Bubble ขยาย
↓
Drag ซ้าย/ขวา
↓
Bubble follow finger
↓
Nearest icon highlight
↓
Release
↓
Bubble snap
↓
Navigate

เป้าหมายคือให้ Bottom Navigation ของ ChainPay
รู้สึกเหมือน interactive control ของ Mobile Banking App จริง
ไม่ใช่แค่ navbar ที่มี active background

หลังทำเสร็จให้ตรวจ:

- iPhone / Android widths
- Light Theme
- Dark Theme
- EN
- TH
- Tap
- Hold
- Drag
- Release
- Fast drag
- Cancel drag
- route synchronization
- browser Back/Forward
- safe area
- no horizontal overflow

แล้ว run:

npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e

สุดท้ายสรุป:
1. component ที่แก้
2. liquid glass implementation
3. drag gesture implementation
4. tap vs drag detection
5. route synchronization
6. theme support
7. accessibility
8. mobile performance
9. tests executed