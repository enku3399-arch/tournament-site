# Claude Code Prompt — Монгол 87/89 V Спорт Наадам сайт

## CONTEXT
Та `tournament-site` гэдэг Next.js 15 + Tailwind v4 + Supabase ашигладаг төсөл дээр ажиллах гэж байна.
Энэ нь **"Монгол 87/89" Төгсөгчдийн Холбоо ТББ**-ийн зохион байгуулдаг **V Спорт Наадам 2026**-ийн албан ёсны вэб сайт.

**Тэмцээний мэдээлэл:**
- Огноо: 2026.06.11–12 (магадгүй 13 хүртэл сунгагдана — медалийн тоглолт өөр зааланд болно)
- Байршил: "Буянт Ухаа" спорт ордон, Улаанбаатар
- Хост 4 аймаг: Өмнөговь · Сэлэнгэ · Төв · Увс
- 21 аймгийн оролцоо, 5 спортын төрөл, 7 ангилал
- Уриа: "Өнгөлөг · Сүрлэг · Тэнгэрлэг · Ухаалаг"
- Хаалтын үдэшлэг: NICE хамтлаг

**Спортын төрлүүд:**
1. Сагсан бөмбөг — ♂ Эрэгтэй + ♀ Эмэгтэй (2 ангилал)
2. Волейбол — ♂ Эрэгтэй + ♀ Эмэгтэй (2 ангилал)
3. Шатар — Багаар
4. Ширээний теннис — Багаар
5. Дартс — Багаар

## ТАНЫ ҮҮРЭГ

Энэ зипэнд орсон **`index.html` + `styles.css`** бол **албан ёсны баталсан дизайн систем**.
Олимп / Азийн наадмын албан ёсны сайтуудын стилээр (сурагч Hangzhou 2022, Milano-Cortina 2026, olympics.com) бүтээсэн.

Таны үүрэг — энэ дизайныг **яг хатуу барьж** одоо байгаа Next.js TSX кодыг шинэчлэх:
1. `src/app/globals.css` — өнгө, фонт, утилит классуудыг `styles.css`-тэй яг адил тохируулна
2. `src/app/(public)/layout.tsx` — utility bar + цагаан masthead + main nav + gold ribbon + footer
3. `src/app/(public)/page.tsx` — нүүр хуудас
4. `src/app/(public)/t/[id]/page.tsx` — тэмцээний дэлгэрэнгүй
5. `src/app/(public)/t/[id]/[sportId]/page.tsx` — спортын bracket/group
6. `src/app/(public)/register/[id]/RegisterForm.tsx`
7. `src/app/(judge)/...` болон `src/app/(admin)/...` хуудаснууд
8. `src/components/*` (Nav, Bracket, GroupTable, RealtimeScoreboard зэргийг шинэ системд тохируулна)

---

## ⚠️ ХАТУУ ДҮРЭМ — НЭГ Ч ЗҮЙЛ БҮҮ ӨӨРЧИЛ

### 1. ӨНГӨНИЙ ПАЛИТР (нэмж сольж болохгүй)

```css
--ink:        #0B1426   /* primary dark navy */
--ink-2:      #111d36   /* card / surface */
--ink-3:      #1a2747   /* elevated */
--line:       #25325a   /* hairline border */
--line-2:     #2f3e6e
--fog:        #8c9bbf   /* muted body on dark */
--fog-2:      #5e6e96
--bone:       #f5f1e8   /* cream section */
--bone-2:     #ece6d6
--paper:      #ffffff
--gold:       #c8a24a   /* medal gold (primary accent) */
--gold-light: #e5c87a
--gold-dark:  #8f7128   /* for cream-section accents */
--red:        #c8102e   /* live / urgent only */
--silver:     #c0c4ce
--bronze:     #b97a3a
```

### 2. ФОНТ — 3 family-аас өөр битгий нэм

- **Display (гарчиг):** `'Oswald', sans-serif` — `font-weight: 500/600/700`, ВСЕГДА `text-transform: uppercase`, `letter-spacing: .04em` (хэт хатуу биш)
- **Body:** `'Inter', sans-serif`
- **Mono (тоо, цаг, оноо):** `'JetBrains Mono', ui-monospace, monospace`

Google Fonts-аас preconnect + link:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

### 3. ХУУДАСНЫ БҮТЭЦ — заавал дагах

Бүх хуудас дараах **header system**-ийг хэрэглэнэ:
```
[ Utility bar ] — cream (#f3efe5) — live dot · огноо · хэвлэл · лого ажил баруунд (MN/EN)
[ Masthead   ] — pure white — color logo (assets/logo-color.png) + Монгол 87/89 + meta (огноо/байршил/хост)
[ Main nav   ] — sticky white — Нүүр · Мэдээ · Спорт · Хуваарь · Үр дүн · Багууд · Тухай + Шүүгч/Бүртгүүлэх товч
[ Gold ribbon] — 3px height, gold gradient
[ ... content ... ]
[ Footer     ] — dark — white logo (assets/logo-white.png) + 4 columns + sponsor row
```

### 4. SECTION ӨНГӨ ЭЭЛЖИЛЭЛ — заавал ШОО шиг

Шууд хар-хар-хар явахгүй! Ээлжилнэ:
```
Header (цагаан) → Hero ХАР → Stats КРЕМ → News ХАР → Sports КРЕМ → Schedule ХАР → Medal КРЕМ → Host ХАР → About КРЕМ → Sponsors ХАР → Footer ХАР
```

Хар section — `background: var(--ink)`, цагаан текст, `var(--gold)` accent
Крем section — `background: var(--bone)`, var(--ink) текст, `var(--gold-dark)` accent

### 5. ЛОГО АШИГЛАЛТ

3 хувилбар бий — `assets/` фолдерт:
- **`logo-color.png`** — цагаан/крем дэвсгэр дээр ашиглана (masthead, light sections)
- **`logo-white.png`** — хар дэвсгэр дээр ашиглана (footer, dark hero overlays)
- **`logo-black.png`** — print, цагаан background дээр monochrome хэрэглэхэд

Логог зөвхөн `.emblem` wrapper дотор `<img>` тагаар. Хэмжээ 50–72px square.

### 6. ҮСГИЙН ТУЛГУУР ДҮРЭМ

- Гарчиг (`section-title`): Oswald 600/700, uppercase, ~44px desktop / ~30px mobile
- Eyebrow (section дээрх): Oswald 500/600, uppercase, `letter-spacing: .22em`, **11px**, gold
- Body: Inter, 15px desktop / 14px mobile
- Мобайл дахь font-size — бүхэлдээ ~85%
- Тоо (медал, оноо, цаг): JetBrains Mono, tabular-nums

### 7. ENGLISH/MONGOLIAN BLEND

Eyebrow-д англиар бичиж болно (e.g. "Medal Standings · Live", "About the Games") — энэ нь Олимп стилийг өгдөг. Гэхдээ гол title үргэлж монголоор.

### 8. ICON & EMOJI

- 5 спортын **circular pictogram** (Oswald-той ижил weight, нимгэн stroke 1.5px) — `index.html`-д мэдэгдэхүйц SVG mask байгаа. Тэдгээрийг яг хадгална.
- Emoji **бараг бүү ашиглана** — зөвхөн 🥇🥈🥉 (медал), 🏆 (онцлох), 🎉 (нээлт), 🎶 (хөгжим)-г л зөвшөөрнө.

### 9. ТАЙЛЛАЖ БҮТЭЭХ КОМПОНЕНТУУД

Дараах нэрээр TSX компонент бий болго:
- `<UtilityBar />`
- `<Masthead />` — лого + brand + meta
- `<MainNav />` — sticky white, hamburger mobile
- `<GoldRibbon />`
- `<HeroSection />` — countdown card + hero title + meta strip
- `<LiveRibbon />`
- `<StatsStrip />`
- `<SectionHeader eyebrow title gold action />`
- `<NewsCard variant="feature|compact" />`
- `<SportCard sport="basketball|volleyball|..." />` — pictogram + category pills
- `<ScheduleDay date weekday events />` — нэг өдөр, дотор нь "Үндсэн тэмцээн" / "Хөгжөөн дэмжигч" хэсэг
- `<MedalTable />` + `<RecentMedals />`
- `<HostCard aimag stat />`
- `<FactsList />`
- `<Footer />`

### 10. RESPONSIVE breakpoints

- ≥ 1024px — desktop (бүх grid full)
- 768px — 1023px — tablet (sport 3 col, schedule 1 col)
- < 768px — mobile (hamburger, 2 col sports, 1 col everything)
- < 380px — small mobile (extra adjustments in index.html байгаа)

### 11. LIVE / REAL-TIME ЗААГ

Шууд тоглож байгаа эсвэл шинэ медал гарсан өгөгдлийг живээр харуулна:
- Top utility bar — "Шууд дамжуулалт" pulse dot (red)
- Hero countdown — наадам эхлэх хүртэлх цаг
- Live ribbon — хэвтээ scroll, дараагийн тоглолтуудын pipeline
- Medal table aside — сүүлд олгогдсон медалиуд

### 12. ӨӨРЧИЛЖ БОЛОХ ЗҮЙЛС

- **Бодит мэдээлэл оруулах** — Supabase-аас ирэх тэмцээн/баг/тоглолт/үр дүнг placeholder-ын оронд оруулна
- **Сэжүүр текст** — copy сайжруулах
- **Нэмэлт хуудаснууд** — тэмцээний түүх (I–IV), баг тус бүрийн профайл, тамирчдын статистик

### 13. ӨӨРЧИЛЖ ЯГ БОЛОХГҮЙ ЗҮЙЛС

- Өнгөний палитрыг бүү солих
- Фонтыг бүү солих
- Section өнгөний ээлжлэлийг бүү алдагдуулах
- Логог бүү reposition хийх
- Eyebrow + section-title pattern-ийг бүү алгасах
- Уриа болон тэмцээний нэрийг бүү шинээр гарга

---

## АЖИЛЛАХ ДАРААЛАЛ

1. Эхлээд `index.html` + `styles.css`-ийг бүхэлд нь уншаад дизайн системийг ОЙЛГО
2. `globals.css`-д CSS variables-ийг хуулж тавь
3. Tailwind config-д custom colors-ийг нэмж тавь (хэрвээ Tailwind v4 inline @theme ашиглах бол `styles.css`-тэй адил хий)
4. Footer + Header-ийг shared layout `(public)/layout.tsx`-д бий болго
5. Нүүр хуудсыг (`(public)/page.tsx`) хэсэг хэсэгээр шинэчилнэ
6. Бусад хуудаснуудыг ижил design language-аар порт хий

## АСУУЛТ ГАРВАЛ

- Хэрвээ design дотор шинээр UI хийх шаардлагатай бол (жишээ нь bracket bar, vote button) → энэ дизайн системд тохирох СТИЛИЙГ ҮРГЭЛЖЛҮҮЛЭН ХЭРЭГЛЭ
- Хэрвээ section/component зорчиж байгаа эсэхтэй итгэлгүй бол → `index.html`-ийг лавлана
- Өнгө/фонт сонгох ёстой шинэ зүйл гарвал → ӨМНӨ НЬ БАЙГАА ТОКЕНУУДЫГ дагана

---

**Энэ дизайн бол ХАТУУ STANDARD. Загвар алдахын оронд асууж шалга.**
