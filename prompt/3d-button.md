ปรับ Mobile Bottom Navigation ของ ChainPay ใหม่ โดยให้ยึด “ภาพ reference ที่ผมแนบไว้ใน project” เป็น visual target หลัก

IMPORTANT:
ก่อนแก้ code ให้เปิดและวิเคราะห์ภาพ reference ก่อน แล้วเปรียบเทียบกับ implementation ปัจจุบัน

ตอนนี้ implementation ยังไม่ตรง reference เพราะ:
- active indicator ยังดูเหมือน rounded rectangle ธรรมดา
- bubble ยังอยู่ภายในขอบ navbar มากเกินไป
- ไม่มีความรู้สึกว่าเป็นก้อนแก้วหนาแบบ 3D
- highlight / refraction / depth ยังไม่ชัด
- active bubble ยังไม่ “โป่งออกจากตัว bar” แบบใน reference

อย่าแก้แค่ opacity / blur / box-shadow เดิม
ให้ปรับโครงสร้าง visual ของ active indicator ใหม่จนใกล้ reference จริง

==================================================
TARGET VISUAL
==================================================

Reference มีลักษณะสำคัญดังนี้:

1. Bottom bar เป็น dark rounded pill เรียบ ๆ
2. Active item เป็น “ก้อน Liquid Glass แยกอีก layer”
3. Active bubble มีขนาดใหญ่กว่าความสูงของ navbar
4. Bubble ต้อง protrude / ล้นออกด้านบนและด้านล่างของ bar เล็กน้อย
5. Bubble ดูเหมือน convex glass lens หรือแก้วหนา 3D
6. มีขอบแก้วรอบนอกที่เห็นชัด
7. มี highlight ขาวบริเวณด้านบน/ซ้าย
8. มี refraction / blue-white light ที่ขอบ
9. ด้านล่างมีเงาและความลึก
10. Bubble ต้องดูเหมือน “วัตถุจริงที่ลอยอยู่เหนือ nav bar”
11. icon + label อยู่กลางก้อนแก้ว
12. inactive tabs อยู่เรียบ ๆ บน bar และไม่มีกล่อง

ผลลัพธ์ต้องใกล้ reference มากกว่าของปัจจุบันอย่างชัดเจน

==================================================
STRUCTURE
==================================================

หาก component ปัจจุบันทำ active indicator อยู่ภายใน tab item ให้ refactor

ต้องมี structure ประมาณ:

<nav className="mobile-bottom-nav">

  <div className="nav-glass-surface" />

  <motion.div className="active-liquid-glass">
      ...
  </motion.div>

  <NavItems />

</nav>

Active bubble ต้องเป็น independent absolute layer

อย่าให้ active bubble ถูกจำกัดด้วย tab button แต่ละตัว

navbar ต้อง:

overflow: visible

เพื่อให้ bubble สามารถล้นออกนอก nav bar ได้

==================================================
ACTIVE BUBBLE SIZE
==================================================

Active glass bubble ต้องใหญ่กว่า navbar height

ตัวอย่างแนวทาง:

Navbar:
height ~64–68px

Active bubble:
height ~76–84px

width:
ประมาณ 80–100px
ขึ้นกับ label

bubble ควร:

translateY(-3px ถึง -8px)

เพื่อให้ดูเหมือนลอยและโป่งออกจาก bar

อย่าให้เหมือนกล่องที่ถูกวาง “ข้างใน” navbar

==================================================
3D GLASS CONSTRUCTION
==================================================

สร้าง Glass Bubble จากหลาย layer

ใช้:

base element
::before
::after
และ nested highlight layer ถ้าจำเป็น

Layer 1 — Glass body
- translucent blue/white
- backdrop blur
- saturation
- subtle gradient

Layer 2 — Outer glass rim
- bright white/blue edge
- ไม่ใช่ border สีเดียวทั้งรอบ

Layer 3 — Specular highlight
- ด้านบน
- curved reflection
- soft white
- opacity ประมาณ 0.25–0.55

Layer 4 — Inner refraction
- blue/white inner edge
- subtle inner shadow

Layer 5 — Depth shadow
- soft shadow ใต้ bubble
- ช่วยให้ bubble ลอยจาก navbar

==================================================
CONVEX / LENS EFFECT
==================================================

Bubble ต้องดูโค้งนูน

ใช้ combination ของ:

radial-gradient()
linear-gradient()
inset box-shadow
outer box-shadow
backdrop-filter

แนวทาง visual:

center:
โปร่งกว่า

edge:
สว่างกว่าเล็กน้อย

top:
white reflection

bottom:
blue-gray depth

ต้องดูเหมือน glass lens

ไม่ใช่ frosted rectangle

==================================================
SHAPE
==================================================

Shape ไม่ควรเป็น rectangle ที่ radius ธรรมดาเกินไป

ทำให้มีลักษณะ:

soft capsule
+
convex rounded body

border-radius อาจประมาณ 26–34px

แต่ให้ curvature ดู organic กว่าเดิม

ถ้าจำเป็นสามารถใช้:

border-radius:
32px 32px 28px 28px

หรือ pseudo layers ช่วยสร้างรูปทรง

อย่าทำ perfect flat pill แบบทั่ว ๆ ไป

==================================================
OPTICAL EDGE
==================================================

Reference มี edge ที่ดูเหมือนแก้วหักเหแสง

จำลองด้วย:

::before

ใช้ gradient border / mask

ตัวอย่าง concept:

top-left:
strong white highlight

top:
soft blue-white line

right:
blue refraction

bottom:
darker translucent edge

ห้ามใช้:

border: 1px solid rgba(...)

แบบเดียวทั้งรอบแล้วจบ

==================================================
SPECULAR REFLECTION
==================================================

เพิ่ม reflection บนผิว glass

เช่น pseudo-element:

position absolute
top: 4px
left: 10%
width: 80%
height: 30%

background:
linear-gradient(
  to bottom,
  rgba(255,255,255,.55),
  rgba(255,255,255,.05)
)

border-radius: inherit

blur เล็กน้อย

ต้อง subtle แต่เห็นได้

==================================================
NAV BAR ITSELF
==================================================

Navbar ต้องเรียบกว่า active bubble

Dark theme:

- deep navy / black translucent
- low reflection
- subtle thin border
- soft shadow

ประมาณ visual hierarchy:

Page
↓
Dark nav pill
↓
3D Liquid Glass Bubble

Bubble ต้องเป็นสิ่งที่สายตาเห็นก่อน navbar

==================================================
ACTIVE ICON + LABEL
==================================================

Active:

icon:
bright white / pale blue

label:
white
font-weight 600

จัด icon + label อยู่กลาง bubble

vertical centered

Inactive:

icon:
muted blue-gray

label:
muted

ไม่มี background

==================================================
POSITIONING
==================================================

สำคัญมาก:

active bubble ต้อง overlap navbar

เช่น:

navbar:
position fixed

active bubble:
position absolute
top: 50%
transform:
translateY(-50%)

แต่เพิ่ม offset ให้ bubble ล้น:

ประมาณ -4px ถึง -8px

และ:

overflow: visible

บน nav container

ต้องไม่ถูก clip

==================================================
MOTION
==================================================

คงระบบ tap / drag ที่มีอยู่แล้ว

แต่ active bubble ต้องเคลื่อน “ทั้งก้อน glass”

ใช้ MotionValue + spring

ตอนเปลี่ยน tab:

bubble:
stretch แนวนอนเล็กน้อย

scaleX:
1 → 1.12 → 1

scaleY:
1 → 1.04 → 1

ตอน press:

scale:
1.05

ตอน drag:

scale:
1.08

bubble ต้องดูเหมือนของเหลว / elastic glass

แต่ไม่เด้งแบบ cartoon

==================================================
DRAG
==================================================

กดค้าง / drag behavior เดิมต้องยังใช้งานได้

ตอน drag:

- bubble follow finger
- icon target brighten
- glass reflection เพิ่มนิดเดียว
- bubble stretch ตาม velocity ได้เล็กน้อย

release:

snap ไป nearest tab
↓
spring settle
↓
navigate

ห้าม route เปลี่ยนระหว่างลาก

==================================================
LIGHT THEME
==================================================

Light theme ต้องยังให้ bubble ดูเป็นแก้วจริง

ไม่ใช่ solid blue

ใช้:

white translucent glass
+
very light blue tint
+
stronger rim highlight
+
soft gray/blue shadow

Navbar light theme:
white / off-white translucent

Active bubble:
ใสกว่าและนูนกว่า navbar

==================================================
DARK THEME
==================================================

Dark theme:

navbar:
#07101d / dark navy translucent

bubble:
blue-gray transparent glass

rim:
white + blue

highlight:
white

shadow:
deep navy

ไม่ทำเป็น neon

==================================================
REFERENCE MATCHING
==================================================

ให้ใช้ภาพ reference ที่ผมเพิ่มไว้ใน project เป็น visual comparison ระหว่างทำ

อย่าตีความคำว่า Liquid Glass แบบทั่วไป

เป้าหมายเฉพาะคือ:

“Large convex glass bubble protruding from a dark pill navigation bar.”

ถ้าผลออกมาเป็น:
- rounded blue rectangle
- flat glass card
- simple blur button

ถือว่ายังไม่ผ่าน

==================================================
CURRENT IMPLEMENTATION
==================================================

อย่าทำลาย:

- navigation routes
- Home
- Pay
- Request
- Activity
- More
- drag behavior
- tap behavior
- browser Back/Forward synchronization
- EN / TH
- Kanit Thai font
- Light / Dark Theme
- Safe Area
- accessibility

ปรับเฉพาะ visual structure และ motion ของ mobile bottom navigation ตามที่จำเป็น

==================================================
RESPONSIVE
==================================================

ตรวจ:

320px
375px
390px
430px

Bubble ต้องไม่ชนจอ

Label ต้องไม่ล้น

Navbar ต้องยังอยู่กึ่งกลาง

safe-area-inset-bottom ต้องทำงาน

==================================================
PERFORMANCE
==================================================

ใช้ static CSS สำหรับ:

blur
refraction
glass layers
shadow

เวลา drag animate เฉพาะ:

transform
x
scale
opacity

ห้าม animate backdrop-filter ทุก frame

ต้องรักษา smooth 60fps ให้มากที่สุด

==================================================
REDUCED MOTION
==================================================

prefers-reduced-motion:

- ปิด stretch
- ลด spring
- drag ยังใช้งานได้
- glass visual ยังอยู่

==================================================
FINAL ACCEPTANCE
==================================================

ก่อนจบงาน เปรียบเทียบ implementation กับ reference อีกครั้ง

ต้องตอบได้ว่า:

1. Active bubble ใหญ่กว่า navbar จริงหรือไม่
2. Bubble ล้นออกจาก bar จริงหรือไม่
3. มี convex 3D depth จริงหรือไม่
4. เห็น glass rim จริงหรือไม่
5. มี top reflection จริงหรือไม่
6. มี refraction edge จริงหรือไม่
7. Navbar และ bubble แยกเป็นคนละ depth layer จริงหรือไม่
8. ตอน drag ทั้งก้อน glass เคลื่อนตามนิ้วหรือไม่

ถ้าข้อใดข้อหนึ่งยังไม่ชัด ให้ refine ต่อก่อนจบ

จากนั้นทดสอบ:

npm run lint
npm run typecheck
npm run build

แล้วสรุป:
- component ที่แก้
- CSS/glass layers ที่เพิ่ม
- วิธีสร้าง convex glass effect
- positioning / overflow ที่แก้
- drag animation ที่คงไว้
- dark/light theme implementation