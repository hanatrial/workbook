---
name: Keluarga Sultan
description: Warm family-team hub for a 12-person field crew — Cerita, Tugas, Board, Report
colors:
  teluk-toraja: "#0B6B5E"
  zamrud-muda: "#15A392"
  kopi-toraja-deep: "#0A4A42"
  beras-ketan: "#F3EEE5"
  beras-ketan-light: "#FBF8F2"
  kartu-hangat: "#FFFDF9"
  kopi-toraja: "#221D18"
  abu-hangat: "#8C8175"
  pasir: "#EFE8DA"
  garis-halus: "rgba(34,29,24,0.08)"
  merah-peringatan: "#C63A47"
  amber-proses: "#B5771A"
  hijau-selesai: "#137A5A"
typography:
  display:
    fontFamily: "Clash Display, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 8.6vw, 2.625rem)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Clash Display, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  componentTitle:
    fontFamily: "Clash Display, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  pill: "999px"
  card: "26px"
  cardSmall: "18px"
  sheet: "30px"
  input: "14px"
  fab: "20px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "22px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.teluk-toraja}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "14px 58px 14px 20px"
  button-ghost:
    backgroundColor: "{colors.kartu-hangat}"
    textColor: "{colors.kopi-toraja}"
    rounded: "{rounded.pill}"
    padding: "14px 20px"
  card-surface:
    backgroundColor: "{colors.kartu-hangat}"
    textColor: "{colors.kopi-toraja}"
    rounded: "{rounded.card}"
    padding: "16px"
  chip-active:
    backgroundColor: "{colors.kopi-toraja}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
---

# Design System: Keluarga Sultan

## 1. Overview

**Creative North Star: "Meja Keluarga" (The Family Table)**

Keluarga Sultan is the digital table where a 12-person field team gathers: cerita gets told, tugas get handed out, progress gets seen. Every surface should feel like it was set by someone who cares — warm cream linens, softly stacked plates (double-bezel cards), a teal accent worn like a family color, not a corporate one. The system is **hangat & akrab** (warm, close-knit) first, **ceria & fun** (playful reactions, hand-drawn figure avatars, casual Bahasa Indonesia) second, and **premium/mewah** (mewah) throughout — crafted material depth rather than sterile flatness.

This system explicitly rejects the cold, impersonal register of enterprise SaaS dashboards, and refuses to let "premium" curdle into visual noise or clutter. Warmth is carried structurally (soft ambient shadows, hairline rims, cream surfaces), not just decoratively.

**Key Characteristics:**
- Warm cream ("Beras Ketan") surfaces, never sterile white or corporate gray
- Double-bezel cards: hairline rim + inner highlight + soft diffused shadow, no harsh drop shadows
- Floating glass islands (nav, header) instead of edge-glued bars
- Hand-drawn person-figure avatars, gender-correct, never generic initials or stock icons
- Clash Display headlines paired with Plus Jakarta Sans body — editorial warmth, not corporate grotesk
- Casual Bahasa Indonesia voice throughout the UI copy

## 2. Colors

A warm, single-hue-anchored palette: one teal ("Teluk Toraja") carries identity against a family of cream and warm-ink neutrals. Status colors (amber/red/green) stay desaturated enough to read as part of the same warm family, not as bolted-on system colors.

### Primary
- **Teluk Toraja** (#0B6B5E): the brand teal. Used on the header logo tile, primary buttons, active nav pill, focus rings, and the reaction/comment send button. Always as a gradient partner with Zamrud Muda, never flat.
- **Zamrud Muda** (#15A392): the lighter gradient partner to Teluk Toraja. Never used alone — always the light end of a 135°/145° gradient with the primary.

### Neutral
- **Beras Ketan** (#F3EEE5): the page background. Warm cream, never pure white — this is the "tablecloth" the whole app sits on.
- **Beras Ketan Light** (#FBF8F2): sheet/modal background, one step lighter than the page for depth separation.
- **Kartu Hangat** (#FFFDF9): card and input surface — the "plate" sitting on the tablecloth.
- **Kopi Toraja** (#221D18): primary ink/text color. Warm near-black, never cold `#000` or slate gray.
- **Abu Hangat** (#8C8175): muted/secondary text. A warm gray-brown, not a cool slate.
- **Pasir** (#EFE8DA): tertiary surface for pressed states, inactive pills, and the sand-toned progress-bar track.
- **Garis Halus** (rgba(34,29,24,0.08)): the only border in the system — a hairline, never a solid 1px gray stroke.

### Status (desaturated, family-consistent)
- **Merah Peringatan** (#C63A47): overdue tasks, delete actions, active-reaction highlight. A warm brick red, not a saturated system red.
- **Amber Proses** (#B5771A): "in progress" status. A muted ochre, not a bright warning yellow.
- **Hijau Selesai** (#137A5A): "done" status. Deliberately close to the brand teal family — completion reads as "home," not as an unrelated green.

### Named Rules
**The One Accent Rule.** Teluk Toraja (teal) is the only saturated color that appears as a solid fill (buttons, active nav, logo tile). Everywhere else, color is either a warm neutral or a desaturated status tone.

**The No Pink Rule.** Pink and magenta are permanently excluded from the avatar and accent palette — a direct, standing team decision, not a stylistic default.

## 3. Typography

**Display Font:** Clash Display (with Plus Jakarta Sans, system-ui fallback)
**Body Font:** Plus Jakarta Sans (with -apple-system, Segoe UI fallback)

**Character:** Clash Display brings editorial confidence to headlines and section titles — wide, warm, slightly rounded geometric display letterforms. Plus Jakarta Sans carries everything functional (body copy, buttons, labels, form fields) with a friendly, slightly humanist grotesk feel. The pairing reads as "a warm magazine," not "a SaaS product."

### Hierarchy
- **Display** (600 weight, `clamp(1.875rem, 8.6vw, 2.625rem)`, line-height 0.96, letter-spacing -0.03em): page-level view titles ("Cerita", "Tugas", "Board").
- **Title** (600 weight, 23px, line-height 1.15): sheet/modal headers ("Tulis cerita", "Assign a task").
- **Component Title** (600 weight, 15px, line-height 1.2): card-level headings — task titles, board card titles, member names.
- **Body** (400 weight, 15px, line-height 1.45, letter-spacing -0.01em): all copy, descriptions, comments. Cap prose at ~70ch.
- **Label** (700 weight, 10px, letter-spacing 0.2em, uppercase): the eyebrow tag under view titles and status pills only — never on body copy.

### Named Rules
**The Editorial Weight Rule.** Clash Display is reserved for things a user scans, never for things a user reads at length. If it's more than one short line, it's Plus Jakarta Sans.

## 4. Elevation

Layered, never flat, never harsh. Every raised surface uses the same three-part "double-bezel" recipe — an inner top highlight, a hairline outer rim, and a soft, heavily diffused ambient shadow — so depth reads as a physically stacked plate, not a CSS drop-shadow.

### Shadow Vocabulary
- **Hairline rim** (`inset 0 0 0 1px rgba(34,29,24,0.06)`): the outer edge of every card, input, chip, and button. Replaces solid borders entirely.
- **Inner highlight** (`inset 0 1px 0 rgba(255,255,255,0.75)`): a soft top-edge catch-light, simulating light falling on a slightly domed surface.
- **Ambient shadow** (`0 2px 4px rgba(34,29,24,0.03), 0 22px 46px -24px rgba(34,29,24,0.22)`): a heavily diffused, large-radius shadow — never a tight, dark, "2014 app" shadow. The blur radius must always be large relative to the offset.
- **Nav/FAB shadow** (`0 12–14px 34px -10px rgba(11,107,94,0.5–0.62)`): tinted with the brand teal rather than neutral black, used only on floating teal elements (FAB, active nav pill, primary buttons).

### Named Rules
**The Diffuse-or-Nothing Rule.** If a shadow's blur radius isn't at least 4× its vertical offset, it's forbidden — tight dark shadows are the single fastest way to make this system look cheap.

## 5. Components

### Buttons
- **Shape:** full pill (`rounded: 999px`) — never a rectangle or a slightly-rounded rect.
- **Primary:** Teluk Toraja → Zamrud Muda gradient (145°), white text, teal-tinted ambient shadow, `padding: 14px 58px 14px 20px` to make room for the trailing icon.
- **Button-in-button trailing icon:** primary buttons carry a nested circular "↗" glyph flush to the right edge (`42px` circle, `rgba(255,255,255,0.18)` fill) that kicks diagonally on press — never a bare arrow floating next to the label.
- **Ghost:** Kartu Hangat background, hairline rim + ambient shadow, no gradient — used for secondary actions ("Export", "Reassign PIC").
- **Danger:** same ghost shell, Merah Peringatan text only — never a solid red fill (destructive actions stay quiet until confirmed).
- **Press feedback:** `scale(0.975)` on `:active`; the trailing icon circle additionally translates `+3px, -3px` and scales to 1.05.

### Chips (filters, status pills)
- **Default:** Kartu Hangat background, hairline rim, Abu Hangat text.
- **Active filter chip:** solid Kopi Toraja (near-black ink) fill, white text — deliberately NOT teal, so the active-filter state stays visually distinct from brand/primary-action teal.
- **Status pill (todo/doing/done/due):** soft tinted background at ~12–14% opacity of the status color, full-strength status color for text. Always a pill, always text-only (no icon by default).

### Cards / Containers
- **Corner style:** 26px for primary content cards (photo, member, stat), 22px for tasks, 18px for compact board cards — corner radius scales down slightly with card density, never uniform.
- **Background:** Kartu Hangat, always with the double-bezel elevation recipe (Section 4).
- **Shadow strategy:** ambient shadow at rest; on hover (desktop only), lift `translateY(-3px)` and deepen the shadow slightly. Never on touch devices.
- **Border:** none — the hairline rim from Section 4 substitutes for a border everywhere.

### Inputs / Fields
- **Style:** white/Kartu Hangat fill, hairline rim + inner highlight, no visible border, 14px radius.
- **Focus:** a 2px solid Teluk Toraja ring replaces the hairline, no glow/blur.

### Navigation
- **Style:** a floating glass pill, detached from the screen edge (`bottom: 16px`, centered, `border-radius: 999px`), warm-cream translucent background with heavy backdrop blur — never a full-width bar glued to the viewport edge.
- **Active state:** the active tab's icon+label sit inside a solid teal-gradient pill capsule (`::before`, `border-radius: 999px`) that morphs in behind the button; inactive tabs are plain Abu Hangat icon+label.
- **Header:** a translucent glass app-bar (not a solid color slab), with the logo on its own small teal squircle tile (13px radius).

### Avatars (Signature Component)
Every teammate is a small hand-drawn SVG person-figure, deterministically varied by their member ID (hair style, skin tone, hair color) so the same person always renders identically. **Gender is explicit, not inferred from color**: female members get a longer-hair silhouette (side locks + soft fringe), male members get a short-hair silhouette (three hairline variants). Avatar background is a ~78%-lightened tint of the member's assigned accent color (never the saturated color directly, so the figure reads clearly against it). Pink and magenta are excluded from the assignable accent set (see Section 2's No Pink Rule).

### Sheets / Modals
- **Shape:** rises from the bottom, 30px top corners only, with a small pill-shaped grabber handle centered at the top.
- **Header:** sticky, translucent warm-cream glass with backdrop blur; title in the Title type tier.
- **Motion:** spring easing (`cubic-bezier(.34,.7,0,1)`), never a linear or ease-in-out slide.

## 6. Do's and Don'ts

### Do:
- **Do** keep Teluk Toraja teal as the only saturated solid-fill color in the system (The One Accent Rule).
- **Do** use the three-part double-bezel elevation recipe (hairline + inner highlight + diffused ambient shadow) on every raised surface.
- **Do** keep all UI copy in casual, warm Bahasa Indonesia.
- **Do** size tap targets generously — this app is used one-handed, outdoors, in the field.
- **Do** keep avatars gender-correct and personally distinct (unique hair/skin per member ID).

### Don't:
- **Don't** design anything that reads as a "generic cold corporate SaaS dashboard" — this is PRODUCT.md's primary anti-reference, and it rules out sterile white surfaces, tight dark drop-shadows, and impersonal system-gray chrome.
- **Don't** let "premium" tip into "terlalu ramai" (overstimulating) — no more than one moving/glowing element competing for attention at a time.
- **Don't** use pink or magenta anywhere in the avatar or accent palette — a standing team decision (The No Pink Rule).
- **Don't** use gender-stereotyped or incorrect avatar representation — hair silhouette must match the actual person, not an assumed default.
- **Don't** use `border-left` or `border-right` colored stripes as an accent technique anywhere in this system.
- **Don't** use gradient text (`background-clip: text`) for emphasis — emphasis comes from weight or size only.
- **Don't** use a tight, dark shadow (blur radius less than 4× the offset) — see The Diffuse-or-Nothing Rule.
