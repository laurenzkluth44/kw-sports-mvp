# KW Sports — Internal Tool Design System

This tool shares the visual identity of the KW Sports public website (`../KW/KW`):
**condensed all-caps display type, a single electric-blue accent, true-black "ink"
chrome, sharp architectural geometry, and buttery expo easing.**

It's adapted for a data-dense internal app with the **hybrid** model:
**dark editorial chrome (header / nav / login / page banners) + light, readable data
surfaces (tables, forms, cards).** Don't put dense tables on dark backgrounds.

Everything below is already wired into `tailwind.config.ts`, `src/app/globals.css`,
and the primitives in `src/components/ui/`. Build new screens out of these — don't
reinvent colors or one-off hex values.

---

## Tokens

### Color

| Token (Tailwind) | Value | Use |
| --- | --- | --- |
| `brand-500` / `blue` | `#0055ff` | **The** accent — CTAs, focus, links, active, highlights. Use sparingly. |
| `blue-bright` | `#0066ff` | Accent hover |
| `brand-600` / `blue-dark` | `#0044cc` | Gradient / pressed |
| `brand-700` / `blue-deep` | `#003399` | Deep blue, chart 2nd series, badge text |
| `brand-300` | `#7aa8ff` | Accent on dark chrome (taglines, eyebrows) |
| `brand-50` / `brand-100` | `#eef4ff` / `#d9e6ff` | Blue tint surfaces, soft badges |
| `navy-950` / `ink` | `#0a0a0a` | Dark chrome background, primary text |
| `navy-800` | `#1a1a1c` | Primary button hover |
| `slate-*` | (Tailwind) | Hairlines, muted text, neutral surfaces |

> The legacy `navy` and `brand` scales **are** the KW palette now — reuse them.
> Avoid raw hex in markup; the only raw hex lives in the chart palette
> (`visual-summary.tsx`).

### Type

- **Display** — `font-display` → Bebas Neue. Big headings, stat numbers, the wordmark.
  Uppercase, tight leading (~0.9), tracking `-0.01em` (big) to `+0.02em` (small).
  Use the `.kw-title` helper for page/section titles.
- **Body / UI** — default (`font-sans`/`font-body`) → Outfit, weights 300–900.
- **Eyebrow** — `.eyebrow` (uppercase blue label with a 30px blue dash before it);
  add `.eyebrow-light` on dark backgrounds.
- **Labels** — uppercase, `font-extrabold`, tracking `0.08em–0.12em`.

### Geometry & motion

- **Sharp by default.** `rounded-sm`/`rounded-md` = `2px`; pills use `rounded-full`.
  Never go pill-soft on surfaces.
- **Easing** — `ease-out-expo` (`cubic-bezier(0.16,1,0.3,1)`) is the house curve.
  Default transitions ~`300ms`. `ease-out-quart` for secondary motion.
- **Shadows** — `shadow-card` (rest), `shadow-cardHover` (lift), `shadow-blueGlow`
  (accent buttons).
- **Framing** — `.corner-brackets` (L-shaped blue corners), `.kw-stripes` (diagonal
  hatch for dark/blue panels).

---

## Component classes (`globals.css`)

`.page-shell` · `.panel` / `.panel-muted` · `.kw-title` · `.eyebrow` /
`.eyebrow-light` · `.section-heading` / `.section-subtitle` · `.table-header` ·
`.data-row` (blue hover) · `.metric-card` / `.metric-kicker` / `.metric-value`
(Bebas numeral) · `.alert-success|warning|error` (blue/amber/red left-rule) ·
`.field-label` / `.field-help` · `.nav-link` (blue underline-wipe).

## Primitives (`src/components/ui/`)

- **Button / LinkButton** — variants `primary` (ink), `accent` (electric blue +
  glow), `secondary` (white→blue tint), `ghost` (for dark chrome). Uppercase,
  tracked, expo motion; a trailing icon nudges right on hover.
- **Badge** — sharp, uppercase, tracked. Color via `STATUS_/PRIORITY_BADGE_CLASSES`.
- **PageHeader** — blue-dash eyebrow + Bebas title + blue left rule.
- **Field / Input / Select / Textarea** — sharp, blue focus ring.
- **EmptyState** — blue tick + Bebas title.
- **AppShell** — dark ink chrome, Bebas wordmark, underline-wipe nav.

---

## Recipes

```tsx
// Page intro
<PageHeader eyebrow="KW Sports Admin" title="Alle Kaderbedarfe" description="…" actions={…} />

// Eyebrow + display title by hand
<p className="eyebrow">KW Sports Portal</p>
<h2 className="kw-title text-4xl">Login</h2>

// Primary action / accent export
<LinkButton variant="primary">Speichern</LinkButton>
<LinkButton variant="accent"><Download className="h-4 w-4" />CSV Export</LinkButton>

// Dark hero panel
<section className="kw-stripes relative bg-navy-950 text-white">…</section>
```

**Mobile:** all interactive targets keep `min-h-10`/`min-h-11`; chrome nav scrolls
horizontally; the login hero collapses to a compact mobile header. Keep these intact.
`prefers-reduced-motion` is respected globally.
