# Idan Alush — UI & Design System Preferences

> Load this file into any Claude project where you build interfaces, apps, dashboards, reports, or any visual output. It contains design rules, technical preferences, and real examples from past projects.

---

## 1. General Design Philosophy

- Clean, minimal, professional. Substance over decoration.
- Whitespace is a design tool — use it generously.
- No visual noise: no unnecessary gradients, glows, shadows, or textures.
- Data should speak for itself. The UI frames it, not competes with it.
- If it looks like a generic AI-generated UI, start over.

---

## 2. Language & Direction

- **Default language:** Hebrew
- **Direction:** RTL (`dir="rtl"` on `<html>`)
- All text aligns right unless explicitly specified otherwise
- Flex containers in RTL: first JSX element appears on the right. Do NOT use `flex-row-reverse` — RTL handles it natively.
- When mixing Hebrew and English (e.g., metric names), keep the layout RTL and let the browser handle bidi.
- English content is fine for code-facing or developer tools.

---

## 3. Typography

### For web apps (React / Next.js):
- **Primary font:** Almoni (Hebrew) — weights: 400, 500, 600, 700
  - Files: `almoni-regular-aaa.otf`, `almoni-medium-aaa.otf`, `almoni-demibold-aaa.otf`, `almoni-bold-aaa.otf`
  - Stored in `public/fonts/`
  - Fallback: `sans-serif`
- **Alternative for quick prototypes:** System fonts — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

### For HTML reports (standalone files):
- **System fonts only** — no Google Fonts, no external resources
- Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

### For PDFs:
- **Heebo** for Hebrew text (registered via reportlab/pdfkit)
- Ensure RTL rendering with bidi algorithm

### Rules:
- Body text: 14-15px
- Don't over-style headings. Clean hierarchy: size + weight, not color tricks.
- No decorative fonts. Ever.

---

## 4. Color System

### Light theme (default for reports and client-facing tools):

```
Background:       #f7f7f5  (warm off-white)
Card/Surface:     #ffffff
Border:           #e5e5e0
Border Light:     #eeeeea
Text Primary:     #1a1a1a
Text Mid:         #555550
Text Dim:         #8a877f
```

### Functional colors:

```
Green (positive):    #1a7a4c  on  #e8f5ee
Red (negative):      #c0392b  on  #fceaea
Blue (info/links):   #2563a0  on  #e8f0fa
Purple (secondary):  #6d4c9e  on  #f0eaf8
```

### Dark theme (for internal dashboards / app UI):

```
Background:       #0c0f14
Card/Surface:     #151921
Card Border:      rgba(255,255,255,0.04)
Accent Gold:      #c9a96e
Green:            #34d399
Blue:             #60a5fa
Purple:           #a78bfa
Orange:           #fb923c
Text:             #e8e4dd
Text Dim:         #7a7872
Text Mid:         #a8a49d
```

### Rules:
- No brand colors in headers or titles — keep them neutral
- Currency symbols (₪) always visible next to monetary values
- Positive/negative indicators use green/red badges, not just color on text
- No rainbow palettes. Stick to 2-3 accent colors max per view.

---

## 5. Component Patterns

### Cards
- White background, subtle border (`#e5e5e0`), rounded corners (8-12px)
- Comfortable padding: `py-3 px-4` minimum
- Hover: light blue background (`#F0F7FF`) for interactive cards
- Selected state: light background + left border accent (in RTL: right border)

### Metric displays
- Label on top (small, dim color, 11-12px)
- Value below (large, bold, 20-22px)
- Optional badge underneath for % change (green/red background)

### Tables
- Clean, minimal borders
- Row hover for interactivity
- Right-aligned text for Hebrew
- Numbers in a slightly different weight or color for scannability

### Buttons
- Primary: solid fill, rounded (10-14px radius)
- Secondary: border only, no fill
- Don't stack more than 2-3 action buttons in a row

### Dropdowns / Selects
- Open from right side in RTL
- Show secondary info (like account ID) in small gray text below main label
- Comfortable padding per item

---

## 6. Layout Patterns

### Toolbar / Filter bars
- Horizontal flex, items aligned right (RTL native)
- Use `flex-1` on spacer elements (like search input) to push groups apart
- Never use `flex-row-reverse` — RTL handles direction
- Group related controls together with consistent spacing

### Grid layouts
- Use CSS Grid or flex-wrap
- For ad galleries: masonry-style or uniform card grid
- For reports: single column, max-width 760px, centered
- For dashboards: responsive grid, 2-4 columns

### Responsive
- Mobile-first breakpoint at 600px
- Stack everything vertically on mobile
- Reduce padding on mobile (48px → 16px)
- Font sizes can drop 2-4px on mobile

---

## 7. Report-Specific Rules (HTML standalone files)

These are for visual campaign reports sent to clients:

- **Style:** Clean, light, doc-like. Think "Google Doc with a quiet design upgrade."
- **Background:** `#f7f7f5` — never dark mode
- **No JavaScript** — pure HTML + CSS
- **No external resources** — no Google Fonts, no CDN links
- **No charts or interactive elements** — just clean readable content
- **Don't rephrase the user's notes** — keep original text exactly as written
- **Don't skip links** the user provided
- **Currency:** Always show ₪ next to monetary values
- **Structure:** Header → Campaign sections → Budget section → Notes

### Report color patterns:
- Campaign metrics in clean tables with alternating subtle backgrounds
- Positive changes: green badge (`#1a7a4c` on `#e8f5ee`)
- Negative changes: red badge (`#c0392b` on `#fceaea`)
- Info/links: blue (`#2563a0` on `#e8f0fa`)
- Notes/commentary: blockquote style with right border accent

---

## 8. Tech Stack Preferences

### For web apps:
- **React** (Next.js preferred)
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Recharts** for data visualization
- **Lucide React** for icons
- TypeScript

### For standalone tools:
- Single HTML file when possible
- No build step required
- Self-contained CSS

### For artifacts in Claude:
- React with Tailwind
- shadcn/ui components available
- Recharts for charts
- Single-file, no separate CSS/JS

### Deployment:
- **Vercel** (primary)
- **Cloudflare Pages** (for client landing pages)
- **GitHub** for version control

---

## 9. What I Don't Like

- Generic "AI-generated" aesthetics (overly smooth gradients, generic stock-photo vibes)
- Cluttered interfaces with too many elements competing for attention
- Blurry or low-quality images
- Left-aligned Hebrew text
- `flex-row-reverse` hacks instead of proper RTL
- Google Fonts in standalone HTML reports
- Noise textures, excessive shadows, glow effects
- Dark mode for client-facing reports
- Emoji in professional/marketing content
- Em dashes anywhere

---

## 10. Examples from Past Projects

### fb-ads-tool (React / Next.js)
- Facebook Ads creative display + PDF export
- Dark-ish UI for internal use, card-based ad gallery
- Almoni font, full RTL Hebrew
- Masonry grid for ad cards with full-quality images
- Filter chips: All, Images, Videos, Carousels, Active, Paused
- Metric badges on each card
- PDF export with Heebo font for Hebrew support

### Visual campaign reports (HTML)
- Light background (#f7f7f5), system fonts
- Clean metric tables per campaign
- Budget progress bars
- Green/red badges for performance changes
- Max-width 760px, centered layout
- Mobile responsive at 600px breakpoint

### Budget Pacing Tool (planned)
- Dashboard with client overview table
- Per-client detail: cumulative spend chart with ideal pace line
- Color scheme: green (#27AE60), yellow (#F39C12), red (#E74C3C)
- Auto-refresh every 15 minutes

### Expense Tracker (React artifact)
- Hebrew UI, RTL
- Category-based pie charts
- Budget progress indicators
- Clean card-based dashboard inspired by Rise Up

---

## 11. How to Use This File

1. **In a Claude Project:** Upload as a project file or paste into Project Instructions
2. **In Claude Code:** Place in project root as `DESIGN_SYSTEM.md` and reference in `CLAUDE.md`
3. **For one-off conversations:** Paste the relevant sections

When starting any new UI project, Claude should read this file first and apply these preferences automatically without asking.

---

*Last updated: March 2026*
